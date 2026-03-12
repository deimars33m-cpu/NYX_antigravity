import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, Send, Scale, Sparkles, X, Briefcase, MapPin, Gavel, Zap, Search, ChevronDown, Check, Tag, FileText, ChevronRight, BookOpen, TrendingUp, Star, ExternalLink } from "lucide-react";
import AiThinkingNodes from "@/components/AiThinkingNodes";
import { useTheme } from "@/context/ThemeContext";
import { LawBadge, LawType } from "@/components/LawBadge";

interface Message { role: "user" | "ai"; content: string; timestamp: string; }

// ── Shared data ──
const mockCases = [
  { id: 1, ref: "EXP-2024-001", title: "García vs. Inmobiliaria Sol S.L.", client: "María García López", area: "Civil", status: "En curso", date: "15/01/2024", docs: 12 },
  { id: 2, ref: "EXP-2024-002", title: "Despido improcedente - Rodríguez", client: "Carlos Rodríguez", area: "Laboral", status: "En curso", date: "22/02/2024", docs: 8 },
  { id: 3, ref: "EXP-2024-003", title: "Recurso contencioso-administrativo", client: "Empresa TechFlow S.A.", area: "Administrativo", status: "En curso", date: "10/03/2024", docs: 15 },
  { id: 4, ref: "EXP-2024-004", title: "Divorcio contencioso Martínez-Sánchez", client: "Ana Martínez", area: "Familia", status: "En curso", date: "05/04/2024", docs: 6 },
  { id: 5, ref: "EXP-2024-005", title: "Constitución SL y pacto de socios", client: "StartupVerde S.L.", area: "Mercantil", status: "En curso", date: "18/05/2024", docs: 20 },
  { id: 6, ref: "EXP-2024-006", title: "Defensa penal por estafa", client: "Jorge Fernández", area: "Penal", status: "En curso", date: "01/06/2024", docs: 9 },
];

const jurisdicciones = ["D. Boliviano", "D. Internacional", "D. Comunitario Andino"];

interface Especialidad { nombre: string; color: string; documentos: string[]; }
const especialidades: Especialidad[] = [
  { nombre: "Derecho Procesal", color: "217 91% 60%", documentos: ["Demanda", "Contestación", "Apelación", "Casación", "Actas"] },
  { nombre: "Derecho Civil", color: "190 100% 50%", documentos: ["Contratos", "Testamentos", "Escrituras", "Acuerdos de Conciliación", "Sucesiones"] },
  { nombre: "Derecho Comercial", color: "150 90% 45%", documentos: ["Constitución de Sociedades", "Contratos Comerciales", "Actas de Asamblea", "Acuerdos de Fusión"] },
  { nombre: "Derecho Penal", color: "0 90% 60%", documentos: ["Querellas", "Defensas", "Apelaciones Penales", "Acuerdos de Plea Bargaining"] },
  { nombre: "Derecho Laboral", color: "45 100% 55%", documentos: ["Contratos Laborales", "Despidos", "Reclamaciones", "Convenios Colectivos"] },
  { nombre: "Derecho Tributario", color: "170 90% 48%", documentos: ["Declaración de Impuestos", "Litigios Fiscales", "Acuerdos Tributarios"] },
  { nombre: "Derecho Internacional", color: "260 80% 65%", documentos: ["Solicitudes de Asilo", "Contratos Internacionales", "Reclamaciones por Derechos Humanos"] },
  { nombre: "Derecho Ambiental", color: "142 70% 48%", documentos: ["Licencias Ambientales", "Impactos Ambientales", "Demandas Ambientales"] },
  { nombre: "Derecho de Propiedad Intelectual", color: "320 85% 62%", documentos: ["Registro de Marca", "Patentes", "Contratos de Licencia", "Demandas por Infracción"] },
  { nombre: "Derecho Administrativo", color: "38 80% 50%", documentos: ["Solicitudes Administrativas", "Recursos", "Informes Administrativos", "Permisos"] },
];

const areaColors: Record<string, string> = {
  "Civil": "190 100% 50%", "Penal": "0 90% 60%", "Laboral": "45 100% 55%",
  "Mercantil": "150 90% 45%", "Administrativo": "260 80% 65%", "Familia": "320 85% 62%",
  "Fiscal": "170 90% 48%", "Internacional": "217 85% 52%",
};

