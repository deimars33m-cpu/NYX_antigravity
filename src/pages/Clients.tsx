import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Users, Plus, Search, Mail, Phone, MapPin, Star,
  FolderOpen, X, Edit2, Save, ChevronDown, Check,
  Briefcase, Calendar, Building2, FileText, User, ExternalLink,
  LayoutGrid, LayoutList, ClipboardPlus, Clock, AlertTriangle,
} from "lucide-react";
import { LawBadge, LawType, lawConfig } from "@/components/LawBadge";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* ─── Task types catalog ─────────────────────────────────── */
const taskTypes = [
  { id: "consulta_inicial", label: "Consulta Inicial", icon: "📋" },
  { id: "recoleccion_info", label: "Recolección de Información", icon: "📂" },
  { id: "firma_documentos", label: "Firma de Documentos", icon: "✍️" },
  { id: "estrategia", label: "Estrategia / Planificación", icon: "🧩" },
  { id: "audiencia_juicio", label: "Audiencia / Juicio", icon: "⚖️" },
  { id: "seguimiento", label: "Seguimiento del Caso", icon: "🔄" },
  { id: "prep_testigos", label: "Preparación de Testigos", icon: "🗣️" },
  { id: "negociacion", label: "Negociación / Acuerdo", icon: "🤝" },
  { id: "revision_contratos", label: "Revisión de Contratos", icon: "📑" },
  { id: "analisis_evidencia", label: "Análisis de Evidencia", icon: "🔍" },
  { id: "recurso_apelacion", label: "Recurso / Apelación", icon: "📤" },
  { id: "asesoria_admin", label: "Asesoría Administrativa", icon: "🏛️" },
  { id: "revision_sentencia", label: "Revisión de Sentencia", icon: "📜" },
  { id: "jurisprudencia", label: "Revisión de Jurisprudencia", icon: "📚" },
] as const;

/* ─── Types ──────────────────────────────────────────────── */
export type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string;
  cases: number;
  status: string;
  rating: number;
  types: LawType[];
  balance: string;
  occupation: string;
  joinDate: string;
  docType: string;
  docNumber: string;
  notes: string;
};

/* Fake cases per client (Keep for UI depth if requested, or replace later) */
const casesByClient: Record<string, { id: string; title: string; type: LawType; status: string; date: string; progress: number }[]> = {
  1: [
    { id: "EXP-2024-041", title: "Divorcio por mutuo acuerdo", type: "familia", status: "En curso", date: "2024-02-10", progress: 65 },
    { id: "EXP-2024-018", title: "Reclamación daños y perjuicios", type: "civil", status: "En curso", date: "2024-01-05", progress: 40 },
    { id: "EXP-2023-112", title: "Herencia testamentaria", type: "civil", status: "Cerrado", date: "2023-09-14", progress: 100 },
  ],
  2: [
    { id: "EXP-2024-055", title: "Fusión empresarial", type: "mercantil", status: "En curso", date: "2024-03-01", progress: 30 },
    { id: "EXP-2024-033", title: "Inspección fiscal Q1", type: "fiscal", status: "En curso", date: "2024-01-20", progress: 55 },
    { id: "EXP-2023-200", title: "Contrato distribución Europa", type: "mercantil", status: "Cerrado", date: "2023-11-10", progress: 100 },
    { id: "EXP-2023-180", title: "Litigio proveedor", type: "mercantil", status: "En pausa", date: "2023-10-05", progress: 70 },
    { id: "EXP-2022-099", title: "Constitución S.L.", type: "mercantil", status: "Cerrado", date: "2022-12-01", progress: 100 },
  ],
  3: [
    { id: "EXP-2024-060", title: "Defensa penal — delito informático", type: "penal", status: "En curso", date: "2024-03-15", progress: 20 },
  ],
  4: [
    { id: "EXP-2024-022", title: "Despido improcedente", type: "laboral", status: "En curso", date: "2024-01-28", progress: 50 },
    { id: "EXP-2023-145", title: "Acoso laboral", type: "laboral", status: "Cerrado", date: "2023-08-30", progress: 100 },
  ],
  5: [
    { id: "EXP-2024-070", title: "Declaración IRPF 2023", type: "fiscal", status: "En curso", date: "2024-04-01", progress: 80 },
    { id: "EXP-2024-048", title: "Exportación a Francia", type: "mercantil", status: "En curso", date: "2024-02-20", progress: 45 },
    { id: "EXP-2023-188", title: "Sanción Hacienda", type: "fiscal", status: "Cerrado", date: "2023-10-14", progress: 100 },
    { id: "EXP-2022-120", title: "Registro de marca", type: "mercantil", status: "Cerrado", date: "2022-09-05", progress: 100 },
  ],
  6: [
    { id: "EXP-2022-077", title: "Custodia compartida", type: "familia", status: "Cerrado", date: "2022-07-10", progress: 100 },
    { id: "EXP-2022-040", title: "Pensión alimenticia", type: "familia", status: "Cerrado", date: "2022-05-01", progress: 100 },
  ],
};

