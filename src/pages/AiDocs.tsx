import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Send, Scale, Zap, X, Search, Briefcase, FileText, MapPin, Gavel, ChevronDown, Check, Tag, Wand2, Edit, Upload, BookOpen, ChevronRight, MessageSquare, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Printer, Download, Save, Eye, Clock, MoreHorizontal, Paperclip, ClipboardCheck, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import AiThinkingNodes from "@/components/AiThinkingNodes";
import { useTheme } from "@/context/ThemeContext";

interface Message { role: "user" | "ai"; content: string; timestamp: string; }

// Mock cases data
const mockCases = [
  { id: 1, ref: "EXP-2024-001", title: "García vs. Inmobiliaria Sol S.L.", client: "María García López", area: "Civil", status: "En curso", date: "15/01/2024", docs: 12 },
  { id: 2, ref: "EXP-2024-002", title: "Despido improcedente - Rodríguez", client: "Carlos Rodríguez", area: "Laboral", status: "En curso", date: "22/02/2024", docs: 8 },
  { id: 3, ref: "EXP-2024-003", title: "Recurso contencioso-administrativo", client: "Empresa TechFlow S.A.", area: "Administrativo", status: "En curso", date: "10/03/2024", docs: 15 },
  { id: 4, ref: "EXP-2024-004", title: "Divorcio contencioso Martínez-Sánchez", client: "Ana Martínez", area: "Familia", status: "En curso", date: "05/04/2024", docs: 6 },
  { id: 5, ref: "EXP-2024-005", title: "Constitución SL y pacto de socios", client: "StartupVerde S.L.", area: "Mercantil", status: "En curso", date: "18/05/2024", docs: 20 },
  { id: 6, ref: "EXP-2024-006", title: "Defensa penal por estafa", client: "Jorge Fernández", area: "Penal", status: "En curso", date: "01/06/2024", docs: 9 },
];

const jurisdicciones = ["D. Boliviano", "D. Internacional", "D. Comunitario Andino"];

interface Especialidad {
  nombre: string;
  color: string;
  documentos: string[];
}

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

const aiActions = [
  { icon: "📝", title: "Escrito de Demanda", desc: "Genera una demanda civil completa con hechos y fundamentos de derecho", tags: ["Civil", "Generación"] },
  { icon: "📋", title: "Contestación a la Demanda", desc: "Contestación detallada con excepciones procesales", tags: ["Civil", "Generación"] },
  { icon: "⚖️", title: "Recurso de Apelación", desc: "Recurso fundado con jurisprudencia relevante", tags: ["Procesal", "Generación"] },
  { icon: "📄", title: "Contrato de Trabajo", desc: "Contrato laboral con cláusulas legalmente conformes", tags: ["Laboral", "Generación"] },
  { icon: "🔍", title: "Análisis de Contratos", desc: "Detecta cláusulas abusivas y riesgos legales automáticamente", tags: ["Análisis", "Revisión"] },
  { icon: "✏️", title: "Revisión y Mejora", desc: "Mejora la redacción jurídica y detecta inconsistencias", tags: ["Revisión"] },
  { icon: "📑", title: "Extracción de Datos", desc: "Extrae información clave de documentos con OCR + IA", tags: ["Análisis", "OCR"] },
  { icon: "🏛️", title: "Escrito Penal – Denuncia", desc: "Denuncia penal formal con descripción de hechos", tags: ["Penal", "Generación"] },
  { icon: "🤝", title: "Contrato Mercantil", desc: "Acuerdo comercial entre empresas con cláusulas completas", tags: ["Mercantil", "Generación"] },
  { icon: "📊", title: "Comparar documentos", desc: "Construir una tabla que resuma las diferencias clave en dos documentos", tags: ["Análisis"] },
  { icon: "📁", title: "Resumir documentos", desc: "Genere rápidamente resúmenes de sus documentos", tags: ["Análisis"] },
  { icon: "🕐", title: "Crear línea de tiempo", desc: "Extraiga una cronología de eventos de sus documentos", tags: ["Análisis"] },
];

