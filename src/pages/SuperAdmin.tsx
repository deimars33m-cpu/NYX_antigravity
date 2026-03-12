import { TrendingUp, DollarSign, Users, Building2, Plus, Eye } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import { useTheme } from "@/context/ThemeContext";

const kpis = [
  { title: "Ingresos Totales", value: "$142K", subtitle: "Este mes", icon: DollarSign, accent: "hsl(142 70% 48%)", trend: { value: "22%", up: true } },
  { title: "Bufetes Activos", value: "34", subtitle: "2 nuevos", icon: Building2, accent: "hsl(217 91% 60%)", trend: { value: "6%", up: true } },
  { title: "Usuarios Totales", value: "281", subtitle: "Abogados activos", icon: Users, accent: "hsl(199 89% 55%)", trend: { value: "14%", up: true } },
  { title: "MRR", value: "$38K", subtitle: "Recurrente mensual", icon: TrendingUp, accent: "hsl(271 77% 62%)", trend: { value: "8%", up: true } },
];

const firms = [
  { name: "Bufete Rodríguez & Asociados", plan: "Enterprise", users: 24, revenue: "$4,200", status: "Activo" },
  { name: "Despacho Jurídico Martínez", plan: "Pro", users: 8, revenue: "$1,600", status: "Activo" },
  { name: "López Legal Group", plan: "Pro", users: 12, revenue: "$2,400", status: "Activo" },
  { name: "Estudio Jurídico Torres", plan: "Starter", users: 3, revenue: "$300", status: "Trial" },
  { name: "Asesoría García & Partners", plan: "Enterprise", users: 31, revenue: "$6,200", status: "Activo" },
];

const plans = [
  { name: "Starter", price: "$99/mes", features: ["5 usuarios", "50 casos", "IA básica"], color: "hsl(142 70% 48%)" },
  { name: "Pro", price: "$199/mes", features: ["15 usuarios", "Casos ilimitados", "IA avanzada", "Reportes"], color: "hsl(217 91% 60%)" },
  { name: "Enterprise", name2: "Enterprise", price: "Custom", features: ["Usuarios ilimitados", "White-label", "API acceso", "SLA 99.9%"], color: "hsl(271 77% 62%)" },
];

const planColor: Record<string, string> = {
  Enterprise: "hsl(271 77% 62%)", Pro: "hsl(217 91% 60%)", Starter: "hsl(142 70% 48%)", Trial: "hsl(38 92% 55%)",
};

