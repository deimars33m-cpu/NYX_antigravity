import { Scale, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onNavigate: (path: string) => void;
}

const stats = [
  { value: "500+", label: "Bufetes Activos" },
  { value: "50K+", label: "Casos Gestionados" },
  { value: "99.9%", label: "Uptime Garantizado" },
  { value: "10x", label: "Más Productividad" },
];

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-36 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, hsl(217 85% 52%), transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, hsl(199 80% 44%), transparent 70%)" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border" style={{ background: "hsl(217 85% 52% / 0.06)", borderColor: "hsl(217 85% 52% / 0.2)", color: "hsl(217 85% 52%)" }}>
            <Scale size={12} />
            Plataforma Legal Inteligente #1 en Español
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
            Dedica más tiempo al{" "}
            <span className="gradient-text">trabajo estratégico</span>{" "}
            de alto valor
          </h1>

          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            NYX LEX automatiza las tareas rutinarias de tu bufete para que te concentres 
            en lo que realmente importa: tus clientes y tus casos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button size="lg" onClick={() => onNavigate("/auth")} className="gap-2 text-base px-8 h-12">
              Comenzar Gratis <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => onNavigate("/auth")} className="gap-2 text-base px-8 h-12">
              <Play size={16} /> Ver Demo en Vivo
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x" style={{ borderColor: "hsl(var(--border))" }}>
          {stats.map((s) => (
            <div key={s.label} className="text-center lg:px-8">
              <div className="text-3xl lg:text-4xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
