-- =============================================================================
-- MIGRACIÓN 002: Columnas faltantes en tabla `clients`
-- Proyecto: NyxLex
-- Fecha: 2026-03-11
-- Descripción: Agrega los 13 campos del §3.2 del Diccionario de Datos que
--              se usan en el frontend (Clients.tsx) pero no existían en la DB.
--              La operación es ADITIVA — columnas existentes no se tocan.
-- =============================================================================

ALTER TABLE clients
  -- Tipo de cliente (Persona Natural, Persona Jurídica, etc.)
  ADD COLUMN IF NOT EXISTS client_type    client_type   NOT NULL DEFAULT 'persona_natural',

  -- Documento de identidad
  ADD COLUMN IF NOT EXISTS document_type  text          NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS document_number text         NOT NULL DEFAULT '',

  -- Información adicional personal
  ADD COLUMN IF NOT EXISTS occupation     text          NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city           text          NOT NULL DEFAULT '',

  -- Contacto adicional
  ADD COLUMN IF NOT EXISTS phone_prefix   text          NOT NULL DEFAULT '+591',
  ADD COLUMN IF NOT EXISTS phone_secondary text         NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website        text          NOT NULL DEFAULT '',

  -- Estado y valoración del cliente
  ADD COLUMN IF NOT EXISTS status         text          NOT NULL DEFAULT 'Activo',
  ADD COLUMN IF NOT EXISTS rating         integer       NOT NULL DEFAULT 3
                                          CHECK (rating BETWEEN 1 AND 5),

  -- Fecha de ingreso al bufete
  ADD COLUMN IF NOT EXISTS join_date      date          NOT NULL DEFAULT CURRENT_DATE,

  -- Áreas legales activas del cliente (derivado de sus casos)
  ADD COLUMN IF NOT EXISTS legal_areas    text[]        NOT NULL DEFAULT '{}',

  -- Saldo pendiente de cobro
  ADD COLUMN IF NOT EXISTS balance        numeric(12,2) NOT NULL DEFAULT 0
                                          CHECK (balance >= 0);

-- Índice para búsquedas por ciudad y estado frecuentes
CREATE INDEX IF NOT EXISTS idx_clients_city   ON clients(city);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Comentarios en columnas para documentación de la DB
COMMENT ON COLUMN clients.client_type     IS 'Tipo de cliente: persona_natural, persona_juridica, autonomo, institucion_publica';
COMMENT ON COLUMN clients.document_type   IS 'Tipo de documento: CI, Pasaporte, NIT, RUC, DNI, NIE';
COMMENT ON COLUMN clients.document_number IS 'Número del documento de identidad';
COMMENT ON COLUMN clients.occupation      IS 'Ocupación o actividad principal del cliente';
COMMENT ON COLUMN clients.city            IS 'Ciudad de residencia o sede';
COMMENT ON COLUMN clients.phone_prefix    IS 'Prefijo telefónico (e.g. +591, +34)';
COMMENT ON COLUMN clients.phone_secondary IS 'Teléfono secundario o de contacto alternativo';
COMMENT ON COLUMN clients.website         IS 'Sitio web del cliente o empresa';
COMMENT ON COLUMN clients.status          IS 'Estado del cliente: Activo, Inactivo, Prospecto, VIP';
COMMENT ON COLUMN clients.rating          IS 'Valoración del cliente 1-5 estrellas';
COMMENT ON COLUMN clients.join_date       IS 'Fecha de ingreso como cliente del bufete';
COMMENT ON COLUMN clients.legal_areas     IS 'Áreas legales activas derivadas de sus casos';
COMMENT ON COLUMN clients.balance         IS 'Saldo pendiente de cobro en la moneda principal del bufete';