// ── General AI actions (always visible) ──
const aiActions = [
  { icon: "🔍", title: "Investigación jurídica", desc: "Encuentre respuestas en jurisprudencia, legislación y fuentes secundarias", tags: ["Investigación"] },
  { icon: "📋", title: "Analizar un contrato", desc: "Revisar cláusulas, definiciones, riesgos y lenguaje hostil al cliente", tags: ["Transaccional", "Análisis"] },
  { icon: "⚖️", title: "Analizar una queja", desc: "Extraer reclamaciones y hechos, crear plazos y proponer defensas", tags: ["Litigios", "Análisis"] },
  { icon: "💬", title: "Construir un argumento", desc: "Construya un argumento que respalde sus objetivos", tags: ["Investigación", "Litigios"] },
  { icon: "🌐", title: "Comparar jurisdicciones", desc: "Comparar leyes y regulaciones en varias jurisdicciones a la vez", tags: ["Investigación", "Internacional"] },
  { icon: "✏️", title: "Análisis de líneas rojas", desc: "Identifique cambios en el contrato para evaluar su impacto y estrategia", tags: ["Transaccional", "Análisis"] },
  { icon: "📑", title: "Comparar documentos", desc: "Construir una tabla que resuma las diferencias clave en dos documentos", tags: ["Análisis"] },
  { icon: "📄", title: "Resumir documentos", desc: "Genere rápidamente resúmenes de sus documentos", tags: ["Análisis"] },
  { icon: "🕐", title: "Crear línea de tiempo", desc: "Extraiga una cronología de eventos de sus documentos", tags: ["Análisis"] },
  { icon: "📊", title: "Analizar alegatos", desc: "Realizar análisis de las demandas y defensas", tags: ["Litigios", "Análisis"] },
  { icon: "🔎", title: "Explorar propuesta legal", desc: "Encontrar fuentes para apoyar u oponerse a una propuesta", tags: ["Investigación", "Litigios"] },
  { icon: "📁", title: "Revisión de documentos", desc: "Produzca informes de tablas que resuman documentos y colecciones", tags: ["Análisis", "Transaccional"] },
];

// ── Contextual case actions per area ──
const caseContextActions: Record<string, { icon: string; title: string; desc: string }[]> = {
  "Civil": [
    { icon: "⏰", title: "Plazos para presentar reclamación", desc: "Identificar el plazo para presentar una reclamación civil" },
    { icon: "❓", title: "Preguntas del cliente", desc: "Redactar un cuestionario con preguntas fácticas para hacerle a mi cliente" },
    { icon: "📅", title: "Cronología de eventos clave", desc: "Extraer y presentar una cronología de todos los eventos y transacciones relevantes" },
    { icon: "📊", title: "Tabla de inventario de activos", desc: "Crear una tabla estructurada que enumere todos los activos involucrados" },
    { icon: "✅", title: "Lista de verificación de cumplimiento", desc: "Preparar una lista para verificar el cumplimiento de todas las obligaciones contractuales" },
  ],
  "Familia": [
    { icon: "👨‍👩‍👧", title: "Análisis de custodia y crianza", desc: "Resumir y analizar toda la evidencia relevante para la custodia de los hijos" },
    { icon: "📊", title: "Tabla de inventario de activos", desc: "Crear tabla con activos conyugales y separados, incluyendo bienes raíces y valoraciones" },
    { icon: "⏰", title: "Plazos procesales familiares", desc: "Identificar plazos para presentar acciones en derecho de familia" },
    { icon: "❓", title: "Preguntas al cliente", desc: "Redactar cuestionario con preguntas fácticas para el caso de familia" },
    { icon: "💰", title: "Cálculo de manutención", desc: "Analizar ingresos y gastos para proponer un esquema de manutención" },
    { icon: "🏠", title: "Estándares de reubicación", desc: "Factores legales para mudanza fuera del estado con custodia" },
    { icon: "📋", title: "Comparar registros laborales", desc: "Comparar historial laboral con información financiera para evaluar capacidad de ingresos" },
  ],
  "Laboral": [
    { icon: "📄", title: "Análisis de carta de despido", desc: "Revisar la legalidad de la carta de despido y detectar vicios formales" },
    { icon: "⏰", title: "Plazos laborales", desc: "Identificar plazos para conciliación (SMAC) y demanda" },
    { icon: "💰", title: "Cálculo de indemnización", desc: "Calcular indemnización por despido según antigüedad y salario" },
    { icon: "📋", title: "Verificación de nóminas", desc: "Analizar las nóminas para detectar irregularidades salariales" },
    { icon: "❓", title: "Preguntas al trabajador", desc: "Cuestionario con preguntas clave para el cliente sobre su relación laboral" },
  ],
  "Penal": [
    { icon: "🔍", title: "Análisis de evidencia", desc: "Identificar y resumir toda la evidencia relevante del caso" },
    { icon: "⏰", title: "Plazos penales", desc: "Identificar plazos de prescripción y términos procesales penales" },
    { icon: "🛡️", title: "Estrategia de defensa", desc: "Proponer líneas de defensa basadas en los hechos del caso" },
    { icon: "📅", title: "Cronología de hechos", desc: "Extraer cronología detallada de los hechos delictivos" },
    { icon: "⚖️", title: "Jurisprudencia aplicable", desc: "Buscar sentencias relevantes para el tipo penal imputado" },
  ],
  "Mercantil": [
    { icon: "📋", title: "Revisión de estatutos", desc: "Analizar estatutos sociales y detectar cláusulas problemáticas" },
    { icon: "🤝", title: "Análisis de pacto de socios", desc: "Revisar el pacto de socios y sus implicaciones legales" },
    { icon: "✅", title: "Cumplimiento normativo", desc: "Verificar cumplimiento de obligaciones societarias y mercantiles" },
    { icon: "💼", title: "Due diligence", desc: "Preparar checklist de due diligence para la operación" },
  ],
  "Administrativo": [
    { icon: "📄", title: "Análisis del acto administrativo", desc: "Revisar el acto administrativo impugnado y sus fundamentos" },
    { icon: "⏰", title: "Plazos administrativos", desc: "Identificar plazos para recurso de alzada, reposición o contencioso" },
    { icon: "📋", title: "Requisitos del recurso", desc: "Verificar requisitos formales y materiales del recurso" },
    { icon: "🔍", title: "Precedentes administrativos", desc: "Buscar resoluciones y sentencias similares en vía administrativa" },
  ],
};

