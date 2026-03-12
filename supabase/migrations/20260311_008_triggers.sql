-- =============================================================================
-- MIGRACIÓN 008: Triggers automáticos
-- Proyecto: NyxLex
-- Fecha: 2026-03-11
-- Descripción: Triggers para automatizar:
--   1. updated_at en todas las tablas con esa columna
--   2. Entradas automáticas en case_timeline ante cambios en el caso
--   3. Notificaciones automáticas ante eventos de plazos
-- =============================================================================


-- ─── FUNCIÓN GENÉRICA: Actualizar updated_at ──────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar trigger updated_at a todas las tablas que tienen esa columna
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'clients', 'cases', 'case_notes', 'tasks',
    'invoices', 'time_entries',
    'legal_knowledge', 'ai_sessions',
    'document_processing_queue'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
       CREATE TRIGGER trg_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;


-- ─── FUNCIÓN: Insertar en case_timeline al cambiar status del caso ─────────
CREATE OR REPLACE FUNCTION fn_timeline_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- Ejecuta con permisos elevados para bypasear RLS en la escritura
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO case_timeline (case_id, title, icon, author)
    VALUES (
      NEW.id,
      'Estado actualizado: "' || NEW.status || '"',
      'status',
      (
        SELECT COALESCE(p.first_name || ' ' || p.last_name, 'Sistema')
        FROM profiles p WHERE p.user_id = auth.uid()
        LIMIT 1
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_timeline_status ON cases;
CREATE TRIGGER trg_case_timeline_status
  AFTER UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION fn_timeline_on_status_change();


-- ─── FUNCIÓN: Insertar en case_timeline al agregar nota ───────────────────
CREATE OR REPLACE FUNCTION fn_timeline_on_note_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO case_timeline (case_id, title, icon, author, detail)
  VALUES (
    NEW.case_id,
    CASE WHEN NEW.note_type = 'audio' THEN 'Nota de audio creada' ELSE 'Nota de texto creada' END,
    'note',
    (
      SELECT COALESCE(p.first_name || ' ' || p.last_name, 'Sistema')
      FROM profiles p WHERE p.user_id = NEW.user_id
      LIMIT 1
    ),
    CASE WHEN NEW.note_type = 'text' THEN LEFT(NEW.content, 200) ELSE NULL END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_timeline_note ON case_notes;
CREATE TRIGGER trg_case_timeline_note
  AFTER INSERT ON case_notes
  FOR EACH ROW EXECUTE FUNCTION fn_timeline_on_note_insert();


-- ─── FUNCIÓN: Insertar en case_timeline al subir un archivo ──────────────
CREATE OR REPLACE FUNCTION fn_timeline_on_file_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO case_timeline (case_id, title, icon, author, detail)
  VALUES (
    NEW.case_id,
    'Archivo adjunto: "' || NEW.file_name || '"',
    'doc',
    (
      SELECT COALESCE(p.first_name || ' ' || p.last_name, 'Sistema')
      FROM profiles p WHERE p.user_id = NEW.uploaded_by
      LIMIT 1
    ),
    NEW.file_type || ' · ' || COALESCE(NEW.file_size, '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_timeline_file ON case_files;
CREATE TRIGGER trg_case_timeline_file
  AFTER INSERT ON case_files
  FOR EACH ROW EXECUTE FUNCTION fn_timeline_on_file_upload();


-- ─── FUNCIÓN: Crear notificación al crear/actualizar evento del caso ───────
-- Se crea notificación para todos los abogados asignados al caso
CREATE OR REPLACE FUNCTION fn_notify_on_case_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lawyer_rec RECORD;
  notif_title text;
  days_until int;
BEGIN
  -- Solo para eventos futuros
  IF NEW.event_at <= now() THEN
    RETURN NEW;
  END IF;

  days_until := EXTRACT(DAY FROM (NEW.event_at - now()))::int;

  notif_title := CASE NEW.event_type
    WHEN 'audiencia'   THEN '⚖️ Audiencia: ' || NEW.title
    WHEN 'vencimiento' THEN '⏰ Plazo: ' || NEW.title
    WHEN 'cita'        THEN '📅 Cita: ' || NEW.title
    WHEN 'reunion'     THEN '🤝 Reunión: ' || NEW.title
    ELSE '🔔 Evento: ' || NEW.title
  END;

  -- Crear notificación para cada abogado asignado al caso
  FOR lawyer_rec IN
    SELECT cl.user_id FROM case_lawyers cl WHERE cl.case_id = NEW.case_id
  LOOP
    INSERT INTO notifications (
      user_id, type, title, body, action_url,
      case_id, event_id, channel, scheduled_at
    )
    VALUES (
      lawyer_rec.user_id,
      'plazo',
      notif_title,
      'Faltan ' || days_until || ' día(s) — ' || to_char(NEW.event_at AT TIME ZONE 'America/La_Paz', 'DD/MM/YYYY HH24:MI'),
      '/cases',
      NEW.case_id,
      NEW.id,
      'in_app',
      now()
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_case_event ON case_events;
CREATE TRIGGER trg_notify_case_event
  AFTER INSERT OR UPDATE OF event_at ON case_events
  FOR EACH ROW EXECUTE FUNCTION fn_notify_on_case_event();


-- ─── FUNCIÓN: Completar tarea actualiza caso en timeline ──────────────────
CREATE OR REPLACE FUNCTION fn_timeline_on_task_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo cuando se marca como completada
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completada' THEN
    -- Actualizar completed_at si no está ya
    NEW.completed_at = COALESCE(NEW.completed_at, now());

    -- Si la tarea está vinculada a un caso, registrar en timeline
    IF NEW.case_id IS NOT NULL THEN
      INSERT INTO case_timeline (case_id, title, icon, author, detail)
      VALUES (
        NEW.case_id,
        'Tarea completada: "' || NEW.title || '"',
        'form',
        (
          SELECT COALESCE(p.first_name || ' ' || p.last_name, 'Sistema')
          FROM profiles p WHERE p.user_id = auth.uid()
          LIMIT 1
        ),
        'Categoría: ' || NEW.category
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_task_complete ON tasks;
CREATE TRIGGER trg_task_complete
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION fn_timeline_on_task_complete();
