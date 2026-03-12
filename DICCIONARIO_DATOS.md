# 📋 Diccionario de Datos — NyxLex

> Fuente de verdad para nombres de campos, tipos y mapeo Frontend ↔ Base de datos.
> Última actualización: 2026-03-06

---

## 1. CASOS Y EXPEDIENTES (`cases`)

### 1.1 Información Principal

| # | Campo UI | Columna DB | Tipo DB | Default | Origen | Notas |
|---|----------|------------|---------|---------|--------|-------|
| 1 | Nº Expediente | `case_number` | `text` UNIQUE | — | Auto-generado | Formato: `EXP-YYYY-NNN` |
| 2 | Título del Caso | `title` | `text` | — | NewCase Paso 1 | Obligatorio |
| 3 | Área Jurídica | `legal_area` | `enum: legal_area` | — | NewCase Paso 1 | Valores: `civil`, `penal`, `laboral`, `mercantil`, `administrativo`, `familia`, `fiscal` |
| 4 | Tipo de Procedimiento | `procedure_type` | `text` | `''` | NewCase Paso 1 | Valores UI: Judicial, Extrajudicial, Administrativo, Arbitraje, Mediación |
| 5 | Descripción | `description` | `text` | `''` | NewCase Paso 1 | |
| 6 | Prioridad | `priority` | `enum: case_priority` | `'media'` | NewCase Paso 1 | Valores: `baja`, `media`, `alta`, `urgente` |
| 7 | Estado | `status` | `enum: case_status` | `'borrador'` | Sistema / Manual | Valores: `borrador`, `activo`, `audiencia`, `negociacion`, `revision`, `pendiente`, `cerrado`, `archivado` |
| 8 | Fase Procesal | `phase` | `text` | `''` | NewCase Paso 1 | Valores UI: Instrucción, Juicio oral, Conciliación, Redacción, Vista, Recurso, Demanda |
| 9 | Etiquetas | `tags` | `text[]` | `'{}'` | NewCase Paso 1 | Array de texto libre |

### 1.2 Datos Judiciales

| # | Campo UI | Columna DB | Tipo DB | Default | Origen |
|---|----------|------------|---------|---------|--------|
| 10 | Juez / Árbitro | `judge` | `text` | `''` | NewCase Paso 1 |
| 11 | Tribunal / Juzgado | `court` | `text` | `''` | NewCase Paso 1 |

### 1.3 Parte Contraria

| # | Campo UI | Columna DB | Tipo DB | Default | Origen |
|---|----------|------------|---------|---------|--------|
| 12 | Nombre parte contraria | `opposing_name` | `text` | `''` | NewCase Paso 1 |
| 13 | Abogado contrario | `opposing_lawyer` | `text` | `''` | NewCase Paso 1 |
| 14 | Contacto contrario | `opposing_contact` | `text` | `''` | NewCase Paso 1 |

### 1.4 Información Económica

| # | Campo UI | Columna DB | Tipo DB | Default | Origen | Notas |
|---|----------|------------|---------|---------|--------|-------|
| 15 | Presupuesto | `budget` | `numeric` | `0` | NewCase Paso 1 | **Numérico**, no string |
| 16 | Tipo de Honorarios | `fee_type` | `enum: fee_type` | `'precio_fijo'` | NewCase Paso 1 | Valores: `por_hora`, `precio_fijo`, `porcentaje`, `mixto` |
| 17 | Moneda | `currency` | `text` | `'BOB'` | NewCase Paso 1 | Códigos: `BOB`, `USD`, `EUR` |

**Mapeo UI → DB para `fee_type`:**

| Texto en UI | Valor en DB |
|-------------|-------------|
| Por hora | `por_hora` |
| Precio fijo | `precio_fijo` |
| Porcentaje | `porcentaje` |
| Mixto | `mixto` |

**Mapeo UI → DB para `currency`:**

| Texto en UI | Valor en DB | Símbolo |
|-------------|-------------|---------|
| BOB (Bs) | `BOB` | Bs |
| USD ($) | `USD` | $ |
| EUR (€) | `EUR` | € |