// ── Legal research data ──
type FuenteType = "jurisprudencia" | "auto_supremo" | "sentencia" | "normativa" | "reglamento" | "doctrina";
const fuenteLabels: Record<FuenteType, string> = {
  jurisprudencia: "Jurisprudencia", auto_supremo: "Auto Supremo", sentencia: "Sentencia Judicial",
  normativa: "Normativa Vigente", reglamento: "Reglamento", doctrina: "Opinión Doctrinal",
};
const fuenteColors: Record<FuenteType, string> = {
  jurisprudencia: "271 77% 62%", auto_supremo: "199 89% 55%", sentencia: "0 90% 60%",
  normativa: "142 70% 48%", reglamento: "38 80% 50%", doctrina: "320 85% 62%",
};

const mockLegalResults = [
  { id: "AS 0125/2024", title: "Nulidad de contrato por vicios del consentimiento", fuente: "auto_supremo" as FuenteType, tribunal: "Tribunal Supremo de Justicia", date: "12 Ene 2024", relevance: 97, area: "civil" as LawType, summary: "Establece criterios para determinar la nulidad de contratos cuando existe error esencial o dolo en la formación del consentimiento." },
  { id: "SCP 0342/2023", title: "Debido proceso en materia penal – garantías constitucionales", fuente: "sentencia" as FuenteType, tribunal: "Tribunal Constitucional", date: "8 Mar 2023", relevance: 94, area: "penal" as LawType, summary: "Reafirma las garantías del debido proceso y el derecho a la defensa en procesos penales." },
  { id: "Ley 439", title: "Código Procesal Civil – Plazos y recursos", fuente: "normativa" as FuenteType, tribunal: "Asamblea Legislativa", date: "Vigente", relevance: 91, area: "civil" as LawType, summary: "Regula los plazos procesales, medios de impugnación y recursos ordinarios y extraordinarios." },
  { id: "DS 4760/2022", title: "Reglamento de conciliación laboral", fuente: "reglamento" as FuenteType, tribunal: "Ministerio de Trabajo", date: "15 Sep 2022", relevance: 88, area: "laboral" as LawType, summary: "Establece el procedimiento de conciliación obligatoria previa a demandas laborales." },
  { id: "AS 0089/2024", title: "Cálculo de beneficios sociales – Desahucio", fuente: "auto_supremo" as FuenteType, tribunal: "Tribunal Supremo de Justicia", date: "25 Feb 2024", relevance: 86, area: "laboral" as LawType, summary: "Fija doctrina sobre el cálculo de desahucio e indemnización por despido injustificado." },
  { id: "Doctrina 2024-03", title: "La buena fe contractual en el derecho boliviano", fuente: "doctrina" as FuenteType, tribunal: "Dr. Carlos Mesa Gisbert", date: "2024", relevance: 82, area: "civil" as LawType, summary: "Análisis doctrinal sobre la aplicación del principio de buena fe en las relaciones contractuales." },
  { id: "JP 0456/2023", title: "Custodia compartida – Interés superior del niño", fuente: "jurisprudencia" as FuenteType, tribunal: "Tribunal Departamental", date: "10 Nov 2023", relevance: 80, area: "familia" as LawType, summary: "Establece lineamientos para la custodia compartida priorizando el interés superior del niño." },
];

