import { FolderOpen, Users, CalendarDays, FileText, BarChart3, MessageSquare } from "lucide-react";

const features = [
  {
    icon: FolderOpen,
    title: "Gestión de Casos",
    description: "Organiza expedientes por área jurídica, prioridad y estado. Seguimiento automático de plazos procesales con alertas inteligentes.",
  },
  {
    icon: Users,
    title: "CRM de Clientes",
    description: "Base de datos completa con historial de casos, documentación, facturación y comunicación centralizada en un solo lugar.",
  },
  {
    icon: CalendarDays,
    title: "Agenda Inteligente",
    description: "Calendario con recordatorios automáticos de audiencias, vencimientos y reuniones. Sincronización con Google Calendar y Outlook.",
  },
  {
    icon: FileText,
    title: "Generador de Documentos",
    description: "Plantillas personalizables para contratos, demandas y escritos. Autocompletado inteligente con datos del caso y cliente.",
  },
  {
    icon: BarChart3,
    title: "Analytics y Reportes",
    description: "Informes detallados sobre rendimiento del bufete, estadísticas de casos, análisis financiero y productividad del equipo.",
  },
  {
    icon: MessageSquare,
    title: "Comunicación Integrada",
    description: "Centraliza correos, notas y llamadas por caso. Comparte actualizaciones con clientes de forma segura y profesional.",
  },
];

export default function FeaturesShowcase() {
  return (
    <section className="py-20 lg:py-28" style={{ background: "hsl(210 20% 96%)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Funcionalidades</p>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight">
            Todo lo que necesitas para gestionar<br className="hidden lg:block" /> tu bufete de forma eficiente
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Herramientas especializadas diseñadas por y para profesionales del derecho, 
            con más de 150 años de experiencia en tecnología legal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-7 group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <f.icon size={22} className="text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