### 1.5 Fechas

| # | Campo UI | Columna DB | Tipo DB | Default | Origen | Notas |
|---|----------|------------|---------|---------|--------|-------|
| 18 | Fecha de Apertura | `opened_at` | `timestamptz` | `now()` | Auto | |
| 19 | Fecha Límite | `deadline_at` | `timestamptz` | `null` | NewCase Paso 1 | |
| 20 | Recordatorio | `reminder` | `text` | `'Sin recordatorio'` | NewCase Paso 1 | Valores: Sin recordatorio, 1 día antes, 3 días antes, 1 semana antes, 2 semanas antes |
| 21 | Fecha creación | `created_at` | `timestamptz` | `now()` | Auto | Interno |
| 22 | Fecha actualización | `updated_at` | `timestamptz` | `now()` | Auto | Interno |

### 1.6 Relaciones (FK)

| # | Campo UI | Columna DB | Tipo DB | Destino | Notas |
|---|----------|------------|---------|---------|-------|
| 23 | Cliente | `client_id` | `uuid` nullable | `clients.id` | FK |
| 24 | Creado por | `created_by` | `uuid` | `auth.users.id` | Obligatorio |

### 1.7 Admisión (campos booleanos en `cases`)

| # | Campo UI | Columna DB | Tipo DB | Default | Notas |
|---|----------|------------|---------|---------|-------|
| 25 | Fuente de referencia | `referral_source` | `text` | `''` | Redes sociales, Google, Referido, etc. |
| 26 | Detalle referencia | `referral_detail` | `text` | `''` | Texto libre |
| 27 | Fecha consulta inicial | `consultation_date` | `timestamptz` | `null` | |
| 28 | Tipo consulta | `consultation_type` | `text` | `'presencial'` | presencial, virtual, telefónica |
| 29 | Checklist IA generado | `checklist_generated` | `boolean` | `false` | |
| 30 | Carta compromiso firmada | `commitment_signed` | `boolean` | `false` | |
| 31 | Email bienvenida enviado | `welcome_email_sent` | `boolean` | `false` | |
| 32 | Admisión completada | `admission_completed` | `boolean` | `false` | |

**Total campos en `cases`: 32**

---

## 2. TABLAS RELACIONADAS A CASOS

### 2.1 `case_lawyers` — Abogados asignados al caso

| # | Columna DB | Tipo DB | Default | Notas |
|---|------------|---------|---------|-------|
| 1 | `id` | `uuid` PK | `gen_random_uuid()` | |
| 2 | `case_id` | `uuid` FK | — | → `cases.id` |
| 3 | `user_id` | `uuid` FK | — | → `profiles.user_id` |
| 4 | `is_lead` | `boolean` | `false` | Abogado principal |
| 5 | `assigned_at` | `timestamptz` | `now()` | |

### 2.2 `case_events` — Eventos del caso (audiencias, citas, vencimientos)

| # | Columna DB | Tipo DB | Default | Notas |
|---|------------|---------|---------|-------|
| 1 | `id` | `uuid` PK | `gen_random_uuid()` | |
| 2 | `case_id` | `uuid` FK | — | → `cases.id` |
| 3 | `title` | `text` | — | |
| 4 | `description` | `text` | `''` | |
| 5 | `event_at` | `timestamptz` | — | Fecha y hora del evento |
| 6 | `event_type` | `enum: event_type` | `'otro'` | `audiencia`, `vencimiento`, `cita`, `reunion`, `otro` |
| 7 | `completed` | `boolean` | `false` | |
| 8 | `reminder` | `text` | `'Sin recordatorio'` | |
| 9 | `created_by` | `uuid` | — | |
| 10 | `created_at` | `timestamptz` | `now()` | |

> **NOTA:** Las audiencias del caso se registran aquí como `event_type='audiencia'`, NO como campo suelto en `cases`.

### 2.3 `case_notes` — Notas de texto y audio