const mockResponses: Record<number, string> = {
  0: "El plazo para interponer recurso de apelación es de **20 días hábiles** desde la notificación de la sentencia (art. 458 LEC para civil). Para el orden penal, son **10 días** desde la notificación (art. 790 LECrim). Es fundamental computar correctamente los días hábiles, excluyendo festivos y fines de semana.",
  1: "Para una demanda de despido improcedente necesitas: \n1. **Carta de despido** del empleador\n2. **Contrato de trabajo** firmado\n3. **Nóminas** de los últimos 6 meses\n4. **Vida laboral** actualizada\n5. Presentar **papeleta de conciliación** previa (SMAC) dentro de los **20 días hábiles** tras el despido.",
  2: "Para evaluar la viabilidad del caso necesito más detalles. Generalmente analizo: **nexo causal** entre acción/omisión y daño, **cuantificación del perjuicio**, **pruebas disponibles** y **prescripción** (acción civil prescribe a los 5 años, art. 1964 CC).",
  3: "La jurisprudencia del **Tribunal Supremo** es contundente sobre cláusulas abusivas. Las STS 241/2013 y STS 222/2015 establecen el control de transparencia material. El TJUE (C-26/13 y C-415/11) refuerza la protección.",
};

export default function AiAssistant() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hola, soy tu Asistente IA Legal. Estoy especializado en derecho boliviano. Puedo ayudarte con consultas procesales, análisis de casos, estrategias legales y jurisprudencia aplicable. ¿En qué puedo ayudarte hoy?", timestamp: "Ahora" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseIdx, setResponseIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showActions, setShowActions] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [rightTab, setRightTab] = useState<"acciones" | "caso">("acciones");
  const [centerTab, setCenterTab] = useState<"chat" | "investigacion">("chat");

  // Research states
  const [researchSearch, setResearchSearch] = useState("");
  const [selectedFuente, setSelectedFuente] = useState<FuenteType | null>(null);

  // Case selector
  const [selectedCase, setSelectedCase] = useState<typeof mockCases[0] | null>(null);
  const [caseSearch, setCaseSearch] = useState("");
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const caseDropdownRef = useRef<HTMLDivElement>(null);

  // RAG parameters
  const [selectedJurisdiccion, setSelectedJurisdiccion] = useState("D. Boliviano");
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string | null>(null);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);

  const filteredCases = mockCases.filter(c =>
    c.title.toLowerCase().includes(caseSearch.toLowerCase()) ||
    c.ref.toLowerCase().includes(caseSearch.toLowerCase()) ||
    c.client.toLowerCase().includes(caseSearch.toLowerCase())
  );

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (selectedCase) {
      const match = especialidades.find(e => e.nombre.toLowerCase().includes(selectedCase.area.toLowerCase()));
      if (match) { setSelectedEspecialidad(match.nombre); setSelectedDocTypes([]); }
    }
  }, [selectedCase]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (caseDropdownRef.current && !caseDropdownRef.current.contains(e.target as Node)) setShowCaseDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const now = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { role: "user", content: msg, timestamp: now }]);
    setLoading(true);
    setTimeout(() => {
      const idx = responseIdx % Object.keys(mockResponses).length;
      setResponseIdx(prev => prev + 1);
      setMessages(prev => [...prev, { role: "ai", content: mockResponses[idx], timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) }]);
      setLoading(false);
    }, 1500);
  };

  // Get contextual actions for the selected case
  const contextActions = selectedCase ? (caseContextActions[selectedCase.area] || []) : [];

  const filteredResearch = mockLegalResults.filter(r => {
    const matchesSearch = !researchSearch || r.title.toLowerCase().includes(researchSearch.toLowerCase()) || r.tribunal.toLowerCase().includes(researchSearch.toLowerCase()) || r.id.toLowerCase().includes(researchSearch.toLowerCase());
    const matchesFuente = !selectedFuente || r.fuente === selectedFuente;
    return matchesSearch && matchesFuente;
  });

  // ── Case Card ──
  const CaseCard = ({ c }: { c: typeof mockCases[0] }) => (
    <div className="p-3 rounded-xl" style={{ background: "hsl(var(--secondary) / 0.5)", border: `1px solid hsl(${areaColors[c.area] || "var(--border)"} / 0.3)` }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono font-semibold" style={{ color: `hsl(${areaColors[c.area] || "var(--primary)"})` }}>{c.ref}</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `hsl(${areaColors[c.area] || "var(--primary)"} / 0.15)`, color: `hsl(${areaColors[c.area] || "var(--primary)"})` }}>{c.area}</span>
      </div>
      <p className="text-xs font-semibold text-foreground leading-tight mb-1">{c.title}</p>
      <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
        <span>{c.client}</span><span>·</span><span>{c.docs} docs</span>
      </div>
    </div>
  );

  // ── Config Panel (left column content) ──
  const ConfigPanel = () => (
    <div className="flex flex-col h-full">
      {/* Case selector */}
      <div className="p-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="flex items-center gap-2 mb-2.5">
          <Briefcase size={13} style={{ color: "hsl(var(--primary))" }} />
          <h3 className="text-xs font-bold text-foreground">Caso activo</h3>
        </div>
        <div className="relative" ref={caseDropdownRef}>
          <div onClick={() => setShowCaseDropdown(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-all" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: selectedCase ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
            <Search size={12} className="shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
            <span className="flex-1 truncate">{selectedCase ? selectedCase.ref + " – " + selectedCase.title : "Buscar caso..."}</span>
            <ChevronDown size={12} className="shrink-0" style={{ color: "hsl(var(--muted-foreground))", transform: showCaseDropdown ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
          </div>
          {showCaseDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 30px hsl(220 30% 2% / 0.25)" }}>
              <div className="p-2 border-b" style={{ borderColor: "hsl(var(--border))" }}>
                <input value={caseSearch} onChange={e => setCaseSearch(e.target.value)} placeholder="Filtrar casos..." autoFocus className="w-full px-2.5 py-1.5 rounded-lg text-xs" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", outline: "none" }} />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCases.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCase(c); setShowCaseDropdown(false); setCaseSearch(""); }} className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors hover:bg-secondary/50" style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `hsl(${areaColors[c.area] || "var(--primary)"})` }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>{c.ref}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `hsl(${areaColors[c.area]} / 0.12)`, color: `hsl(${areaColors[c.area]})` }}>{c.area}</span>
                      </div>
                      <p className="text-xs text-foreground truncate">{c.title}</p>
                    </div>
                    {selectedCase?.id === c.id && <Check size={14} style={{ color: "hsl(var(--primary))" }} />}
                  </button>
                ))}
                {filteredCases.length === 0 && <p className="text-xs text-center py-4" style={{ color: "hsl(var(--muted-foreground))" }}>Sin resultados</p>}
              </div>
            </div>
          )}
        </div>
        {selectedCase && <div className="mt-2.5"><CaseCard c={selectedCase} /></div>}
      </div>

      {/* RAG Parameters */}
      <div className="p-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="flex items-center gap-2 mb-2.5">
          <Tag size={13} style={{ color: "hsl(var(--accent))" }} />
          <h3 className="text-xs font-bold text-foreground">Parámetros de consulta</h3>
        </div>
        <label className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Jurisdicción</label>
        <div className="flex gap-1 mb-3">
          {jurisdicciones.map(j => (
            <button key={j} onClick={() => setSelectedJurisdiccion(j)} className="flex-1 px-1.5 py-1 rounded-lg text-[9px] font-medium transition-all text-center" style={{ background: selectedJurisdiccion === j ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary) / 0.5)", border: `1px solid ${selectedJurisdiccion === j ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border) / 0.4)"}`, color: selectedJurisdiccion === j ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
              {j}
            </button>
          ))}
        </div>
        <label className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Especialidad</label>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {especialidades.map(esp => {
            const isActive = selectedEspecialidad === esp.nombre;
            return (
              <div key={esp.nombre}>
                <button onClick={() => { setSelectedEspecialidad(isActive ? null : esp.nombre); if (!isActive) setSelectedDocTypes([]); }} className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all text-left" style={{ background: isActive ? `hsl(${esp.color} / 0.15)` : "hsl(var(--secondary) / 0.5)", border: `1px solid ${isActive ? `hsl(${esp.color} / 0.4)` : "hsl(var(--border) / 0.3)"}`, color: isActive ? `hsl(${esp.color})` : "hsl(var(--muted-foreground))" }}>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `hsl(${esp.color})` }} />
                  <span className="flex-1">{esp.nombre}</span>
                  <ChevronRight size={10} className="shrink-0 transition-transform" style={{ transform: isActive ? "rotate(90deg)" : "rotate(0)" }} />
                </button>
                {isActive && (
                  <div className="flex flex-wrap gap-1 pl-4 pt-1.5 pb-1 animate-fade-in">
                    {esp.documentos.map(doc => {
                      const docSelected = selectedDocTypes.includes(doc);
                      return (
                        <button key={doc} onClick={() => setSelectedDocTypes(prev => docSelected ? prev.filter(d => d !== doc) : [...prev, doc])} className="px-2 py-0.5 rounded-full text-[9px] font-medium transition-all" style={{ background: docSelected ? `hsl(${esp.color} / 0.2)` : "hsl(var(--secondary) / 0.7)", border: `1px solid ${docSelected ? `hsl(${esp.color} / 0.5)` : "hsl(var(--border) / 0.3)"}`, color: docSelected ? `hsl(${esp.color})` : "hsl(var(--muted-foreground))" }}>
                          {docSelected && <span className="mr-0.5">✓</span>}{doc}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active params summary */}
      <div className="p-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>Parámetros activos</h4>
        <div className="flex flex-wrap gap-1.5">
          {selectedCase && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))" }}>
              <Briefcase size={10} /> {selectedCase.ref}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: "hsl(var(--accent) / 0.12)", color: "hsl(var(--accent))" }}>
            <MapPin size={10} /> {selectedJurisdiccion}
          </span>
          {selectedEspecialidad && (() => {
            const esp = especialidades.find(e => e.nombre === selectedEspecialidad);
            const c = esp?.color || "var(--primary)";
            return (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: `hsl(${c} / 0.12)`, color: `hsl(${c})` }}>
                <Gavel size={10} /> {selectedEspecialidad}
              </span>
            );
          })()}
          {selectedDocTypes.map(doc => {
            const esp = especialidades.find(e => e.nombre === selectedEspecialidad);
            const c = esp?.color || "var(--primary)";
            return (
              <span key={doc} className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `hsl(${c} / 0.08)`, color: `hsl(${c})`, border: `1px solid hsl(${c} / 0.2)` }}>
                <FileText size={8} /> {doc}
                <button onClick={() => setSelectedDocTypes(prev => prev.filter(d => d !== doc))} className="ml-0.5 hover:opacity-70"><X size={8} /></button>
              </span>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <div className="flex flex-col h-full animate-fade-in overflow-hidden" style={{ height: "calc(100vh - 10rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 shrink-0">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground font-display">Asistente IA Legal</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Online · Especializado en Derecho Boliviano</p>
          </div>
        </div>
        {/* Mobile toggles */}
        <div className="flex lg:hidden gap-1.5">
          <button onClick={() => { setShowConfig(v => !v); setShowActions(false); }} className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all" style={{ background: showConfig ? "hsl(var(--primary))" : "hsl(var(--secondary))", color: showConfig ? "white" : "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}>
            <Briefcase size={13} /> Caso
          </button>
          <button onClick={() => { setShowActions(v => !v); setShowConfig(false); }} className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all" style={{ background: showActions ? "hsl(var(--primary))" : "hsl(var(--secondary))", color: showActions ? "white" : "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}>
            <Zap size={13} /> Acciones
          </button>
        </div>
      </div>

      {/* Mobile slide-overs — portaled to body */}
      {showConfig && createPortal(
        <div className="lg:hidden fixed inset-0 z-[60] animate-fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfig(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-sm flex flex-col overflow-hidden animate-slide-in-right" style={{ background: "hsl(var(--background))", boxShadow: "4px 0 24px hsl(220 30% 2% / 0.3)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "hsl(var(--border))" }}>
              <div className="flex items-center gap-2">
                <Briefcase size={16} style={{ color: "hsl(var(--primary))" }} />
                <h3 className="text-sm font-bold text-foreground">Configurar consulta</h3>
              </div>
              <button onClick={() => setShowConfig(false)} className="p-1.5 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                <X size={16} className="text-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConfigPanel />
            </div>
          </div>
        </div>,
        document.body
      )}

      {showActions && createPortal(
        <div className="lg:hidden fixed inset-0 z-[60] animate-fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowActions(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm flex flex-col overflow-hidden animate-slide-in-right" style={{ background: "hsl(var(--background))", boxShadow: "-4px 0 24px hsl(220 30% 2% / 0.3)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "hsl(var(--border))" }}>
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: "hsl(var(--accent))" }} />
                <h3 className="text-sm font-bold text-foreground">Acciones de IA</h3>
              </div>
              <button onClick={() => setShowActions(false)} className="p-1.5 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                <X size={16} className="text-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {aiActions.map((a, i) => (
                <button key={i} onClick={() => { setShowActions(false); send(a.title + ": " + a.desc); }} className="w-full text-left p-3.5 rounded-xl transition-all" style={{ background: "hsl(var(--secondary) / 0.6)", border: "1px solid hsl(var(--border) / 0.5)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{a.icon}</span>
                    <span className="text-sm font-semibold text-foreground">{a.title}</span>
                  </div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>{a.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "hsl(var(--border) / 0.6)", color: "hsl(var(--muted-foreground))" }}>{t}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Main layout: Left Config + Chat + Right Actions */}
      <div className="flex gap-3 flex-1 min-h-0">

        {/* LEFT: Config panel (desktop) */}
        <div className={`hidden lg:flex w-64 xl:w-72 shrink-0 flex-col glass-card ${theme === "dark" ? "nexus-ai-alive" : ""} rounded-xl overflow-hidden`}>
          <div className="flex-1 overflow-y-auto">
            <ConfigPanel />
          </div>
        </div>

        {/* CENTER: Chat + Research tabs */}
        <div className={`flex-1 min-w-0 ${isClassic ? "notepad-card" : "glass-card"} ${theme === "dark" ? "nexus-ai-alive" : ""} rounded-xl flex flex-col overflow-hidden`}>
          {/* Tab header */}
          <div className="flex border-b shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
            <button onClick={() => setCenterTab("chat")} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] font-semibold transition-all" style={{ borderBottom: centerTab === "chat" ? "2px solid hsl(var(--primary))" : "2px solid transparent", color: centerTab === "chat" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", background: centerTab === "chat" ? "hsl(var(--primary) / 0.05)" : "transparent" }}>
              <MessageSquare size={13} /> Chat IA
            </button>
            <button onClick={() => setCenterTab("investigacion")} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] font-semibold transition-all" style={{ borderBottom: centerTab === "investigacion" ? "2px solid hsl(var(--primary))" : "2px solid transparent", color: centerTab === "investigacion" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", background: centerTab === "investigacion" ? "hsl(var(--primary) / 0.05)" : "transparent" }}>
              <BookOpen size={13} /> Investigación Legal
            </button>
          </div>

          {centerTab === "chat" && (
            <>
              {/* Active params strip */}
              {(selectedCase || selectedEspecialidad || selectedDocTypes.length > 0) && (
                <div className="px-3 py-2 border-b flex flex-wrap gap-1.5 shrink-0" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary) / 0.3)" }}>
                  {selectedCase && (
                    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
                      <Briefcase size={8} /> {selectedCase.ref}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "hsl(var(--accent) / 0.1)", color: "hsl(var(--accent))" }}>
                    <MapPin size={8} /> {selectedJurisdiccion}
                  </span>
                  {selectedEspecialidad && (
                    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
                      <Gavel size={8} /> {selectedEspecialidad}
                    </span>
                  )}
                  {selectedDocTypes.map(doc => (
                    <span key={doc} className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "hsl(var(--border) / 0.5)", color: "hsl(var(--muted-foreground))" }}>
                      <FileText size={8} /> {doc}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 animate-fade-in ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={m.role === "ai" ? { background: "linear-gradient(135deg, hsl(271 77% 62%), hsl(199 89% 55%))", color: "white" } : { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", color: "white" }}>
                      {m.role === "ai" ? <Scale size={12} /> : "Tú"}
                    </div>
                    <div className="max-w-[80%]">
                      <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed" style={m.role === "ai" ? { background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", borderBottomLeftRadius: "4px" } : { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", color: "white", borderBottomRightRadius: "4px" }}>
                        {m.content.split('\n').map((line, j) => (
                          <p key={j} className={j > 0 ? "mt-1" : ""}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                        ))}
                      </div>
                      <p className="text-[10px] mt-1 px-1" style={{ color: "hsl(var(--muted-foreground))", textAlign: m.role === "user" ? "right" : "left" }}>{m.timestamp}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(271 77% 62%), hsl(199 89% 55%))" }}>
                      <Scale size={12} className="text-white" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl" style={{ background: "hsl(var(--secondary))" }}>
                      <AiThinkingNodes />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t" style={{ borderColor: "hsl(var(--border))" }}>
                <div className="flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Pregunta sobre procedimientos, estrategias, jurisprudencia..." className="flex-1 px-4 py-2.5 rounded-xl text-sm" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", outline: "none" }} />
                  <button onClick={() => send()} className="btn-primary px-4 rounded-xl" disabled={loading || !input.trim()}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}

          {centerTab === "investigacion" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search bar */}
              <div className="p-3 border-b shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
                <div className="relative mb-2.5">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--primary))" }} />
                  <input value={researchSearch} onChange={e => setResearchSearch(e.target.value)} placeholder="Buscar jurisprudencia, autos supremos, normativa..." className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", outline: "none" }} />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={() => setSelectedFuente(null)} className="px-2 py-1 rounded-lg text-[10px] font-medium transition-all" style={{ background: !selectedFuente ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary) / 0.5)", color: !selectedFuente ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", border: `1px solid ${!selectedFuente ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border) / 0.4)"}` }}>
                    Todas
                  </button>
                  {(Object.keys(fuenteLabels) as FuenteType[]).map(f => (
                    <button key={f} onClick={() => setSelectedFuente(selectedFuente === f ? null : f)} className="px-2 py-1 rounded-lg text-[10px] font-medium transition-all" style={{ background: selectedFuente === f ? `hsl(${fuenteColors[f]} / 0.15)` : "hsl(var(--secondary) / 0.5)", color: selectedFuente === f ? `hsl(${fuenteColors[f]})` : "hsl(var(--muted-foreground))", border: `1px solid ${selectedFuente === f ? `hsl(${fuenteColors[f]} / 0.4)` : "hsl(var(--border) / 0.4)"}` }}>
                      {fuenteLabels[f]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                <p className="text-[10px] font-medium px-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {filteredResearch.length} resultado{filteredResearch.length !== 1 ? "s" : ""} encontrado{filteredResearch.length !== 1 ? "s" : ""}
                </p>
                {filteredResearch.map((r, i) => (
                  <div key={r.id} className={`${isClassic ? "paper-item" : "glass-card rounded-xl p-3.5"} cursor-pointer animate-fade-in-up`} style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                          <span className="text-[10px] font-mono font-semibold" style={{ color: `hsl(${fuenteColors[r.fuente]})` }}>{r.id}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `hsl(${fuenteColors[r.fuente]} / 0.12)`, color: `hsl(${fuenteColors[r.fuente]})` }}>{fuenteLabels[r.fuente]}</span>
                          <LawBadge type={r.area} />
                        </div>
                        <p className="text-xs font-semibold text-foreground mb-1 leading-tight">{r.title}</p>
                        <p className="text-[11px] leading-relaxed mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>{r.tribunal}</p>
                        <p className="text-[11px] leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{r.summary}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp size={10} style={{ color: "hsl(142 70% 48%)" }} />
                          <span className="text-[10px] font-bold" style={{ color: "hsl(142 70% 55%)" }}>{r.relevance}%</span>
                        </div>
                        <span className="text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>{r.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2.5">
                      <button className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg transition-all" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
                        <Star size={9} /> Guardar
                      </button>
                      <button className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg transition-all" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
                        <ExternalLink size={9} /> Ver completa
                      </button>
                      <button onClick={() => { setCenterTab("chat"); send("Analiza la fuente: " + r.id + " – " + r.title); }} className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg transition-all" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
                        <Sparkles size={9} /> Analizar con IA
                      </button>
                    </div>
                  </div>
                ))}
                {filteredResearch.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen size={32} className="mb-3" style={{ color: "hsl(var(--muted-foreground) / 0.3)" }} />
                    <p className="text-xs font-semibold text-foreground mb-1">Sin resultados</p>
                    <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>Intenta con otros términos o filtra por tipo de fuente.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* RIGHT: Tabbed sidebar (desktop) */}
        <div className={`hidden lg:flex w-64 xl:w-72 shrink-0 flex-col glass-card ${theme === "dark" ? "nexus-ai-alive" : ""} rounded-xl overflow-hidden`}>
          {/* Tab header */}
          <div className="flex border-b shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
            <button onClick={() => setRightTab("acciones")} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] font-semibold transition-all" style={{ borderBottom: rightTab === "acciones" ? "2px solid hsl(var(--primary))" : "2px solid transparent", color: rightTab === "acciones" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", background: rightTab === "acciones" ? "hsl(var(--primary) / 0.05)" : "transparent" }}>
              <Sparkles size={12} /> Flujos de trabajo
            </button>
            <button onClick={() => setRightTab("caso")} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] font-semibold transition-all relative" style={{ borderBottom: rightTab === "caso" ? "2px solid hsl(var(--primary))" : "2px solid transparent", color: rightTab === "caso" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", background: rightTab === "caso" ? "hsl(var(--primary) / 0.05)" : "transparent" }}>
              <Briefcase size={12} /> Estrategia
              {contextActions.length > 0 && (
                <span className="text-[9px] px-1 py-0.5 rounded-full font-bold" style={{ background: `hsl(${selectedCase ? (areaColors[selectedCase.area] || "var(--primary)") : "var(--primary)"} / 0.2)`, color: `hsl(${selectedCase ? (areaColors[selectedCase.area] || "var(--primary)") : "var(--primary)"})` }}>{contextActions.length}</span>
              )}
            </button>
          </div>

          {rightTab === "acciones" && (
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {aiActions.map((a, i) => (
                <button key={i} onClick={() => send(a.title + ": " + a.desc)} className="w-full text-left p-2.5 rounded-xl transition-all hover:scale-[1.01]" style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border) / 0.4)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--primary) / 0.4)"; (e.currentTarget as HTMLElement).style.background = "hsl(var(--secondary))"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border) / 0.4)"; (e.currentTarget as HTMLElement).style.background = "hsl(var(--secondary) / 0.5)"; }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{a.icon}</span>
                    <span className="text-xs font-semibold text-foreground leading-tight">{a.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>{a.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {a.tags.map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "hsl(var(--border) / 0.6)", color: "hsl(var(--muted-foreground))" }}>{t}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}

          {rightTab === "caso" && (
            <div className="flex-1 overflow-y-auto p-2.5">
              {contextActions.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-medium px-1 mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Acciones sugeridas para <span className="font-bold text-foreground">{selectedCase?.area}</span> · {selectedCase?.ref}
                  </p>
                  {contextActions.map((a, i) => (
                    <button key={i} onClick={() => send(a.title + ": " + a.desc)} className="w-full text-left p-2.5 rounded-xl transition-all hover:scale-[1.01]" style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border) / 0.4)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `hsl(${areaColors[selectedCase!.area] || "var(--primary)"} / 0.4)`; (e.currentTarget as HTMLElement).style.background = "hsl(var(--secondary))"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border) / 0.4)"; (e.currentTarget as HTMLElement).style.background = "hsl(var(--secondary) / 0.5)"; }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{a.icon}</span>
                        <span className="text-xs font-semibold text-foreground leading-tight">{a.title}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{a.desc}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                  <Briefcase size={28} className="mb-3" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} />
                  <p className="text-xs font-semibold text-foreground mb-1">Sin caso activo</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>Selecciona un caso en la columna izquierda para ver las acciones estratégicas sugeridas.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
