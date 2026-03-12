import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, CheckCircle2, User, Phone, MapPin,
  Mail, Briefcase, Calendar, Plus, X, ChevronDown, Star,
  Building2, FileText,
} from "lucide-react";
import { LawType, lawConfig } from "@/components/LawBadge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────── */
type Step = 1 | 2 | 3;

const steps = [
  { n: 1 as Step, label: "Datos Personales", sub: "Identificación del cliente" },
  { n: 2 as Step, label: "Contacto", sub: "Email, teléfono, dirección" },
  { n: 3 as Step, label: "Áreas & Revisión", sub: "Legal y confirmación" },
];

const clientTypes = ["Persona Natural", "Persona Jurídica (Empresa)", "Autónomo / Freelance", "Institución Pública"];

const documentTypes = ["CI (Cédula de Identidad)", "Pasaporte", "NIT", "RUC", "DNI", "NIE"];

const occupations = [
  "Empresario / Emprendedor",
  "Empleado Dependiente",
  "Profesional Liberal",
  "Comerciante",
  "Estudiante",
  "Jubilado / Pensionado",
  "Ama/o de Casa",
  "Servidor Público",
  "Agricultor / Ganadero",
  "Otro",
];

const cities = [
  "La Paz", "Cochabamba", "Santa Cruz", "Oruro", "Potosí",
  "Sucre", "Tarija", "Beni", "Pando",
  // Internacional
  "Madrid", "Barcelona", "Buenos Aires", "Lima", "Bogotá", "Ciudad de México",
];

const phonePrefixes = ["+591 (BOL)", "+34 (ESP)", "+54 (ARG)", "+51 (PER)", "+52 (MEX)", "+57 (COL)", "+1 (USA)"];

const ratingLabels = ["Muy bajo", "Bajo", "Medio", "Alto", "Muy alto"];

const legalAreas: { type: LawType; label: string }[] = [
  { type: "civil", label: "Derecho Civil" },
  { type: "penal", label: "Derecho Penal" },
  { type: "laboral", label: "Derecho Laboral" },
  { type: "mercantil", label: "Derecho Mercantil" },
  { type: "administrativo", label: "Derecho Administrativo" },
  { type: "familia", label: "Derecho de Familia" },
  { type: "fiscal", label: "Derecho Fiscal" },
];

const statusOptions = ["Activo", "Inactivo", "Prospecto", "VIP"];
const statusColors: Record<string, string> = {
  "Activo": "hsl(142 70% 48%)",
  "Inactivo": "hsl(var(--muted-foreground))",
  "Prospecto": "hsl(217 91% 60%)",
  "VIP": "hsl(38 92% 55%)",
};

/* ─── Shared micro-components ────────────────────────────── */
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
        minHeight: 80,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.1)"; }}
      onBlur={e => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; }}
    />
  );
}

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
          className={`absolute z-[300] w-full rounded-xl shadow-2xl overflow-auto max-h-52 ${dropUp ? "bottom-full mb-1" : "top-full mt-1"}`}
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

function SectionTitle({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5 pb-3" style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.15)" }}>
        <Icon size={13} style={{ color: "hsl(var(--primary))" }} />
      </div>
      <h3 className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>{title}</h3>
    </div>
  );
}