const mockResponses: Record<number, string> = {
  0: "He generado el **Escrito de Demanda** para el caso seleccionado. El documento incluye:\n\n1. **Encabezamiento** con datos del juzgado competente\n2. **Hechos** detallados basados en la documentación del expediente\n3. **Fundamentos de Derecho** con artículos aplicables (arts. 1124, 1964 CC)\n4. **Petitum** con las pretensiones concretas\n\nEl documento tiene **6 páginas** y **3,240 palabras**. ¿Deseas revisarlo o hacer ajustes?",
  1: "He analizado el contrato y he detectado **3 cláusulas potencialmente abusivas**:\n\n1. **Cláusula 12.3** – Penalización desproporcionada por resolución anticipada (art. 85.6 TRLGDCU)\n2. **Cláusula 8.1** – Limitación de responsabilidad unilateral que contradice la Directiva 93/13/CEE\n3. **Cláusula 15.2** – Sumisión a fuero distinto al del consumidor\n\nRecomiendo renegociar estas cláusulas antes de firmar.",
  2: "El recurso de apelación ha sido redactado con los siguientes fundamentos:\n\n- **Error en la valoración de la prueba** (art. 456.1 LEC)\n- **Infracción de norma procesal** que causó indefensión\n- **Jurisprudencia del TS** aplicable: STS 241/2013, STS 705/2015\n\nDocumento generado: **8 páginas**, **4,120 palabras**. Incluye citas de jurisprudencia actualizadas.",
  3: "He preparado el **Contrato de Trabajo** conforme al ET vigente:\n\n- **Tipo:** Indefinido a tiempo completo\n- **Convenio aplicable:** Identificado según actividad\n- **Cláusulas incluidas:** Periodo de prueba, retribución, jornada, vacaciones, confidencialidad\n- **Cumplimiento normativo:** Verificado contra RDL 2/2015 y normativa de protección de datos\n\nDocumento listo para descarga en PDF.",
};

const areaColors: Record<string, string> = {
  "Civil": "190 100% 50%",
  "Penal": "0 90% 60%",
  "Laboral": "45 100% 55%",
  "Mercantil": "150 90% 45%",
  "Administrativo": "260 80% 65%",
  "Familia": "320 85% 62%",
  "Fiscal": "170 90% 48%",
  "Internacional": "217 85% 52%",
};

// Mock generated documents bank
const mockGeneratedDocs = [
  { id: 1, title: "Escrito de Demanda – García vs. Inmobiliaria Sol", date: "20/02/2026", pages: 6, type: "Demanda", area: "Civil" },
  { id: 2, title: "Recurso de Apelación – Rodríguez", date: "18/02/2026", pages: 8, type: "Recurso", area: "Laboral" },
  { id: 3, title: "Contrato Mercantil – TechFlow", date: "15/02/2026", pages: 4, type: "Contrato", area: "Mercantil" },
  { id: 4, title: "Análisis de Cláusulas – Préstamo Hipotecario", date: "12/02/2026", pages: 3, type: "Análisis", area: "Civil" },
  { id: 5, title: "Denuncia Penal – Caso Fernández", date: "10/02/2026", pages: 5, type: "Denuncia", area: "Penal" },
  { id: 6, title: "Contestación a Demanda – Martínez", date: "08/02/2026", pages: 7, type: "Contestación", area: "Familia" },
  { id: 7, title: "Contrato de Trabajo – StartupVerde", date: "05/02/2026", pages: 3, type: "Contrato", area: "Laboral" },
];

