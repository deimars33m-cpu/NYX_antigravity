import { useState, useRef, useEffect } from "react";
import { useIsClassic } from "@/hooks/useClassicTheme";
import { useTheme } from "@/context/ThemeContext";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen, Plus, Search, Clock, Send, FileText,
  MessageSquare, Paperclip, File, Image, Music, Video,
  ChevronRight, CheckCircle2, Circle, AlertCircle, User,
  Mail, Phone, Download, Trash2, PenLine, Calendar,
  Sparkles, Check, X, LayoutList, LayoutGrid, Mic, MicOff,
  ClipboardList, FileSignature, MailPlus, UserPlus, MessageCircle, ChevronDown, ChevronUp, Scale, DollarSign,
} from "lucide-react";
import { LawBadge, LawType } from "@/components/LawBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const cases: any[] = [];

/* ─── Mock notes per case ─────────────────────────────────── */
const notesByCase: Record<string, { id: number; author: string; date: string; content: string; type: "text" | "audio"; duration?: string; summary?: string }[]> = {
  "EXP-2024-001": [
    { id: 1, author: "Ana Rodríguez", date: "12 Feb 2024, 10:15", content: "Cliente confirma recepción de la notificación judicial. Pendiente de aportar prueba pericial.", type: "text" },
    { id: 2, author: "Ana Rodríguez", date: "5 Feb 2024, 14:30", content: "Admitida a trámite la demanda. Juzgado 1ª Instancia Nº3 Madrid. Plazo contestación 20 días hábiles.", type: "text" },
    { id: 3, author: "Ana Rodríguez", date: "3 Feb 2024, 09:00", content: "", type: "audio", duration: "2:34", summary: "Reunión telefónica con la cliente. Confirma que tiene copia del contrato original y fotos del estado del inmueble. Se compromete a enviar todo por email antes del viernes." },
  ],
  "EXP-2024-002": [
    { id: 1, author: "Carlos López", date: "18 Ene 2024, 09:00", content: "Primera reunión con el cliente. Alega coartada para la noche del 15 de enero. Revisar cámaras CCTV.", type: "text" },
  ],
};

/* ─── Mock communications ─────────────────────────────────── */
const commsByCase: Record<string, { id: number; from: string; to: string; date: string; subject: string; body: string; sent: boolean }[]> = {
  "EXP-2024-001": [
    { id: 1, from: "Ana Rodríguez", to: "garcia@email.com", date: "10 Feb 2024, 11:00", subject: "Documentación pendiente", body: "Estimada Sra. García, le rogamos aporte el contrato de compraventa antes del 20 de febrero para poder adjuntarlo a la demanda.", sent: true },
    { id: 2, from: "María García", to: "bufete@legalnova.es", date: "11 Feb 2024, 08:45", subject: "Re: Documentación pendiente", body: "Buenos días, les envío escaneado el contrato. Quedo a su disposición para cualquier consulta.", sent: false },
    { id: 3, from: "Ana Rodríguez", to: "garcia@email.com", date: "20 Ene 2024, 16:30", subject: "Apertura de expediente EXP-2024-001", body: "Estimada Sra. García, le informamos que se ha procedido a la apertura formal de su expediente. Adjuntamos la carta de compromiso para su revisión y firma.", sent: true },
    { id: 4, from: "María García", to: "bufete@legalnova.es", date: "21 Ene 2024, 09:10", subject: "Re: Apertura de expediente", body: "Recibido, muchas gracias. Revisaré la carta de compromiso y se la devuelvo firmada esta semana.", sent: false },
    { id: 5, from: "Ana Rodríguez", to: "garcia@email.com", date: "25 Ene 2024, 14:00", subject: "Confirmación de recepción de documentos", body: "Confirmamos recepción del contrato de compraventa firmado y las fotografías del estado del inmueble. Procederemos con la redacción de la demanda.", sent: true },
    { id: 6, from: "Ana Rodríguez", to: "juzgado3@justicia.es", date: "5 Feb 2024, 10:00", subject: "Presentación demanda — García vs. Constructora Norte S.A.", body: "Se adjunta escrito de demanda junto con la documentación probatoria para su admisión a trámite.", sent: true },
  ],
  "EXP-2024-002": [
    { id: 1, from: "Carlos López", to: "jperez@gmail.com", date: "18 Ene 2024, 10:00", subject: "Inicio de representación legal", body: "Estimado Sr. Pérez, confirmamos el inicio de su representación legal. Le mantendremos informado de cada avance.", sent: true },
  ],
};

/* ─── Mock files ──────────────────────────────────────────── */
const filesByCase: Record<string, { id: number; name: string; type: string; size: string; date: string }[]> = {
  "EXP-2024-001": [
    { id: 1, name: "Demanda_principal.pdf", type: "pdf", size: "1.2 MB", date: "15 Ene 2024" },
    { id: 2, name: "Contrato_compraventa.pdf", type: "pdf", size: "840 KB", date: "11 Feb 2024" },
    { id: 3, name: "Prueba_fotografica_01.jpg", type: "img", size: "3.4 MB", date: "20 Ene 2024" },
    { id: 4, name: "Grabacion_pericial.mp3", type: "audio", size: "12 MB", date: "5 Feb 2024" },
    { id: 5, name: "Informe_daños.docx", type: "doc", size: "210 KB", date: "18 Ene 2024" },
  ],
  "EXP-2024-002": [
    { id: 1, name: "Escrito_defensa.pdf", type: "pdf", size: "560 KB", date: "20 Ene 2024" },
    { id: 2, name: "Declaracion_testigo.mp3", type: "audio", size: "8 MB", date: "22 Ene 2024" },
  ],
};

