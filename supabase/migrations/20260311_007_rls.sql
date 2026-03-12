-- =============================================================================
-- MIGRACIÓN 007: Row Level Security (RLS)
-- Proyecto: NyxLex
-- Fecha: 2026-03-11
-- Descripción: Políticas de seguridad a nivel de fila para ALL tablas.
--              Roles: 'admin' tiene acceso total, 'lawyer' solo ve lo suyo.
--              Se usa la función is_admin() y is_case_member() ya existentes.
-- =============================================================================

-- ─── HABILITAR RLS EN TABLAS NUEVAS ───────────────────────────────────────

ALTER TABLE tasks                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees             ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries               ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_knowledge            ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_knowledge_chunks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_document_chunks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_queue  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages                ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs                 ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════════════════
-- TAREAS
-- ═══════════════════════════════════════════════════════════════════════════

-- Admin: acceso total
CREATE POLICY "admin_all_tasks" ON tasks
  FOR ALL USING (is_admin());

-- Lawyer: ve tareas de casos donde está asignado, o que él creó
CREATE POLICY "lawyer_own_tasks" ON tasks
  FOR SELECT USING (
    auth.uid() = created_by
    OR (case_id IS NOT NULL AND is_case_member(case_id))
  );

CREATE POLICY "lawyer_create_tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "lawyer_update_own_tasks" ON tasks
  FOR UPDATE USING (auth.uid() = created_by OR is_admin());

CREATE POLICY "lawyer_delete_own_tasks" ON tasks
  FOR DELETE USING (auth.uid() = created_by OR is_admin());


-- ─── task_assignees ─────────────────────────────────────────────────────
CREATE POLICY "admin_all_task_assignees" ON task_assignees
  FOR ALL USING (is_admin());

CREATE POLICY "lawyer_view_task_assignees" ON task_assignees
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM tasks t WHERE t.id = task_assignees.task_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "lawyer_manage_assignees" ON task_assignees
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_assignees.task_id AND t.created_by = auth.uid())
    OR is_admin()
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- FACTURACIÓN
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "admin_all_invoices" ON invoices
  FOR ALL USING (is_admin());

CREATE POLICY "lawyer_own_invoices" ON invoices
  FOR SELECT USING (
    auth.uid() = created_by
    OR (case_id IS NOT NULL AND is_case_member(case_id))
  );

CREATE POLICY "lawyer_create_invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = created_by);


-- ─── invoice_items ──────────────────────────────────────────────────────
CREATE POLICY "admin_all_invoice_items" ON invoice_items
  FOR ALL USING (is_admin());

CREATE POLICY "lawyer_view_invoice_items" ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i WHERE i.id = invoice_items.invoice_id
      AND (i.created_by = auth.uid() OR is_admin())
    )
  );


-- ─── time_entries ───────────────────────────────────────────────────────
CREATE POLICY "admin_all_time_entries" ON time_entries
  FOR ALL USING (is_admin());

CREATE POLICY "lawyer_own_time_entries" ON time_entries
  FOR ALL USING (auth.uid() = user_id);


-- ─── payments ───────────────────────────────────────────────────────────
CREATE POLICY "admin_all_payments" ON payments
  FOR ALL USING (is_admin());

CREATE POLICY "lawyer_view_payments" ON payments
  FOR SELECT USING (
    auth.uid() = registered_by
    OR EXISTS (
      SELECT 1 FROM invoices i WHERE i.id = payments.invoice_id AND i.created_by = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- IA & DOCUMENTOS
-- ═══════════════════════════════════════════════════════════════════════════

-- legal_knowledge: todos los usuarios autenticados pueden leer
CREATE POLICY "authenticated_read_legal_knowledge" ON legal_knowledge
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "admin_manage_legal_knowledge" ON legal_knowledge
  FOR ALL USING (is_admin());

-- legal_knowledge_chunks: mismo patrón
CREATE POLICY "authenticated_read_lk_chunks" ON legal_knowledge_chunks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "admin_manage_lk_chunks" ON legal_knowledge_chunks
  FOR ALL USING (is_admin());


-- case_document_chunks: solo miembros del caso
CREATE POLICY "case_member_doc_chunks" ON case_document_chunks
  FOR SELECT USING (is_case_member(case_id) OR is_admin());

CREATE POLICY "admin_manage_doc_chunks" ON case_document_chunks
  FOR ALL USING (is_admin());


-- document_processing_queue: administradores y dueños del caso
CREATE POLICY "admin_all_doc_queue" ON document_processing_queue
  FOR ALL USING (is_admin());

CREATE POLICY "case_member_view_queue" ON document_processing_queue
  FOR SELECT USING (is_case_member(case_id));


-- ai_sessions: cada usuario ve solo sus sesiones
CREATE POLICY "user_own_ai_sessions" ON ai_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admin_all_ai_sessions" ON ai_sessions
  FOR SELECT USING (is_admin());


-- ai_messages: via sesión del usuario
CREATE POLICY "user_own_ai_messages" ON ai_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM ai_sessions s WHERE s.id = ai_messages.session_id AND s.user_id = auth.uid())
  );


-- ═══════════════════════════════════════════════════════════════════════════
-- NOTIFICACIONES
-- ═══════════════════════════════════════════════════════════════════════════

-- Cada usuario solo ve sus propias notificaciones
CREATE POLICY "user_own_notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admin_all_notifications" ON notifications
  FOR ALL USING (is_admin());


-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT LOGS — Solo lectura para admins; escritura solo vía triggers del sistema
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "admin_read_audit_logs" ON audit_logs
  FOR SELECT USING (is_admin());

-- NUNCA agregar políticas de UPDATE o DELETE en audit_logs
-- La escritura se realiza únicamente por funciones SECURITY DEFINER
