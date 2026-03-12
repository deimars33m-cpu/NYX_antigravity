import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Archive, Upload, Search, Grid, List, FileText, File, Download, Eye, Sparkles } from "lucide-react";
import { LawBadge, LawType } from "@/components/LawBadge";

interface Doc { id: number; name: string; type: string; size: string; case: string; caseType: LawType; modified: string; version: number; }

const documents: Doc[] = [
  { id: 1, name: "Demanda_Garcia_vs_Norte.pdf", type: "PDF", size: "245 KB", case: "EXP-2024-001", caseType: "civil", modified: "Hoy, 10:30", version: 3 },
  { id: 2, name: "Contrato_TechCorp_v2.docx", type: "DOCX", size: "128 KB", case: "EXP-2024-004", caseType: "mercantil", modified: "Ayer, 16:45", version: 2 },
  { id: 3, name: "Sentencia_Primera_Instancia.pdf", type: "PDF", size: "890 KB", case: "EXP-2024-002", caseType: "penal", modified: "3 Mar, 09:00", version: 1 },
  { id: 4, name: "Informe_Pericial_Laboral.pdf", type: "PDF", size: "1.2 MB", case: "EXP-2024-003", caseType: "laboral", modified: "2 Mar, 14:20", version: 1 },
  { id: 5, name: "Poderes_Notariales_Rodriguez.pdf", type: "PDF", size: "445 KB", case: "EXP-2024-005", caseType: "familia", modified: "1 Mar, 11:00", version: 1 },
  { id: 6, name: "Recurso_Apelacion_Borrador.docx", type: "DOCX", size: "87 KB", case: "EXP-2024-001", caseType: "civil", modified: "28 Feb, 17:30", version: 4 },
  { id: 7, name: "Declaracion_IVA_2023.xlsx", type: "XLSX", size: "234 KB", case: "EXP-2024-006", caseType: "fiscal", modified: "27 Feb, 09:15", version: 2 },
  { id: 8, name: "Contrato_Arrendamiento.pdf", type: "PDF", size: "312 KB", case: "EXP-2024-001", caseType: "civil", modified: "25 Feb, 12:00", version: 1 },
];

const typeIcon: Record<string, string> = { PDF: "🔴", DOCX: "🔵", XLSX: "🟢", IMG: "🟡" };
const typeColor: Record<string, string> = { PDF: "hsl(0 72% 55%)", DOCX: "hsl(217 91% 60%)", XLSX: "hsl(142 70% 48%)", IMG: "hsl(38 92% 55%)" };

