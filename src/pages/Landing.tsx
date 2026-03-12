import { LogIn } from "lucide-react";
import NyxLexLogo from "@/components/NyxLexLogo";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeroSection from "./landing/HeroSection";
import BenefitsSection from "./landing/BenefitsSection";
import FeaturesShowcase from "./landing/FeaturesShowcase";
import WorkflowSection from "./landing/WorkflowSection";
import ProductHighlight from "./landing/ProductHighlight";
import TestimonialsSection from "./landing/TestimonialsSection";
import CtaSection from "./landing/CtaSection";
import FooterSection from "./landing/FooterSection";

export default function Landing() {
  const navigate = useNavigate();
  const onNavigate = (path: string) => navigate(path);

  return (
    <div data-theme="light" className="min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(160deg, hsl(0 0% 100%) 0%, hsl(220 14% 90%) 100%)" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ background: "hsla(0, 0%, 100%, 0.85)", borderColor: "hsl(214 20% 86%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <NyxLexLogo size={32} variant="light" showText={false} />
            <span className="font-bold text-foreground text-lg tracking-[0.15em]" style={{ fontFamily: "'Newsreader', 'Playfair Display', serif" }}>NYX LEX</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Beneficios</a>
            <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#documentos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentos</a>
            <a href="#testimonios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonios</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="gap-1.5">
              <LogIn size={15} /> Iniciar Sesión
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")}>
              Registrarse
            </Button>
          </div>
        </div>
      </nav>

      <HeroSection onNavigate={onNavigate} />
      
      <div id="beneficios">
        <BenefitsSection />
      </div>
      
      <div id="funcionalidades">
        <FeaturesShowcase />
      </div>
      
      <div id="documentos">
        <WorkflowSection />
      </div>
      
      <ProductHighlight />
      
      <div id="testimonios">
        <TestimonialsSection />
      </div>
      
      <CtaSection onNavigate={onNavigate} />
      <FooterSection />
    </div>
  );
}