/* ─── Constants ──────────────────────────────────────────── */
const occupations = [
  "Empresario / Emprendedor", "Empleado Dependiente", "Profesional Liberal",
  "Comerciante", "Estudiante", "Jubilado / Pensionado", "Ama/o de Casa",
  "Servidor Público", "Agricultor / Ganadero", "Otro",
];
const cities = [
  "La Paz", "Cochabamba", "Santa Cruz", "Oruro", "Potosí", "Sucre", "Tarija", "Beni", "Pando",
  "Madrid", "Barcelona", "Buenos Aires", "Lima", "Bogotá", "Ciudad de México",
];
const statusOptions = ["Activo", "Inactivo", "Prospecto", "VIP"];
const statusColors: Record<string, string> = {
  Activo: "hsl(142 70% 48%)",
  Inactivo: "hsl(var(--muted-foreground))",
  Prospecto: "hsl(217 91% 60%)",
  VIP: "hsl(38 92% 55%)",
};
const legalAreasAll: { type: LawType; label: string }[] = [
  { type: "civil", label: "Civil" },
  { type: "penal", label: "Penal" },
  { type: "laboral", label: "Laboral" },
  { type: "mercantil", label: "Mercantil" },
  { type: "administrativo", label: "Administrativo" },
  { type: "familia", label: "Familia" },
  { type: "fiscal", label: "Fiscal" },
];
const caseStatusColor: Record<string, string> = {
  "En curso": "hsl(217 91% 60%)",
  "En pausa": "hsl(38 92% 55%)",
  "Cerrado": "hsl(142 70% 48%)",
};

/* ─── Shared micro-components ────────────────────────────── */
function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none"
      style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
      onFocus={e => { e.currentTarget.style.borderColor = "hsl(var(--primary)/0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary)/0.1)"; }}
      onBlur={e => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; }}
    />
  );
}

