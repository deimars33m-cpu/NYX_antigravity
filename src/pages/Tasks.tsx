import { useState } from "react";
import { CheckSquare, Plus, User, Clock, AlertCircle, ChevronDown, X, ClipboardList, FolderOpen, CalendarIcon, FileText, Search, Users, Briefcase, Settings, MessageSquare, Sparkles, Check, ThumbsDown, Brain, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/context/ThemeContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Priority = "urgente" | "alta" | "media" | "baja";
type Status = "pendiente" | "en_progreso" | "completada";

interface Task {
  id: number; title: string; assignee: string; case: string; priority: Priority; status: Status; due: string;
}

const tasks: Task[] = [
  { id: 1, title: "Preparar escrito de demanda García vs Norte", assignee: "Ana R.", case: "EXP-2024-001", priority: "urgente", status: "en_progreso", due: "Hoy" },
  { id: 2, title: "Revisar contrato TechCorp – cláusulas límite", assignee: "Carlos L.", case: "EXP-2024-004", priority: "alta", status: "pendiente", due: "Mañana" },
  { id: 3, title: "Notificar cliente resultado audiencia", assignee: "María T.", case: "EXP-2024-002", priority: "alta", status: "pendiente", due: "Hoy" },
  { id: 4, title: "Calcular indemnización despido López", assignee: "Ana R.", case: "EXP-2024-003", priority: "media", status: "en_progreso", due: "5 Mar" },
  { id: 5, title: "Solicitar certificado antecedentes penales", assignee: "Carlos L.", case: "EXP-2024-002", priority: "alta", status: "completada", due: "Completada" },
  { id: 6, title: "Actualizar base de datos clientes Q1", assignee: "María T.", case: "—", priority: "baja", status: "pendiente", due: "15 Mar" },
  { id: 7, title: "Revisar documentación custodia Rodríguez", assignee: "Ana R.", case: "EXP-2024-005", priority: "alta", status: "en_progreso", due: "8 Mar" },
  { id: 8, title: "Preparar informe mensual para partners", assignee: "Carlos L.", case: "—", priority: "media", status: "pendiente", due: "28 Mar" },
];

const priorityStyle: Record<Priority, { color: string; bg: string; label: string }> = {
  urgente: { color: "hsl(0 72% 65%)",   bg: "hsl(0 72% 55% / 0.15)",   label: "Urgente" },
  alta:    { color: "hsl(38 92% 65%)",  bg: "hsl(38 92% 55% / 0.15)",  label: "Alta" },
  media:   { color: "hsl(217 91% 70%)", bg: "hsl(217 91% 60% / 0.15)", label: "Media" },
  baja:    { color: "hsl(142 70% 55%)", bg: "hsl(142 70% 48% / 0.15)", label: "Baja" },
};

const statusStyle: Record<Status, { color: string; bg: string; label: string }> = {
  pendiente:    { color: "hsl(var(--muted-foreground))", bg: "hsl(var(--border))", label: "Pendiente" },
  en_progreso:  { color: "hsl(217 91% 70%)", bg: "hsl(217 91% 60% / 0.15)", label: "En Progreso" },
  completada:   { color: "hsl(142 70% 55%)", bg: "hsl(142 70% 48% / 0.15)", label: "Completada" },
};

/* ─── Task categories ─────────────────────────────────────── */
const TASK_CATEGORIES = [
  { id: "tiempos", label: "Tiempos y Plazos", icon: Clock, subtasks: [
    "Alerta de fecha límite (apelación, audiencia, vencimiento)",
    "Programar cita con cliente",
    "Programar reunión con experto/perito",
    "Recordatorio de plazo procesal",
  ]},
  { id: "documentos", label: "Documentos", icon: FileText, subtasks: [
    "Redactar demanda",
    "Redactar recurso o apelación",
    "Redactar contrato",
    "Redactar informe legal",
    "Revisar y corregir documento antes de presentación",
    "Preparar escrito judicial",
  ]},
  { id: "investigacion", label: "Investigación Legal", icon: Search, subtasks: [
    "Buscar jurisprudencia y precedentes",
    "Investigar leyes y regulaciones aplicables",
    "Revisar casos similares",
    "Análisis de evidencia o pruebas",
  ]},
  { id: "cliente", label: "Interacción Cliente", icon: MessageSquare, subtasks: [
    "Notificar avances del caso al cliente",
    "Coordinar reunión de seguimiento",
    "Asesoría en decisión estratégica",
    "Preparar cliente para audiencia/juicio",
    "Explicar sentencia o resolución",
  ]},
  { id: "coordinacion", label: "Coordinación", icon: Users, subtasks: [
    "Contactar perito o testigo",
    "Coordinar con otro abogado (caso complejo)",
    "Preparar testigos para declaración",
    "Solicitar informes a terceros",
  ]},
  { id: "administrativa", label: "Administrativa", icon: Settings, subtasks: [
    "Gestión de pagos y facturación",
    "Presentar documentos ante tribunal",
    "Presentar documentos ante autoridad administrativa",
    "Gestionar trámites registrales",
    "Actualizar expediente / base de datos",
  ]},
];

const ATTORNEYS = [
  { id: "ana", name: "Ana R.", role: "Abogada Senior" },
  { id: "carlos", name: "Carlos L.", role: "Abogado Asociado" },
  { id: "maria", name: "María T.", role: "Abogada Junior" },
  { id: "juan", name: "Juan P.", role: "Pasante Legal" },
];

const CASES = [
  { id: "EXP-2024-001", label: "García vs Norte S.A." },
  { id: "EXP-2024-002", label: "Def. Penal Mendoza" },
  { id: "EXP-2024-003", label: "Laboral López" },
  { id: "EXP-2024-004", label: "Contrato TechCorp" },
  { id: "EXP-2024-005", label: "Custodia Rodríguez" },
];

const DURATIONS = ["15 min", "30 min", "1 hora", "2 horas", "Medio día", "Todo el día"];

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00",
];