const defaultEditorContent = `<h1 style="text-align:center; margin-bottom:4px;">ESCRITO DE DEMANDA</h1>
<p style="text-align:center; color: gray; font-size: 13px;">Juzgado de Primera Instancia n.º 5 de Madrid</p>
<hr/>
<p><br/></p>
<p><strong>AL JUZGADO DE PRIMERA INSTANCIA</strong></p>
<p><br/></p>
<p>D./D.ª <strong>[Nombre del Procurador]</strong>, Procurador de los Tribunales, en nombre y representación de <strong>D./D.ª María García López</strong>, según acredito con escritura de poder que acompaño, ante el Juzgado comparezco y como mejor proceda en Derecho, <strong>DIGO:</strong></p>
<p><br/></p>
<h2>I. HECHOS</h2>
<p><br/></p>
<p><strong>PRIMERO.</strong> — Con fecha 15 de enero de 2024, mi mandante suscribió contrato de compraventa con la mercantil Inmobiliaria Sol S.L., cuyo objeto era la adquisición de la vivienda sita en…</p>
<p><br/></p>
<p><strong>SEGUNDO.</strong> — La parte vendedora incumplió las obligaciones contractuales relativas a la entrega de la vivienda en las condiciones pactadas, concretamente…</p>
<p><br/></p>
<p><strong>TERCERO.</strong> — Tras requerimiento fehaciente mediante burofax de fecha…, la demandada no procedió a subsanar los defectos señalados ni a cumplir con sus obligaciones contractuales.</p>
<p><br/></p>
<h2>II. FUNDAMENTOS DE DERECHO</h2>
<p><br/></p>
<p><strong>PRIMERO.</strong> — De conformidad con lo dispuesto en el artículo 1124 del Código Civil, la facultad de resolver las obligaciones se entiende implícita en las recíprocas…</p>
<p><br/></p>
<p><strong>SEGUNDO.</strong> — Resulta de aplicación el artículo 1964 del Código Civil respecto al plazo de prescripción de las acciones personales…</p>
<p><br/></p>
<h2>III. PETITUM</h2>
<p><br/></p>
<p>Por lo expuesto, <strong>SUPLICO AL JUZGADO</strong> que, teniendo por presentado este escrito con los documentos que se acompañan, se sirva admitirlo y, en su virtud, tenga por formulada demanda de juicio ordinario contra <strong>Inmobiliaria Sol S.L.</strong>, y tras los trámites legales oportunos, dicte sentencia por la que:</p>
<p><br/></p>
<ol>
<li>Se declare resuelto el contrato de compraventa de fecha 15/01/2024.</li>
<li>Se condene a la demandada a la devolución íntegra del precio satisfecho.</li>
<li>Se condene a la demandada al pago de los daños y perjuicios ocasionados.</li>
<li>Se impongan las costas procesales a la parte demandada.</li>
</ol>`;

