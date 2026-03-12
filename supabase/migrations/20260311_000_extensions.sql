-- =============================================================================
-- MIGRACIÓN 000: Extensiones PostgreSQL
-- Proyecto: NyxLex
-- Fecha: 2026-03-11
-- Descripción: Habilita las extensiones necesarias para el funcionamiento
--              actual y futuro del sistema (IA, búsqueda semántica, UUIDs).
-- =============================================================================

-- Generación de UUIDs (ya probablemente activo, se asegura aquí)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Búsqueda vectorial para RAG (Biblioteca Jurídica, Asistente IA)
-- Permite almacenar embeddings de texto para búsqueda semántica
CREATE EXTENSION IF NOT EXISTS vector;

-- Búsqueda fuzzy de texto (buscar casos/clientes con errores tipográficos)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Generación de números aleatorios seguros (para tokens de notificación, etc.)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