| # | Columna DB | Tipo DB | Default | Notas |
|---|------------|---------|---------|-------|
| 1 | `id` | `uuid` PK | `gen_random_uuid()` | |
| 2 | `case_id` | `uuid` FK | — | → `cases.id` |
| 3 | `user_id` | `uuid` | — | Autor |
| 4 | `content` | `text` | `''` | |
| 5 | `note_type` | `enum: note_type` | `'text'` | `text`, `audio` |
| 6 | `duration` | `text` | `''` | Duración si es audio |
| 7 | `ai_summary` | `text` | `''` | Resumen IA |
| 8 | `created_at` | `timestamptz` | `now()` | |
| 9 | `updated_at` | `timestamptz` | `now()` | |

### 2.4 `case_communications` — Correos / emails

| # | Columna DB | Tipo DB | Default | Notas |
|---|------------|---------|---------|-------|
| 1 | `id` | `uuid` PK | `gen_random_uuid()` | |
| 2 | `case_id` | `uuid` FK | — | → `cases.id` |
| 3 | `from_name` | `text` | — | Remitente |
| 4 | `to_address` | `text` | — | Destinatario |
| 5 | `subject` | `text` | `''` | |
| 6 | `body` | `text` | `''` | |
| 7 | `is_outgoing` | `boolean` | `true` | Enviado vs Recibido |
| 8 | `sent_at` | `timestamptz` | `now()` | |
| 9 | `created_by` | `uuid` | — | |

### 2.5 `case_files` — Archivos adjuntos

| # | Columna DB | Tipo DB | Default | Notas |
|---|------------|---------|---------|-------|
| 1 | `id` | `uuid` PK | `gen_random_uuid()` | |
| 2 | `case_id` | `uuid` FK | — | → `cases.id` |
| 3 | `file_name` | `text` | — | |
| 4 | `file_type` | `text` | `''` | pdf, doc, img, audio, video |
| 5 | `file_size` | `text` | `''` | |
| 6 | `storage_path` | `text` | `''` | Ruta en storage bucket |
| 7 | `uploaded_by` | `uuid` | — | |
| 8 | `uploaded_at` | `timestamptz` | `now()` | |

### 2.6 `case_timeline` — Cronología automática

| # | Columna DB | Tipo DB | Default | Notas |
|---|------------|---------|---------|-------|
| 1 | `id` | `uuid` PK | `gen_random_uuid()` | |
| 2 | `case_id` | `uuid` FK | — | → `cases.id` |
| 3 | `title` | `text` | — | Descripción del hito |
| 4 | `detail` | `text` | `''` | |
| 5 | `icon` | `text` | `'status'` | form, calendar, doc, note, status |
| 6 | `author` | `text` | `''` | |
| 7 | `created_at` | `timestamptz` | `now()` | |

### 2.7 `case_actions` — Registro de actividad

| # | Columna DB | Tipo DB | Default | Notas |
|---|------------|---------|---------|-------|
| 1 | `id` | `uuid` PK | `gen_random_uuid()` | |
| 2 | `case_id` | `uuid` FK | — | → `cases.id` |
| 3 | `title` | `text` | — | |
| 4 | `description` | `text` | `''` | |
| 5 | `action_type` | `text` | — | Tipo libre |
| 6 | `action_date` | `timestamptz` | `now()` | |
| 7 | `category` | `enum: action_category` | — | Ver enum abajo |
| 8 | `priority` | `text` | `'media'` | |
| 9 | `completed` | `boolean` | `false` | |
| 10 | `completed_at` | `timestamptz` | `null` | |
| 11 | `metadata` | `jsonb` | `'{}'` | Datos flexibles |
| 12 | `related_event_id` | `uuid` FK nullable | `null` | → `case_events.id` |
| 13 | `related_file_id` | `uuid` FK nullable | `null` | → `case_files.id` |
| 14 | `created_by` | `uuid` | — | |
| 15 | `created_at` | `timestamptz` | `now()` | |

---

## 3. CLIENTES (`clients`)

### 3.1 Campos existentes en DB

