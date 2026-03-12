import { TrendingUp, Clock, Users, Award, Download } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import KpiCard from "@/components/KpiCard";
import { LawBadge, LawType } from "@/components/LawBadge";

const kpis = [
  { title: "Casos Resueltos (Mes)", value: "18", icon: Award, accent: "hsl(142 70% 48%)", trend: { value: "15%", up: true } },
  { title: "Tiempo Medio Resolución", value: "4.2 meses", icon: Clock, accent: "hsl(217 91% 60%)", trend: { value: "0.5 meses", up: true } },
  { title: "Tasa de Éxito", value: "87%", icon: TrendingUp, accent: "hsl(38 92% 55%)", trend: { value: "3%", up: true } },
  { title: "Nuevos Clientes", value: "12", icon: Users, accent: "hsl(271 77% 62%)", trend: { value: "20%", up: true } },
];

const casesByType: Array<{ type: LawType; count: number; pct: number }> = [
  { type: "civil", count: 18, pct: 37 },
  { type: "laboral", count: 12, pct: 25 },
  { type: "mercantil", count: 9, pct: 19 },
  { type: "penal", count: 5, pct: 10 },
  { type: "familia", count: 3, pct: 6 },
  { type: "fiscal", count: 2, pct: 4 },
];

const typeColors: Record<LawType, string> = {
  civil: "hsl(217 91% 60%)", penal: "hsl(0 72% 55%)", laboral: "hsl(38 92% 55%)",
  mercantil: "hsl(142 70% 48%)", administrativo: "hsl(271 77% 62%)", familia: "hsl(330 80% 58%)", fiscal: "hsl(199 89% 55%)",
};

const monthlyData = [
  { month: "Sep", cases: 14, revenue: 28 },
  { month: "Oct", cases: 18, revenue: 36 },
  { month: "Nov", cases: 12, revenue: 24 },
  { month: "Dic", cases: 22, revenue: 44 },
  { month: "Ene", cases: 19, revenue: 38 },
  { month: "Feb", cases: 25, revenue: 50 },
];

const maxCases = Math.max(...monthlyData.map(d => d.cases));
const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

const lawyers = [
  { name: "Ana Rodríguez", cases: 18, success: 92, hours: 142 },
  { name: "Carlos López", cases: 15, success: 80, hours: 128 },
  { name: "María Torres", cases: 13, success: 88, hours: 115 },
];

export default function Reports() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground font-display">Reportes & Analytics</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Datos en tiempo real · Febrero 2025</p>
        </div>
        <button className="btn-primary flex items-center gap-2"><Download size={16} /> Exportar Reporte</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => <KpiCard key={k.title} {...k} delay={i * 80} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly chart */}
        <div className={`lg:col-span-2 ${isClassic ? "classic-container" : "glass-card rounded-xl"} p-5`}>
          <div className="section-header">
            <h3 className="text-sm font-semibold text-foreground">Casos & Ingresos Mensuales</h3>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}><div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--primary))" }} /> Casos</span>
              <span className="flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}><div className="w-2 h-2 rounded-full" style={{ background: "hsl(142 70% 48%)" }} /> Ingresos (K€)</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-36 mt-4">
            {monthlyData.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end">
                  <div className="flex-1 rounded-t-md transition-all duration-700" style={{ height: `${(d.cases / maxCases) * 100}%`, minHeight: "8px", background: "hsl(var(--primary) / 0.7)" }} />
                  <div className="flex-1 rounded-t-md transition-all duration-700" style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: "8px", background: "hsl(142 70% 48% / 0.7)" }} />
                </div>
                <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By type */}
        <div className={`${isClassic ? "classic-container" : "glass-card rounded-xl"} p-5`}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Casos por Área Legal</h3>
          <div className="space-y-3">
            {casesByType.map((c) => (
              <div key={c.type}>
                <div className="flex items-center justify-between mb-1">
                  <LawBadge type={c.type} />
                  <span className="text-xs font-semibold text-foreground">{c.count} ({c.pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "hsl(var(--border))" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.pct}%`, background: typeColors[c.type] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team performance */}
      <div className={`${isClassic ? "classic-container" : "glass-card rounded-xl"} p-5`}>
        <h3 className="text-sm font-semibold text-foreground mb-4">Rendimiento del Equipo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lawyers.map((l, i) => (
            <div key={l.name} className="p-4 rounded-xl hover-glow animate-fade-in-up" style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border) / 0.4)", animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", color: "white" }}>
                  {l.name.split(" ").map(n => n[0]).join("")}
                </div>
                <p className="text-sm font-semibold text-foreground">{l.name}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Casos", value: l.cases },
                  { label: "Éxito", value: `${l.success}%` },
                  { label: "Horas", value: `${l.hours}h` },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-base font-bold font-display" style={{ color: "hsl(var(--primary))" }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
