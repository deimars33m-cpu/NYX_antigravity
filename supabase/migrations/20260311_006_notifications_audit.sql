-- =============================================================================
-- MIGRACIÓN 006: Notificaciones y Auditoría
-- Proyecto: NyxLex
-- Fecha: 2026-03-11
-- Descripción: Sistema de notificaciones multicanal para plazos, tareas y pagos,
--              más un log de auditoría inmutable para cumplimiento legal.
-- =============================================================================

-- ─── TABLA: notifications ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            uuid                 PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Destinatario
  user_id       uuid                 NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo y contenido
  type          notification_type    NOT NULL,
  title         text                 NOT NULL,
  body          text                 NOT NULL DEFAULT '',
  action_url    text                 NOT NULL DEFAULT '',  -- Ruta interna a la que lleva

  -- Entidad referenciada (uno de estos será no-null según el tipo)
  case_id       uuid                 REFERENCES cases(id)       ON DELETE CASCADE,
  task_id       uuid                 REFERENCES tasks(id)        ON DELETE CASCADE,
  invoice_id    uuid                 REFERENCES invoices(id)     ON DELETE CASCADE,
  event_id      uuid                 REFERENCES case_events(id)  ON DELETE CASCADE,

  -- Estado
  is_read       boolean              NOT NULL DEFAULT false,
  read_at       timestamptz,

  -- Programación (para envíos diferidos)
  scheduled_at  timestamptz          NOT NULL DEFAULT now(),
  sent_at       timestamptz,
  channel       notification_channel NOT NULL DEFAULT 'in_app',

  created_at    timestamptz          NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id      ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read      ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at) WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_case_id      ON notifications(case_id);

COMMENT ON TABLE notifications IS 'Notificaciones in-app para abogados: vencimientos de plazos, tareas pendientes, pagos, cambios en casos.';


-- ─── TABLA: audit_logs ────────────────────────────────────────────────────
-- Registro INMUTABLE de todas las acciones críticas del sistema.
-- Esta tabla NUNCA debe tener UPDATE ni DELETE por parte de la aplicación.
-- RLS bloqueará cualquier intento de modificación.
CREATE TABLE IF NOT EXISTS audit_logs (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Actor
  user_id        uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email     text        NOT NULL DEFAULT '',  -- Desnormalizado por si se elimina el usuario

  -- Acción
  action         text        NOT NULL,             -- Ej: 'case.created', 'invoice.paid', 'doc.uploaded'
  entity_type    text        NOT NULL,             -- Tabla afectada: 'cases', 'invoices', etc.
  entity_id      uuid,                             -- ID del registro afectado
  entity_label   text        NOT NULL DEFAULT '',  -- Descripción legible (título del caso, Nº factura)

  -- Diferencia de datos (para ediciones)
  old_values     jsonb,      -- Valores antes del cambio
  new_values     jsonb,      -- Valores después del cambio

  -- Contexto técnico
  ip_address     inet,
  user_agent     text,

  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Solo índices de lectura — no hay índice único para mantener máxima velocidad de escritura
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id     ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action      ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON audit_logs(created_at DESC);

COMMENT ON TABLE audit_logs IS 'Log inmutable de auditoría. Registra todas las acciones críticas para cumplimiento legal y trazabilidad forense. NUNCA modificar ni eliminar registros.';
