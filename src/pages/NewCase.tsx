import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, CheckCircle2, User, FileText, Eye,
  Calendar, Clock, DollarSign, Upload, X, Plus,
  Scale, AlertTriangle, Zap, Minus, ChevronDown,
} from "lucide-react";
import { LawBadge, LawType, lawConfig } from "@/components/LawBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────── */
type Priority = "baja" | "media" | "alta" | "urgente";
type Step = 1 | 2 | 3 | 4;

const procedureTypes = [
  "Procedimiento Judicial",
  "Procedimiento Extrajudicial",
  "Procedimiento Administrativo",
  "Arbitraje",
  "Mediación",
];

const feeTypes = [
  { label: "Por hora", value: "por_hora" },
  { label: "Precio fijo", value: "precio_fijo" },
  { label: "Porcentaje", value: "porcentaje" },
  { label: "Mixto", value: "mixto" },
];
const feeTypeLabels = feeTypes.map(f => f.label);
const currencies = [
  { label: "BOB (Bs)", value: "BOB" },
  { label: "USD ($)", value: "USD" },
  { label: "EUR (€)", value: "EUR" },
];
const currencyLabels = currencies.map(c => c.label);
const reminders = ["Sin recordatorio", "1 día antes", "3 días antes", "1 semana antes", "2 semanas antes"];

const lawyersList = [
  { name: "Ana Rodríguez", initials: "AR", color: "hsl(190 100% 50%)" },
  { name: "Carlos López", initials: "CL", color: "hsl(260 80% 65%)" },
  { name: "María Torres", initials: "MT", color: "hsl(150 90% 45%)" },
  { name: "Pedro Sánchez", initials: "PS", color: "hsl(45 100% 55%)" },
];



const legalAreas: { type: LawType; label: string }[] = [
  { type: "civil", label: "Derecho Civil" },
  { type: "penal", label: "Derecho Penal" },
  { type: "laboral", label: "Derecho Laboral" },
  { type: "mercantil", label: "Derecho Mercantil" },
  { type: "administrativo", label: "Derecho Administrativo" },
  { type: "familia", label: "Derecho de Familia" },
  { type: "fiscal", label: "Derecho Fiscal" },
];

const steps = [
  { n: 1 as Step, label: "Información Básica", sub: "Datos principales del caso" },
  { n: 2 as Step, label: "Cliente", sub: "Información del cliente" },
  { n: 3 as Step, label: "Documentos", sub: "Carga de documentación" },
  { n: 4 as Step, label: "Revisión", sub: "Confirmar y crear" },
];

/* ─── Priority card ─────────────────────────────────────── */
const priorities: { value: Priority; label: string; sub: string; icon: typeof Scale; color: string }[] = [
  { value: "baja", label: "Baja", sub: "Sin urgencia", icon: Minus, color: "hsl(150 90% 45%)" },
  { value: "media", label: "Media", sub: "Plazos normales", icon: Scale, color: "hsl(45 100% 55%)" },
  { value: "alta", label: "Alta", sub: "Urgente", icon: AlertTriangle, color: "hsl(0 90% 60%)" },
  { value: "urgente", label: "Urgente", sub: "Crítico / Inmediato", icon: Zap, color: "hsl(0 72% 50%)" },
];

/* ─── Custom Select ─────────────────────────────────────── */
function CustomSelect({ options, value, onChange, placeholder, dropUp = false }: { options: string[]; value: string; onChange: (v: string) => void; placeholder: string; dropUp?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm"
        style={{
          background: "hsl(var(--secondary))",
          border: `1px solid ${open ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))"}`,
          color: value ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
        }}
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "hsl(var(--muted-foreground))" }} />
      </button>
      {open && (
        <div
          className={`absolute z-[300] w-full rounded-xl shadow-2xl overflow-hidden ${dropUp ? "bottom-full mb-1" : "top-full mt-1"}`}
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 -8px 32px hsl(220 30% 2% / 0.4), 0 8px 32px hsl(220 30% 2% / 0.4)",
          }}
        >
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
              style={{
                background: value === opt ? "hsl(var(--primary) / 0.15)" : "transparent",
                color: value === opt ? "hsl(var(--primary))" : "hsl(var(--foreground))",
              }}
              onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = "hsl(var(--secondary))"; }}
              onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = "transparent"; }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Label + field wrapper ─────────────────────────────── */
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</label>
      {children}
    </div>
  );
}

function StyledInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2.5 rounded-lg text-sm transition-all focus:outline-none"
      style={{
        background: "hsl(var(--secondary))",
        border: "1px solid hsl(var(--border))",
        color: "hsl(var(--foreground))",
      }}
      onFocus={e => { e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.1)"; }}
      onBlur={e => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; }}
    />
  );
}

function StyledTextarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2.5 rounded-lg text-sm resize-none transition-all focus:outline-none"
      style={{
        background: "hsl(var(--secondary))",
        border: "1px solid hsl(var(--border))",
        color: "hsl(var(--foreground))",
        minHeight: 96,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.1)"; }}
      onBlur={e => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; }}
    />
  );
}

/* ─── Date quick-pick ───────────────────────────────────── */
function QuickDateButtons({ onPick }: { onPick: (date: string) => void }) {
  const fmtDate = (d: Date) => d.toISOString().split("T")[0];
  const today = new Date();
  const add = (days: number) => { const d = new Date(today); d.setDate(d.getDate() + days); return d; };
  return (
    <div className="flex gap-1.5 mt-1.5 flex-wrap">
      {[["Hoy", today], ["+7d", add(7)], ["+30d", add(30)], ["+3m", add(90)], ["+6m", add(180)]].map(([label, d]) => (
        <button key={label as string} type="button" onClick={() => onPick(fmtDate(d as Date))}
          className="px-2 py-1 rounded-md text-[10px] font-medium transition-all hover:opacity-80"
          style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.25)" }}>
          {label as string}
        </button>
      ))}
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────── */
function SectionTitle({ icon: Icon, title }: { icon: typeof Scale; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5 pb-3" style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.15)" }}>
        <Icon size={13} style={{ color: "hsl(var(--primary))" }} />
      </div>
      <h3 className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>{title}</h3>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function NewCase() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);

  /** 1. Fetch Clients for selection */
  const { data: clientsData = [] } = useQuery({
    queryKey: ["clients-simple"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const clientsList = clientsData.map(c => (c.name || "Sin nombre"));

  /** 2. Mutation to Create Case */
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("cases")
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases-list"] });
      toast.success("Expediente creado correctamente");
      navigate("/cases");
    },
    onError: (err) => {
      toast.error(`Error al crear expediente: ${err.message}`);
    }
  });
  const handleSave = () => {
    if (!title) { toast.error("El título es obligatorio"); return; }
    if (!selectedClient) { toast.error("Debe seleccionar un cliente"); return; }

    const client = clientsData.find(c => c.name === selectedClient);
    if (!client) { toast.error("Cliente no encontrado"); return; }

    createMutation.mutate({
      title,
      case_number: `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      client_id: client.id,
      legal_area: area || "civil",
      status: "activo",
      priority: priority,
      description: description,
      opened_at: startDate,
      deadline_at: deadline || null,
    });
  };

  // Form state
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<LawType | "">("");
  const [procedureType, setProcedureType] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("media");
  const [lawyers, setLawyers] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(["urgente", "demanda", "primera instancia"]);
  const [tagInput, setTagInput] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [deadline, setDeadline] = useState("");
  const [hearing, setHearing] = useState("");
  const [reminder, setReminder] = useState("");
  const [budget, setBudget] = useState("");
  const [feeType, setFeeType] = useState("");
  const [currency, setCurrency] = useState("BOB (Bs)");

  // Client
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [selectedClient, setSelectedClient] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  // Opposing party
  const [opposingName, setOpposingName] = useState("");
  const [opposingLawyer, setOpposingLawyer] = useState("");
  const [opposingContact, setOpposingContact] = useState("");

  // Files
  const [files, setFiles] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const caseNumber = `EXP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
  const selectedPriority = priorities.find(p => p.value === priority)!;
  const selectedArea = legalAreas.find(a => a.type === area);

  const toggleLawyer = (name: string) =>
    setLawyers(prev => prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  /* ─── Steps UI ─────────────────────────────────────────── */
  const StepBar = () => (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => {
        const isActive = s.n === step;
        const isDone = s.n < step;
        return (
          <div key={s.n} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => isDone && setStep(s.n)}
              className="flex items-center gap-2.5 min-w-0"
              style={{ cursor: isDone ? "pointer" : "default" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all"
                style={{
                  background: isActive
                    ? "hsl(var(--primary))"
                    : isDone
                      ? "hsl(var(--primary) / 0.25)"
                      : "hsl(var(--secondary))",
                  color: isActive ? "hsl(var(--primary-foreground))" : isDone ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  border: isActive ? "none" : isDone ? "1px solid hsl(var(--primary) / 0.4)" : "1px solid hsl(var(--border))",
                  boxShadow: isActive ? "0 0 12px hsl(var(--primary) / 0.4)" : "none",
                }}
              >
                {isDone ? <CheckCircle2 size={14} /> : s.n}
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: isActive ? "hsl(var(--primary))" : isDone ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>{s.label}</p>
                <p className="text-[10px] truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{s.sub}</p>
              </div>
            </button>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-3 rounded-full" style={{
                background: isDone ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );

  /* ─── STEP 1 ─────────────────────────────────────────── */
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Información del Caso */}
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={FileText} title="Información del Caso" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Título del Caso">
            <StyledInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Divorcio Martínez-Gómez" />
          </Field>
          <Field label="Número de Caso">
            <StyledInput value={caseNumber} readOnly style={{ opacity: 0.5, cursor: "not-allowed" }} />
          </Field>
        </div>

        {/* Área Jurídica – chip selector */}
        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>Área Jurídica</label>
          <div className="flex flex-wrap gap-2">
            {legalAreas.map(a => {
              const cfg = lawConfig[a.type];
              const active = area === a.type;
              return (
                <button
                  key={a.type}
                  type="button"
                  onClick={() => setArea(a.type)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: active ? cfg.bg : "hsl(var(--secondary))",
                    color: active ? cfg.color : "hsl(var(--muted-foreground))",
                    border: `1px solid ${active ? cfg.border : "hsl(var(--border))"}`,
                    boxShadow: active ? `0 0 10px ${cfg.bg}` : "none",
                    transform: active ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: active ? cfg.color : "transparent", border: `1px solid ${cfg.color}` }} />
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Field label="Tipo de Procedimiento">
            <CustomSelect options={procedureTypes} value={procedureType} onChange={setProcedureType} placeholder="Seleccionar tipo" />
          </Field>
          <Field label="Etiquetas / Tags">
            <div className="flex gap-2">
              <StyledInput
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Añadir etiqueta..."
                className="flex-1"
              />
              <button type="button" onClick={addTag} className="px-3 rounded-lg transition-all" style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}>
                <Plus size={14} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.25)" }}>
                    {t}
                    <button type="button" onClick={() => setTags(p => p.filter(x => x !== t))}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </Field>
        </div>

        <Field label="Descripción del Caso" className="mt-4">
          <StyledTextarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describa brevemente la situación legal y los objetivos del caso..." rows={4} />
        </Field>
      </div>

      {/* Prioridad */}
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={AlertTriangle} title="Prioridad del Caso" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {priorities.map(p => {
            const Icon = p.icon;
            const active = priority === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl transition-all"
                style={{
                  background: active ? `${p.color}18` : "hsl(var(--secondary))",
                  border: `2px solid ${active ? p.color : "hsl(var(--border))"}`,
                  boxShadow: active ? `0 0 18px ${p.color}30` : "none",
                  transform: active ? "translateY(-2px)" : "none",
                }}
              >
                <Icon size={22} style={{ color: p.color }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: active ? p.color : "hsl(var(--foreground))" }}>{p.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{p.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fechas */}
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={Calendar} title="Fechas Importantes" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-visible">
          <Field label="Fecha de Inicio">
            <StyledInput type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <QuickDateButtons onPick={setStartDate} />
          </Field>
          <Field label="Fecha Límite">
            <StyledInput type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            <QuickDateButtons onPick={setDeadline} />
          </Field>
          <Field label="Próxima Audiencia">
            <StyledInput type="datetime-local" value={hearing} onChange={e => setHearing(e.target.value)} />
          </Field>
          <Field label="Recordatorio">
            <CustomSelect options={reminders} value={reminder} onChange={setReminder} placeholder="Sin recordatorio" dropUp />
          </Field>
        </div>
      </div>

      {/* Información Económica */}
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={DollarSign} title="Información Económica" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Presupuesto Estimado">
            <StyledInput type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00" />
          </Field>
          <Field label="Tipo de Honorarios">
            <CustomSelect options={feeTypeLabels} value={feeType} onChange={setFeeType} placeholder="Seleccionar tipo" dropUp />
          </Field>
          <Field label="Moneda">
            <CustomSelect options={currencyLabels} value={currency} onChange={setCurrency} placeholder="BOB (Bs)" dropUp />
          </Field>
        </div>
      </div>

      {/* Abogado Asignado */}
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={User} title="Abogado(s) Asignado(s)" />
        <div className="flex flex-wrap gap-3">
          {lawyersList.map(l => {
            const active = lawyers.includes(l.name);
            return (
              <button
                key={l.name}
                type="button"
                onClick={() => toggleLawyer(l.name)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all"
                style={{
                  background: active ? `${l.color}20` : "hsl(var(--secondary))",
                  border: `2px solid ${active ? l.color : "hsl(var(--border))"}`,
                  boxShadow: active ? `0 0 12px ${l.color}30` : "none",
                }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: l.color, color: "hsl(var(--primary-foreground))" }}>
                  {l.initials}
                </div>
                <span className="text-sm font-medium" style={{ color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>{l.name}</span>
                {active && <CheckCircle2 size={14} style={{ color: l.color }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ─── STEP 2 – Cliente ──────────────────────────────────── */
  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={User} title="Cliente" />
        {/* Mode toggle */}
        <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: "hsl(var(--secondary))" }}>
          {(["existing", "new"] as const).map(m => (
            <button key={m} type="button" onClick={() => setClientMode(m)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: clientMode === m ? "hsl(var(--primary))" : "transparent",
                color: clientMode === m ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                boxShadow: clientMode === m ? "0 0 12px hsl(var(--primary) / 0.3)" : "none",
              }}>
              {m === "existing" ? "Cliente Existente" : "Nuevo Cliente"}
            </button>
          ))}
        </div>

        {clientMode === "existing" ? (
          <div className="space-y-3">
            <Field label="Seleccionar Cliente">
              <CustomSelect options={clientsList} value={selectedClient} onChange={setSelectedClient} placeholder="Buscar cliente..." />
            </Field>
            {selectedClient && (
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.2)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                  {selectedClient.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>{selectedClient}</p>
                  <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Cliente existente · Ver perfil →</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre / Razón Social" className="md:col-span-2">
              <StyledInput value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Nombre completo o empresa" />
            </Field>
            <Field label="Email">
              <StyledInput type="email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} placeholder="email@ejemplo.com" />
            </Field>
            <Field label="Teléfono">
              <StyledInput type="tel" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="+34 600 000 000" />
            </Field>
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={Scale} title="Parte Contraria" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre o Razón Social" className="md:col-span-2">
            <StyledInput value={opposingName} onChange={e => setOpposingName(e.target.value)} placeholder="Nombre de la parte contraria" />
          </Field>
          <Field label="Representante Legal">
            <StyledInput value={opposingLawyer} onChange={e => setOpposingLawyer(e.target.value)} placeholder="Abogado contrario" />
          </Field>
          <Field label="Contacto">
            <StyledInput value={opposingContact} onChange={e => setOpposingContact(e.target.value)} placeholder="Teléfono / email" />
          </Field>
        </div>
      </div>
    </div>
  );

  /* ─── STEP 3 – Documentos ───────────────────────────────── */
  const renderStep3 = () => (
    <div className="glass-card rounded-xl p-5">
      <SectionTitle icon={Upload} title="Cargar Documentos" />
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault(); setDragOver(false);
          const dropped = Array.from(e.dataTransfer.files).map(f => f.name);
          setFiles(prev => [...prev, ...dropped]);
        }}
        className="flex flex-col items-center justify-center py-14 rounded-xl transition-all cursor-pointer"
        style={{
          border: `2px dashed ${dragOver ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
          background: dragOver ? "hsl(var(--primary) / 0.05)" : "hsl(var(--secondary))",
        }}
      >
        <Upload size={36} style={{ color: dragOver ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} className="mb-3" />
        <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>Arrastra archivos aquí</p>
        <p className="text-xs mt-1 mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>o haz clic para seleccionar</p>
        <label className="cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
          + Seleccionar Archivos
          <input type="file" multiple className="hidden" onChange={e => {
            const picked = Array.from(e.target.files || []).map(f => f.name);
            setFiles(prev => [...prev, ...picked]);
          }} />
        </label>
      </div>
      <p className="text-[10px] mt-3" style={{ color: "hsl(var(--muted-foreground))" }}>ⓘ Formatos permitidos: PDF, DOC, DOCX, JPG, PNG. Máximo 10MB por archivo.</p>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center gap-2">
                <FileText size={14} style={{ color: "hsl(var(--primary))" }} />
                <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>{f}</span>
              </div>
              <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>
                <X size={13} style={{ color: "hsl(var(--muted-foreground))" }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ─── STEP 4 – Revisión ──────────────────────────────────── */
  const renderStep4 = () => {
    const rows = [
      ["Número de Caso", caseNumber],
      ["Título", title || "—"],
      ["Área Jurídica", selectedArea?.label || "—"],
      ["Tipo de Procedimiento", procedureType || "—"],
      ["Prioridad", selectedPriority.label],
      ["Abogado(s)", lawyers.join(", ") || "—"],
      ["Cliente", selectedClient || newClientName || "—"],
      ["Fecha de Inicio", startDate || "—"],
      ["Fecha Límite", deadline || "—"],
      ["Presupuesto", budget ? `${budget} ${currency}` : "—"],
      ["Tipo de Honorarios", feeType || "—"],
      ["Documentos", files.length > 0 ? `${files.length} archivo(s)` : "Ninguno"],
    ];
    return (
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={Eye} title="Revisión del Expediente" />
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))" }}>
          {rows.map(([label, value], i) => (
            <div key={label} className="flex justify-between items-center px-4 py-3 transition-colors"
              style={{
                background: i % 2 === 0 ? "hsl(var(--secondary))" : "transparent",
                borderBottom: i < rows.length - 1 ? "1px solid hsl(var(--border) / 0.4)" : "none",
              }}>
              <span className="text-xs font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</span>
              <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>{value}</span>
            </div>
          ))}
        </div>
        {area && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Área:</span>
            <LawBadge type={area} />
          </div>
        )}
      </div>
    );
  };

  /* ─── Sidebar (summary) ─────────────────────────────────── */
  const Sidebar = () => (
    <div className="space-y-4">
      {/* Summary */}
      <div className="glass-card rounded-xl p-4">
        <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>Resumen del Caso</h4>
        {[
          ["Área", selectedArea?.label || "—"],
          ["Tipo", procedureType || "—"],
          ["Prioridad", selectedPriority.label],
          ["Cliente", selectedClient || newClientName || "—"],
          ["Presupuesto", budget ? `${budget} ${currency.split(" ")[0]}` : "€0.00"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between py-2" style={{ borderBottom: "1px solid hsl(var(--border) / 0.4)" }}>
            <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</span>
            <span className="text-xs font-semibold" style={{ color: "hsl(var(--foreground))" }}>{value}</span>
          </div>
        ))}
        {area && (
          <div className="mt-3">
            <LawBadge type={area} />
          </div>
        )}
      </div>

      {/* Priority visual */}
      <div className="glass-card rounded-xl p-4">
        <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>Prioridad</h4>
        {priorities.map(p => {
          const Icon = p.icon;
          const active = priority === p.value;
          return (
            <button key={p.value} type="button" onClick={() => setPriority(p.value)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1.5 transition-all"
              style={{
                background: active ? `${p.color}18` : "transparent",
                border: `1px solid ${active ? p.color : "transparent"}`,
              }}>
              <Icon size={14} style={{ color: p.color }} />
              <span className="text-xs font-medium" style={{ color: active ? p.color : "hsl(var(--muted-foreground))" }}>{p.label}</span>
              {active && <CheckCircle2 size={12} className="ml-auto" style={{ color: p.color }} />}
            </button>
          );
        })}
      </div>

      {/* Quick preview btn */}
      <button type="button" onClick={() => setStep(4)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}>
        <Eye size={14} /> Vista Previa
      </button>
    </div>
  );

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="animate-fade-in">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate("/cases")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
            <ArrowLeft size={14} /> Casos
          </button>
          <div>
            <h2 className="text-xl font-bold font-display" style={{ color: "hsl(var(--foreground))" }}>Nuevo Caso</h2>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Registra un nuevo expediente en el sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate("/cases")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}>
            <Save size={14} /> Cancelar
          </button>
          <button type="button"
            onClick={() => handleSave()}
            disabled={createMutation.isPending}
            className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <CheckCircle2 size={14} /> {createMutation.isPending ? "Creando..." : "Crear Caso"}
          </button>
        </div>
      </div>

      {/* Step bar */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <StepBar />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main */}
        <div className="xl:col-span-2">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button type="button"
              onClick={() => setStep(s => Math.max(1, s - 1) as Step)}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
              style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}>
              ← Anterior
            </button>
            {step < 4 ? (
              <button type="button"
                onClick={() => setStep(s => Math.min(4, s + 1) as Step)}
                className="btn-primary flex items-center gap-2 px-6">
                Siguiente →
              </button>
            ) : (
              <button type="button"
                onClick={() => handleSave()}
                disabled={createMutation.isPending}
                className="btn-primary flex items-center gap-2 px-6 disabled:opacity-50">
                <CheckCircle2 size={16} /> {createMutation.isPending ? "Creando..." : "Crear Expediente"}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sticky top-4 h-fit">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