function CustomSelect({ options, value, onChange, placeholder }: { options: string[]; value: string; onChange: (v: string) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm"
        style={{ background: "hsl(var(--secondary))", border: `1px solid ${open ? "hsl(var(--primary)/0.5)" : "hsl(var(--border))"}`, color: value ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
        <span>{value || placeholder}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "hsl(var(--muted-foreground))" }} />
      </button>
      {open && (
        <div className="absolute z-[400] top-full mt-1 w-full rounded-xl shadow-2xl overflow-auto max-h-48"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 8px 32px hsl(220 30% 2%/0.4)" }}>
          {options.map(opt => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
              style={{ background: value === opt ? "hsl(var(--primary)/0.15)" : "transparent", color: value === opt ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}
              onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = "hsl(var(--secondary))"; }}
              onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = "transparent"; }}>
              {value === opt && <Check size={12} />}{opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</label>
      {children}
    </div>
  );
}

/* ─── Edit Panel (inline in the right sidebar) ───────────── */
function EditPanel({ client, onSave, onCancel }: { client: Client; onSave: (c: Client) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...client });
  const set = (k: keyof Client, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const toggleType = (t: LawType) =>
    set("types", form.types.includes(t) ? form.types.filter(x => x !== t) : [...form.types, t]);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>Editando cliente</p>
        <button type="button" onClick={onCancel} className="p-1 rounded-md hover:opacity-70" style={{ color: "hsl(var(--muted-foreground))" }}><X size={14} /></button>
      </div>

      <Field label="Nombre completo">
        <StyledInput value={form.name} onChange={e => set("name", e.target.value)} />
      </Field>

      <Field label="Email">
        <StyledInput type="email" value={form.email} onChange={e => set("email", e.target.value)} />
      </Field>

      <Field label="Teléfono">
        <StyledInput value={form.phone} onChange={e => set("phone", e.target.value)} />
      </Field>

      <Field label="Ciudad">
        <CustomSelect options={cities} value={form.city} onChange={v => set("city", v)} placeholder="Ciudad" />
      </Field>

      <Field label="Ocupación">
        <CustomSelect options={occupations} value={form.occupation} onChange={v => set("occupation", v)} placeholder="Ocupación" />
      </Field>

      <Field label="Estado">
        <div className="flex gap-1.5 flex-wrap">
          {statusOptions.map(s => (
            <button key={s} type="button" onClick={() => set("status", s)}
              className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
              style={{
                background: form.status === s ? `${statusColors[s]}20` : "hsl(var(--secondary))",
                color: form.status === s ? statusColors[s] : "hsl(var(--muted-foreground))",
                border: `1px solid ${form.status === s ? `${statusColors[s]}60` : "hsl(var(--border))"}`,
              }}>{s}</button>
          ))}
        </div>
      </Field>

      <Field label="Áreas legales">
        <div className="flex flex-wrap gap-1.5">
          {legalAreasAll.map(a => {
            const cfg = lawConfig[a.type];
            const active = form.types.includes(a.type);
            return (
              <button key={a.type} type="button" onClick={() => toggleType(a.type)}
                className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-all"
                style={{
                  background: active ? cfg.bg : "hsl(var(--secondary))",
                  color: active ? cfg.color : "hsl(var(--muted-foreground))",
                  border: `1px solid ${active ? cfg.border : "hsl(var(--border))"}`,
                }}>{a.label}</button>
            );
          })}
        </div>
      </Field>

      <Field label="Valoración">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={18}
              style={{ color: s <= form.rating ? "hsl(38 92% 55%)" : "hsl(var(--border))", fill: s <= form.rating ? "hsl(38 92% 55%)" : "transparent", cursor: "pointer" }}
              onClick={() => set("rating", s)} />
          ))}
        </div>
      </Field>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
          style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
          Cancelar
        </button>
        <button type="button" onClick={() => onSave(form)}
          className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-2 text-xs">
          <Save size={13} /> Guardar
        </button>
      </div>
    </div>
  );
}