/* ─── Styling helpers ─────────────────────────────────────── */
const statusColor: Record<string, { bg: string; color: string }> = {
  Activo: { bg: "hsl(142 70% 48% / 0.15)", color: "hsl(142 70% 55%)" },
  Audiencia: { bg: "hsl(0 72% 55% / 0.15)", color: "hsl(0 72% 65%)" },
  Negociación: { bg: "hsl(38 92% 55% / 0.15)", color: "hsl(38 92% 65%)" },
  Revisión: { bg: "hsl(217 91% 60% / 0.15)", color: "hsl(217 91% 70%)" },
  Pendiente: { bg: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" },
};
const priorityColor: Record<string, string> = {
  Urgente: "hsl(0 72% 55%)", Alta: "hsl(38 92% 55%)", Media: "hsl(217 91% 60%)", Baja: "hsl(142 70% 48%)",
};
const lawTypes: Array<LawType | "todos"> = ["todos", "civil", "penal", "laboral", "mercantil", "administrativo", "familia", "fiscal"];

type TabId = "detalles" | "admision" | "notas" | "comunicaciones" | "archivos" | "cronologia";
const TABS: { id: TabId; label: string }[] = [
  { id: "detalles", label: "Detalles" },
  { id: "admision", label: "Admisión" },
  { id: "notas", label: "Notas" },
  { id: "comunicaciones", label: "Comunicaciones" },
  { id: "archivos", label: "Archivos" },
  { id: "cronologia", label: "Cronología" },
];

/* ─── File icon helper ────────────────────────────────────── */
function FileIcon({ type }: { type: string }) {
  if (type === "img") return <Image size={16} style={{ color: "hsl(217 91% 60%)" }} />;
  if (type === "audio") return <Music size={16} style={{ color: "hsl(280 70% 60%)" }} />;
  if (type === "video") return <Video size={16} style={{ color: "hsl(0 72% 55%)" }} />;
  if (type === "doc") return <FileText size={16} style={{ color: "hsl(38 92% 55%)" }} />;
  return <File size={16} style={{ color: "hsl(var(--primary))" }} />;
}

/* ═══════════════════════════════════════════════════════════════
   ADMISIÓN TAB — 5-Step Pipeline
   ═══════════════════════════════════════════════════════════ */
const ADMISSION_STEPS = [
  { id: 1, label: "Referencias", icon: MessageCircle, desc: "Origen del cliente" },
  { id: 2, label: "Consulta Inicial", icon: Calendar, desc: "Programar consulta" },
  { id: 3, label: "Checklists IA", icon: ClipboardList, desc: "Formularios del caso" },
  { id: 4, label: "Carta Compromiso", icon: FileSignature, desc: "Firma digital" },
  { id: 5, label: "Bienvenida", icon: MailPlus, desc: "Email de bienvenida" },
];

const referralSources = [
  "Redes sociales", "Google / Búsqueda web", "Publicidad (ADS)",
  "Recomendación de cliente", "Referencia de abogado", "Directorio legal",
  "Evento / Conferencia", "Otro",
];

function AdmisionTab() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  // Step data
  const [referralSource, setReferralSource] = useState("");
  const [referralDetail, setReferralDetail] = useState("");
  const [consultDate, setConsultDate] = useState("");
  const [consultTime, setConsultTime] = useState("");
  const [consultType, setConsultType] = useState("presencial");
  const [checklistGenerated, setChecklistGenerated] = useState(false);
  const [signed, setSigned] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const toggleComplete = (step: number) => {
    setCompletedSteps(p => p.includes(step) ? p.filter(s => s !== step) : [...p, step]);
  };
  const toggleExpand = (step: number) => setExpandedStep(p => p === step ? null : step);

  const progress = Math.round((completedSteps.length / 5) * 100);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-1">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--secondary))" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: progress === 100 ? "hsl(142 70% 48%)" : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }} />
        </div>
        <span className="text-[11px] font-bold shrink-0" style={{ color: progress === 100 ? "hsl(142 70% 55%)" : "hsl(var(--primary))" }}>{progress}%</span>
      </div>

      {/* Vertical checklist */}
      {ADMISSION_STEPS.map((step) => {
        const done = completedSteps.includes(step.id);
        const expanded = expandedStep === step.id;
        const Icon = step.icon;
        return (
          <div key={step.id} className="rounded-xl overflow-hidden transition-all" style={{ background: "hsl(var(--secondary)/0.3)", border: `1px solid ${done ? "hsl(142 70% 48%/0.3)" : expanded ? "hsl(var(--primary)/0.3)" : "hsl(var(--border))"}` }}>
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => toggleExpand(step.id)}>
              <button onClick={e => { e.stopPropagation(); toggleComplete(step.id); }}
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{ background: done ? "hsl(142 70% 48%)" : "hsl(var(--secondary))", border: `2px solid ${done ? "hsl(142 70% 48%)" : "hsl(var(--border))"}` }}>
                {done && <Check size={12} style={{ color: "white" }} />}
              </button>
              <Icon size={15} className="shrink-0" style={{ color: done ? "hsl(142 70% 55%)" : "hsl(var(--primary))" }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: done ? "hsl(142 70% 55%)" : "hsl(var(--foreground))", textDecoration: done ? "line-through" : "none" }}>{step.label}</p>
                <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{step.desc}</p>
              </div>
              <div className="transition-transform" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>
                <ChevronDown size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
              </div>
            </div>

            {/* Expanded content */}
            {expanded && (
              <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: "1px solid hsl(var(--border)/0.5)" }}>
                {step.id === 1 && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {referralSources.map(src => (
                        <button key={src} onClick={() => setReferralSource(src)}
                          className="px-2.5 py-2 rounded-lg text-[11px] text-left transition-all"
                          style={{
                            background: referralSource === src ? "hsl(var(--primary)/0.1)" : "hsl(var(--secondary)/0.5)",
                            border: `1px solid ${referralSource === src ? "hsl(var(--primary)/0.4)" : "hsl(var(--border))"}`,
                            color: referralSource === src ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                          }}>{src}</button>
                      ))}
                    </div>
                    {referralSource && (
                      <textarea value={referralDetail} onChange={e => setReferralDetail(e.target.value)}
                        placeholder="Detalle adicional (opcional)..." rows={2}
                        className="w-full text-xs rounded-lg px-3 py-2 resize-none focus:outline-none"
                        style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                    )}
                  </>
                )}
                {step.id === 2 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Fecha</label>
                      <input type="date" value={consultDate} onChange={e => setConsultDate(e.target.value)}
                        className="w-full text-xs rounded-lg px-3 py-2 focus:outline-none"
                        style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Hora</label>
                      <input type="time" value={consultTime} onChange={e => setConsultTime(e.target.value)}
                        className="w-full text-xs rounded-lg px-3 py-2 focus:outline-none"
                        style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Modalidad</label>
                      <div className="flex gap-1.5">
                        {["presencial", "videollamada", "telefónica"].map(m => (
                          <button key={m} onClick={() => setConsultType(m)}
                            className="flex-1 px-2 py-2 rounded-lg text-[10px] capitalize transition-all"
                            style={{
                              background: consultType === m ? "hsl(var(--primary)/0.1)" : "hsl(var(--secondary)/0.5)",
                              border: `1px solid ${consultType === m ? "hsl(var(--primary)/0.4)" : "hsl(var(--border))"}`,
                              color: consultType === m ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                            }}>{m}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {step.id === 3 && (
                  <>
                    {!checklistGenerated ? (
                      <button onClick={() => setChecklistGenerated(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium transition-all"
                        style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.1), hsl(var(--accent)/0.1))", border: "1px solid hsl(var(--primary)/0.3)", color: "hsl(var(--primary))" }}>
                        <Sparkles size={14} /> Generar Checklists con IA
                      </button>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {["Datos personales del cliente", "Documentación requerida", "Hechos relevantes del caso", "Pruebas a recabar", "Plazos legales aplicables"].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ background: "hsl(var(--secondary)/0.5)", border: "1px solid hsl(var(--border))" }}>
                            <CheckCircle2 size={12} style={{ color: "hsl(142 70% 48%)" }} />
                            <span className="text-[11px] text-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {step.id === 4 && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                      <FileText size={13} style={{ color: "hsl(var(--primary))" }} />
                      <span className="text-[11px] font-medium text-foreground">Carta_Compromiso_General.pdf</span>
                      <span className="text-[9px] ml-auto" style={{ color: "hsl(var(--muted-foreground))" }}>Auto-generado</span>
                    </div>
                    <button onClick={() => setSigned(true)} disabled={signed}
                      className="px-4 py-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all shrink-0"
                      style={signed
                        ? { background: "hsl(142 70% 48%/0.15)", border: "1px solid hsl(142 70% 48%/0.3)", color: "hsl(142 70% 55%)" }
                        : { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                      {signed ? <><Check size={12} /> Firmado</> : <><FileSignature size={12} /> Firmar</>}
                    </button>
                  </div>
                )}
                {step.id === 5 && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg px-3 py-2.5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                      <div className="flex items-center gap-2 text-[11px]">
                        <Mail size={11} style={{ color: "hsl(var(--primary))" }} />
                        <span style={{ color: "hsl(var(--muted-foreground))" }}>Para:</span>
                        <span className="font-medium text-foreground">cliente@email.com</span>
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>Bienvenido/a a NYX LEX — Su representación legal</p>
                    </div>
                    <button onClick={() => setEmailSent(true)} disabled={emailSent}
                      className="px-4 py-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all shrink-0"
                      style={emailSent
                        ? { background: "hsl(142 70% 48%/0.15)", border: "1px solid hsl(142 70% 48%/0.3)", color: "hsl(142 70% 55%)" }
                        : { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                      {emailSent ? <><Check size={12} /> Enviado</> : <><Send size={12} /> Enviar</>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Completion */}
      {completedSteps.length === 5 && (
        <div className="rounded-xl p-3 text-center" style={{ background: "hsl(142 70% 48%/0.1)", border: "1px solid hsl(142 70% 48%/0.3)" }}>
          <CheckCircle2 size={20} className="mx-auto mb-1" style={{ color: "hsl(142 70% 48%)" }} />
          <p className="text-xs font-bold" style={{ color: "hsl(142 70% 55%)" }}>Admisión Completada</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TIMELINE — Cronología de eventos del caso
   ═══════════════════════════════════════════════════════════ */
const MOCK_TIMELINE = [
  { id: 1, icon: "form", title: 'Formulario marcado como completo: "Formulario de admisión general"', author: "Ana Rodríguez", date: "Miércoles, 5 de marzo de 2025 a las 11:29 a. m.", detail: null },
  { id: 2, icon: "calendar", title: 'Cita marcada como completa: "Consulta inicial"', author: "Ana Rodríguez", date: "Miércoles, 5 de marzo de 2025 a las 11:29 a. m.", detail: null },
  { id: 3, icon: "doc", title: 'Documento preparado: "Carta de compromiso general"', author: "Ana Rodríguez", date: "Miércoles, 5 de marzo de 2025 a las 10:20 a. m.", detail: null },
  { id: 4, icon: "note", title: "Motivo de la consulta", author: "Ana Rodríguez", date: "Miércoles, 5 de marzo de 2025 a las 10:13 a. m.", detail: "Buscando asesoramiento legal sobre un accidente automovilístico. El accidente ocurrió el 15 de agosto de 2025 en la intersección de la calle 14 y Broad, en la ciudad de Nueva York." },
  { id: 5, icon: "form", title: 'Formulario marcado como completo: "Formulario de admisión general"', author: "Ana Rodríguez", date: "Miércoles, 5 de marzo de 2025 a las 9:19 a. m.", detail: null },
  { id: 6, icon: "calendar", title: 'Cita marcada como completa: "Consulta inicial"', author: "Ana Rodríguez", date: "Miércoles, 5 de marzo de 2025 a las 8:27 a. m.", detail: null },
  { id: 7, icon: "status", title: 'Estado del asunto actualizado a "Formulario de admisión completado"', author: "Ana Rodríguez", date: "Viernes, 24 de enero de 2025 a las 3:51 p. m.", detail: null },
  { id: 8, icon: "form", title: 'Formulario preparado: "Formulario de admisión general"', author: "Ana Rodríguez", date: "Lunes, 13 de enero de 2025 a las 12:17 p. m.", detail: null },
];

function TimelineIcon({ type }: { type: string }) {
  const size = 14;
  const style: React.CSSProperties = { color: "hsl(var(--primary))" };
  if (type === "form") return <ClipboardList size={size} style={style} />;
  if (type === "calendar") return <Calendar size={size} style={style} />;
  if (type === "doc") return <FileText size={size} style={style} />;
  if (type === "note") return <PenLine size={size} style={style} />;
  if (type === "status") return <CheckCircle2 size={size} style={{ color: "hsl(142 70% 48%)" }} />;
  return <Circle size={size} style={style} />;
}

function CaseTimeline() {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Clock size={16} style={{ color: "hsl(var(--primary))" }} />
        Cronología
      </h4>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px" style={{ background: "hsl(var(--border))" }} />

        <div className="space-y-0">
          {MOCK_TIMELINE.map((evt) => (
            <div key={evt.id} className="relative pb-4 last:pb-0">
              {/* Dot on line */}
              <div className="absolute -left-6 top-1 w-[22px] h-[22px] rounded-md flex items-center justify-center"
                style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                <TimelineIcon type={evt.icon} />
              </div>

              <div className="ml-2">
                <p className="text-xs font-medium text-foreground leading-snug">{evt.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {evt.author} · {evt.date}
                </p>
                {evt.detail && (
                  <div className="mt-2 rounded-lg px-3 py-2.5" style={{ background: "hsl(var(--secondary)/0.5)", borderLeft: "3px solid hsl(var(--primary)/0.5)" }}>
                    <p className="text-[11px] leading-relaxed text-foreground">{evt.detail}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NOTAS TAB — Text + Audio notes with summaries
   ═══════════════════════════════════════════════════════════ */
function NotasTab({ caseId }: { caseId: string }) {
  const [notes, setNotes] = useState(notesByCase[caseId] || []);
  const [newNote, setNewNote] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const addTextNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [
      { id: Date.now(), author: "Yo", date: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), content: newNote.trim(), type: "text" },
      ...prev,
    ]);
    setNewNote("");
  };

  const toggleRecording = () => {
    if (recording) {
      // Stop recording — simulate saving audio note
      if (timerRef.current) clearInterval(timerRef.current);
      const duration = `${Math.floor(recordingTime / 60)}:${String(recordingTime % 60).padStart(2, "0")}`;
      setNotes(prev => [
        { id: Date.now(), author: "Yo", date: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), content: "", type: "audio", duration, summary: "Resumen generado por IA: Nota de audio sobre el avance del caso y próximos pasos a seguir con el cliente." },
        ...prev,
      ]);
      setRecordingTime(0);
      setRecording(false);
    } else {
      setRecording(true);
      timerRef.current = window.setInterval(() => setRecordingTime(t => t + 1), 1000);
    }
  };

  return (
    <div className="space-y-4">
      {/* New note area */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "hsl(var(--secondary)/0.5)", border: "1px solid hsl(var(--border))" }}>
        <div className="flex gap-2">
          <textarea
            value={newNote} onChange={e => setNewNote(e.target.value)}
            placeholder="Escribe una nota de texto..."
            rows={3}
            className="flex-1 text-xs resize-none rounded-lg px-3 py-2 focus:outline-none"
            style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={addTextNote} disabled={!newNote.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs py-2 disabled:opacity-40">
            <PenLine size={12} /> Crear Nota de Texto
          </button>
          <button onClick={toggleRecording}
            className="flex items-center justify-center gap-1.5 text-xs py-2 px-4 rounded-lg font-medium transition-all"
            style={recording
              ? { background: "hsl(0 72% 55%/0.15)", border: "1px solid hsl(0 72% 55%/0.4)", color: "hsl(0 72% 65%)" }
              : { background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }
            }>
            {recording ? <><MicOff size={12} /> Detener {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")}</> : <><Mic size={12} /> Nota de Audio</>}
          </button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-xs text-center py-6" style={{ color: "hsl(var(--muted-foreground))" }}>Sin notas todavía</p>
      ) : (
        <div className="space-y-2">
          {notes.map(n => (
            <div key={n.id} className="rounded-xl p-3" style={{ background: "hsl(var(--secondary)/0.4)", borderLeft: `3px solid ${n.type === "audio" ? "hsl(280 70% 60%)" : "hsl(var(--primary)/0.6)"}`, border: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {n.type === "audio" ? <Mic size={10} style={{ color: "hsl(280 70% 60%)" }} /> : <PenLine size={10} style={{ color: "hsl(var(--primary))" }} />}
                  <span className="text-[10px] font-semibold" style={{ color: n.type === "audio" ? "hsl(280 70% 60%)" : "hsl(var(--primary))" }}>{n.author}</span>
                  {n.type === "audio" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "hsl(280 70% 60%/0.15)", color: "hsl(280 70% 60%)" }}>
                      🎙 {n.duration}
                    </span>
                  )}
                </div>
                <span className="text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>{n.date}</span>
              </div>
              {n.type === "text" && (
                <p className="text-[11px] leading-relaxed text-foreground">{n.content}</p>
              )}
              {n.type === "audio" && n.summary && (
                <div className="mt-1 px-2 py-1.5 rounded-md" style={{ background: "hsl(var(--secondary)/0.5)" }}>
                  <p className="text-[10px] font-medium mb-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <Sparkles size={9} className="inline mr-1" style={{ color: "hsl(var(--primary))" }} />
                    Resumen IA:
                  </p>
                  <p className="text-[11px] leading-relaxed text-foreground">{n.summary}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMUNICACIONES TAB
   ═══════════════════════════════════════════════════════════ */
function ComunicacionesTab({ c }: { c: typeof cases[0] }) {
  const [comms, setComms] = useState(commsByCase[c.id] || []);
  const [to, setTo] = useState(c.clientEmail);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const send = () => {
    if (!body.trim() || !subject.trim()) return;
    setSending(true);
    setTimeout(() => {
      setComms(prev => [
        { id: Date.now(), from: c.lawyer, to, date: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), subject, body: body.trim(), sent: true },
        ...prev,
      ]);
      setSubject(""); setBody("");
      setSending(false);
    }, 600);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl p-3 space-y-2" style={{ background: "hsl(var(--secondary)/0.5)", border: "1px solid hsl(var(--border))" }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Nuevo email</p>
        <div className="flex items-center gap-2 text-xs">
          <Mail size={11} style={{ color: "hsl(var(--primary))" }} />
          <input value={to} onChange={e => setTo(e.target.value)} className="flex-1 px-2 py-1 rounded-md text-xs focus:outline-none"
            style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
        </div>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Asunto..." className="w-full px-2 py-1 rounded-md text-xs focus:outline-none"
          style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Mensaje..." rows={3} className="w-full px-2 py-1.5 rounded-md text-xs resize-none focus:outline-none"
          style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
        <button onClick={send} disabled={sending} className="btn-primary w-full flex items-center justify-center gap-1.5 text-xs py-1.5">
          <Send size={12} /> {sending ? "Enviando..." : "Enviar"}
        </button>
      </div>
      {comms.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: "hsl(var(--muted-foreground))" }}>Sin comunicaciones</p>
      ) : (
        <div className="space-y-2">
          {comms.map(m => (
            <div key={m.id} className={`rounded-xl p-3 ${m.sent ? "ml-4" : "mr-4"}`}
              style={{
                background: m.sent ? "hsl(var(--primary)/0.1)" : "hsl(var(--secondary)/0.4)",
                border: `1px solid ${m.sent ? "hsl(var(--primary)/0.25)" : "hsl(var(--border))"}`,
              }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold" style={{ color: m.sent ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}>
                  {m.sent ? `↑ ${m.from}` : `↓ ${m.from}`}
                </span>
                <span className="text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>{m.date}</span>
              </div>
              <p className="text-[10px] font-semibold mb-1 text-foreground">{m.subject}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{m.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AI CHAT PANEL + ARCHIVOS TAB (unchanged logic)
   ═══════════════════════════════════════════════════════════ */
const AI_ACTIONS = [
  { id: "lenguaje", label: "Lenguaje hostil", desc: "Identificar cláusulas desfavorables al cliente" },
  { id: "inconsist", label: "Inconsistencias", desc: "Detectar ambigüedades y solapamientos en el expediente" },
  { id: "definic", label: "Definiciones", desc: "Extraer y verificar todos los términos definidos" },
  { id: "obligac", label: "Obligaciones", desc: "Identificar y listar obligaciones post-cierre" },
  { id: "riesgos", label: "Mitigación de riesgos", desc: "Proponer mitigaciones para cada riesgo identificado" },
  { id: "negociacion", label: "Estrategia negociación", desc: "Desarrollar objetivos, posiciones y tácticas" },
  { id: "plazos", label: "Plazos de reclamación", desc: "Identificar el plazo límite para presentar reclamaciones" },
  { id: "preguntas", label: "Preguntas al cliente", desc: "Generar cuestionario de hechos relevantes" },
  { id: "cronologia", label: "Cronología de eventos", desc: "Extraer línea de tiempo de comunicaciones y transacciones" },
  { id: "inventario", label: "Inventario de activos", desc: "Listar bienes, cuentas e inversiones relacionados" },
];

const AI_MOCK_RESPONSES: Record<string, string> = {
  lenguaje: "He analizado el expediente. Identifico **3 cláusulas potencialmente hostiles**: (1) La cláusula 4.2 limita la responsabilidad del contratista sin reciprocidad. (2) La cláusula 7.1 otorga plazos asimétricos. (3) La cláusula 11 excluye daños indirectos unilateralmente. Recomiendo renegociar estas disposiciones.",
  inconsist: "Detectadas **2 inconsistencias**: La fecha en el artículo 3 no coincide con el anexo B (diferencia de 15 días). El importe en cláusula 9.1 difiere del cuadro resumen. Requieren corrección antes de la firma.",
  definic: "Extraídos **12 términos definidos**. Se detectan 2 términos utilizados sin definición previa: 'Plazo de Garantía' (usado en cláusula 6 pero no definido) y 'Entrega Final' (art. 8, sin definición explícita). Recomiendo incluirlos en el artículo 1.",
  obligac: "Listadas **8 obligaciones post-cierre**: entrega de documentación técnica (30 días), mantenimiento preventivo (trimestral), reporte de incidencias (72h), auditoría anual, renovación de seguros, notificación de cambios societarios, conservación de garantías y actualización de datos de contacto.",
  riesgos: "Identificados **4 riesgos principales**: (1) Incumplimiento de plazos — mitigación: cláusula de penalidades proporcionales. (2) Insolvencia del contratista — mitigación: aval bancario o seguro de caución. (3) Cambio normativo — mitigación: cláusula de hardship. (4) Conflicto de jurisdicción — mitigación: sumisión expresa a arbitraje.",
  negociacion: "**Estrategia recomendada**: Objetivo prioritario: reducir cláusula de exclusión de responsabilidad. Posición inicial: responsabilidad ilimitada. Posición de reserva: cap en 2× el valor del contrato. Táctica: ofrecer plazo extendido a cambio de mayor cobertura. BATNA: contratar seguro de responsabilidad complementario.",
  plazos: "**Plazos críticos identificados**: Reclamación por vicios ocultos: 6 meses desde entrega (art. 12). Recurso ante TEAC: 1 mes desde notificación. Prescripción acción civil: 5 años. Contestación demanda: 20 días hábiles. ⚠️ El plazo más próximo vence el **15 de marzo**.",
  preguntas: "**Cuestionario generado** (10 preguntas clave):\n1. ¿Existe documentación del estado previo al contrato?\n2. ¿Se realizaron negociaciones previas por escrito?\n3. ¿Hay pagos realizados fuera del contrato formal?\n4. ¿Existen comunicaciones por canales informales?\n5. ¿Se cumplieron todos los hitos parciales?\n6. ¿Hay testigos presenciales de la entrega?\n7. ¿Existen fotografías o videos del estado del bien?\n8. ¿Se presentaron reclamaciones previas?\n9. ¿El cliente tiene copias de todos los anexos firmados?\n10. ¿Existen acuerdos verbales no recogidos en el contrato?",
  cronologia: "**Cronología extraída**:\n• 15 Ene 2024 — Firma del contrato principal\n• 20 Ene 2024 — Primer pago parcial (30%)\n• 5 Feb 2024 — Notificación de demanda\n• 12 Feb 2024 — Requerimiento de documentación\n• 28 Feb 2024 — Plazo contestación demanda\n• 15 Mar 2024 — Vista oral programada",
  inventario: "**Inventario de activos relacionados**:\n• Inmueble principal: valorado en €245,000 (tasación 2023)\n• Cuenta corriente compartida: saldo ~€18,400\n• Vehículo matrícula 1234-ABC: valor €22,000\n• Fondo de inversión: €35,200 (a fecha de apertura)\n• Participaciones societarias: 40% en Constructora Norte S.A.",
};

function AIChatPanel({ caseId, files }: { caseId: string; files: { id: number; name: string; type: string; size: string; date: string }[] }) {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string; ts: string }[]>([
    { role: "ai", text: `Hola, soy tu asistente legal IA. He analizado los **${files.length} archivos** adjuntos a este expediente. Selecciona una acción sugerida o escribe tu consulta.`, ts: "Ahora" },
  ]);
  const [input, setInput] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const ts = () => new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(p => [...p, { role: "user", text: text.trim(), ts: ts() }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const key = AI_ACTIONS.find(a => a.label.toLowerCase() === text.toLowerCase())?.id || "";
      const reply = AI_MOCK_RESPONSES[key] || `He analizado tu consulta sobre **"${text}"**. Basándome en los documentos del expediente, te recomiendo revisar las cláusulas relevantes y coordinar con el abogado asignado antes de tomar acción.`;
      setMessages(p => [...p, { role: "ai", text: reply, ts: ts() }]);
      setLoading(false);
    }, 900);
  };

  const toggleAction = (id: string) => setSelectedActions(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const runSelected = () => {
    const labels = AI_ACTIONS.filter(a => selectedActions.includes(a.id)).map(a => a.label);
    if (!labels.length) return;
    sendMessage(labels.join(", "));
    setSelectedActions([]);
  };

  return (
    <div className="mt-5 pt-5 flex flex-col gap-3" style={{ borderTop: "1px solid hsl(var(--border)/0.5)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
            <Sparkles size={12} style={{ color: "white" }} />
          </div>
          <span className="text-xs font-bold text-foreground">Asistente IA del Expediente</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "hsl(142 70% 48%/0.15)", color: "hsl(142 70% 55%)" }}>● En línea</span>
      </div>
      <div className="rounded-xl overflow-y-auto space-y-2 max-h-48 p-3" style={{ background: "hsl(var(--secondary)/0.3)", border: "1px solid hsl(var(--border))" }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            {m.role === "ai" && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
                <Sparkles size={9} style={{ color: "white" }} />
              </div>
            )}
            <div className={`max-w-[82%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${m.role === "user" ? "ml-auto" : ""}`}
              style={{ background: m.role === "user" ? "hsl(var(--primary)/0.15)" : "hsl(var(--card))", border: `1px solid ${m.role === "user" ? "hsl(var(--primary)/0.3)" : "hsl(var(--border))"}`, color: "hsl(var(--foreground))", whiteSpace: "pre-line" }}>
              {m.text.replace(/\*\*(.*?)\*\*/g, "$1")}
              <p className="text-[9px] mt-1 opacity-50">{m.ts}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center">
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
              <Sparkles size={9} style={{ color: "white" }} />
            </div>
            <div className="flex gap-1 px-3 py-2 rounded-xl" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(var(--primary))", animationDelay: `${i * 150}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage(input)}
          placeholder="Escribe tu consulta sobre el expediente..."
          className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none"
          style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
        <button onClick={() => sendMessage(input)} className="btn-primary px-3 py-2 rounded-lg"><Send size={13} /></button>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>Acciones sugeridas</p>
          <div className="flex gap-2">
            <button className="text-[10px]" style={{ color: "hsl(var(--primary))" }} onClick={() => setSelectedActions(AI_ACTIONS.map(a => a.id))}>Todos</button>
            <span style={{ color: "hsl(var(--border))" }}>|</span>
            <button className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }} onClick={() => setSelectedActions([])}>Ninguno</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {AI_ACTIONS.map(a => {
            const active = selectedActions.includes(a.id);
            return (
              <button key={a.id} onClick={() => toggleAction(a.id)}
                className="flex items-start gap-2 p-2.5 rounded-lg text-left transition-all hover:opacity-80"
                style={{ background: active ? "hsl(var(--primary)/0.08)" : "hsl(var(--secondary)/0.5)", border: `1px solid ${active ? "hsl(var(--primary)/0.35)" : "hsl(var(--border)/0.7)"}` }}>
                <div className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5"
                  style={{ borderColor: active ? "hsl(var(--primary))" : "hsl(var(--border))", background: active ? "hsl(var(--primary))" : "transparent" }}>
                  {active && <Check size={9} style={{ color: "white" }} />}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-foreground leading-tight">{a.label}</p>
                  <p className="text-[10px] mt-0.5 leading-snug" style={{ color: "hsl(var(--muted-foreground))" }}>{a.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        {selectedActions.length > 0 && (
          <button onClick={runSelected} className="btn-primary w-full mt-3 flex items-center justify-center gap-2 text-xs py-2">
            <Sparkles size={13} /> Ejecutar {selectedActions.length} acción{selectedActions.length > 1 ? "es" : ""}
          </button>
        )}
      </div>
    </div>
  );
}

function ButtonToAssistant() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/ai-assistant")}
      className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium transition-all hover:opacity-80"
      style={{
        background: "linear-gradient(135deg, hsl(var(--primary)/0.1), hsl(var(--accent)/0.1))",
        border: "1px solid hsl(var(--primary)/0.3)",
        color: "hsl(var(--primary))",
      }}
    >
      <Sparkles size={14} />
      Abrir Asistente IA Legal
    </button>
  );
}

function ArchivosTab({ caseId }: { caseId: string }) {
  const files = filesByCase[caseId] || [];
  const groups = [
    { label: "PDF", types: ["pdf"], color: "hsl(0 72% 55%)" },
    { label: "Documentos", types: ["doc"], color: "hsl(38 92% 55%)" },
    { label: "Imágenes", types: ["img"], color: "hsl(217 91% 60%)" },
    { label: "Audio", types: ["audio"], color: "hsl(280 70% 60%)" },
    { label: "Vídeo", types: ["video"], color: "hsl(142 70% 48%)" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {groups.map(g => {
          const count = files.filter(f => g.types.includes(f.type)).length;
          if (!count) return null;
          return (
            <span key={g.label} className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: `${g.color}20`, color: g.color, border: `1px solid ${g.color}40` }}>
              {count} {g.label}
            </span>
          );
        })}
        {files.length === 0 && <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Sin archivos adjuntos</p>}
      </div>
      <div className="space-y-1.5">
        {files.map(f => (
          <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl group"
            style={{ background: "hsl(var(--secondary)/0.5)", border: "1px solid hsl(var(--border))" }}>
            <FileIcon type={f.type} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
              <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{f.size} · {f.date}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: "hsl(var(--muted-foreground))" }}><Download size={12} /></button>
              <button className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: "hsl(0 72% 55%)" }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-4 text-center border-dashed cursor-pointer hover:opacity-80 transition-opacity"
        style={{ background: "hsl(var(--primary)/0.05)", border: "2px dashed hsl(var(--primary)/0.3)", color: "hsl(var(--muted-foreground))" }}>
        <Paperclip size={18} className="mx-auto mb-1.5" style={{ color: "hsl(var(--primary)/0.6)" }} />
        <p className="text-xs">Arrastra archivos o haz clic para adjuntar</p>
      </div>
      <ButtonToAssistant />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CASE DETAILS TAB — Full details view (replaces left panel)
   ═══════════════════════════════════════════════════════════ */


function DetailSection({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "hsl(var(--primary)/0.12)" }}>
          <Icon size={11} style={{ color: "hsl(var(--primary))" }} />
        </div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>{title}</h4>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, editable = true }: { label: string; value: string; editable?: boolean }) {
  const [val, setVal] = useState(value);
  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2 group"
      style={{ background: "hsl(var(--secondary)/0.3)", border: "1px solid hsl(var(--border)/0.5)" }}>
      <span className="text-[10px] w-28 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</span>
      {editable ? (
        <input value={val} onChange={e => setVal(e.target.value)}
          className="flex-1 text-[11px] font-medium bg-transparent focus:outline-none text-foreground" style={{ minWidth: 0 }} />
      ) : (
        <span className="flex-1 text-[11px] font-medium text-foreground">{val}</span>
      )}
      {editable && <PenLine size={10} className="opacity-0 group-hover:opacity-50 shrink-0 transition-opacity" style={{ color: "hsl(var(--muted-foreground))" }} />}
    </div>
  );
}

function CaseDetailsTab({ c }: { c: typeof cases[0] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-5">
        <DetailSection icon={FolderOpen} title="Información del Caso">
          <DetailRow label="Nº Expediente" value={c.id} editable={false} />
          <DetailRow label="Tipo proceso" value={c.procedureType} />
          <DetailRow label="Fase procesal" value={c.phase} />
          <DetailRow label="Juez / Árbitro" value={c.judge} />
          <DetailRow label="Tribunal / Org" value={c.court} />
          <DetailRow label="Abogado" value={c.lawyer} />
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <LawBadge type={c.type} />
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={statusColor[c.status]}>{c.status}</span>
            <span className="text-xs font-bold" style={{ color: priorityColor[c.priority] }}>● {c.priority}</span>
          </div>
          {c.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {c.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full text-[9px] font-medium"
                  style={{ background: "hsl(var(--primary)/0.1)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary)/0.2)" }}>{t}</span>
              ))}
            </div>
          )}
        </DetailSection>

        <DetailSection icon={User} title="Cliente">
          <DetailRow label="Nombre" value={c.client} />
          <DetailRow label="Email" value={c.clientEmail} />
          <DetailRow label="Teléfono" value={c.clientPhone} />
        </DetailSection>

        <DetailSection icon={Scale} title="Parte Contraria">
          <DetailRow label="Nombre" value={c.opposingName} />
          <DetailRow label="Abogado" value={c.opposingLawyer} />
          <DetailRow label="Contacto" value={c.opposingContact} />
        </DetailSection>
      </div>

      {/* Right column */}
      <div className="space-y-5">
        <DetailSection icon={DollarSign} title="Información Económica">
          <DetailRow label="Presupuesto" value={`${c.budget.toLocaleString()} ${CURRENCY_LABELS[c.currency] || c.currency}`} />
          <DetailRow label="Honorarios" value={FEE_TYPE_LABELS[c.feeType] || c.feeType} />
          <DetailRow label="Moneda" value={CURRENCY_LABELS[c.currency] || c.currency} />
        </DetailSection>

        <DetailSection icon={Calendar} title="Fechas Críticas">
          <DetailRow label="Fecha apertura" value={c.opened} />
          <DetailRow label="Vencimiento" value={c.deadline} />
          <DetailRow label="Recordatorio" value={c.reminder} />
        </DetailSection>

        {c.description && (
          <DetailSection icon={FileText} title="Descripción del Caso">
            <div className="rounded-lg px-3 py-2.5" style={{ background: "hsl(var(--secondary)/0.3)", border: "1px solid hsl(var(--border)/0.5)" }}>
              <p className="text-[11px] leading-relaxed text-foreground">{c.description}</p>
            </div>
          </DetailSection>
        )}
      </div>
    </div>
  );
}

/* ─── Compact sidebar summary for modal left panel ─────── */
function CaseDetailsPanel({ c }: { c: typeof cases[0] }) {
  const quickFields = [
    { label: "Cliente", value: c.client, icon: User },
    { label: "Email", value: c.clientEmail, icon: Mail },
    { label: "Teléfono", value: c.clientPhone, icon: Phone },
    { label: "Abogado", value: c.lawyer, icon: User },
    { label: "Fase", value: c.phase, icon: ChevronRight },
    { label: "Juez", value: c.judge, icon: User },
    { label: "Tribunal", value: c.court, icon: FolderOpen },
    { label: "Vencimiento", value: c.deadline, icon: Clock },
    { label: "Vencimiento", value: c.deadline, icon: Calendar },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-xs font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>{c.id}</span>
        <LawBadge type={c.type} />
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={statusColor[c.status]}>{c.status}</span>
      </div>
      <div className="space-y-1">
        {quickFields.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
            style={{ background: "hsl(var(--secondary)/0.3)", border: "1px solid hsl(var(--border)/0.5)" }}>
            <Icon size={11} className="shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
            <span className="text-[9px] w-16 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</span>
            <span className="flex-1 text-[10px] font-medium text-foreground truncate">{value}</span>
          </div>
        ))}
      </div>
      <div className="pt-1 flex items-center gap-2">
        <span className="text-xs font-bold" style={{ color: priorityColor[c.priority] }}>● {c.priority}</span>
        {c.tags.length > 0 && c.tags.slice(0, 3).map(t => (
          <span key={t} className="px-1.5 py-0.5 rounded-full text-[8px] font-medium"
            style={{ background: "hsl(var(--primary)/0.1)", color: "hsl(var(--primary))" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE COLLAPSIBLE DETAILS
   ═══════════════════════════════════════════════════════════ */
function MobileCollapsibleDetails({ c }: { c: typeof cases[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-80 shrink-0 overflow-y-auto px-5 py-4" style={{ borderRight: "1px solid hsl(var(--border)/0.5)" }}>
        <h4 className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
          Detalles del Caso
        </h4>
        <CaseDetailsPanel c={c} />
      </div>
      {/* Mobile collapsible */}
      <div className="md:hidden shrink-0" style={{ borderBottom: "1px solid hsl(var(--border)/0.5)" }}>
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold"
          style={{ color: "hsl(var(--muted-foreground))" }}>
          <span className="uppercase tracking-widest text-[10px]">Detalles del Caso</span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {open && (
          <div className="px-4 pb-4 max-h-60 overflow-y-auto">
            <CaseDetailsPanel c={c} />
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function Cases() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  const navigate = useNavigate();

  const [filter, setFilter] = useState<LawType | "todos">("todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("detalles");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  /** 1. Fetch Cases with Client names from Supabase */
  const { data: casesData = [], isLoading } = useQuery({
    queryKey: ["cases-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select(`
          id, case_number, title, legal_area, status, priority, 
          opened_at, deadline_at, description,
          clients (name, email, phone)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(c => ({
        id: c.case_number,
        title: c.title,
        client: c.clients?.name || "Cliente Desconocido",
        clientEmail: c.clients?.email || "",
        clientPhone: c.clients?.phone || "",
        type: c.legal_area as LawType,
        status: c.status === "activo" ? "Activo" : c.status.charAt(0).toUpperCase() + c.status.slice(1),
        phase: "Instrucción",
        deadline: c.deadline_at ? format(new Date(c.deadline_at), "dd MMM") : "TBD",
        opened: c.opened_at ? format(new Date(c.opened_at), "dd MMM yyyy") : "Desconocido",
        priority: c.priority.charAt(0).toUpperCase() + c.priority.slice(1),
        lawyer: "Abogado Principal",
        judge: "–",
        court: "–",
        description: c.description || "",
        procedureType: "Procedimiento Judicial",
        tags: [c.legal_area],
        budget: 0,
        feeType: "precio_fijo" as const,
        currency: "EUR" as const,
        opposingName: "–",
        opposingLawyer: "–",
        opposingContact: "–",
        reminder: "Sin recordatorio"
      }));
    },
  });

  const filtered = casesData.filter(c =>
    (filter === "todos" || c.type === filter) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase()))
  );

  const selectCase = (c: typeof cases[0]) => { setSelected(c); setActiveTab("detalles"); };
  const closeModal = () => setSelected(null);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground font-display">Gestión de Casos</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{casesData.length} expedientes en total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg gap-1" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
            <button onClick={() => setViewMode("list")} className="p-1.5 rounded-md transition-all" title="Vista lista"
              style={viewMode === "list" ? { background: "hsl(var(--primary)/0.2)", color: "hsl(var(--primary))" } : { color: "hsl(var(--muted-foreground))" }}>
              <LayoutList size={15} />
            </button>
            <button onClick={() => setViewMode("grid")} className="p-1.5 rounded-md transition-all" title="Vista mosaico"
              style={viewMode === "grid" ? { background: "hsl(var(--primary)/0.2)", color: "hsl(var(--primary))" } : { color: "hsl(var(--muted-foreground))" }}>
              <LayoutGrid size={15} />
            </button>
          </div>
          <button onClick={() => navigate("/cases/new")} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nuevo Expediente
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar casos o clientes..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm"
            style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", outline: "none" }} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {lawTypes.map(t => (
            <button key={t} onClick={() => setFilter(t)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filter === t
                ? { background: "hsl(var(--primary)/0.2)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary)/0.4)" }
                : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
              {t === "todos" ? "Todos" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cases List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(c => {
            if (isClassic) {
              return (
                <div key={c.id} className="folder-card cursor-pointer" onClick={() => selectCase(c)}>
                  <div className="folder-tab"><span>{c.id.replace("EXP-2024-", "#")}</span></div>
                  <div className="folder-body">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <LawBadge type={c.type} />
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={statusColor[c.status]}>{c.status}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{c.title}</p>
                        <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{c.client} · {c.lawyer}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold" style={{ color: priorityColor[c.priority] }}>{c.priority}</p>
                        <div className="flex items-center gap-1 mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <Clock size={10} /><span className="text-[10px]">{c.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 flex items-center gap-2" style={{ borderTop: "1px solid hsl(32 28% 78%)" }}>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(32 25% 82%)" }}>
                        <div className="h-full rounded-full" style={{ width: "45%", background: "hsl(4 75% 38%)" }} />
                      </div>
                      <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{c.phase}</span>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div key={c.id} onClick={() => selectCase(c)} className="glass-card rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>{c.id}</span>
                      <LawBadge type={c.type} />
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={statusColor[c.status]}>{c.status}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{c.title}</p>
                    <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{c.client} · {c.lawyer}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold" style={{ color: priorityColor[c.priority] }}>{c.priority}</p>
                    <div className="flex items-center gap-1 mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                      <Clock size={10} /><span className="text-[10px]">{c.deadline}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 flex items-center gap-2" style={{ borderTop: "1px solid hsl(var(--border)/0.4)" }}>
                  <div className="flex-1 h-1 rounded-full" style={{ background: "hsl(var(--border))" }}>
                    <div className="h-full rounded-full" style={{ width: "45%", background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }} />
                  </div>
                  <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{c.phase}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} onClick={() => selectCase(c)} className="glass-card rounded-xl px-3 sm:px-4 py-3 cursor-pointer hover:border-primary/40 transition-all">
              {/* Mobile: stacked layout */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] sm:text-xs font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>{c.id}</span>
                  <LawBadge type={c.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{c.title}</p>
                  <p className="text-[10px] sm:text-xs truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{c.client} · {c.lawyer}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={statusColor[c.status]}>{c.status}</span>
                  <span className="text-xs font-bold" style={{ color: priorityColor[c.priority] }}>{c.priority}</span>
                  <div className="flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <Clock size={10} /><span className="text-[10px]">{c.deadline}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
              </div>
              {/* Mobile-only meta row */}
              <div className="flex items-center gap-2 mt-1.5 sm:hidden">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={statusColor[c.status]}>{c.status}</span>
                <span className="text-[10px] font-bold" style={{ color: priorityColor[c.priority] }}>{c.priority}</span>
                <div className="flex items-center gap-1 ml-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <Clock size={10} /><span className="text-[10px]">{c.deadline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ MODAL — Two-column layout ═══ */}
      {selected && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
          style={{ background: "hsl(0 0% 0% / 0.7)", backdropFilter: "blur(6px)" }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="relative glass-card rounded-2xl overflow-hidden animate-fade-in flex flex-col w-full h-full sm:w-[90vw] sm:h-[90vh]"
            style={{ maxWidth: "1200px" }}
          >
            {/* Modal header */}
            <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-3 shrink-0 flex items-center justify-between gap-2" style={{ borderBottom: "1px solid hsl(var(--border)/0.5)" }}>
              <h3 className="text-sm sm:text-base font-bold text-foreground truncate">{selected.title}</h3>
              <div className="flex gap-2 items-center shrink-0">
                <button className="btn-primary px-3 py-1.5 text-xs">Guardar</button>
                <button onClick={closeModal} className="p-2 rounded-lg transition-all hover:opacity-70"
                  style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body — vertical on mobile, horizontal on desktop */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* LEFT — Case Details (collapsible on mobile) */}
              <MobileCollapsibleDetails c={selected} />

              {/* RIGHT — Tabs */}
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Tab bar */}
                <div className="flex gap-0 px-3 sm:px-5 shrink-0 overflow-x-auto" style={{ borderBottom: "1px solid hsl(var(--border)/0.5)" }}>
                  {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className="px-3 sm:px-5 py-2.5 text-xs font-medium transition-all relative whitespace-nowrap shrink-0"
                      style={{ color: activeTab === tab.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", background: "transparent", border: "none" }}>
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: "hsl(var(--primary))" }} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4">
                  {activeTab === "detalles" && <CaseDetailsTab c={selected} />}
                  {activeTab === "admision" && <AdmisionTab />}
                  {activeTab === "notas" && <NotasTab caseId={selected.id} />}
                  {activeTab === "comunicaciones" && <ComunicacionesTab c={selected} />}
                  {activeTab === "archivos" && <ArchivosTab caseId={selected.id} />}
                  {activeTab === "cronologia" && <CaseTimeline />}
                </div>
              </div>
            </div>
          </div>
        </div>
        , document.body)}
    </div>
  );
}
