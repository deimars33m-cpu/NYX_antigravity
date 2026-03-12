import { ArrowRight, Check, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CtaSectionProps {
  onNavigate: (path: string) => void;
}

const reasons = [
  "Diseñado específicamente para bufetes de abogados",
  "Cumplimiento total con LOPD y RGPD",
  "Soporte por profesionales del derecho y tecnología",
  "Sin contratos de permanencia – cancela cuando quieras",
];

export default function CtaSection({ onNavigate }: CtaSectionProps) {
  return (
    <section className="py-20 lg:py-28" style={{ background: "linear-gradient(135deg, hsl(217 85% 52% / 0.04) 0%, hsl(199 80% 44% / 0.06) 100%)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-10 lg:p-16 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-5 leading-tight">
            ¿Listo para modernizar<br className="hidden sm:block" /> tu bufete?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg">
            Únete a más de 500 bufetes que ya están utilizando NYX LEX para 
            mejorar su eficiencia y brindar un mejor servicio a sus clientes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={() => onNavigate("/auth")} className="gap-2 text-base px-10 h-12">
              Comenzar Gratis <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => onNavigate("/auth")} className="text-base px-10 h-12">
              Solicitar Demo Personalizada
            </Button>
          </div>

          <div className="border-t pt-8" style={{ borderColor: "hsl(var(--border))" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {reasons.map((r) => (
                <div key={r} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground text-left">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