/* ─── Quick date buttons ─────────────────────────────────── */
function QuickDateButtons({ onPick }: { onPick: (d: string) => void }) {
  const fmtDate = (d: Date) => d.toISOString().split("T")[0];
  const today = new Date();
  const sub = (days: number) => { const d = new Date(today); d.setDate(d.getDate() - days); return d; };
  return (
    <div className="flex gap-1.5 mt-1.5 flex-wrap">
      {[["Hoy", today], ["-7d", sub(7)], ["-1m", sub(30)], ["-3m", sub(90)], ["-1a", sub(365)]].map(([label, d]) => (
        <button key={label as string} type="button" onClick={() => onPick(fmtDate(d as Date))}
          className="px-2 py-1 rounded-md text-[10px] font-medium transition-all hover:opacity-80"
          style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.25)" }}>
          {label as string}
        </button>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function NewClient() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);

  /** 1. Mutation to Create Client */
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("clients")
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      toast.success("Cliente creado correctamente");
      navigate("/clients");
    },
    onError: (err) => {
      toast.error(`Error al crear cliente: ${err.message}`);
    }
  });

  // Step 1 – Personal
  const [clientType, setClientType] = useState("Persona Natural");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [occupation, setOccupation] = useState("");
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("Activo");
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState("");

  // Step 2 – Contact
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+591 (BOL)");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  // Step 3 – Legal areas
  const [legalAreas2, setLegalAreas2] = useState<LawType[]>([]);

  const isCompany = clientType === "Persona Jurídica (Empresa)";
  const displayName = isCompany ? companyName : `${firstName} ${lastName}`.trim();
  const initials = isCompany
    ? (companyName.charAt(0) || "?")
    : ((firstName.charAt(0) || "") + (lastName.charAt(0) || "")) || "?";

  const toggleArea = (t: LawType) =>
    setLegalAreas2(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  /* ─── Step bar ─────────────────────────────────────────── */
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
              className="flex items-center gap-2 min-w-0"
              style={{ cursor: isDone ? "pointer" : "default" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all"
                style={{
                  background: isActive ? "hsl(var(--primary))" : isDone ? "hsl(var(--primary) / 0.25)" : "hsl(var(--secondary))",
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
              <div className="flex-1 h-0.5 mx-3 rounded-full" style={{ background: isDone ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))" }} />
            )}
          </div>
        );
      })}
    </div>
  );

  /* ─── Live summary sidebar ──────────────────────────────── */
  const Summary = () => (
    <div className="glass-card rounded-xl p-5 h-fit sticky top-4">
      <p className="text-xs font-semibold tracking-wide uppercase mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>Resumen</p>
      <div className="flex flex-col items-center mb-5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mb-2"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", color: "white" }}>
          {initials || "?"}
        </div>
        <p className="text-sm font-bold text-foreground text-center">{displayName || "Nombre del cliente"}</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full mt-1" style={{ background: `${statusColors[status]}20`, color: statusColors[status] }}>{status}</span>
      </div>

      <div className="space-y-2 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
        {occupation && <div className="flex items-center gap-2"><Briefcase size={10} style={{ color: "hsl(var(--primary))" }} />{occupation}</div>}
        {email && <div className="flex items-center gap-2"><Mail size={10} style={{ color: "hsl(var(--primary))" }} />{email}</div>}
        {phone && <div className="flex items-center gap-2"><Phone size={10} style={{ color: "hsl(var(--primary))" }} />{phonePrefix.split(" ")[0]} {phone}</div>}
        {city && <div className="flex items-center gap-2"><MapPin size={10} style={{ color: "hsl(var(--primary))" }} />{city}</div>}
        {joinDate && <div className="flex items-center gap-2"><Calendar size={10} style={{ color: "hsl(var(--primary))" }} />Ingreso: {joinDate}</div>}
      </div>

      {legalAreas2.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>Áreas legales</p>
          <div className="flex flex-wrap gap-1">
            {legalAreas2.map(t => {
              const cfg = lawConfig[t];
              return (
                <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  {cfg.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-0.5 mt-4 justify-center">
        {[1, 2, 3, 4, 5].map(s => (
          <Star key={s} size={14}
            style={{ color: s <= rating ? "hsl(38 92% 55%)" : "hsl(var(--border))", fill: s <= rating ? "hsl(38 92% 55%)" : "transparent", cursor: "pointer" }}
            onClick={() => setRating(s)} />
        ))}
      </div>
      <p className="text-[10px] text-center mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{ratingLabels[rating - 1]}</p>
    </div>
  );

  /* ─── STEP 1 ─────────────────────────────────────────── */
  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Tipo de cliente */}
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={User} title="Tipo de Cliente" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {clientTypes.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setClientType(t)}
              className="px-3 py-3 rounded-xl text-xs font-semibold text-center transition-all"
              style={{
                background: clientType === t ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary))",
                color: clientType === t ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                border: `1px solid ${clientType === t ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))"}`,
                boxShadow: clientType === t ? "0 0 10px hsl(var(--primary) / 0.15)" : "none",
                transform: clientType === t ? "scale(1.02)" : "scale(1)",
              }}
            >
              {t === "Persona Natural" && <User size={16} className="mx-auto mb-1.5" style={{ color: clientType === t ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />}
              {t === "Persona Jurídica (Empresa)" && <Building2 size={16} className="mx-auto mb-1.5" style={{ color: clientType === t ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />}
              {t === "Autónomo / Freelance" && <Briefcase size={16} className="mx-auto mb-1.5" style={{ color: clientType === t ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />}
              {t === "Institución Pública" && <FileText size={16} className="mx-auto mb-1.5" style={{ color: clientType === t ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />}
              {t.replace("Persona Jurídica (Empresa)", "Empresa").replace("Autónomo / Freelance", "Autónomo").replace("Institución Pública", "Institución")}
            </button>
          ))}
        </div>
      </div>

      {/* Identificación */}
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={User} title="Datos de Identificación" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isCompany ? (
            <Field label="Nombre de la Empresa" className="md:col-span-2">
              <StyledInput value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ej: TechCorp S.L." />
            </Field>
          ) : (
            <>
              <Field label="Nombre(s)">
                <StyledInput value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="María Elena" />
              </Field>
              <Field label="Apellido(s)">
                <StyledInput value={lastName} onChange={e => setLastName(e.target.value)} placeholder="García López" />
              </Field>
            </>
          )}
          <Field label="Tipo de Documento">
            <CustomSelect options={documentTypes} value={docType} onChange={setDocType} placeholder="Seleccionar..." />
          </Field>
          <Field label="Número de Documento">
            <StyledInput value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="Ej: 12345678" />
          </Field>
          <Field label="Ocupación / Profesión">
            <CustomSelect options={occupations} value={occupation} onChange={setOccupation} placeholder="Seleccionar ocupación" />
          </Field>
          <Field label="Estado">
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: status === s ? `${statusColors[s]}20` : "hsl(var(--secondary))",
                    color: status === s ? statusColors[s] : "hsl(var(--muted-foreground))",
                    border: `1px solid ${status === s ? `${statusColors[s]}60` : "hsl(var(--border))"}`,
                  }}
                >{s}</button>
              ))}
            </div>
          </Field>
        </div>

        {/* Fecha de ingreso */}
        <div className="mt-4">
          <Field label="Fecha de Ingreso">
            <StyledInput type="date" value={joinDate} onChange={e => setJoinDate(e.target.value)} />
            <QuickDateButtons onPick={setJoinDate} />
          </Field>
        </div>

        {/* Notas internas */}
        <div className="mt-4">
          <Field label="Notas Internas (opcional)">
            <StyledTextarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones sobre el cliente..." rows={3} />
          </Field>
        </div>
      </div>
    </div>
  );

  /* ─── STEP 2 ─────────────────────────────────────────── */
  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={Mail} title="Datos de Contacto" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Correo Electrónico" className="md:col-span-2">
            <StyledInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@email.com" />
          </Field>

          {/* Phone with prefix */}
          <Field label="Teléfono Principal">
            <div className="flex gap-2">
              <div className="w-36 shrink-0">
                <CustomSelect options={phonePrefixes} value={phonePrefix} onChange={setPhonePrefix} placeholder="+591" />
              </div>
              <StyledInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="70000000" />
            </div>
          </Field>

          <Field label="Teléfono Alternativo (opcional)">
            <StyledInput value={phone2} onChange={e => setPhone2(e.target.value)} placeholder="Ej: 22334455" />
          </Field>

          <Field label="Ciudad">
            <CustomSelect options={cities} value={city} onChange={setCity} placeholder="Seleccionar ciudad" />
          </Field>

          <Field label="Sitio Web (opcional)">
            <StyledInput value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
          </Field>

          <Field label="Dirección" className="md:col-span-2">
            <StyledInput value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, barrio..." />
          </Field>
        </div>
      </div>
    </div>
  );

  /* ─── STEP 3 ─────────────────────────────────────────── */
  const renderStep3 = () => (
    <div className="space-y-5">
      {/* Áreas legales */}
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={FileText} title="Áreas Legales de Interés" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {legalAreas.map(a => {
            const cfg = lawConfig[a.type];
            const active = legalAreas2.includes(a.type);
            return (
              <button
                key={a.type}
                type="button"
                onClick={() => toggleArea(a.type)}
                className="flex items-center gap-2 px-3 py-3 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: active ? cfg.bg : "hsl(var(--secondary))",
                  color: active ? cfg.color : "hsl(var(--muted-foreground))",
                  border: `1px solid ${active ? cfg.border : "hsl(var(--border))"}`,
                  boxShadow: active ? `0 0 10px ${cfg.bg}` : "none",
                  transform: active ? "scale(1.02)" : "scale(1)",
                }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: active ? cfg.color : "transparent", border: `1px solid ${cfg.color}` }} />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Revisión final */}
      <div className="glass-card rounded-xl p-5">
        <SectionTitle icon={CheckCircle2} title="Resumen Final" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "Nombre", value: displayName || "—" },
            { label: "Tipo", value: clientType },
            { label: "Documento", value: docType ? `${docType}: ${docNumber || "—"}` : "—" },
            { label: "Ocupación", value: occupation || "—" },
            { label: "Email", value: email || "—" },
            { label: "Teléfono", value: phone ? `${phonePrefix.split(" ")[0]} ${phone}` : "—" },
            { label: "Ciudad", value: city || "—" },
            { label: "Fecha Ingreso", value: joinDate || "—" },
            { label: "Estado", value: status },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border) / 0.5)" }}>
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</span>
              <span className="text-xs font-semibold text-foreground">{value}</span>
            </div>
          ))}
        </div>
        {legalAreas2.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>Áreas legales</p>
            <div className="flex flex-wrap gap-1.5">
              {legalAreas2.map(t => {
                const cfg = lawConfig[t];
                return <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ─── Navigation buttons ─────────────────────────────── */
  const NavButtons = () => (
    <div className="flex gap-3 pt-4">
      {step > 1 && (
        <button type="button" onClick={() => setStep(s => (s - 1) as Step)}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
          Anterior
        </button>
      )}
      <div className="flex-1" />
      {step < 3 ? (
        <button type="button" onClick={() => setStep(s => (s + 1) as Step)}
          className="btn-primary px-6 py-2.5 text-sm">
          Siguiente →
        </button>
      ) : (
        <button type="button"
          onClick={() => {
            if (!displayName) {
              toast.error("El nombre es obligatorio");
              return;
            }
            createMutation.mutate({
              name: displayName,
              email: email || null,
              phone: phone ? `${phonePrefix.split(" ")[0]} ${phone}` : null,
              client_type: isCompany ? "persona_juridica" : "persona_natural",
              company: isCompany ? companyName : null,
              city: city || null,
              address: address || null,
              status: status.toLowerCase(),
              balance: 0,
            });
          }}
          disabled={createMutation.isPending}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-50">
          <Save size={15} /> {createMutation.isPending ? "Guardando..." : "Guardar Cliente"}
        </button>
      )}
    </div>
  );

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate("/clients")}
            className="p-2 rounded-lg transition-all" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-foreground font-display">Nuevo Cliente</h2>
            <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Completa los datos para registrar el cliente</p>
          </div>
        </div>
      </div>

      {/* Step bar */}
      <div className="glass-card rounded-xl p-4">
        <StepBar />
      </div>

      {/* Content + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-3">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          <NavButtons />
        </div>
        <div className="xl:col-span-1">
          <Summary />
        </div>
      </div>
    </div>
  );
}