const members = ["Todos", "Ana R.", "Carlos L.", "María T."];
const statuses: Array<Status | "todas"> = ["todas", "pendiente", "en_progreso", "completada"];

/* ─── AI Suggested Tasks ──────────────────────────────────── */
interface AiSuggestion {
  id: number;
  title: string;
  reason: string;
  case: string;
  caseName: string;
  category: string;
  suggestedPriority: Priority;
  suggestedDue: string;
  confidence: number; // 0-100
}

const AI_SUGGESTIONS: AiSuggestion[] = [
  { id: 901, title: "Preparar recurso de apelación — Sentencia desfavorable detectada", reason: "La sentencia del caso García vs Norte fue notificada hace 3 días. El plazo de apelación vence en 7 días hábiles según Art. 261 CPC.", case: "EXP-2024-001", caseName: "García vs Norte S.A.", category: "Tiempos y Plazos", suggestedPriority: "urgente", suggestedDue: "3 Mar", confidence: 95 },
  { id: 902, title: "Revisar nueva jurisprudencia — SCP relevante publicada", reason: "Se detectó la Sentencia Constitucional Plurinacional 0245/2024 que podría beneficiar la estrategia de defensa penal.", case: "EXP-2024-002", caseName: "Def. Penal Mendoza", category: "Investigación Legal", suggestedPriority: "alta", suggestedDue: "5 Mar", confidence: 82 },
  { id: 903, title: "Notificar al cliente — Audiencia programada", reason: "Se detectó audiencia de conciliación agendada para el 10 de marzo. El cliente no ha sido notificado aún.", case: "EXP-2024-003", caseName: "Laboral López", category: "Interacción Cliente", suggestedPriority: "alta", suggestedDue: "Hoy", confidence: 98 },
  { id: 904, title: "Solicitar peritaje contable — Documentos financieros pendientes", reason: "El caso requiere análisis de estados financieros para acreditar el incumplimiento contractual. Sin peritaje, la prueba será insuficiente.", case: "EXP-2024-004", caseName: "Contrato TechCorp", category: "Coordinación", suggestedPriority: "media", suggestedDue: "12 Mar", confidence: 76 },
  { id: 905, title: "Actualizar estrategia de custodia — Cambio normativo detectado", reason: "Nueva ley de protección del menor (Ley N° 1520) entró en vigencia. Afecta directamente los criterios de evaluación de custodia.", case: "EXP-2024-005", caseName: "Custodia Rodríguez", category: "Documentos", suggestedPriority: "alta", suggestedDue: "8 Mar", confidence: 88 },
  { id: 906, title: "Generar factura mensual — Servicios legales febrero", reason: "Se completaron 3 actividades facturables en febrero para el caso TechCorp. Total estimado: Bs. 12,500.", case: "EXP-2024-004", caseName: "Contrato TechCorp", category: "Administrativa", suggestedPriority: "media", suggestedDue: "28 Feb", confidence: 70 },
];