| # | Campo UI | Columna DB | Tipo DB | Default | Notas |
|---|----------|------------|---------|---------|-------|
| 1 | Nombre completo | `name` | `text` | — | Nombre+Apellido o Razón Social |
| 2 | Email | `email` | `text` | `''` | |
| 3 | Teléfono | `phone` | `text` | `''` | Incluye prefijo |
| 4 | Dirección | `address` | `text` | `''` | |
| 5 | Empresa | `company` | `text` | `''` | Solo si es persona jurídica |
| 6 | Notas | `notes` | `text` | `''` | |
| 7 | Creado por | `created_by` | `uuid` | — | |
| 8 | Fecha creación | `created_at` | `timestamptz` | `now()` | |
| 9 | Fecha actualización | `updated_at` | `timestamptz` | `now()` | |

### 3.2 Campos usados en UI pero ⚠️ NO en tabla DB (pendientes de migración)

| # | Campo UI | Columna propuesta | Tipo propuesto | Default | Notas |
|---|----------|-------------------|----------------|---------|-------|
| 10 | Tipo de cliente | `client_type` | `text` | `'Persona Natural'` | Persona Natural, Persona Jurídica, Autónomo, Institución Pública |
| 11 | Tipo de documento | `document_type` | `text` | `''` | CI, Pasaporte, NIT, RUC, DNI, NIE |
| 12 | Nº documento | `document_number` | `text` | `''` | |
| 13 | Ocupación | `occupation` | `text` | `''` | |
| 14 | Ciudad | `city` | `text` | `''` | |
| 15 | Teléfono secundario | `phone_secondary` | `text` | `''` | |
| 16 | Sitio web | `website` | `text` | `''` | |
| 17 | Fecha de ingreso | `join_date` | `date` | `now()` | |
| 18 | Estado | `status` | `text` | `'Activo'` | Activo, Inactivo, Prospecto, VIP |
| 19 | Valoración | `rating` | `integer` | `3` | 1–5 estrellas |
| 20 | Áreas legales | `legal_areas` | `text[]` | `'{}'` | Derivado de los casos del cliente |
| 21 | Saldo pendiente | `balance` | `numeric` | `0` | |
| 22 | Prefijo telefónico | `phone_prefix` | `text` | `'+591'` | +591, +34, +54, etc. |

---

## 4. PLAZOS Y CALENDARIO

El calendario se alimenta directamente de `case_events`. **No existe tabla separada.**

### 4.1 Campos consumidos por Calendar.tsx

| Campo mostrado | Fuente DB | Tabla | Notas |
|----------------|-----------|-------|-------|
| Título evento | `title` | `case_events` | |
| Descripción | `description` | `case_events` | |
| Fecha y hora | `event_at` | `case_events` | Posicionamiento en calendario |
| Tipo evento | `event_type` | `case_events` | audiencia, vencimiento, cita, reunion, otro |
| Completado | `completed` | `case_events` | |
| Recordatorio | `reminder` | `case_events` | |
| Caso vinculado | `case_id` | `case_events` | FK → cases |
| Área jurídica (badge) | `legal_area` | `cases` | JOIN con cases |
| Urgente (sí/no) | — | derivado | Se calcula desde `cases.priority` o `cases.deadline_at` |
| Hora (display) | — | derivado | Extraído de `event_at` |
| Día del mes | — | derivado | Extraído de `event_at` |

### 4.2 Campos de fecha en `cases` que alimentan plazos

| Campo UI | Columna DB | Notas |
|----------|------------|-------|
| Fecha límite | `deadline_at` | Vencimiento principal |
| Recordatorio | `reminder` | Texto descriptivo |
| Fecha apertura | `opened_at` | Referencia temporal |

---

## 5. TAREAS Y WORKFLOW

### 5.1 Tabla propuesta: `tasks` (⚠️ NO EXISTE AÚN — necesita migración)

