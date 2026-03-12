-- =============================================================================
-- MIGRACIÓN 001: Nuevos Enums
-- Proyecto: NyxLex
-- Fecha: 2026-03-11
-- Descripción: Agrega los enums que aún no existen en la base de datos.
--              Los enums existentes (legal_area, case_status, case_priority,
--              fee_type, event_type, note_type, action_category, app_role)
--              NO se modifican para no afectar el frontend actual.
-- =============================================================================

-- ─── MÓDULO: TAREAS (§5 Diccionario de Datos) ─────────────────────────────
CREATE TYPE task_status AS ENUM (
  'pendiente',
  'en_progreso',
  'completada'
);

-- ─── MÓDULO: CLIENTES (§3.2 Diccionario de Datos) ─────────────────────────
CREATE TYPE client_type AS ENUM (
  'persona_natural',
  'persona_juridica',
  'autonomo',
  'institucion_publica'
);

-- ─── MÓDULO: FACTURACIÓN (futuro) ─────────────────────────────────────────
CREATE TYPE billing_status AS ENUM (
  'borrador',
  'enviada',
  'pendiente',
  'pagado',
  'vencido',
  'cancelado'
);

-- Unidad del servicio facturado
CREATE TYPE fee_unit AS ENUM (
  'hora',
  'caso',
  'mes',
  'evento',
  'documento'
);

-- Métodos de pago
CREATE TYPE payment_method AS ENUM (
  'transferencia',
  'efectivo',
  'tarjeta',
  'cheque',
  'otro'
);

-- ─── MÓDULO: IA & DOCUMENTOS (futuro) ─────────────────────────────────────
-- Estado del pipeline de procesamiento de documentos (OCR, STT)
CREATE TYPE doc_processing_status AS ENUM (
  'pendiente',
  'procesando',
  'listo',
  'error'
);

-- Tipo de documento en la Biblioteca Jurídica
CREATE TYPE legal_knowledge_type AS ENUM (
  'ley',
  'decreto_supremo',
  'resolucion',
  'jurisprudencia',
  'auto_supremo',
  'circular',
  'reglamento',
  'otro'
);

-- Tipo de documento subido al caso
CREATE TYPE case_document_type AS ENUM (
  'demanda',
  'memorial',
  'contrato',
  'acuerdo',
  'sentencia',
  'auto',
  'notificacion',
  'pericial',
  'evidencia',
  'audio',
  'video',
  'imagen',
  'otro'
);

-- ─── MÓDULO: NOTIFICACIONES (futuro) ──────────────────────────────────────
CREATE TYPE notification_type AS ENUM (
  'plazo',
  'tarea',
  'caso',
  'pago',
  'documento',
  'sistema'
);

CREATE TYPE notification_channel AS ENUM (
  'in_app',
  'email',
  'sms',
  'whatsapp'
);