export default function AiDocs() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hola, soy tu asistente legal. Puedo generar, revisar y mejorar documentos jurídicos. Sube un archivo o selecciona una acción para comenzar.", timestamp: "Ahora" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [responseIdx, setResponseIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Case selector state
  const [selectedCase, setSelectedCase] = useState<typeof mockCases[0] | null>(null);
  const [caseSearch, setCaseSearch] = useState("");
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);

  // RAG parameters
  const [selectedJurisdiccion, setSelectedJurisdiccion] = useState("D. Boliviano");
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string | null>(null);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);

  // Mobile panels
  const [showActions, setShowActions] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Right column tab
  const [rightTab, setRightTab] = useState<"acciones" | "revision">("acciones");

  // Editor state
  const [activeDoc, setActiveDoc] = useState(mockGeneratedDocs[0]);
  const [editorContent, setEditorContent] = useState(defaultEditorContent);
  const [showFileBank, setShowFileBank] = useState(false);
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

  const caseDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (caseDropdownRef.current && !caseDropdownRef.current.contains(e.target as Node)) setShowCaseDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Editor commands
  const execCmd = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }, []);

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

  const ConfigPanel = () => (
    <div className="flex flex-col h-full">
      {/* Case selector */}
      <div className="p-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="flex items-center gap-2 mb-2.5">
          <Briefcase size={13} style={{ color: "hsl(var(--primary))" }} />
          <h3 className="text-xs font-bold text-foreground">Caso activo</h3>
        </div>
        <div className="relative" ref={caseDropdownRef}>
          <div
            onClick={() => setShowCaseDropdown(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-all"
            style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: selectedCase ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
          >
            <Search size={12} className="shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
            <span className="flex-1 truncate">{selectedCase ? selectedCase.ref + " – " + selectedCase.title : "Buscar caso..."}</span>
            <ChevronDown size={12} className="shrink-0" style={{ color: "hsl(var(--muted-foreground))", transform: showCaseDropdown ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
          </div>
          {showCaseDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "var(--shadow-lg)" }}>
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
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {especialidades.map(esp => {
            const isActive = selectedEspecialidad === esp.nombre;
            return (
              <div key={esp.nombre}>
                <button
                  onClick={() => { setSelectedEspecialidad(isActive ? null : esp.nombre); if (!isActive) setSelectedDocTypes([]); }}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all text-left"
                  style={{
                    background: isActive ? `hsl(${esp.color} / 0.15)` : "hsl(var(--secondary) / 0.5)",
                    border: `1px solid ${isActive ? `hsl(${esp.color} / 0.4)` : "hsl(var(--border) / 0.3)"}`,
                    color: isActive ? `hsl(${esp.color})` : "hsl(var(--muted-foreground))"
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `hsl(${esp.color})` }} />
                  <span className="flex-1">{esp.nombre}</span>
                  <ChevronRight size={10} className="shrink-0 transition-transform" style={{ transform: isActive ? "rotate(90deg)" : "rotate(0)" }} />
                </button>
                {isActive && (
                  <div className="flex flex-wrap gap-1 pl-4 pt-1.5 pb-1 animate-fade-in">
                    {esp.documentos.map(doc => {
                      const docSelected = selectedDocTypes.includes(doc);
                      return (
                        <button
                          key={doc}
                          onClick={() => setSelectedDocTypes(prev => docSelected ? prev.filter(d => d !== doc) : [...prev, doc])}
                          className="px-2 py-0.5 rounded-full text-[9px] font-medium transition-all"
                          style={{
                            background: docSelected ? `hsl(${esp.color} / 0.2)` : "hsl(var(--secondary) / 0.7)",
                            border: `1px solid ${docSelected ? `hsl(${esp.color} / 0.5)` : "hsl(var(--border) / 0.3)"}`,
                            color: docSelected ? `hsl(${esp.color})` : "hsl(var(--muted-foreground))"
                          }}
                        >
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
      <div className="p-3">
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

  /* ── Toolbar button ── */
  const ToolBtn = ({ icon: Icon, label, onClick, active }: { icon: any; label: string; onClick: () => void; active?: boolean }) => (
    <button
      onClick={onClick}
      title={label}
      className="p-1.5 rounded-md transition-all"
      style={{
        background: active ? "hsl(var(--primary) / 0.15)" : "transparent",
        color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "hsl(var(--secondary))"; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <Icon size={14} />
    </button>
  );

  const ToolSep = () => <div className="w-px h-5 mx-0.5" style={{ background: "hsl(var(--border))" }} />;

  return (
    <div className="flex flex-col h-full animate-fade-in overflow-hidden" style={{ height: "calc(100vh - 10rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 shrink-0">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground font-display">Taller Legal IA</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Online · Genera, revisa y mejora escritos jurídicos</p>
          </div>
        </div>
        {/* Mobile toggles */}
        <div className="flex lg:hidden gap-1.5">
          <button onClick={() => { setShowConfig(v => !v); setShowActions(false); }} className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all" style={{ background: showConfig ? "hsl(var(--primary))" : "hsl(var(--secondary))", color: showConfig ? "white" : "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}>
            <Briefcase size={13} /> IA Generar
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
              <button onClick={() => setShowConfig(false)} className="p-1.5 rounded-lg" style={{ background: "hsl(var(--secondary))" }}><X size={16} className="text-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto"><ConfigPanel /></div>
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
              <button onClick={() => setShowActions(false)} className="p-1.5 rounded-lg" style={{ background: "hsl(var(--secondary))" }}><X size={16} className="text-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {aiActions.map((a, i) => (
                <button key={i} onClick={() => { setShowActions(false); send(a.title + ": " + a.desc); }} className="w-full text-left p-3.5 rounded-xl transition-all" style={{ background: "hsl(var(--secondary) / 0.6)", border: "1px solid hsl(var(--border) / 0.5)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{a.icon}</span>
                    <span className="text-sm font-semibold text-foreground">{a.title}</span>
                  </div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>{a.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═══ Main 3-column layout ═══ */}
      <div className="flex gap-3 flex-1 min-h-0 min-w-0 overflow-hidden">

        {/* LEFT: Config + Chat (desktop) */}
        <div className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col gap-3 min-h-0">
          {/* Config panel */}
          <div className="shrink-0 glass-card rounded-xl overflow-hidden overflow-y-auto" style={{ maxHeight: "50%" }}>
            <ConfigPanel />
          </div>

          {/* Chat IA */}
          <div
            className={`flex-1 min-h-0 flex flex-col ${isClassic ? "notepad-card" : "glass-card"} ${theme === "dark" ? "nexus-ai-alive" : ""} rounded-xl overflow-hidden`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) setUploadedFile(file);
            }}
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "hsl(var(--border))" }}>
              <MessageSquare size={12} style={{ color: "hsl(var(--primary))" }} />
              <span className="text-[11px] font-bold text-foreground">Chat IA</span>
            </div>

            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl" style={{ background: "hsl(var(--primary) / 0.08)", border: "2px dashed hsl(var(--primary) / 0.5)" }}>
                <div className="text-center">
                  <Upload size={24} style={{ color: "hsl(var(--primary))", margin: "0 auto 8px" }} />
                  <p className="text-xs font-semibold" style={{ color: "hsl(var(--primary))" }}>Soltar archivo aquí</p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 animate-fade-in ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold" style={m.role === "ai" ? { background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(199 89% 55%))", color: "white" } : { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", color: "white" }}>
                    {m.role === "ai" ? <Sparkles size={9} /> : "T"}
                  </div>
                  <div className="max-w-[85%]">
                    <div className="px-2.5 py-1.5 rounded-xl text-[11px] leading-relaxed" style={m.role === "ai" ? { background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" } : { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", color: "white" }}>
                      {m.content.split('\n').slice(0, 3).map((line, j) => (
                        <p key={j} className={j > 0 ? "mt-0.5" : ""}>{line.replace(/\*\*(.*?)\*\*/g, '$1').substring(0, 100)}{line.length > 100 ? "…" : ""}</p>
                      ))}
                      {m.content.split('\n').length > 3 && <p className="mt-0.5 opacity-60">…</p>}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 animate-fade-in">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(199 89% 55%))" }}>
                    <Sparkles size={9} className="text-white" />
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl" style={{ background: "hsl(var(--secondary))" }}>
                    <AiThinkingNodes compact />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Active params strip in chat */}
            {(selectedEspecialidad || selectedDocTypes.length > 0) && (
              <div className="px-2 pt-1.5">
                <div className="flex flex-wrap gap-1 items-center">
                  {selectedEspecialidad && (() => {
                    const esp = especialidades.find(e => e.nombre === selectedEspecialidad);
                    const c = esp?.color || "var(--primary)";
                    return (
                      <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `hsl(${c} / 0.12)`, color: `hsl(${c})` }}>
                        <Scale size={8} /> {selectedEspecialidad.replace("Derecho ", "").replace("de ", "")}
                      </span>
                    );
                  })()}
                  {selectedDocTypes.map(doc => {
                    const esp = especialidades.find(e => e.nombre === selectedEspecialidad);
                    const c = esp?.color || "var(--primary)";
                    return (
                      <span key={doc} className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `hsl(${c} / 0.08)`, color: `hsl(${c})`, border: `1px solid hsl(${c} / 0.2)` }}>
                        {doc}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {uploadedFile && (
              <div className="px-2 pt-1.5">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px]" style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.25)" }}>
                  <FileText size={12} style={{ color: "hsl(var(--primary))" }} />
                  <span className="flex-1 truncate font-medium" style={{ color: "hsl(var(--primary))" }}>{uploadedFile.name}</span>
                  <button onClick={() => setUploadedFile(null)} className="p-0.5 rounded" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <X size={10} />
                  </button>
                </div>
              </div>
            )}

            {/* Input + file button */}
            <div className="p-2 border-t" style={{ borderColor: "hsl(var(--border))" }}>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.txt,.rtf,.odt" onChange={e => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); e.target.value = ""; }} />
              <div className="flex gap-1.5">
                <button onClick={() => fileInputRef.current?.click()} title="Adjuntar archivo" className="p-1.5 rounded-lg shrink-0 transition-all" style={{ color: "hsl(var(--muted-foreground))", background: "hsl(var(--secondary))" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--primary))"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--muted-foreground))"; }}>
                  <Paperclip size={13} />
                </button>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder={uploadedFile ? "Pedir revisión del archivo..." : "Pedir ajustes al documento..."} className="flex-1 px-2.5 py-1.5 rounded-lg text-[11px]" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", outline: "none" }} />
                <button onClick={() => send()} className="px-2.5 py-1.5 rounded-lg" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }} disabled={loading || !input.trim()}>
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: File bank button + Editor */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden w-0">

          {/* Banco de archivos: collapsible */}
          <div className="shrink-0 mb-2">
            <button
              onClick={() => setShowFileBank(v => !v)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: showFileBank ? "hsl(var(--primary) / 0.1)" : "hsl(var(--card))",
                border: `1px solid ${showFileBank ? "hsl(var(--primary) / 0.3)" : "hsl(var(--border) / 0.5)"}`,
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.15)" }}>
                <BookOpen size={14} style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div className="flex-1 text-left">
                <span className="text-xs font-bold text-foreground">Banco de archivos NYX</span>
                <span className="text-[10px] ml-2" style={{ color: "hsl(var(--muted-foreground))" }}>{mockGeneratedDocs.length} documentos</span>
              </div>
              <ChevronDown size={14} style={{ color: "hsl(var(--muted-foreground))", transform: showFileBank ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
            </button>

            {showFileBank && (
              <div className="mt-1 rounded-xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.5)" }}>
                <div className="max-h-44 overflow-y-auto">
                  {mockGeneratedDocs.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => { setActiveDoc(doc); setShowFileBank(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
                      style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)", background: activeDoc?.id === doc.id ? "hsl(var(--primary) / 0.06)" : "transparent" }}
                      onMouseEnter={e => { if (activeDoc?.id !== doc.id) (e.currentTarget as HTMLElement).style.background = "hsl(var(--secondary) / 0.5)"; }}
                      onMouseLeave={e => { if (activeDoc?.id !== doc.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <FileText size={14} style={{ color: `hsl(${areaColors[doc.area] || "var(--primary)"})`, flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{doc.date}</span>
                          <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{doc.pages} págs</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `hsl(${areaColors[doc.area] || "var(--primary)"} / 0.12)`, color: `hsl(${areaColors[doc.area] || "var(--primary)"})` }}>{doc.type}</span>
                      {activeDoc?.id === doc.id && <Check size={12} style={{ color: "hsl(var(--primary))" }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className={`flex-1 min-h-0 flex flex-col ${isClassic ? "notepad-card" : "glass-card"} rounded-xl overflow-hidden`}>
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b flex-wrap" style={{ borderColor: "hsl(var(--border))" }}>
              <ToolBtn icon={Bold} label="Negrita" onClick={() => execCmd("bold")} />
              <ToolBtn icon={Italic} label="Cursiva" onClick={() => execCmd("italic")} />
              <ToolBtn icon={Underline} label="Subrayado" onClick={() => execCmd("underline")} />
              <ToolSep />
              <ToolBtn icon={Heading1} label="Título 1" onClick={() => execCmd("formatBlock", "h1")} />
              <ToolBtn icon={Heading2} label="Título 2" onClick={() => execCmd("formatBlock", "h2")} />
              <ToolSep />
              <ToolBtn icon={List} label="Lista" onClick={() => execCmd("insertUnorderedList")} />
              <ToolBtn icon={ListOrdered} label="Lista numerada" onClick={() => execCmd("insertOrderedList")} />
              <ToolSep />
              <ToolBtn icon={AlignLeft} label="Izquierda" onClick={() => execCmd("justifyLeft")} />
              <ToolBtn icon={AlignCenter} label="Centrar" onClick={() => execCmd("justifyCenter")} />
              <ToolBtn icon={AlignRight} label="Derecha" onClick={() => execCmd("justifyRight")} />

              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--primary) / 0.5)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border))"; }}>
                  <Printer size={12} /> Imprimir
                </button>
                <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--primary) / 0.5)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border))"; }}>
                  <Download size={12} /> PDF
                </button>
                <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                  <Save size={12} /> Guardar en NYX
                </button>
              </div>
            </div>

            {activeDoc && (
              <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: "hsl(var(--border) / 0.5)", background: "hsl(var(--secondary) / 0.3)" }}>
                <FileText size={12} style={{ color: "hsl(var(--primary))" }} />
                <span className="text-xs font-semibold text-foreground truncate">{activeDoc.title}</span>
                <span className="text-[10px] ml-auto" style={{ color: "hsl(var(--muted-foreground))" }}>{activeDoc.pages} págs · {activeDoc.date}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="p-6 min-h-full text-sm leading-relaxed focus:outline-none prose prose-sm max-w-none"
                style={{ color: "hsl(var(--foreground))", fontFamily: isClassic ? "'Source Serif Pro', Georgia, serif" : "inherit" }}
                dangerouslySetInnerHTML={{ __html: editorContent }}
                onInput={e => setEditorContent((e.target as HTMLDivElement).innerHTML)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: AI Actions + Revisión tabs */}
        <div className={`hidden lg:flex w-64 xl:w-72 shrink-0 flex-col glass-card ${theme === "dark" ? "nexus-ai-alive" : ""} rounded-xl overflow-hidden`}>
          {/* Tab bar */}
          <div className="flex border-b" style={{ borderColor: "hsl(var(--border))" }}>
            <button
              onClick={() => setRightTab("acciones")}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold transition-all"
              style={{
                color: rightTab === "acciones" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                borderBottom: rightTab === "acciones" ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                background: rightTab === "acciones" ? "hsl(var(--primary) / 0.06)" : "transparent",
              }}
            >
              <Sparkles size={13} /> Acciones de IA
            </button>
            <button
              onClick={() => setRightTab("revision")}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold transition-all"
              style={{
                color: rightTab === "revision" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                borderBottom: rightTab === "revision" ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                background: rightTab === "revision" ? "hsl(var(--primary) / 0.06)" : "transparent",
              }}
            >
              <ClipboardCheck size={13} /> Revisión
            </button>
          </div>

          {/* Acciones tab */}
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

          {/* Revisión tab */}
          {rightTab === "revision" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Summary header */}
              <div className="p-3 rounded-xl" style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.2)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={14} style={{ color: "hsl(var(--primary))" }} />
                  <span className="text-xs font-bold text-foreground">Resumen de Revisión</span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Análisis automático del documento actual con observaciones y sugerencias de mejora.
                </p>
              </div>

              {/* Score */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border) / 0.4)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, hsl(150 90% 45%), hsl(170 90% 48%))", color: "white" }}>
                  82
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Calidad general</p>
                  <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>Buena — 3 mejoras sugeridas</p>
                </div>
              </div>

              {/* Observations */}
              <div>
                <h4 className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={12} style={{ color: "hsl(45 100% 55%)" }} /> Observaciones
                </h4>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg" style={{ background: "hsl(45 100% 55% / 0.08)", border: "1px solid hsl(45 100% 55% / 0.2)" }}>
                    <p className="text-[11px] font-semibold" style={{ color: "hsl(45 80% 40%)" }}>Falta de referencia normativa</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>El Hecho Segundo no cita la normativa específica que respalda el incumplimiento alegado.</p>
                  </div>
                  <div className="p-2.5 rounded-lg" style={{ background: "hsl(45 100% 55% / 0.08)", border: "1px solid hsl(45 100% 55% / 0.2)" }}>
                    <p className="text-[11px] font-semibold" style={{ color: "hsl(45 80% 40%)" }}>Petitum genérico</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>La solicitud de "daños y perjuicios" debería cuantificarse o fundamentarse con prueba pericial.</p>
                  </div>
                </div>
              </div>

              {/* Improvements */}
              <div>
                <h4 className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={12} style={{ color: "hsl(150 90% 45%)" }} /> Mejoras sugeridas
                </h4>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg" style={{ background: "hsl(150 90% 45% / 0.08)", border: "1px solid hsl(150 90% 45% / 0.2)" }}>
                    <p className="text-[11px] font-semibold" style={{ color: "hsl(150 70% 35%)" }}>Añadir jurisprudencia reciente</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Incluir STS 463/2019 sobre resolución contractual por incumplimiento esencial.</p>
                  </div>
                  <div className="p-2.5 rounded-lg" style={{ background: "hsl(150 90% 45% / 0.08)", border: "1px solid hsl(150 90% 45% / 0.2)" }}>
                    <p className="text-[11px] font-semibold" style={{ color: "hsl(150 70% 35%)" }}>Reforzar el Otrosí</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Solicitar medida cautelar de anotación preventiva de demanda (art. 42.1 LH).</p>
                  </div>
                  <div className="p-2.5 rounded-lg" style={{ background: "hsl(150 90% 45% / 0.08)", border: "1px solid hsl(150 90% 45% / 0.2)" }}>
                    <p className="text-[11px] font-semibold" style={{ color: "hsl(150 70% 35%)" }}>Cuantificar daños</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Desglosar el importe reclamado: precio pagado, intereses legales y daño moral estimado.</p>
                  </div>
                </div>
              </div>

              {/* Info note */}
              <div className="p-2.5 rounded-lg flex items-start gap-2" style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border) / 0.4)" }}>
                <Info size={12} className="shrink-0 mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }} />
                <p className="text-[10px] leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Esta revisión es generada automáticamente por IA. Verifique siempre las sugerencias con la normativa vigente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}