| # | Campo UI | Columna DB | Tipo DB | Default | Notas |
|---|----------|------------|---------|---------|-------|
| 1 | ID | `id` | `uuid` PK | `gen_random_uuid()` | |
| 2 | Título / Subtarea | `title` | `text` | — | Subtipo seleccionado en formulario |
| 3 | Categoría | `category` | `text` | — | Ver §5.3 |
| 4 | Caso vinculado | `case_id` | `uuid` FK nullable | `null` | → `cases.id` |
| 5 | Prioridad | `priority` | `enum: case_priority` | `'media'` | Reutiliza enum de casos |
| 6 | Estado | `status` | `text` | `'pendiente'` | `pendiente`, `en_progreso`, `completada` |
| 7 | Fecha límite | `due_date` | `timestamptz` | `null` | |
| 8 | Hora asignada | `due_time` | `text` | `''` | HH:MM |
| 9 | Duración estimada | `estimated_duration` | `text` | `''` | 15 min, 30 min, 1 hora, etc. |
| 10 | Notas | `notes` | `text` | `''` | |
| 11 | Origen IA | `is_ai_suggested` | `boolean` | `false` | |
| 12 | Confianza IA | `ai_confidence` | `integer` | `null` | 0–100 |
| 13 | Razón IA | `ai_reason` | `text` | `''` | |
| 14 | Aprobada | `approved` | `boolean` | `true` | false si pendiente de aprobación IA |
| 15 | Creado por | `created_by` | `uuid` | — | |
| 16 | Fecha creación | `created_at` | `timestamptz` | `now()` | |
| 17 | Fecha actualización | `updated_at` | `timestamptz` | `now()` | |

### 5.2 Tabla propuesta: `task_assignees` (⚠️ NO EXISTE AÚN)

Relación muchos-a-muchos para asignación múltiple de abogados.

| # | Columna DB | Tipo DB | Default | Notas |
|---|------------|---------|---------|-------|
| 1 | `id` | `uuid` PK | `gen_random_uuid()` | |
| 2 | `task_id` | `uuid` FK | — | → `tasks.id` |
| 3 | `user_id` | `uuid` FK | — | → `profiles.user_id` |
| 4 | `assigned_at` | `timestamptz` | `now()` | |

### 5.3 Categorías de Tareas (UNIFICADAS para todo el proyecto)

Estas categorías se usan tanto en **Tasks.tsx** como en **Clients.tsx**.

| ID en DB | Etiqueta UI | Subtipos |
|----------|-------------|----------|
| `tiempos` | Tiempos y Plazos | Alerta de fecha límite, Programar cita con cliente, Programar reunión con experto/perito, Recordatorio de plazo procesal |
| `documentos` | Documentos | Redactar demanda, Redactar recurso o apelación, Redactar contrato, Redactar informe legal, Revisar y corregir documento, Preparar escrito judicial |
| `investigacion` | Investigación Legal | Buscar jurisprudencia y precedentes, Investigar leyes y regulaciones, Revisar casos similares, Análisis de evidencia o pruebas |
| `cliente` | Interacción Cliente | Notificar avances del caso, Coordinar reunión de seguimiento, Asesoría en decisión estratégica, Preparar cliente para audiencia/juicio, Explicar sentencia o resolución |
| `coordinacion` | Coordinación | Contactar perito o testigo, Coordinar con otro abogado, Preparar testigos para declaración, Solicitar informes a terceros |
| `administrativa` | Administrativa | Gestión de pagos y facturación, Presentar documentos ante tribunal, Presentar documentos ante autoridad administrativa, Gestionar trámites registrales, Actualizar expediente / base de datos |

### 5.4 Mapeo de tipos antiguos de Clients.tsx → Categorías unificadas

