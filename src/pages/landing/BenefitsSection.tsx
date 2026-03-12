import { Clock, TrendingUp, Shield, Zap } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Ahorra hasta 15 horas semanales",
    description: "Automatiza la generación de documentos, seguimiento de plazos y organización de expedientes. Más tiempo para el trabajo legal que requiere tu expertise.",
    highlight: "15h/semana",
  },
  {
    icon: TrendingUp,
    title: "Aumenta tu facturación un 40%",
    description: "Con mejor gestión de casos y clientes, reduce el tiempo administrativo y aumenta la capacidad de tu bufete para atender más asuntos simultáneamente.",
    highlight: "+40%",
  },
  {
    icon: Shield,
    title: "Seguridad de grado bancario",
    description: "Encriptación AES-256, cumplimiento con la LOPD y RGPD, respaldos automáticos y auditoría completa de todas las operaciones sobre datos sensibles.",
    highlight: "AES-256",
  },
  {
    icon: Zap,
    title: "Implementación en 24 horas",
    description: "Sin instalaciones complicadas ni formación extensiva. Tu equipo estará operativo en un día con migración asistida de datos y soporte dedicado.",
    highlight: "24h",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Por qué NYX LEX</p>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight">
            Tecnología avanzada al servicio<br className="hidden lg:block" /> del ejercicio jurídico
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((b) => (
            <div key={b.title} className="glass-card rounded-2xl p-8 group relative overflow-hidden">
              {/* Subtle accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <b.icon size={22} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-foreground">{b.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
              </div>
              
              {/* Floating highlight */}
              <div className="absolute top-6 right-6 text-2xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                {b.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