/* ─── New Task Modal ──────────────────────────────────────── */
function NewTaskModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const clientCases = casesByClient[client.id]?.filter(c => c.status !== "Cerrado") || [];
  const [taskType, setTaskType] = useState("");
  const [taskTypeOpen, setTaskTypeOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState("");
  const [caseOpen, setCaseOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [timeOpen, setTimeOpen] = useState(false);
  const [duration, setDuration] = useState("30 min");
  const [priority, setPriority] = useState("media");
  const [notes, setNotes] = useState("");

  const selectedTaskType = taskTypes.find(t => t.id === taskType);

  const handleSubmit = () => {
    if (!taskType || !date || !time) {
      toast.error("Completa los campos obligatorios: tipo, fecha y hora");
      return;
    }
    toast.success(`Tarea "${selectedTaskType?.label}" agendada para ${format(date, "dd/MM/yyyy")} a las ${time}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "hsl(220 30% 2%/0.7)", backdropFilter: "blur(6px)" }} />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl animate-fade-in"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 32px 80px hsl(220 30% 2%/0.6)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 pt-5 pb-4 flex items-center justify-between"
          style={{ background: "hsl(var(--card))", borderBottom: "1px solid hsl(var(--border)/0.5)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.15), hsl(var(--accent)/0.15))", border: "1px solid hsl(var(--primary)/0.3)" }}>
              <ClipboardPlus size={16} style={{ color: "hsl(var(--primary))" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Nueva Tarea</h3>
              <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>Cliente: {client.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="p-2 rounded-xl transition-all hover:opacity-70"
            style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Task type selector */}
          <Field label="Tipo de tarea *">
            <div className="relative">
              <button type="button" onClick={() => setTaskTypeOpen(p => !p)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm"
                style={{
                  background: "hsl(var(--secondary))",
                  border: `1px solid ${taskTypeOpen ? "hsl(var(--primary)/0.5)" : "hsl(var(--border))"}`,
                  color: taskType ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                }}>
                <span className="flex items-center gap-2">
                  {selectedTaskType ? <>{selectedTaskType.icon} {selectedTaskType.label}</> : "Seleccionar tipo de tarea"}
                </span>
                <ChevronDown size={13} className={`transition-transform ${taskTypeOpen ? "rotate-180" : ""}`} style={{ color: "hsl(var(--muted-foreground))" }} />
              </button>
              {taskTypeOpen && (
                <div className="absolute z-[600] top-full mt-1 w-full rounded-xl shadow-2xl overflow-auto max-h-56"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 8px 32px hsl(220 30% 2%/0.5)" }}>
                  {taskTypes.map(t => (
                    <button key={t.id} type="button" onClick={() => { setTaskType(t.id); setTaskTypeOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5"
                      style={{
                        background: taskType === t.id ? "hsl(var(--primary)/0.15)" : "transparent",
                        color: taskType === t.id ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                      }}
                      onMouseEnter={e => { if (taskType !== t.id) e.currentTarget.style.background = "hsl(var(--secondary))"; }}
                      onMouseLeave={e => { if (taskType !== t.id) e.currentTarget.style.background = "transparent"; }}>
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                      {taskType === t.id && <Check size={12} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          {/* Related case */}
          {clientCases.length > 0 && (
            <Field label="Caso relacionado">
              <div className="relative">
                <button type="button" onClick={() => setCaseOpen(p => !p)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm"
                  style={{
                    background: "hsl(var(--secondary))",
                    border: `1px solid ${caseOpen ? "hsl(var(--primary)/0.5)" : "hsl(var(--border))"}`,
                    color: selectedCase ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  }}>
                  <span>{selectedCase ? clientCases.find(c => c.id === selectedCase)?.title || selectedCase : "Seleccionar caso (opcional)"}</span>
                  <ChevronDown size={13} className={`transition-transform ${caseOpen ? "rotate-180" : ""}`} style={{ color: "hsl(var(--muted-foreground))" }} />
                </button>
                {caseOpen && (
                  <div className="absolute z-[600] top-full mt-1 w-full rounded-xl shadow-2xl overflow-auto max-h-48"
                    style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 8px 32px hsl(220 30% 2%/0.5)" }}>
                    <button type="button" onClick={() => { setSelectedCase(""); setCaseOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                      onMouseEnter={e => e.currentTarget.style.background = "hsl(var(--secondary))"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      Sin caso específico
                    </button>
                    {clientCases.map(c => (
                      <button key={c.id} type="button" onClick={() => { setSelectedCase(c.id); setCaseOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
                        style={{
                          background: selectedCase === c.id ? "hsl(var(--primary)/0.15)" : "transparent",
                          color: selectedCase === c.id ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                        }}
                        onMouseEnter={e => { if (selectedCase !== c.id) e.currentTarget.style.background = "hsl(var(--secondary))"; }}
                        onMouseLeave={e => { if (selectedCase !== c.id) e.currentTarget.style.background = "transparent"; }}>
                        <LawBadge type={c.type} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{c.title}</p>
                          <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{c.id}</p>
                        </div>
                        {selectedCase === c.id && <Check size={12} className="ml-auto shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Field>
          )}

          {/* Date & Time row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha *">
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button"
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left"
                    style={{
                      background: "hsl(var(--secondary))",
                      border: "1px solid hsl(var(--border))",
                      color: date ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                    }}>
                    <Calendar size={13} style={{ color: "hsl(var(--primary))" }} />
                    {date ? format(date, "dd/MM/yyyy") : "Elegir"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[700]" align="start">
                  <CalendarUI
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={d => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field label="Hora *">
              <div className="relative">
                <button type="button" onClick={() => setTimeOpen(p => !p)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                  style={{
                    background: "hsl(var(--secondary))",
                    border: `1px solid ${timeOpen ? "hsl(var(--primary)/0.5)" : "hsl(var(--border))"}`,
                    color: time ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  }}>
                  <Clock size={13} style={{ color: "hsl(var(--primary))" }} />
                  {time || "Elegir"}
                </button>
                {timeOpen && (
                  <div className="absolute z-[600] top-full mt-1 w-full rounded-xl shadow-2xl overflow-auto max-h-48"
                    style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 8px 32px hsl(220 30% 2%/0.5)" }}>
                    {timeSlots.map(t => (
                      <button key={t} type="button" onClick={() => { setTime(t); setTimeOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{
                          background: time === t ? "hsl(var(--primary)/0.15)" : "transparent",
                          color: time === t ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                        }}
                        onMouseEnter={e => { if (time !== t) e.currentTarget.style.background = "hsl(var(--secondary))"; }}
                        onMouseLeave={e => { if (time !== t) e.currentTarget.style.background = "transparent"; }}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Field>
          </div>

          {/* Duration chips */}
          <Field label="Duración estimada">
            <div className="flex flex-wrap gap-1.5">
              {durations.map(d => (
                <button key={d} type="button" onClick={() => setDuration(d)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                  style={{
                    background: duration === d ? "hsl(var(--primary)/0.15)" : "hsl(var(--secondary))",
                    color: duration === d ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    border: `1px solid ${duration === d ? "hsl(var(--primary)/0.4)" : "hsl(var(--border))"}`,
                  }}>
                  {d}
                </button>
              ))}
            </div>
          </Field>

          {/* Priority buttons */}
          <Field label="Prioridad">
            <div className="grid grid-cols-4 gap-1.5">
              {priorities.map(p => (
                <button key={p.id} type="button" onClick={() => setPriority(p.id)}
                  className="py-2 rounded-lg text-[11px] font-semibold transition-all text-center"
                  style={{
                    background: priority === p.id ? `${p.color}20` : "hsl(var(--secondary))",
                    color: priority === p.id ? p.color : "hsl(var(--muted-foreground))",
                    border: `1px solid ${priority === p.id ? `${p.color}60` : "hsl(var(--border))"}`,
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Notes (optional, minimal) */}
          <Field label="Notas (opcional)">
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={2} placeholder="Observaciones breves..."
              className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none"
              style={{
                background: "hsl(var(--secondary))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "hsl(var(--primary)/0.6)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 flex gap-2"
          style={{ background: "hsl(var(--card))", borderTop: "1px solid hsl(var(--border)/0.5)" }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs">
            <ClipboardPlus size={13} /> Agendar Tarea
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Modal ──────────────────────────────────────── */
function ProfileModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const navigate = useNavigate();
  const cases = casesByClient[client.id] || [];
  const open = cases.filter(c => c.status !== "Cerrado");
  const closed = cases.filter(c => c.status === "Cerrado");

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "hsl(220 30% 2%/0.7)", backdropFilter: "blur(6px)" }} />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl animate-fade-in"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 32px 80px hsl(220 30% 2%/0.6)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 pt-6 pb-4 flex items-start gap-4"
          style={{ background: "hsl(var(--card))", borderBottom: "1px solid hsl(var(--border)/0.5)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", color: "white" }}>
            {client.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">{client.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: `${statusColors[client.status]}20`, color: statusColors[client.status] }}>
                {client.status}
              </span>
              {client.occupation && (
                <span className="text-xs flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <Briefcase size={10} />{client.occupation}
                </span>
              )}
              <span className="text-xs flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                <Calendar size={10} />Ingreso: {client.joinDate}
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="p-2 rounded-xl transition-all hover:opacity-70 shrink-0"
            style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
            <X size={16} />
          </button>
        </div>

        {/* Contact info */}
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ borderBottom: "1px solid hsl(var(--border)/0.5)" }}>
          {[
            { icon: Mail, val: client.email },
            { icon: Phone, val: client.phone },
            { icon: MapPin, val: client.city },
          ].map(({ icon: Icon, val }) => (
            <div key={val} className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
              style={{ background: "hsl(var(--secondary)/0.5)", border: "1px solid hsl(var(--border)/0.5)", color: "hsl(var(--muted-foreground))" }}>
              <Icon size={12} style={{ color: "hsl(var(--primary))" }} />{val}
            </div>
          ))}
        </div>

        {/* Legal areas */}
        {client.types.length > 0 && (
          <div className="px-6 py-4" style={{ borderBottom: "1px solid hsl(var(--border)/0.5)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>Áreas legales</p>
            <div className="flex flex-wrap gap-1.5">
              {client.types.map(t => <LawBadge key={t} type={t} />)}
            </div>
          </div>
        )}

        {/* Cases */}
        <div className="px-6 py-4">
          {/* Open cases */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen size={14} style={{ color: "hsl(var(--primary))" }} />
              <p className="text-sm font-bold text-foreground">Casos Abiertos</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "hsl(var(--primary)/0.15)", color: "hsl(var(--primary))" }}>{open.length}</span>
            </div>
            {open.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: "hsl(var(--muted-foreground))" }}>Sin casos abiertos</p>
            ) : (
              <div className="space-y-2">
                {open.map(c => (
                  <div key={c.id} className="rounded-xl p-4 space-y-2"
                    style={{ background: "hsl(var(--secondary)/0.5)", border: "1px solid hsl(var(--border))" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{c.title}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{c.id} · {c.date}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <LawBadge type={c.type} />
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${caseStatusColor[c.status]}20`, color: caseStatusColor[c.status] }}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>Progreso</span>
                        <span className="text-[10px] font-semibold" style={{ color: "hsl(var(--primary))" }}>{c.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${c.progress}%`, background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }} />
                      </div>
                    </div>
                    {/* Go to case button */}
                    <button
                      type="button"
                      onClick={() => { onClose(); navigate("/cases"); }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80"
                      style={{ background: "hsl(var(--primary)/0.1)", border: "1px solid hsl(var(--primary)/0.3)", color: "hsl(var(--primary))" }}>
                      <ExternalLink size={10} /> Ir al Caso
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Closed cases */}
          {closed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} style={{ color: "hsl(142 70% 48%)" }} />
                <p className="text-sm font-bold text-foreground">Casos Cerrados</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "hsl(142 70% 48%/0.15)", color: "hsl(142 70% 55%)" }}>{closed.length}</span>
              </div>
              <div className="space-y-2">
                {closed.map(c => (
                  <div key={c.id} className="rounded-xl p-3 flex items-center gap-3"
                    style={{ background: "hsl(var(--secondary)/0.3)", border: "1px solid hsl(var(--border)/0.5)" }}>
                    <LawBadge type={c.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{c.title}</p>
                      <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{c.id} · {c.date}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
                      style={{ background: "hsl(142 70% 48%/0.15)", color: "hsl(142 70% 55%)" }}>
                      ✓ Cerrado
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function Clients() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [editing, setEditing] = useState(false);
  const [profileClient, setProfileClient] = useState<Client | null>(null);
  const [taskClient, setTaskClient] = useState<Client | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /** 1. Fetch Clients from Supabase */
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");
      if (error) throw error;

      // Mapping DB fields to UI fields
      return data.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city || "S/N",
        cases: 0, // Should join with cases count if available
        status: "Activo", // Default status for UI
        rating: 5,
        types: [c.client_type === "persona_juridica" ? "mercantil" : "civil"] as LawType[],
        balance: c.balance ? `€${c.balance.toLocaleString()}` : "€0",
        occupation: c.company || "Particular",
        joinDate: format(new Date(c.created_at), "yyyy-MM-dd"),
        docType: "NIT",
        docNumber: "0000000",
        notes: ""
      })) as Client[];
    },
  });

  /** 2. Mutation to Save/Update Client */
  const saveMutation = useMutation({
    mutationFn: async (updated: Client) => {
      const { error } = await supabase
        .from("clients")
        .update({
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          city: updated.city,
        })
        .eq("id", updated.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      toast.success("Cliente actualizado correctamente");
      setEditing(false);
    }
  });

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email?.toLowerCase().includes(search.toLowerCase()) || false)
  );

  const handleSave = (updated: Client) => {
    saveMutation.mutate(updated);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile modal */}
      {profileClient && <ProfileModal client={profileClient} onClose={() => setProfileClient(null)} />}
      {taskClient && <NewTaskModal client={taskClient} onClose={() => setTaskClient(null)} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground font-display">Gestión de Clientes</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{clients.length} clientes registrados</p>
        </div>
        <button onClick={() => navigate("/clients/new")} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      {isClassic ? (
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: "Activos", value: clients.filter(c => c.status === "Activo").length.toString(), color: "hsl(142 70% 48%)", sticky: { bg: "hsl(140 52% 82%)", shadow: "hsl(140 45% 45% / 0.3)", rotate: "-1.0deg" } },
            { label: "Total Casos", value: clients.reduce((a, c) => a + c.cases, 0).toString(), color: "hsl(217 91% 60%)", sticky: { bg: "hsl(200 62% 82%)", shadow: "hsl(200 50% 45% / 0.3)", rotate: "0.8deg" } },
            { label: "Pendiente Cobro", value: "€25.4K", color: "hsl(38 92% 55%)", sticky: { bg: "hsl(50 88% 83%)", shadow: "hsl(48 70% 55% / 0.35)", rotate: "-0.5deg" } },
          ].map((s, i) => (
            <div key={s.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, paddingTop: "8px" }}>
              <div
                style={{
                  background: s.sticky.bg,
                  borderRadius: "2px",
                  padding: "18px 16px",
                  transform: `rotate(${s.sticky.rotate})`,
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  boxShadow: `3px 3px 0 hsl(25 30% 55% / 0.22), 5px 6px 14px ${s.sticky.shadow}`,
                  cursor: "default",
                  position: "relative",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) translateY(-5px) scale(1.02)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `4px 4px 0 hsl(25 30% 55% / 0.18), 8px 14px 22px ${s.sticky.shadow}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = `rotate(${s.sticky.rotate})`;
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `3px 3px 0 hsl(25 30% 55% / 0.22), 5px 6px 14px ${s.sticky.shadow}`;
                }}
              >
                {/* Tape strip */}
                <div style={{
                  position: "absolute", top: "-7px", left: "50%", transform: "translateX(-50%)",
                  width: "38px", height: "13px",
                  background: "hsl(40 50% 90% / 0.8)", border: "1px solid hsl(32 25% 72%)",
                  borderRadius: "2px", boxShadow: "0 1px 3px hsl(25 40% 18% / 0.1)",
                }} />
                <p className="text-xl font-bold" style={{ color: "hsl(25 40% 16%)", fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.1 }}>{s.value}</p>
                <p className="text-xs mt-1.5 font-semibold" style={{ color: "hsl(25 30% 45%)", fontFamily: "'Inter', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Activos", value: clients.filter(c => c.status === "Activo").length.toString(), color: "hsl(142 70% 48%)" },
            { label: "Total Casos", value: clients.reduce((a, c) => a + c.cases, 0).toString(), color: "hsl(217 91% 60%)" },
            { label: "Pendiente Cobro", value: "€25.4K", color: "hsl(38 92% 55%)" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-4 text-center">
              <p className="text-xl font-bold font-display" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* List */}
        <div className="xl:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clientes..."
                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid hsl(var(--border))" }}>
              {([["grid", LayoutGrid], ["list", LayoutList]] as const).map(([mode, Icon]) => (
                <button key={mode} type="button" onClick={() => setViewMode(mode)}
                  className="p-2 transition-colors"
                  style={{
                    background: viewMode === mode ? "hsl(var(--primary)/0.15)" : "hsl(var(--secondary))",
                    color: viewMode === mode ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  }}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(c => (
                <div key={c.id} onClick={() => { setSelected(c); setEditing(false); }}
                  className={`${isClassic ? "paper-item" : "glass-card rounded-xl p-3"} cursor-pointer transition-all hover:scale-[1.01] ${selected?.id === c.id ? "border-primary/50" : ""}`}
                  style={isClassic ? { borderLeftColor: c.status === "Activo" ? "hsl(142 70% 48%)" : "hsl(var(--muted-foreground))" } : {}}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.3), hsl(var(--accent)/0.3))", color: "hsl(var(--primary))" }}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.status === "Activo" ? "hsl(142 70% 48%)" : "hsl(var(--muted-foreground))" }} />
                        <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{c.status}</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold shrink-0" style={{ color: "hsl(142 70% 55%)" }}>{c.balance}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                      <MapPin size={10} />{c.city} · {c.cases} casos
                    </div>
                    <div className="flex gap-0.5">
                      {c.types.slice(0, 2).map(t => <LawBadge key={t} type={t} />)}
                      {c.types.length > 2 && <span className="text-[9px] px-1 rounded" style={{ color: "hsl(var(--muted-foreground))" }}>+{c.types.length - 2}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map(c => (
                <div key={c.id} onClick={() => { setSelected(c); setEditing(false); }}
                  className={`glass-card rounded-lg px-3 py-2 cursor-pointer flex items-center gap-3 transition-all ${selected?.id === c.id ? "border-primary/50" : ""}`}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.status === "Activo" ? "hsl(142 70% 48%)" : "hsl(var(--muted-foreground))" }} />
                  <p className="text-sm font-medium text-foreground truncate flex-1">{c.name}</p>
                  <span className="text-[10px] hidden sm:inline" style={{ color: "hsl(var(--muted-foreground))" }}>{c.city}</span>
                  <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{c.cases} casos</span>
                  <p className="text-xs font-bold shrink-0" style={{ color: "hsl(142 70% 55%)" }}>{c.balance}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail / Edit Panel */}
        <div className={`${isClassic ? "classic-container" : "glass-card rounded-xl"} p-5 h-fit`}>
          {selected ? (
            editing ? (
              <EditPanel
                client={selected}
                onSave={handleSave}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <div className="animate-fade-in">
                <div className="text-center mb-5">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3"
                    style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", color: "white" }}>
                    {selected.name.charAt(0)}
                  </div>
                  <h3 className="text-base font-bold text-foreground">{selected.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: `${statusColors[selected.status]}15`, color: statusColors[selected.status] }}>
                    {selected.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {[
                    { icon: Mail, value: selected.email },
                    { icon: Phone, value: selected.phone },
                    { icon: MapPin, value: selected.city },
                    { icon: Briefcase, value: selected.occupation },
                    { icon: Calendar, value: `Ingreso: ${selected.joinDate}` },
                  ].map(({ icon: Icon, value }) => value ? (
                    <div key={value} className="flex items-center gap-2 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      <Icon size={12} style={{ color: "hsl(var(--primary))" }} />{value}
                    </div>
                  ) : null)}
                </div>

                <div className="p-3 rounded-lg mb-4" style={{ background: "hsl(var(--secondary)/0.5)", border: "1px solid hsl(var(--border))" }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Saldo pendiente</span>
                    <span className="text-sm font-bold" style={{ color: "hsl(142 70% 55%)" }}>{selected.balance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Casos activos</span>
                    <span className="text-xs font-semibold text-foreground">{selected.cases}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-foreground mb-2">Áreas legales</p>
                  <div className="flex flex-wrap gap-1">{selected.types.map(t => <LawBadge key={t} type={t} />)}</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setEditing(true)}
                    className="btn-primary flex-1 text-center text-xs flex items-center justify-center gap-1.5">
                    <Edit2 size={12} /> Editar
                  </button>
                  <button onClick={() => setProfileClient(selected)}
                    className="flex-1 text-center py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                    style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                    <FolderOpen size={12} /> Ver Perfil
                  </button>
                </div>

                <button onClick={() => setTaskClient(selected)}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)/0.1), hsl(var(--accent)/0.1))",
                    border: "1px solid hsl(var(--primary)/0.3)",
                    color: "hsl(var(--primary))",
                  }}>
                  <ClipboardPlus size={13} /> Nueva Tarea
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users size={32} style={{ color: "hsl(var(--muted-foreground))" }} className="mb-3" />
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Selecciona un cliente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