| ID antiguo (Clients.tsx) | Categoría unificada | Subtipo equivalente |
|--------------------------|--------------------|--------------------|
| `consulta_inicial` | `cliente` | Coordinar reunión de seguimiento |
| `recoleccion_info` | `coordinacion` | Solicitar informes a terceros |
| `firma_documentos` | `documentos` | Preparar escrito judicial |
| `estrategia` | `cliente` | Asesoría en decisión estratégica |
| `audiencia_juicio` | `tiempos` | Alerta de fecha límite |
| `seguimiento` | `cliente` | Notificar avances del caso |
| `prep_testigos` | `coordinacion` | Preparar testigos para declaración |
| `negociacion` | `cliente` | Asesoría en decisión estratégica |
| `revision_contratos` | `documentos` | Revisar y corregir documento |
| `analisis_evidencia` | `investigacion` | Análisis de evidencia o pruebas |
| `recurso_apelacion` | `documentos` | Redactar recurso o apelación |
| `asesoria_admin` | `administrativa` | Gestión de pagos y facturación |
| `revision_sentencia` | `investigacion` | Revisar casos similares |
| `jurisprudencia` | `investigacion` | Buscar jurisprudencia y precedentes |

---

## 6. PERFILES DE USUARIO (`profiles`)

| # | Campo UI | Columna DB | Tipo DB | Default | Notas |
|---|----------|------------|---------|---------|-------|
| 1 | ID | `id` | `uuid` PK | `gen_random_uuid()` | |
| 2 | User ID (auth) | `user_id` | `uuid` UNIQUE | — | Referencia a auth.users |
| 3 | Nombre | `first_name` | `text` | `''` | |
| 4 | Apellido | `last_name` | `text` | `''` | |
| 5 | Iniciales | `initials` | `text` | `''` | Auto-calculadas |
| 6 | Email | `email` | `text` | `''` | |
| 7 | Teléfono | `phone` | `text` | `''` | |
| 8 | Especialidad | `specialty` | `text` | `''` | |
| 9 | Avatar URL | `avatar_url` | `text` | `''` | |
| 10 | Fecha creación | `created_at` | `timestamptz` | `now()` | |
| 11 | Fecha actualización | `updated_at` | `timestamptz` | `now()` | |

---

## 7. ROLES DE USUARIO (`user_roles`)

| # | Columna DB | Tipo DB | Default | Notas |
|---|------------|---------|---------|-------|
| 1 | `id` | `uuid` PK | `gen_random_uuid()` | |
| 2 | `user_id` | `uuid` FK | — | → auth.users |
| 3 | `role` | `enum: app_role` | `'lawyer'` | `admin`, `lawyer` |

---

## 8. ENUMS REGISTRADOS EN BASE DE DATOS

| Enum | Valores | Usado en |
|------|---------|----------|
| `legal_area` | `civil`, `penal`, `laboral`, `mercantil`, `administrativo`, `familia`, `fiscal` | `cases.legal_area` |
| `case_status` | `borrador`, `activo`, `audiencia`, `negociacion`, `revision`, `pendiente`, `cerrado`, `archivado` | `cases.status` |
| `case_priority` | `baja`, `media`, `alta`, `urgente` | `cases.priority`, `tasks.priority` |
| `fee_type` | `por_hora`, `precio_fijo`, `porcentaje`, `mixto` | `cases.fee_type` |
| `event_type` | `audiencia`, `vencimiento`, `cita`, `reunion`, `otro` | `case_events.event_type` |
| `note_type` | `text`, `audio` | `case_notes.note_type` |
| `action_category` | `comunicacion`, `documento`, `reunion`, `accion_legal`, `pago`, `tarea`, `cambio_estado`, `firma`, `cambio_cliente`, `administrativo`, `alerta` | `case_actions.category` |
| `app_role` | `admin`, `lawyer` | `user_roles.role` |

---

## 9. CONSTANTES COMPARTIDAS (Frontend)

### 9.1 Listas de abogados

Todos los módulos deben consumir la tabla `profiles` en producción. En modo mock, usar esta lista unificada:

| Nombre completo | Iniciales | Color asignado | Rol |
|-----------------|-----------|----------------|-----|
| Ana Rodríguez | AR | `hsl(190 100% 50%)` | Abogada Senior |
| Carlos López | CL | `hsl(260 80% 65%)` | Abogado Asociado |
| María Torres | MT | `hsl(150 90% 45%)` | Abogada Junior |
| Pedro Sánchez | PS | `hsl(45 100% 55%)` | Pasante Legal |