/* ─── Classic-only sub-components ─────────────────────────── */
function ClassicTaskItem({ t, onToggle }: { t: Task; onToggle: () => void }) {
  return (
    <div className="paper-item flex items-start gap-3" style={{ borderLeftColor: priorityStyle[t.priority].color, opacity: t.status === "completada" ? 0.6 : 1 }}>
      <button onClick={onToggle} className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
        style={{
          borderColor: t.status === "completada" ? "hsl(142 70% 48%)" : "hsl(32 25% 72%)",
          background: t.status === "completada" ? "hsl(142 70% 48% / 0.2)" : "transparent"
        }}>
        {t.status === "completada" && <div className="w-2 h-2 rounded-sm" style={{ background: "hsl(142 70% 48%)" }} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "hsl(25 40% 16%)", textDecoration: t.status === "completada" ? "line-through" : "none" }}>{t.title}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {t.case !== "—" && <span className="text-[10px] font-mono font-bold" style={{ color: "hsl(4 75% 38%)" }}>{t.case}</span>}
          <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(25 15% 48%)" }}><User size={10} />{t.assignee}</span>
          <span className="flex items-center gap-1 text-xs" style={{ color: t.due === "Hoy" ? "hsl(0 72% 55%)" : "hsl(25 15% 48%)" }}><Clock size={10} />{t.due}</span>
        </div>
      </div>
      <span className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
        style={{ background: priorityStyle[t.priority].bg, color: priorityStyle[t.priority].color }}>
        {priorityStyle[t.priority].label}
      </span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function Tasks() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  const [filterMember, setFilterMember] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState<Status | "todas">("todas");
  const [taskList, setTaskList] = useState(tasks);
  const [showNew, setShowNew] = useState(false);
  const [formStep, setFormStep] = useState(0); // 0=category, 1=details
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubtask, setSelectedSubtask] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<Priority>("media");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState(AI_SUGGESTIONS);
  const [approvingTask, setApprovingTask] = useState<AiSuggestion | null>(null);
  const [approvalAssignees, setApprovalAssignees] = useState<string[]>([]);
  const [approvalPriority, setApprovalPriority] = useState<Priority>("media");

  const toggleApprovalAssignee = (name: string) => {
    setApprovalAssignees(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleApproveAiTask = () => {
    if (!approvingTask) return;
    const task: Task = {
      id: Date.now(),
      title: approvingTask.title,
      assignee: approvalAssignees.length > 0 ? approvalAssignees.join(", ") : "Sin asignar",
      case: approvingTask.case,
      priority: approvalPriority,
      status: "pendiente",
      due: approvingTask.suggestedDue,
    };
    setTaskList(prev => [task, ...prev]);
    setAiSuggestions(prev => prev.filter(s => s.id !== approvingTask.id));
    setApprovingTask(null);
    setApprovalAssignees([]);
  };

  const dismissAiTask = (id: number) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const resetForm = () => {
    setFormStep(0);
    setSelectedCategory("");
    setSelectedSubtask("");
    setSelectedAssignees([]);
    setSelectedCase("");
    setSelectedPriority("media");
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedDuration("");
    setTaskNotes("");
  };

  const toggleAssignee = (name: string) => {
    setSelectedAssignees(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleCreateTask = () => {
    if (!selectedSubtask) return;
    const task: Task = {
      id: Date.now(),
      title: selectedSubtask,
      assignee: selectedAssignees.length > 0 ? selectedAssignees.join(", ") : "Sin asignar",
      case: selectedCase || "—",
      priority: selectedPriority,
      status: "pendiente",
      due: selectedDate ? format(selectedDate, "d MMM", { locale: es }) : "Sin fecha",
    };
    setTaskList(prev => [task, ...prev]);
    resetForm();
    setShowNew(false);
  };

  const currentCategory = TASK_CATEGORIES.find(c => c.id === selectedCategory);

  const toggleStatus = (id: number) => {
    setTaskList(prev => prev.map(t => t.id === id
      ? { ...t, status: t.status === "completada" ? "pendiente" : "completada" }
      : t
    ));
  };

  const filtered = taskList.filter(t =>
    (filterMember === "Todos" || t.assignee.includes(filterMember)) &&
    (filterStatus === "todas" || t.status === filterStatus)
  );

  const counts = {
    pendiente: taskList.filter(t => t.status === "pendiente").length,
    en_progreso: taskList.filter(t => t.status === "en_progreso").length,
    completada: taskList.filter(t => t.status === "completada").length,
  };

  const urgentTasks = filtered.filter(t => t.priority === "urgente" && t.status !== "completada");
  const otherTasks = filtered.filter(t => !(t.priority === "urgente" && t.status !== "completada"));

  return (
    <div className="flex gap-5 animate-fade-in">
      {/* ─── Left: Main Task Column ─── */}
      <div className="flex-1 min-w-0 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isClassic && <ClipboardList size={22} style={{ color: "hsl(4 75% 38%)" }} />}
          <div>
            <h2 className="text-xl font-bold text-foreground font-display">Tareas & Workflow</h2>
            <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{taskList.filter(t => t.status !== "completada").length} tareas activas</p>
          </div>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nueva Tarea</button>
      </div>

      {/* New Task Dialog — Redesigned */}
      <Dialog open={showNew} onOpenChange={(o) => { if (!o) { resetForm(); } setShowNew(o); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {formStep === 1 && (
                <button onClick={() => setFormStep(0)} className="p-1 rounded hover:bg-accent transition-colors">
                  <ChevronDown size={16} className="rotate-90" style={{ color: "hsl(var(--muted-foreground))" }} />
                </button>
              )}
              Nueva Tarea
            </DialogTitle>
            <DialogDescription>
              {formStep === 0 ? "Selecciona la categoría de la tarea" : `${currentCategory?.label} — Completa los detalles`}
            </DialogDescription>
          </DialogHeader>

          {formStep === 0 ? (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {TASK_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setSelectedSubtask(""); setFormStep(1); }}
                    className="p-3 rounded-xl border text-left transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: "hsl(var(--border))",
                      background: "hsl(var(--secondary) / 0.5)",
                    }}
                  >
                    <Icon size={18} style={{ color: "hsl(var(--primary))" }} />
                    <p className="text-xs font-semibold mt-1.5 text-foreground">{cat.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{cat.subtasks.length} tipos</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Subtask chips */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tipo de tarea *</Label>
                <div className="flex flex-wrap gap-1.5">
                  {currentCategory?.subtasks.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubtask(sub)}
                      className="px-2.5 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        background: selectedSubtask === sub ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary))",
                        color: selectedSubtask === sub ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                        border: selectedSubtask === sub ? "1px solid hsl(var(--primary) / 0.4)" : "1px solid hsl(var(--border))",
                        fontWeight: selectedSubtask === sub ? 600 : 400,
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Case */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Expediente vinculado</Label>
                <Select value={selectedCase} onValueChange={setSelectedCase}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar expediente" /></SelectTrigger>
                  <SelectContent>
                    {CASES.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="font-mono text-xs">{c.id}</span> — {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Multi-assignee */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Asignar a (múltiple)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {ATTORNEYS.map(att => {
                    const isSelected = selectedAssignees.includes(att.name);
                    return (
                      <button
                        key={att.id}
                        onClick={() => toggleAssignee(att.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                        style={{
                          background: isSelected ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary))",
                          color: isSelected ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                          border: isSelected ? "1px solid hsl(var(--primary) / 0.4)" : "1px solid hsl(var(--border))",
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ background: isSelected ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted))" }}>
                          {att.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <span className="block leading-tight">{att.name}</span>
                          <span className="block text-[9px] leading-tight" style={{ color: "hsl(var(--muted-foreground))" }}>{att.role}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Prioridad</Label>
                <div className="flex gap-1.5">
                  {(["urgente", "alta", "media", "baja"] as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedPriority(p)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: selectedPriority === p ? priorityStyle[p].bg : "hsl(var(--secondary))",
                        color: selectedPriority === p ? priorityStyle[p].color : "hsl(var(--muted-foreground))",
                        border: selectedPriority === p ? `1px solid ${priorityStyle[p].color}40` : "1px solid hsl(var(--border))",
                      }}
                    >
                      {priorityStyle[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date + Time + Duration */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-xs font-normal h-9">
                        <CalendarIcon size={12} className="mr-1" />
                        {selectedDate ? format(selectedDate, "d MMM", { locale: es }) : "Elegir"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={es} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Hora</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Hora" /></SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Duración</Label>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Duración" /></SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Notas adicionales <span className="font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>(opcional)</span></Label>
                <Textarea placeholder="Detalles relevantes..." rows={2} value={taskNotes} onChange={e => setTaskNotes(e.target.value)} className="text-xs" />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => { resetForm(); setShowNew(false); }}>Cancelar</Button>
                <Button onClick={handleCreateTask} disabled={!selectedSubtask}>Crear Tarea</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isClassic ? (
        <div className="grid grid-cols-3 gap-5">
          {(["pendiente", "en_progreso", "completada"] as Status[]).map((s, i) => {
            const stickyColors = [
              { bg: "hsl(50 88% 83%)", shadow: "hsl(48 70% 55% / 0.35)", rotate: "-1.2deg" },
              { bg: "hsl(200 62% 82%)", shadow: "hsl(200 50% 45% / 0.3)", rotate: "0.8deg" },
              { bg: "hsl(140 52% 82%)", shadow: "hsl(140 45% 45% / 0.3)", rotate: "-0.5deg" },
            ];
            const sticky = stickyColors[i];
            const isActive = filterStatus === s;
            return (
              <div key={s} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, paddingTop: "8px" }}>
                <div
                  onClick={() => setFilterStatus(isActive ? "todas" : s)}
                  style={{
                    background: sticky.bg,
                    borderRadius: "2px",
                    padding: "18px 16px",
                    transform: `rotate(${sticky.rotate})`,
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    boxShadow: isActive
                      ? `4px 4px 0 hsl(25 30% 55% / 0.18), 8px 14px 22px ${sticky.shadow}`
                      : `3px 3px 0 hsl(25 30% 55% / 0.22), 5px 6px 14px ${sticky.shadow}`,
                    cursor: "pointer",
                    position: "relative",
                    textAlign: "center",
                    outline: isActive ? `2px solid ${statusStyle[s].color}` : "none",
                    outlineOffset: "2px",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) translateY(-5px) scale(1.02)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `4px 4px 0 hsl(25 30% 55% / 0.18), 8px 14px 22px ${sticky.shadow}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = `rotate(${sticky.rotate})`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `3px 3px 0 hsl(25 30% 55% / 0.22), 5px 6px 14px ${sticky.shadow}`;
                  }}
                >
                  {/* Tape strip */}
                  <div style={{
                    position: "absolute", top: "-7px", left: "50%", transform: "translateX(-50%)",
                    width: "38px", height: "13px",
                    background: "hsl(40 50% 90% / 0.8)", border: "1px solid hsl(32 25% 72%)",
                    borderRadius: "2px", boxShadow: "0 1px 3px hsl(25 40% 18% / 0.1)",
                  }} />
                  <p className="text-2xl font-bold" style={{ color: "hsl(25 40% 16%)", fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.1 }}>{counts[s]}</p>
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: "hsl(25 30% 45%)", fontFamily: "'Inter', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{statusStyle[s].label}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {(["pendiente", "en_progreso", "completada"] as Status[]).map(s => (
            <div key={s} className="glass-card rounded-xl p-4 text-center cursor-pointer hover-glow" onClick={() => setFilterStatus(filterStatus === s ? "todas" : s)}>
              <p className="text-2xl font-bold font-display" style={{ color: statusStyle[s].color }}>{counts[s]}</p>
              <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{statusStyle[s].label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex gap-1">
          {members.map(m => (
            <button key={m} onClick={() => setFilterMember(m)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={filterMember === m ? { background: "hsl(var(--primary) / 0.2)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.4)" } : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Task list — Classic: clipboard + container grouping */}
      {isClassic ? (
        <div className="space-y-5">
          {/* Urgent tasks in red clipboard */}
          {urgentTasks.length > 0 && (
            <div className="clipboard-card p-5" style={{ background: "hsl(25 30% 22%)" }}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <AlertCircle size={14} style={{ color: "hsl(0 72% 65%)" }} />
                <h3 className="text-sm font-bold" style={{ color: "hsl(0 60% 70%)" }}>Tareas Urgentes</h3>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "hsl(0 72% 55% / 0.25)", color: "hsl(0 72% 65%)" }}>{urgentTasks.length}</span>
              </div>
              <div className="space-y-2">
                {urgentTasks.map(t => (
                  <ClassicTaskItem key={t.id} t={t} onToggle={() => toggleStatus(t.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Other tasks in notepad container */}
          <div className="notepad-card rounded-xl" style={{ position: "relative", overflow: "hidden" }}>
            {/* Ruled lines background */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, hsl(210 50% 78% / 0.45) 27px, hsl(210 50% 78% / 0.45) 28px)",
              pointerEvents: "none",
            }} />
            {/* Red margin line */}
            <div style={{
              position: "absolute", top: 0, bottom: 0, left: 44,
              width: "1px", background: "hsl(4 75% 62% / 0.45)",
              pointerEvents: "none",
            }} />
            <div className="p-4 flex items-center gap-2" style={{ borderBottom: "1px solid hsl(32 25% 72%)", position: "relative", zIndex: 1 }}>
              <FolderOpen size={14} style={{ color: "hsl(4 75% 38%)" }} />
              <h3 className="text-sm font-bold" style={{ color: "hsl(25 40% 20%)" }}>Todas las Tareas</h3>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "hsl(38 80% 55% / 0.15)", color: "hsl(38 80% 45%)" }}>{otherTasks.length}</span>
            </div>
            <div className="p-4 space-y-2" style={{ position: "relative", zIndex: 1 }}>
              {otherTasks.map(t => (
                <ClassicTaskItem key={t.id} t={t} onToggle={() => toggleStatus(t.id)} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t, i) => (
            <div key={t.id} className="glass-card rounded-xl p-4 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, opacity: t.status === "completada" ? 0.6 : 1 }}>
              <button onClick={() => toggleStatus(t.id)} className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all" style={{ borderColor: t.status === "completada" ? "hsl(142 70% 48%)" : "hsl(var(--border))", background: t.status === "completada" ? "hsl(142 70% 48% / 0.2)" : "transparent" }}>
                {t.status === "completada" && <div className="w-2 h-2 rounded-full" style={{ background: "hsl(142 70% 48%)" }} />}
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground" style={{ textDecoration: t.status === "completada" ? "line-through" : "none" }}>{t.title}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {t.case !== "—" && <span className="text-[10px] font-mono" style={{ color: "hsl(var(--primary))" }}>{t.case}</span>}
                  <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}><User size={10} />{t.assignee}</span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: t.due === "Hoy" ? "hsl(0 72% 65%)" : "hsl(var(--muted-foreground))" }}><Clock size={10} />{t.due}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: priorityStyle[t.priority].bg, color: priorityStyle[t.priority].color }}>{priorityStyle[t.priority].label}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: statusStyle[t.status].bg, color: statusStyle[t.status].color }}>{statusStyle[t.status].label}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* ─── Right: AI Suggested Tasks Column ─── */}
      <div className="w-80 shrink-0 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="relative">
            <Brain size={18} style={{ color: "hsl(var(--primary))" }} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "hsl(0 72% 55%)" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">Sugerencias IA</h3>
            <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{aiSuggestions.length} tareas detectadas</p>
          </div>
        </div>

        {aiSuggestions.length === 0 ? (
          <div className="rounded-xl border p-6 text-center" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary) / 0.3)" }}>
            <Sparkles size={24} className="mx-auto mb-2" style={{ color: "hsl(var(--muted-foreground))" }} />
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>No hay sugerencias pendientes</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {aiSuggestions.map((s, i) => (
              <div
                key={s.id}
                className="rounded-xl border p-3 transition-all hover:scale-[1.01] animate-fade-in-up"
                style={{
                  animationDelay: `${i * 80}ms`,
                  borderColor: "hsl(var(--border))",
                  background: "hsl(var(--card) / 0.8)",
                  borderLeft: `3px solid ${priorityStyle[s.suggestedPriority].color}`,
                }}
              >
                {/* Confidence + Category */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
                    <Zap size={8} className="inline mr-0.5" />{s.category}
                  </span>
                  <span className="text-[9px] font-bold" style={{ color: s.confidence >= 90 ? "hsl(142 70% 55%)" : s.confidence >= 80 ? "hsl(38 92% 65%)" : "hsl(var(--muted-foreground))" }}>
                    {s.confidence}% conf.
                  </span>
                </div>

                {/* Title */}
                <p className="text-xs font-semibold text-foreground leading-snug mb-1">{s.title}</p>

                {/* Reason */}
                <p className="text-[10px] leading-relaxed mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>{s.reason}</p>

                {/* Case + Due */}
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <span className="text-[9px] font-mono font-bold" style={{ color: "hsl(var(--primary))" }}>{s.case}</span>
                  <span className="text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>·</span>
                  <span className="text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>{s.caseName}</span>
                  <span className="ml-auto flex items-center gap-0.5 text-[9px]" style={{ color: s.suggestedDue === "Hoy" ? "hsl(0 72% 65%)" : "hsl(var(--muted-foreground))" }}>
                    <Clock size={9} />{s.suggestedDue}
                  </span>
                </div>

                {/* Priority badge */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ background: priorityStyle[s.suggestedPriority].bg, color: priorityStyle[s.suggestedPriority].color }}>
                    {priorityStyle[s.suggestedPriority].label}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => dismissAiTask(s.id)}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{ background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))" }}
                      title="Descartar"
                    >
                      <X size={12} />
                    </button>
                    <button
                      onClick={() => { setApprovingTask(s); setApprovalPriority(s.suggestedPriority); setApprovalAssignees([]); }}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all hover:scale-105"
                      style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}
                    >
                      <Check size={10} /> Aprobar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Approval Dialog ─── */}
      <Dialog open={!!approvingTask} onOpenChange={(o) => { if (!o) setApprovingTask(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Sparkles size={18} style={{ color: "hsl(var(--primary))" }} />
              Aprobar Tarea IA
            </DialogTitle>
            <DialogDescription>Asigna abogado(s) y confirma la prioridad antes de aprobar.</DialogDescription>
          </DialogHeader>
          {approvingTask && (
            <div className="space-y-4 pt-2">
              {/* Task preview */}
              <div className="rounded-lg p-3 border" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary) / 0.3)" }}>
                <p className="text-xs font-semibold text-foreground mb-1">{approvingTask.title}</p>
                <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{approvingTask.reason}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-mono font-bold" style={{ color: "hsl(var(--primary))" }}>{approvingTask.case}</span>
                  <span className="text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>{approvingTask.caseName}</span>
                </div>
              </div>

              {/* Attorney assignment */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Asignar a (obligatorio)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {ATTORNEYS.map(att => {
                    const isSelected = approvalAssignees.includes(att.name);
                    return (
                      <button
                        key={att.id}
                        onClick={() => toggleApprovalAssignee(att.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                        style={{
                          background: isSelected ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary))",
                          color: isSelected ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                          border: isSelected ? "1px solid hsl(var(--primary) / 0.4)" : "1px solid hsl(var(--border))",
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ background: isSelected ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted))" }}>
                          {att.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <span className="block leading-tight">{att.name}</span>
                          <span className="block text-[9px] leading-tight" style={{ color: "hsl(var(--muted-foreground))" }}>{att.role}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority override */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Prioridad</Label>
                <div className="flex gap-1.5">
                  {(["urgente", "alta", "media", "baja"] as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setApprovalPriority(p)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: approvalPriority === p ? priorityStyle[p].bg : "hsl(var(--secondary))",
                        color: approvalPriority === p ? priorityStyle[p].color : "hsl(var(--muted-foreground))",
                        border: approvalPriority === p ? `1px solid ${priorityStyle[p].color}40` : "1px solid hsl(var(--border))",
                      }}
                    >
                      {priorityStyle[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setApprovingTask(null)}>Cancelar</Button>
                <Button onClick={handleApproveAiTask} disabled={approvalAssignees.length === 0}>
                  <Check size={14} className="mr-1" /> Aprobar y Asignar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
