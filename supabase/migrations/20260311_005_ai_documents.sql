-- =============================================================================
-- MIGRACIÓN 005: Módulo IA & Documentos
-- Proyecto: NyxLex
-- Fecha: 2026-03-11
-- Descripción: Tablas para los módulos de Taller Legal IA, Asistente Legal IA,
--              Biblioteca Jurídica y Gestión Documental.
--              Usa pgvector (vector(1536)) para embeddings de OpenAI/multilingual.
-- =============================================================================

-- ─── TABLA: legal_knowledge (Biblioteca Jurídica) ─────────────────────────
-- Almacena el texto completo de leyes, DS, jurisprudencia, autos supremos, etc.
CREATE TABLE IF NOT EXISTS legal_knowledge (
  id           uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  title        text                  NOT NULL,
  doc_type     legal_knowledge_type  NOT NULL DEFAULT 'ley',
  reference    text                  NOT NULL DEFAULT '',   -- Ej: "Ley 1340", "DS 0181"
  jurisdiction text                  NOT NULL DEFAULT '',   -- BOL, ESP, ARG, etc.
  legal_area   legal_area,                                  -- Reutiliza enum existente

  -- Contenido completo del documento
  content      text                  NOT NULL,

  -- Metadata
  issued_date  date,
  source_url   text                  NOT NULL DEFAULT '',
  tags         text[]                NOT NULL DEFAULT '{}',

  -- Control
  is_active    boolean               NOT NULL DEFAULT true,
  created_by   uuid                  REFERENCES auth.users(id),

  created_at   timestamptz           NOT NULL DEFAULT now(),
  updated_at   timestamptz           NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legal_knowledge_doc_type   ON legal_knowledge(doc_type);
CREATE INDEX IF NOT EXISTS idx_legal_knowledge_legal_area ON legal_knowledge(legal_area);
CREATE INDEX IF NOT EXISTS idx_legal_knowledge_tags       ON legal_knowledge USING gin(tags);
-- Índice de búsqueda full-text en español
CREATE INDEX IF NOT EXISTS idx_legal_knowledge_fts        ON legal_knowledge
  USING gin(to_tsvector('spanish', title || ' ' || content));

COMMENT ON TABLE legal_knowledge IS 'Base de conocimiento jurídico: leyes, DS, jurisprudencia, autos supremos. Fuente de verdad para el RAG legal.';


-- ─── TABLA: legal_knowledge_chunks (Fragmentos con embeddings para RAG) ──
-- El texto completo se divide en fragmentos de ~500 tokens para búsqueda vectorial
CREATE TABLE IF NOT EXISTS legal_knowledge_chunks (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id    uuid        NOT NULL REFERENCES legal_knowledge(id) ON DELETE CASCADE,

  -- Fragmento de texto
  chunk_index     integer     NOT NULL,          -- Orden del fragmento dentro del doc
  chunk_text      text        NOT NULL,
  token_count     integer,

  -- Embedding vectorial (dimensión 1536 = OpenAI text-embedding-3-small)
  -- O 768 para multilingual-e5-base. Ajustar según el modelo que se use.
  embedding       vector(1536),

  created_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (knowledge_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_lk_chunks_knowledge_id ON legal_knowledge_chunks(knowledge_id);
-- Índice HNSW para búsqueda vectorial rápida (reemplaza IVFFLAT para mejor recall)
CREATE INDEX IF NOT EXISTS idx_lk_chunks_embedding ON legal_knowledge_chunks
  USING hnsw (embedding vector_cosine_ops);

COMMENT ON TABLE legal_knowledge_chunks IS 'Fragmentos de documentos jurídicos con embeddings para búsqueda semántica (RAG).';


-- ─── TABLA: document_processing_queue (Cola de procesamiento OCR/STT) ────
-- Maneja el pipeline asíncrono: PDF→OCR / Audio→STT → Embedding
CREATE TABLE IF NOT EXISTS document_processing_queue (
  id             uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Origen del documento
  case_file_id   uuid                  REFERENCES case_files(id) ON DELETE CASCADE,
  case_id        uuid                  REFERENCES cases(id) ON DELETE CASCADE,

  -- Tipo de procesamiento
  process_type   text                  NOT NULL DEFAULT 'ocr',  -- ocr, stt, embedding, summary
  input_path     text                  NOT NULL,               -- Ruta en Supabase Storage

  -- Estado del pipeline
  status         doc_processing_status NOT NULL DEFAULT 'pendiente',
  attempts       integer               NOT NULL DEFAULT 0,
  max_attempts   integer               NOT NULL DEFAULT 3,
  error_message  text,

  -- Resultado del procesamiento
  output_text    text,                                         -- Texto extraído por OCR/STT
  output_summary text,                                         -- Resumen generado por IA

  -- Tiempos
  started_at     timestamptz,
  completed_at   timestamptz,

  created_at     timestamptz           NOT NULL DEFAULT now(),
  updated_at     timestamptz           NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_queue_status    ON document_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_doc_queue_case_id   ON document_processing_queue(case_id);
CREATE INDEX IF NOT EXISTS idx_doc_queue_file_id   ON document_processing_queue(case_file_id);

COMMENT ON TABLE document_processing_queue IS 'Cola de procesamiento asíncrono de documentos: OCR para PDFs, STT para audios, generación de embeddings y resúmenes IA.';


-- ─── TABLA: case_document_chunks (Embeddings de docs privados del caso) ──
-- Similar a legal_knowledge_chunks, pero para documentos PRIVADOS de cada caso
CREATE TABLE IF NOT EXISTS case_document_chunks (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id    uuid        NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  case_id         uuid        NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

  chunk_index     integer     NOT NULL,
  chunk_text      text        NOT NULL,
  token_count     integer,

  -- Embedding con misma dimensión que legal_knowledge_chunks
  embedding       vector(1536),

  created_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (case_file_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_case_doc_chunks_case_id ON case_document_chunks(case_id);
CREATE INDEX IF NOT EXISTS idx_case_doc_chunks_file_id ON case_document_chunks(case_file_id);
CREATE INDEX IF NOT EXISTS idx_case_doc_chunks_embedding ON case_document_chunks
  USING hnsw (embedding vector_cosine_ops);

COMMENT ON TABLE case_document_chunks IS 'Embeddings de documentos privados del caso para búsqueda semántica dentro del expediente (RAG sobre documentos del caso).';


-- ─── TABLA: ai_sessions (Sesiones del Asistente Legal IA) ────────────────
CREATE TABLE IF NOT EXISTS ai_sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id     uuid        REFERENCES cases(id) ON DELETE SET NULL,

  title       text        NOT NULL DEFAULT 'Nueva Consulta',
  model       text        NOT NULL DEFAULT 'gpt-4o',       -- Modelo LLM usado
  is_active   boolean     NOT NULL DEFAULT true,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_case_id ON ai_sessions(case_id);

COMMENT ON TABLE ai_sessions IS 'Sesiones de conversación con el Asistente Legal IA. Agrupa los mensajes de una consulta.';


-- ─── TABLA: ai_messages (Mensajes individuales del Asistente IA) ──────────
CREATE TABLE IF NOT EXISTS ai_messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid        NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,

  role            text        NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         text        NOT NULL,

  -- Trazabilidad de fuentes usadas en la respuesta (para RAG auditable)
  sources         jsonb       NOT NULL DEFAULT '[]',  -- Array de {type, id, title, excerpt}

  -- Métricas de uso del LLM
  tokens_used     integer,
  model           text,

  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_session_id ON ai_messages(session_id);

COMMENT ON TABLE ai_messages IS 'Mensajes individuales de cada sesión IA. Incluye trazabilidad de fuentes (leyes y docs del caso) para respuestas auditables.';