### 9.2 Prioridades (colores UI)

| Valor DB | Etiqueta UI | Color | Background |
|----------|-------------|-------|------------|
| `baja` | Baja | `hsl(142 70% 55%)` | `hsl(142 70% 48% / 0.15)` |
| `media` | Media | `hsl(217 91% 70%)` | `hsl(217 91% 60% / 0.15)` |
| `alta` | Alta | `hsl(38 92% 65%)` | `hsl(38 92% 55% / 0.15)` |
| `urgente` | Urgente | `hsl(0 72% 65%)` | `hsl(0 72% 55% / 0.15)` |

### 9.3 Duraciones estándar (Tareas)

`15 min`, `30 min`, `1 hora`, `2 horas`, `Medio día`, `Todo el día`

### 9.4 Franjas horarias (Tareas y Calendario)

`08:00` a `18:00` en intervalos de 30 minutos.

---

## 10. ⚠️ INCONSISTENCIAS DETECTADAS Y ESTADO DE RESOLUCIÓN

| # | Ubicación | Problema | Estado | Resolución |
|---|-----------|----------|--------|------------|
| 1 | `Cases.tsx` mock | `honorarios` (texto) vs DB `fee_type` (enum) | ✅ Resuelto | Mapeado: Por hora→`por_hora`, Precio fijo→`precio_fijo`, etc. |
| 2 | `Cases.tsx` mock | `hearing` (string suelto) no existe en DB | ✅ Resuelto | Se maneja como dato derivado de `case_events` tipo `audiencia` |
| 3 | `NewCase.tsx` | `budget` guardado como string | ✅ Resuelto | Se parsea a `number` antes de guardar |
| 4 | `NewCase.tsx` | `currency` como "BOB (Bs)" vs DB código corto | ✅ Resuelto | Mapeo: "BOB (Bs)"→`BOB`, "USD ($)"→`USD`, "EUR (€)"→`EUR` |
| 5 | `Clients.tsx` | 13 campos en UI sin columnas en DB | ⏳ Pendiente | Requiere migración (§3.2) |
| 6 | `Clients.tsx` | `taskTypes` con nombres distintos a `Tasks.tsx` | ✅ Documentado | Mapeo de equivalencias en §5.4 |
| 7 | `Tasks.tsx` | No existe tabla `tasks` en DB | ⏳ Pendiente | Requiere migración (§5.1) |
| 8 | `Calendar.tsx` | Datos mock, no consume `case_events` | ⏳ Pendiente | Conectar a `case_events` |
| 9 | Mock `lawyersList` | Listas duplicadas e inconsistentes | ✅ Documentado | Lista unificada en §9.1 |
| 10 | Mock `clientsList` | Hardcodeada, no consume `clients` | ⏳ Pendiente | Conectar a tabla `clients` |

---

## 11. RESUMEN DE TABLAS

| Tabla | Estado DB | Módulos que la consumen |
|-------|-----------|------------------------|
| `cases` | ✅ Existe | NewCase, Cases, Tasks, Calendar |
| `clients` | ⚠️ Parcial (faltan 13 cols) | NewClient, Clients, Cases |
| `case_lawyers` | ✅ Existe | NewCase, Cases |
| `case_events` | ✅ Existe | Calendar, Cases |
| `case_notes` | ✅ Existe | Cases (tab Notas) |
| `case_communications` | ✅ Existe | Cases (tab Comunicaciones) |
| `case_files` | ✅ Existe | Cases (tab Archivos) |
| `case_timeline` | ✅ Existe | Cases (tab Cronología) |
| `case_actions` | ✅ Existe | Sistema automático |
| `profiles` | ✅ Existe | Auth, Settings, abogados |
| `user_roles` | ✅ Existe | SuperAdmin, RLS |
| `tasks` | ❌ No existe | Tasks |
| `task_assignees` | ❌ No existe | Tasks |
