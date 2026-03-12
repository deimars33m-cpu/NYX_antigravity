import { FolderOpen, Users, AlertTriangle, Clock, CheckSquare, Scale, ArrowRight } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import { LawBadge, LawType } from "@/components/LawBadge";
import { useTheme } from "@/context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";

const priorityColor: Record<string, string> = {
  urgente: "hsl(0 72% 55%)", alta: "hsl(38 92% 55%)", media: "hsl(217 91% 60%)", baja: "hsl(142 70% 48%)",
  Urgente: "hsl(0 72% 55%)", Alta: "hsl(38 92% 55%)", Media: "hsl(217 91% 60%)", Baja: "hsl(142 70% 48%)",
};

export default function Dashboard() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";

  /** 1. Fetch Active Cases KPI */
  const { data: activeCasesCount = 0 } = useQuery({
    queryKey: ["active-cases-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .neq("status", "cerrado");
      if (error) throw error;
      return count || 0;
    },
  });

  /** 2. Fetch Total Clients KPI */
  const { data: totalClientsCount = 0 } = useQuery({
    queryKey: ["total-clients-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  /** 3. Fetch Pending Tasks KPI */
  const { data: pendingTasksCount = 0 } = useQuery({
    queryKey: ["pending-tasks-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .neq("status", "completada");
      if (error) throw error;
      return count || 0;
    },
  });

  /** 4. Recent Cases Table */
  const { data: recentCases = [] } = useQuery({
    queryKey: ["recent-cases-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, case_number, title, legal_area, status, deadline_at, priority")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data.map(c => ({
        id: c.case_number,
        title: c.title,
        type: c.legal_area as LawType,
        status: c.status,
        deadline: c.deadline_at ? format(new Date(c.deadline_at), "dd MMM") : "TBD",
        priority: c.priority
      }));
    },
  });

  const kpis = [
    { title: "Casos Activos", value: activeCasesCount.toString(), subtitle: "Registrados en sistema", icon: FolderOpen, accent: "hsl(217 91% 60%)", trend: { value: "Live", up: true } },
    { title: "Clientes Totales", value: totalClientsCount.toString(), subtitle: "Base de contactos", icon: Users, accent: "hsl(142 70% 48%)", trend: { value: "Live", up: true } },
    { title: "Plazos Próximos", value: "0", subtitle: "Próximos 5 días", icon: AlertTriangle, accent: "hsl(38 92% 55%)", trend: { value: "--", up: false } },
    { title: "Tareas Pendientes", value: pendingTasksCount.toString(), subtitle: "Por completar", icon: CheckSquare, accent: "hsl(271 77% 62%)", trend: { value: "Live", up: false } },
    { title: "Seguimiento", value: "--", subtitle: "Actividad real", icon: Clock, accent: "hsl(199 89% 55%)", trend: { value: "--", up: true } },
  ];

  const alerts = [
    { text: "Sistema conectado a Supabase", time: "Ahora", color: "hsl(142 70% 48%)" },
    { text: "Recuerda ejecutar el Seed Script", time: "Pendiente", color: "hsl(38 92% 55%)" },
  ];

  // Helper: notepad card style for classic theme
  const notePadStyle = isClassic ? {
    background: "hsl(0 0% 99%)",
    border: "1px solid hsl(32 25% 72%)",
    borderRadius: "4px",
    boxShadow: "3px 4px 14px hsl(25 40% 18% / 0.14)",
    position: "relative" as const,
    overflow: "hidden" as const,
  } : undefined;

  const cardClass = isClassic ? "" : "glass-card rounded-xl";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold text-foreground"
            style={isClassic ? { fontFamily: "'Playfair Display', Georgia, serif", color: "hsl(25 40% 16%)" } : {}}
          >
            {isClassic ? "Buenos Días, " : "Bienvenido, "}
            <span className={isClassic ? "" : "gradient-text"} style={isClassic ? { color: "hsl(4 75% 38%)" } : {}}>
              Admin
            </span>
          </h2>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            {isClassic ? "— Aquí está el expediente del día —" : "Aquí está el resumen de hoy"}
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Scale size={16} /> Nuevo Caso
        </button>
      </div>

      {/* KPIs – sticky notes in classic */}
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 ${isClassic ? "gap-6" : "gap-4"}`}>
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.title} {...kpi} delay={i * 80} stickyIndex={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases – notepad card in classic */}
        <div className="lg:col-span-2" style={{ position: "relative" }}>
          {isClassic ? (
            <div className="paper-texture paper-ruled border border-[hsl(32,25%,72%)] rounded shadow-lg p-8 pl-16 pt-12 min-h-[400px]">
              <div className="paper-clip" style={{ left: '15%' }} />
              <div className="paper-clip" style={{ left: '25%' }} />

              {/* Red margin */}
              <div style={{
                position: "absolute", top: 0, bottom: 0, left: 52,
                width: "1px", borderLeft: "2px double hsl(4 75% 62% / 0.4)",
                pointerEvents: "none", zIndex: 1
              }} />

              <div style={{ position: "relative", zIndex: 2 }}>
                <div className="section-header border-b border-[hsl(32,25%,78%)] pb-4 mb-6">
                  <div className="flex flex-col">
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.25rem", fontWeight: 700, color: "hsl(25 40% 16%)" }}>
                      Expedientes Recientes
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest text-[#25203266]">Registro Diario / NyxLex</span>
                  </div>
                  <div className="office-stamp border-[#4a251066] text-[#4a251066] text-[10px] scale-75">ARCHIVADO</div>
                </div>

                <div className="space-y-4">
                  {recentCases.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-4 py-3 group cursor-pointer border-b border-[hsl(32,25%,85%) / 0.5] hover:bg-[hsl(38,40%,96%)] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[11px] font-mono bg-[hsl(38,25%,85%)] px-1.5 py-0.5 rounded" style={{ color: "hsl(25 20% 40%)" }}>{c.id}</span>
                          <LawBadge type={c.type} />
                        </div>
                        <p className="text-base font-medium" style={{ color: "hsl(25 40% 20%)", fontFamily: "'Lora', Georgia, serif" }}>{c.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold uppercase tracking-tighter" style={{ color: priorityColor[c.priority] }}>{c.priority}</p>
                        <p className="text-[11px] font-medium" style={{ color: "hsl(25 20% 50%)" }}>Vence: {c.deadline}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex justify-between items-center opacity-40 grayscale">
                  <span className="text-[10px] font-mono">NYXLEX-FORM-002A</span>
                  <button className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity">
                    Ver Archivo General <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`${cardClass} p-5`}>
              <div className="section-header">
                <h3 className="text-sm font-semibold text-foreground">Casos Recientes</h3>
                <button className="btn-ghost flex items-center gap-1 text-xs">Ver todos <ArrowRight size={12} /></button>
              </div>
              <div className="space-y-2">
                {recentCases.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 table-row-hover"
                    style={{ border: "1px solid hsl(var(--border) / 0.3)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>{c.id}</span>
                        <LawBadge type={c.type} />
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold" style={{ color: priorityColor[c.priority] }}>{c.priority}</p>
                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{c.deadline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Alerts & Workload */}
        <div className="space-y-6">
          {/* Alerts card */}
          {isClassic ? (
            <div className="paper-texture paper-grid border border-[hsl(32,25%,70%)] rounded shadow p-5 min-h-[280px]">
              <div className="paper-clip" style={{ left: '20%' }} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <div className="flex items-center justify-between mb-4 border-b border-[hsl(32,25%,80%)] pb-2">
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "14px", fontWeight: 700, color: "hsl(4 75% 38%)" }}>
                    NOTAS URGENTES
                  </h3>
                  <div className="office-stamp border-[hsl(0,75%,45%)] text-[hsl(0,75%,45%)] text-[8px] rotate-[5deg]">PRIORIDAD A1</div>
                </div>
                <div className="space-y-4">
                  {alerts.map((a, i) => (
                    <div key={i} className="paper-texture bg-[hsl(38,40%,98%)] p-3 shadow-sm border-l-4" style={{ borderColor: a.color }}>
                      <p className="text-[13px] leading-snug font-medium" style={{ color: "hsl(25 35% 20%)", fontFamily: "'Lora', Georgia, serif" }}>{a.text}</p>
                      <p className="text-[10px] mt-1.5 font-mono italic" style={{ color: "hsl(25 20% 50%)" }}>{a.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={`${cardClass} p-5`}>
              <div className="section-header">
                <h3 className="text-sm font-semibold text-foreground">Alertas Críticas</h3>
                <AlertTriangle size={14} style={{ color: "hsl(38 92% 55%)" }} />
              </div>
              <div className="space-y-3">
                {alerts.map((a, i) => (
                  <div key={i} className="flex gap-3 items-start p-2 rounded-lg" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.color }} />
                    <div>
                      <p className="text-xs text-foreground leading-relaxed">{a.text}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workload card */}
          {isClassic ? (
            <div className="paper-texture paper-grid border border-[hsl(32,25%,70%)] rounded shadow p-5 min-h-[280px]">
              <div className="paper-clip" style={{ left: '40%' }} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <h3 className="border-b border-[hsl(32,25%,80%)] pb-2 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "14px", fontWeight: 700, color: "hsl(25 40% 16%)" }}>Personal de Oficina</h3>
                <div className="space-y-5">
                  {[
                    { name: "Ana García", load: 85, color: "hsl(4 75% 38%)" },
                    { name: "Carlos López", load: 60, color: "hsl(38 80% 42%)" },
                    { name: "María Torres", load: 40, color: "hsl(142 45% 38%)" },
                  ].map((m) => (
                    <div key={m.name}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold" style={{ color: "hsl(25 35% 22%)", fontFamily: "'Lora', Georgia, serif" }}>{m.name}</span>
                        <span className="text-[10px] font-bold font-mono px-1 bg-[hsl(32,25%,82%)]" style={{ color: m.color }}>{m.load}%</span>
                      </div>
                      <div className="h-2 border border-[hsl(32,25%,70%)] p-[1px]" style={{ background: "transparent" }}>
                        <div className="h-full transition-all" style={{ width: `${m.load}%`, background: m.color, opacity: 0.8 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-2 right-2 office-stamp border-[#25203233] text-[#25203233] text-[8px] -rotate-45">REPORTE SEMANAL</div>
              </div>
            </div>
          ) : (
            <div className={`${cardClass} p-5`}>
              <h3 className="text-sm font-semibold text-foreground mb-3">Carga de Trabajo</h3>
              {[
                { name: "Ana García", load: 85, color: "hsl(0 72% 55%)" },
                { name: "Carlos López", load: 60, color: "hsl(38 92% 55%)" },
                { name: "María Torres", load: 40, color: "hsl(142 70% 48%)" },
              ].map((m) => (
                <div key={m.name} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-foreground">{m.name}</span>
                    <span className="text-xs font-semibold" style={{ color: m.color }}>{m.load}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "hsl(var(--border))" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${m.load}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
