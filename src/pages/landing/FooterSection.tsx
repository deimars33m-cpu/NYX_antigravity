import NyxLexLogo from "@/components/NyxLexLogo";

export default function FooterSection() {
  return (
    <footer className="py-12 border-t" style={{ borderColor: "hsl(var(--border))" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <NyxLexLogo size={28} variant="light" showText={false} />
              <span className="font-bold text-foreground tracking-[0.12em]" style={{ fontFamily: "'Newsreader', serif" }}>NYX LEX</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              La solución integral para la gestión moderna de bufetes de abogados.
            </p>
          </div>
          {[
            { title: "Producto", links: ["Características", "Precios", "Seguridad", "Actualizaciones"] },
            { title: "Soporte", links: ["Documentación", "Formación", "Soporte Técnico", "Contacto"] },
            { title: "Legal", links: ["Privacidad", "Términos", "Cookies", "Compliance"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-foreground text-sm mb-3">{col.title}</h4>
              <div className="space-y-2">
                {col.links.map((l) => (
                  <a key={l} href="#" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-6 text-center" style={{ borderColor: "hsl(var(--border))" }}>
          <p className="text-xs text-muted-foreground">© 2026 NYX LEX. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