export default function Documents() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");
  const filtered = documents.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.case.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground font-display">Gestión Documental</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{documents.length} documentos · 4.8 GB usados</p>
        </div>
        <button className="btn-primary flex items-center gap-2"><Upload size={16} /> Subir Documento</button>
      </div>

      {/* Storage */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-foreground font-medium">Almacenamiento</span>
          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>4.8 GB / 50 GB</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: "hsl(var(--border))" }}>
          <div className="h-full rounded-full" style={{ width: "9.6%", background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }} />
        </div>
        <div className="flex gap-4 mt-3">
          {[{ label: "PDF", pct: 65, color: typeColor.PDF }, { label: "DOCX", pct: 20, color: typeColor.DOCX }, { label: "XLSX", pct: 10, color: typeColor.XLSX }, { label: "Otros", pct: 5, color: "hsl(var(--muted-foreground))" }].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              {s.label} {s.pct}%
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documentos, expedientes..." className="w-full pl-8 pr-3 py-2 rounded-lg text-sm" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", outline: "none" }} />
        </div>
        <div className="flex" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}>
          <button onClick={() => setView("list")} className="p-2 rounded-lg transition-all" style={{ background: view === "list" ? "hsl(var(--primary) / 0.2)" : "transparent", color: view === "list" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}><List size={16} /></button>
          <button onClick={() => setView("grid")} className="p-2 rounded-lg transition-all" style={{ background: view === "grid" ? "hsl(var(--primary) / 0.2)" : "transparent", color: view === "grid" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}><Grid size={16} /></button>
        </div>
      </div>

      {view === "list" ? (
        isClassic ? (
          <div className="classic-container">
            <div className="classic-container-header">
              <Archive size={14} style={{ color: "hsl(4 75% 38%)" }} />
              <h3>Documentos del Bufete</h3>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "hsl(38 80% 55% / 0.15)", color: "hsl(38 80% 45%)" }}>{filtered.length}</span>
            </div>
            <div className="p-3 space-y-2">
              {filtered.map((d, i) => (
                <div key={d.id} className="paper-item flex items-center gap-3" style={{ borderLeftColor: typeColor[d.type] || "hsl(4 75% 38%)" }}>
                  <span className="text-lg">{typeIcon[d.type] || "📄"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "hsl(25 40% 16%)" }}>{d.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono font-bold" style={{ color: "hsl(4 75% 38%)" }}>{d.case}</span>
                      <LawBadge type={d.caseType} />
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${typeColor[d.type]}20`, color: typeColor[d.type] }}>{d.type}</span>
                  <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>v{d.version}</span>
                  <div className="flex gap-1">
                    <button onClick={() => navigate("/ai-docs")} className="p-1 rounded hover:opacity-70" title="Analizar con IA" style={{ color: "hsl(var(--primary))" }}><Sparkles size={13} /></button>
                    <button className="p-1 rounded hover:opacity-70" style={{ color: "hsl(var(--muted-foreground))" }}><Eye size={13} /></button>
                    <button className="p-1 rounded hover:opacity-70" style={{ color: "hsl(var(--muted-foreground))" }}><Download size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "hsl(var(--secondary) / 0.5)", borderBottom: "1px solid hsl(var(--border))" }}>
                {["Nombre", "Expediente", "Tipo", "Versión", "Modificado", ""].map(h => (
                  <th key={h} className="py-3 px-4 text-left font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id} className="table-row-hover" style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)", animationDelay: `${i * 40}ms` }}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span>{typeIcon[d.type] || "📄"}</span>
                      <span className="font-medium text-foreground truncate max-w-48">{d.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono" style={{ color: "hsl(var(--primary))" }}>{d.case}</span>
                      <LawBadge type={d.caseType} />
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: `${typeColor[d.type]}20`, color: typeColor[d.type] }}>{d.type}</span></td>
                  <td className="py-3 px-4" style={{ color: "hsl(var(--muted-foreground))" }}>v{d.version}</td>
                  <td className="py-3 px-4" style={{ color: "hsl(var(--muted-foreground))" }}>{d.modified}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => navigate("/ai-docs")} className="p-1 rounded hover:text-primary" title="Analizar con IA" style={{ color: "hsl(var(--primary))" }}><Sparkles size={13} /></button>
                      <button className="p-1 rounded hover:text-primary" style={{ color: "hsl(var(--muted-foreground))" }}><Eye size={13} /></button>
                      <button className="p-1 rounded hover:text-primary" style={{ color: "hsl(var(--muted-foreground))" }}><Download size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((d, i) => (
            <div key={d.id} className="glass-card rounded-xl p-4 cursor-pointer animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="text-3xl mb-3">{typeIcon[d.type] || "📄"}</div>
              <p className="text-xs font-semibold text-foreground truncate mb-1">{d.name}</p>
              <p className="text-[10px] font-mono mb-2" style={{ color: "hsl(var(--primary))" }}>{d.case}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{d.size}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${typeColor[d.type]}20`, color: typeColor[d.type] }}>v{d.version}</span>
              </div>
              <button onClick={() => navigate("/ai-docs")}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80"
                style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.3)", color: "hsl(var(--primary))" }}>
                <Sparkles size={10} /> Analizar con IA
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
