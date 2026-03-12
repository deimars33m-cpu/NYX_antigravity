-- =============================================================================
-- MIGRACIÓN 004: Módulo Facturación
-- Proyecto: NyxLex
-- Fecha: 2026-03-11
-- Descripción: Tablas para el módulo de Facturación y Finanzas.
--              Diseñadas para soportar facturación por hora, precio fijo,
--              porcentaje y mixto (alineado con fee_type de casos).
-- =============================================================================

-- ─── TABLA: invoices (Facturas) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  case_id         uuid          REFERENCES cases(id) ON DELETE SET NULL,
  client_id       uuid          NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  created_by      uuid          NOT NULL REFERENCES auth.users(id),

  -- Identificación
  invoice_number  text          UNIQUE NOT NULL, -- Formato: FAC-YYYY-NNN
  title           text          NOT NULL DEFAULT '',

  -- Importes
  subtotal        numeric(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax_rate        numeric(5,2)  NOT NULL DEFAULT 0 CHECK (tax_rate BETWEEN 0 AND 100),
  tax_amount      numeric(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  discount        numeric(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total           numeric(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  currency        text          NOT NULL DEFAULT 'BOB',   -- BOB, USD, EUR

  -- Estado y fechas
  status          billing_status NOT NULL DEFAULT 'borrador',
  issue_date      date          NOT NULL DEFAULT CURRENT_DATE,
  due_date        date,
  paid_at         timestamptz,

  -- Notas
  notes           text          NOT NULL DEFAULT '',

  -- Auditoría
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_case_id   ON invoices(case_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status    ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date  ON invoices(due_date) WHERE due_date IS NOT NULL;

COMMENT ON TABLE invoices IS 'Facturas emitidas por el bufete. Vinculadas a un cliente y opcionalmente a un caso.';


-- ─── TABLA: invoice_items (Líneas de detalle de factura) ─────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid          NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Descripción del servicio
  description  text          NOT NULL,
  category     text          NOT NULL DEFAULT '',  -- honorarios, gastos, tasas, etc.

  -- Qty y precio
  quantity     numeric(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit         fee_unit      NOT NULL DEFAULT 'hora',
  unit_price   numeric(12,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  total        numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

  -- Referencia a registro de horas (si aplica)
  time_entry_id uuid         REFERENCES time_entries(id) ON DELETE SET NULL,

  -- Orden de aparición en la factura
  sort_order   integer       NOT NULL DEFAULT 0,

  created_at   timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

COMMENT ON TABLE invoice_items IS 'Líneas de detalle de cada factura: horas, servicios, gastos, tasas.';


-- ─── TABLA: time_entries (Registro de horas trabajadas) ──────────────────
CREATE TABLE IF NOT EXISTS time_entries (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  case_id      uuid          REFERENCES cases(id) ON DELETE SET NULL,
  user_id      uuid          NOT NULL REFERENCES auth.users(id),

  -- Descripción del trabajo
  description  text          NOT NULL,
  category     text          NOT NULL DEFAULT '',   -- Alineado con §5.3 de tareas

  -- Tiempo
  started_at   timestamptz   NOT NULL,
  ended_at     timestamptz,
  duration_minutes integer   CHECK (duration_minutes >= 0), -- calculado o manual

  -- Facturación
  hourly_rate  numeric(12,2) NOT NULL DEFAULT 0,
  billable     boolean       NOT NULL DEFAULT true,
  billed       boolean       NOT NULL DEFAULT false,
  invoice_id   uuid          REFERENCES invoices(id) ON DELETE SET NULL,

  -- Auditoría
  created_at   timestamptz   NOT NULL DEFAULT now(),
  updated_at   timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_case_id ON time_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_billable ON time_entries(billable, billed);

COMMENT ON TABLE time_entries IS 'Registro de horas trabajadas por abogado en cada caso. Base para facturación por hora.';


-- ─── TABLA: payments (Pagos recibidos) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id             uuid           PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  invoice_id     uuid           NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
  client_id      uuid           NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  registered_by  uuid           NOT NULL REFERENCES auth.users(id),

  -- Importe
  amount         numeric(12,2)  NOT NULL CHECK (amount > 0),
  currency       text           NOT NULL DEFAULT 'BOB',

  -- Método y referencia
  method         payment_method NOT NULL DEFAULT 'transferencia',
  reference      text           NOT NULL DEFAULT '',  -- Nº de transferencia, recibo, etc.

  -- Fecha
  paid_at        timestamptz    NOT NULL DEFAULT now(),

  -- Notas
  notes          text           NOT NULL DEFAULT '',

  created_at     timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id  ON payments(client_id);

COMMENT ON TABLE payments IS 'Pagos recibidos de clientes. Un invoice puede recibir pagos parciales.';
