import { Users, FolderOpen, Clock, TrendingUp, BookOpen, History, MessageSquare } from "lucide-react";

export default function ProductHighlight() {
  return (
    <section className="py-20 lg:py-28" style={{ background: "hsl(210 20% 96%)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Case Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Casos</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              Control total sobre cada procedimiento legal
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Desde la apertura hasta el cierre, gestiona cada aspecto de tus casos con una visión clara 
              del estado, plazos y documentación asociada.
            </p>
            <div className="space-y-5">
              {[
                { icon: FolderOpen, title: "Clasificación por área jurídica", desc: "Civil, penal, laboral, mercantil y más" },
                { icon: Clock, title: "Alertas de plazos procesales", desc: "Nunca pierdas un vencimiento importante" },
                { icon: TrendingUp, title: "Panel de progreso visual", desc: "Estado de cada caso de un vistazo" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <f.icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{f.title}</h4>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Case mock */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(0 72% 55%)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(38 92% 48%)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(142 60% 40%)" }} />
              <span className="text-xs text-muted-foreground ml-2">Gestión de Casos</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Casos Civiles", count: 23, pct: 60, color: "hsl(var(--law-civil))" },
                { label: "Casos Penales", count: 15, pct: 40, color: "hsl(var(--law-penal))" },
                { label: "Casos Laborales", count: 8, pct: 25, color: "hsl(var(--law-laboral))" },
              ].map((c) => (
                <div key={c.label} className="rounded-lg p-4" style={{ background: "hsl(var(--secondary))" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{c.label}</span>
                    <span className="text-lg font-bold" style={{ color: c.color }}>{c.count}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "hsl(var(--border))" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${c.pct}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Client Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Client mock */}
          <div className="glass-card rounded-2xl p-6 order-2 lg:order-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(0 72% 55%)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(38 92% 48%)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(142 60% 40%)" }} />
              <span className="text-xs text-muted-foreground ml-2">Base de Clientes</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg p-4 text-center" style={{ background: "hsl(var(--secondary))" }}>
                <div className="text-2xl font-bold text-foreground">487</div>
                <div className="text-xs text-muted-foreground">Clientes Activos</div>
              </div>
              <div className="rounded-lg p-4 text-center" style={{ background: "hsl(var(--secondary))" }}>
                <div className="text-2xl font-bold text-foreground">98%</div>
                <div className="text-xs text-muted-foreground">Satisfacción</div>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { name: "María González", case: "Divorcio – #2024-156", status: "Activo", color: "hsl(var(--law-mercantil))" },
                { name: "Carlos Rodríguez", case: "Laboral – #2024-157", status: "En Proceso", color: "hsl(var(--primary))" },
                { name: "Ana Martínez", case: "Civil – #2024-158", status: "Finalizado", color: "hsl(var(--muted-foreground))" },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.case}</div>
                  </div>
                  <span className="text-xs font-medium shrink-0" style={{ color: c.color }}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Clientes</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              Relaciones más fuertes con tus clientes
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Mantén toda la información de tus clientes centralizada: historial, documentos, 
              facturación y comunicaciones en un solo lugar accesible.
            </p>
            <div className="space-y-5">
              {[
                { icon: BookOpen, title: "Perfiles completos y detallados", desc: "Toda la info de cada cliente a un clic" },
                { icon: History, title: "Historial completo de casos", desc: "Registro de todos los asuntos por cliente" },
                { icon: MessageSquare, title: "Comunicación centralizada", desc: "Correos, llamadas y notas en un solo lugar" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <f.icon size={16} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{f.title}</h4>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
