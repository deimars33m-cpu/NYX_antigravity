import { Upload, Search, PenTool, Lock, Database, Share2 } from "lucide-react";

const steps = [
  { icon: Upload, num: "01", title: "Carga y Organiza", description: "Sube documentos por lotes. La IA clasifica y organiza automáticamente por tipo, caso y cliente." },
  { icon: Search, num: "02", title: "Encuentra al Instante", description: "Búsqueda por contenido, etiquetas inteligentes y filtros avanzados. Cualquier documento en segundos." },
  { icon: PenTool, num: "03", title: "Genera y Firma", description: "Crea documentos desde plantillas con autocompletado. Firma digital con validez legal integrada." },
  { icon: Share2, num: "04", title: "Colabora de Forma Segura", description: "Comparte con clientes y colegas. Control de versiones, comentarios y permisos granulares." },
  { icon: Lock, num: "05", title: "Protege tus Datos", description: "Encriptación extremo a extremo, control de acceso por roles y auditoría completa de operaciones." },
  { icon: Database, num: "06", title: "Backup Automático", description: "Respaldos automáticos en múltiples ubicaciones. Recuperación ante desastres garantizada." },
];

export default function WorkflowSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Gestión Documental</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              Documentos organizados,<br /> accesibles y seguros
            </h2>
            <p className="text-muted-foreground mb-10 leading-relaxed">
              Desde la carga hasta la firma digital, controla todo el ciclo de vida de tus documentos legales 
              con la seguridad y eficiencia que tu bufete necesita.
            </p>

            <div className="space-y-6">
              {steps.slice(0, 3).map((s) => (
                <div key={s.num} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary-foreground">{s.num}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-0.5">{s.title}</h4>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: more steps */}
          <div className="space-y-6">
            {steps.slice(3).map((s) => (
              <div key={s.num} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-accent-foreground">{s.num}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-0.5">{s.title}</h4>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              </div>
            ))}

            {/* Dashboard mock */}
            <div className="glass-card rounded-2xl p-5 mt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(0 72% 55%)" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(38 92% 48%)" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(142 60% 40%)" }} />
                <span className="text-xs text-muted-foreground ml-2">Gestión Documental</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Documentos", value: "1,234" },
                  { label: "Firmados", value: "856" },
                  { label: "Pendientes", value: "47" },
                ].map((d) => (
                  <div key={d.label} className="rounded-lg p-3 text-center" style={{ background: "hsl(var(--secondary))" }}>
                    <div className="text-lg font-bold text-foreground">{d.value}</div>
                    <div className="text-xs text-muted-foreground">{d.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
