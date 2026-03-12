import { useState } from "react";
import { Search, Sparkles, Star, ExternalLink, TrendingUp } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { LawBadge, LawType } from "@/components/LawBadge";

const jurisprudence = [
  { id: "STS 1234/2024", title: "Responsabilidad civil extracontractual – Daños y perjuicios", court: "Tribunal Supremo", date: "15 Ene 2024", type: "civil" as LawType, relevance: 98, summary: "Establece doctrina sobre el nexo causal en accidentes de tráfico con concurrencia de culpas." },
  { id: "SAN 567/2024", title: "Despido improcedente – Cálculo indemnización", court: "Audiencia Nacional", date: "8 Feb 2024", type: "laboral" as LawType, relevance: 95, summary: "Fija criterios para el cálculo de indemnización cuando existe duda sobre la fecha de inicio." },
  { id: "SAP 890/2023", title: "Nulidad cláusula suelo hipotecaria", court: "Audiencia Provincial", date: "20 Nov 2023", type: "civil" as LawType, relevance: 92, summary: "Confirma la nulidad de cláusulas suelo por falta de transparencia en la información precontractual." },
  { id: "STS 321/2024", title: "Fraude fiscal – Elementos del tipo", court: "Tribunal Supremo", date: "3 Mar 2024", type: "fiscal" as LawType, relevance: 88, summary: "Delimita los elementos objetivos y subjetivos del tipo penal tributario." },
  { id: "STJUE 2024/45", title: "Competencia empresas digitales – Derecho comunitario", court: "Tribunal UE", date: "28 Feb 2024", type: "mercantil" as LawType, relevance: 85, summary: "Interpreta la aplicación del reglamento DMA a plataformas con posición dominante." },
];

const aiAnalysis = "La jurisprudencia reciente del Tribunal Supremo muestra una tendencia clara hacia la protección del consumidor en contratos bancarios. Se recomienda citar las STS 1234/2024 y STS 890/2023 como precedentes directamente aplicables al caso García vs. Constructora Norte.";

export default function Library() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  const [search, setSearch] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const filtered = jurisprudence.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.court.toLowerCase().includes(search.toLowerCase())
  );

  const handleAnalyze = () => {
    if (!aiQuery) return;
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setShowAnalysis(true); }, 1800);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground font-display">Biblioteca Jurídica & Jurisprudencia</h2>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Búsqueda inteligente con IA · +50.000 sentencias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Search + results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-xl p-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--primary))" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar jurisprudencia, sentencias, tribunal..." className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", outline: "none" }} />
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {["Todas", "Civil", "Penal", "Laboral", "Fiscal", "Mercantil"].map(f => (
                <button key={f} className="px-2.5 py-1 rounded-lg text-xs transition-all" style={{ background: f === "Todas" ? "hsl(var(--primary) / 0.2)" : "hsl(var(--secondary))", color: f === "Todas" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", border: `1px solid ${f === "Todas" ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border))"}` }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((j, i) => (
              <div key={j.id} className={`${isClassic ? "paper-item" : "glass-card rounded-xl p-4"} cursor-pointer animate-fade-in-up`} style={{ animationDelay: `${i * 60}ms`, ...(isClassic ? { borderLeftColor: "hsl(var(--law-" + j.type + "))" } : {}) }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-xs font-mono font-semibold" style={{ color: "hsl(var(--primary))" }}>{j.id}</span>
                      <LawBadge type={j.type} />
                      <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{j.court}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">{j.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{j.summary}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp size={12} style={{ color: "hsl(142 70% 48%)" }} />
                      <span className="text-xs font-bold" style={{ color: "hsl(142 70% 55%)" }}>{j.relevance}%</span>
                    </div>
                    <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{j.date}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
                    <Star size={10} /> Guardar
                  </button>
                  <button className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
                    <ExternalLink size={10} /> Ver completa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI panel */}
        <div className={`${isClassic ? "classic-container" : "glass-card rounded-xl"} p-5 h-fit`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: "hsl(var(--accent))" }} />
            <h3 className="text-sm font-semibold text-foreground">Análisis IA de Precedentes</h3>
          </div>
          <textarea rows={4} value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder="Describe tu caso para encontrar jurisprudencia relevante y análisis de precedentes..." className="w-full px-3 py-2 rounded-lg text-sm resize-none mb-3" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", outline: "none" }} />
          <button onClick={handleAnalyze} className="btn-primary w-full flex items-center justify-center gap-2 mb-4" disabled={analyzing}>
            {analyzing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analizando...</> : <><Sparkles size={14} /> Analizar con IA</>}
          </button>

          {showAnalysis && (
            <div className="p-3 rounded-lg animate-fade-in" style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.2)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "hsl(var(--primary))" }}>Análisis IA</p>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--foreground))" }}>{aiAnalysis}</p>
              <div className="flex gap-2 mt-3">
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "hsl(142 70% 48% / 0.15)", color: "hsl(142 70% 55%)" }}>Confianza: 94%</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>3 precedentes</span>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-foreground">Búsquedas recientes</p>
            {["Cláusula suelo nulidad", "Despido improcedente 2024", "Nexo causal accidente"].map(q => (
              <button key={q} className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all" style={{ background: "hsl(var(--secondary) / 0.5)", color: "hsl(var(--muted-foreground))" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--foreground))"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--muted-foreground))"; }}>
                <Search size={10} className="inline mr-1.5" />{q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