export default function SuperAdmin() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";

  const notePadStyle = isClassic ? {
    background: "hsl(0 0% 99%)",
    border: "1px solid hsl(32 25% 72%)",
    borderRadius: "4px",
    boxShadow: "3px 4px 14px hsl(25 40% 18% / 0.14)",
    position: "relative" as const,
    overflow: "hidden" as const,
  } : undefined;

  const cardClass = isClassic ? "" : "glass-card rounded-xl";

  const ruledLines = (
    <>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, hsl(210 50% 78% / 0.45) 27px, hsl(210 50% 78% / 0.45) 28px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 0, bottom: 0, left: 44,
        width: "1px", background: "hsl(4 75% 62% / 0.45)",
        pointerEvents: "none",
      }} />
    </>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground font-display"
              style={isClassic ? { fontFamily: "'Playfair Display', Georgia, serif", color: "hsl(25 40% 16%)" } : {}}>
              Panel Super Admin
            </h2>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Control global de la plataforma</p>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2"><Plus size={16} /> Nuevo Bufete</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => <KpiCard key={k.title} {...k} delay={i * 80} stickyIndex={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Firms table */}
        <div className="lg:col-span-2">
          {isClassic ? (
            <div style={notePadStyle} className="p-5">
              {ruledLines}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div className="section-header">
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "15px", fontWeight: 700, color: "hsl(25 40% 16%)" }}>
                    Bufetes Registrados
                  </h3>
                  <input className="px-3 py-1.5 rounded text-xs" style={{ background: "hsl(38 30% 92%)", border: "1px solid hsl(32 25% 72%)", color: "hsl(25 40% 16%)", outline: "none" }} placeholder="Buscar bufete..." />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: "1px solid hsl(32 25% 72%)" }}>
                        {["Bufete", "Plan", "Usuarios", "Ingresos", "Estado", ""].map(h => (
                          <th key={h} className="pb-2 text-left font-medium" style={{ color: "hsl(25 20% 48%)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {firms.map((f, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid hsl(32 25% 78% / 0.6)" }}>
                          <td className="py-3 font-medium" style={{ color: "hsl(25 40% 16%)", fontFamily: "'Lora', Georgia, serif" }}>{f.name}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: `${planColor[f.plan]}20`, color: planColor[f.plan] }}>{f.plan}</span>
                          </td>
                          <td className="py-3" style={{ color: "hsl(25 20% 48%)" }}>{f.users}</td>
                          <td className="py-3 font-semibold" style={{ color: "hsl(142 50% 38%)" }}>{f.revenue}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: f.status === "Activo" ? "hsl(142 50% 38% / 0.15)" : "hsl(38 75% 45% / 0.15)", color: f.status === "Activo" ? "hsl(142 50% 38%)" : "hsl(38 75% 45%)" }}>{f.status}</span>
                          </td>
                          <td className="py-3"><button className="p-1 rounded" style={{ color: "hsl(25 20% 48%)" }}><Eye size={14} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className={`${cardClass} p-5`}>
              <div className="section-header">
                <h3 className="text-sm font-semibold text-foreground">Bufetes Registrados</h3>
                <div className="flex gap-2">
                  <input className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", outline: "none" }} placeholder="Buscar bufete..." />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                      {["Bufete", "Plan", "Usuarios", "Ingresos", "Estado", ""].map(h => (
                        <th key={h} className="pb-2 text-left font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {firms.map((f, i) => (
                      <tr key={i} className="table-row-hover" style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}>
                        <td className="py-3 font-medium text-foreground">{f.name}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: `${planColor[f.plan]}20`, color: planColor[f.plan] }}>{f.plan}</span>
                        </td>
                        <td className="py-3" style={{ color: "hsl(var(--muted-foreground))" }}>{f.users}</td>
                        <td className="py-3 font-semibold" style={{ color: "hsl(142 70% 55%)" }}>{f.revenue}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: f.status === "Activo" ? "hsl(142 70% 48% / 0.15)" : "hsl(38 92% 55% / 0.15)", color: f.status === "Activo" ? "hsl(142 70% 55%)" : "hsl(38 92% 65%)" }}>{f.status}</span>
                        </td>
                        <td className="py-3"><button className="p-1 rounded hover:text-primary" style={{ color: "hsl(var(--muted-foreground))" }}><Eye size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Plans */}
        {isClassic ? (
          <div style={notePadStyle} className="p-5">
            {ruledLines}
            <div style={{ position: "relative", zIndex: 1 }}>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "14px", fontWeight: 700, color: "hsl(25 40% 16%)", marginBottom: "16px" }}>
                Planes & Precios
              </h3>
              <div className="space-y-3">
                {plans.map((p) => (
                  <div key={p.name} className="p-3 rounded cursor-pointer transition-all" style={{ background: "hsl(38 30% 94%)", border: `1px solid ${p.color}30`, borderLeft: `3px solid ${p.color}` }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold" style={{ color: p.color }}>{p.name}</span>
                      <span className="text-sm font-semibold" style={{ color: "hsl(25 40% 16%)" }}>{p.price}</span>
                    </div>
                    <div className="space-y-1">
                      {p.features.map(f => (
                        <div key={f} className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(25 20% 48%)" }}>
                          <div className="w-1 h-1 rounded-full" style={{ background: p.color }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-primary w-full mt-4 text-center">Gestionar Planes</button>
            </div>
          </div>
        ) : (
          <div className={`${cardClass} p-5`}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Planes & Precios</h3>
            <div className="space-y-3">
              {plans.map((p) => (
                <div key={p.name} className="p-3 rounded-xl hover-glow cursor-pointer transition-all" style={{ background: "hsl(var(--secondary) / 0.5)", border: `1px solid ${p.color}30` }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold" style={{ color: p.color }}>{p.name}</span>
                    <span className="text-sm font-semibold text-foreground">{p.price}</span>
                  </div>
                  <div className="space-y-1">
                    {p.features.map(f => (
                      <div key={f} className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <div className="w-1 h-1 rounded-full" style={{ background: p.color }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary w-full mt-4 text-center">Gestionar Planes</button>
          </div>
        )}
      </div>

      {/* Revenue chart */}
      {isClassic ? (
        <div style={notePadStyle} className="p-5">
          {ruledLines}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="section-header">
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "14px", fontWeight: 700, color: "hsl(25 40% 16%)" }}>
                Ingresos por Mes
              </h3>
              <span className="text-xs" style={{ color: "hsl(25 20% 48%)" }}>Últimos 6 meses</span>
            </div>
            <div className="flex items-end gap-2 h-32">
              {[60, 75, 55, 90, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${h}%`, background: `linear-gradient(180deg, hsl(4 75% 38%) 0%, hsl(38 80% 42%) 100%)`, opacity: 0.7 + i * 0.05 }} />
                  <span className="text-[10px]" style={{ color: "hsl(25 20% 48%)" }}>{["Sep","Oct","Nov","Dic","Ene","Feb"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={`${cardClass} p-5`}>
          <div className="section-header">
            <h3 className="text-sm font-semibold text-foreground">Ingresos por Mes</h3>
            <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Últimos 6 meses</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {[60, 75, 55, 90, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${h}%`, background: `linear-gradient(180deg, hsl(217 91% 60%) 0%, hsl(199 89% 55%) 100%)`, opacity: 0.7 + i * 0.05 }} />
                <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{["Sep","Oct","Nov","Dic","Ene","Feb"][i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
