-- =============================================================================
-- MIGRACIÓN 003: Tablas `tasks` y `task_assignees`
-- Proyecto: NyxLex
-- Fecha: 2026-03-11
-- Descripción: Crea las dos tablas del módulo Tareas & Workflow (§5 del
--              Diccionario de Datos). Incluye FKs, índices y comentarios.
-- =============================================================================

-- ─── TABLA: tasks ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  -- Clave primaria
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Descripción de la tarea
  title               text          NOT NULL,
  category            text          NOT NULL,               -- §5.3: tiempos, documentos, investigacion, etc.

  -- Relaciones
  case_id             uuid          REFERENCES cases(id) ON DELETE SET NULL,
  created_by          uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Clasificación
  priority            case_priority NOT NULL DEFAULT 'media', -- Reutiliza enum existente
  status              task_status   NOT NULL DEFAULT 'pendiente',

  -- Planificación temporal
  due_date            timestamptz,
  due_time            text          NOT NULL DEFAULT '',    -- HH:MM
  estimated_duration  text          NOT NULL DEFAULT '',    -- "30 min", "1 hora", etc.

  -- Notas
  notes               text          NOT NULL DEFAULT '',

  -- Campos de IA (sugerencias automáticas del Asistente Legal)
  is_ai_suggested     boolean       NOT NULL DEFAULT false,
  ai_confidence       integer                                -- 0-100
                        CHECK (ai_confidence IS NULL OR ai_confidence BETWEEN 0 AND 100),
  ai_reason           text          NOT NULL DEFAULT '',
  approved            boolean       NOT NULL DEFAULT true,  -- false = pendiente aprobación IA

  -- Estado de completado
  completed_at        timestamptz,

  -- Auditoría
  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now()
);

-- Índices de consulta frecuente
CREATE INDEX IF NOT EXISTS idx_tasks_case_id    ON tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date   ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_category   ON tasks(category);

-- Comentarios
COMMENT ON TABLE  tasks               IS 'Tareas legales: manuales y sugeridas por IA. Vinculadas a casos.';
COMMENT ON COLUMN tasks.category      IS 'Categoría del §5.3: tiempos, documentos, investigacion, cliente, coordinacion, administrativa';
COMMENT ON COLUMN tasks.is_ai_suggested IS 'True si la tarea fue generada por el Asistente Legal IA';
COMMENT ON COLUMN tasks.ai_confidence IS 'Porcentaje de confianza de la sugerencia IA (0-100)';
COMMENT ON COLUMN tasks.approved      IS 'False si la tarea IA está pendiente de aprobación por el abogado';


-- ─── TABLA: task_assignees ────────────────────────────────────────────────
-- Relación muchos-a-muchos: una tarea puede asignarse a varios abogados
CREATE TABLE IF NOT EXISTS task_assignees (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),

  -- Un usuario no puede ser asignado dos veces a la misma tarea
  UNIQUE (task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON task_assignees(user_id);

COMMENT ON TABLE task_assignees IS 'Asignación de abogados a tareas (N:M). Un abogado puede tener múltiples tareas y una tarea múltiples abogados.';
