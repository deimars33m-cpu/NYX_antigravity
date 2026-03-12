import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "NYX LEX transformó la forma en que gestionamos nuestros casos. Ahorramos más de 20 horas semanales en tareas administrativas.",
    author: "Dra. Carmen López",
    role: "Socia Directora, López & Asociados",
    rating: 5,
  },
  {
    quote: "La gestión documental es excepcional. Encontrar cualquier documento ahora toma segundos en lugar de minutos. Nuestros clientes notan la diferencia.",
    author: "Lic. Roberto Fernández",
    role: "Director Legal, Fernández Abogados",
    rating: 5,
  },
  {
    quote: "La implementación fue rapidísima y el soporte técnico es de primer nivel. En una semana todo el equipo estaba trabajando con la plataforma.",
    author: "Dra. María Sánchez",
    role: "Fundadora, Sánchez Legal",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Testimonios</p>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight">
            Lo que dicen nuestros clientes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.author} className="glass-card rounded-2xl p-7 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-sm text-foreground leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </blockquote>
              <div>
                <div className="text-sm font-semibold text-foreground">{t.author}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
