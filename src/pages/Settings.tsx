import { useState } from "react";
import { Users, Bell, Lock, Palette, Plug, ChevronRight, Check } from "lucide-react";

const sections = [
  { icon: Users, label: "Usuarios & Permisos" },
  { icon: Bell, label: "Notificaciones" },
  { icon: Lock, label: "Seguridad" },
  { icon: Palette, label: "Apariencia" },
  { icon: Plug, label: "Integraciones" },
];

const users = [
  { name: "Ana Rodríguez", email: "ana@lexai.es", role: "Abogado Senior", active: true },
  { name: "Carlos López", email: "carlos@lexai.es", role: "Abogado", active: true },
  { name: "María Torres", email: "maria@lexai.es", role: "Abogado", active: true },
  { name: "Pedro Sanz", email: "pedro@lexai.es", role: "Administrativo", active: false },
];

const roles = ["Admin", "Abogado Senior", "Abogado", "Administrativo", "Solo Lectura"];

const integrations = [
  { name: "Google Calendar", desc: "Sincroniza plazos y audiencias", connected: true, icon: "📅" },
  { name: "Microsoft 365", desc: "Documentos y correo integrado", connected: true, icon: "💼" },
  { name: "DocuSign", desc: "Firma electrónica de documentos", connected: false, icon: "✍️" },
  { name: "Lexnet", desc: "Comunicaciones judiciales", connected: false, icon: "⚖️" },
  { name: "Sage", desc: "Software de facturación", connected: false, icon: "💰" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("Usuarios & Permisos");

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground font-display">Configuración & Administración</h2>
        <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Gestiona usuarios, permisos y configuración del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar nav */}
        <div className="glass-card rounded-xl p-3 h-fit">
          {sections.map((s) => (
            <button key={s.label} onClick={() => setActiveSection(s.label)} className={`nav-item w-full mb-1 ${activeSection === s.label ? "active" : ""}`}>
              <s.icon size={16} />
              <span className="text-sm">{s.label}</span>
              <ChevronRight size={12} className="ml-auto" style={{ color: "hsl(var(--muted-foreground))" }} />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {activeSection === "Usuarios & Permisos" && (
            <div className="glass-card rounded-xl p-5">
              <div className="section-header">
                <h3 className="text-sm font-semibold text-foreground">Miembros del Equipo</h3>
                <button className="btn-primary text-xs px-3 py-1.5">Invitar usuario</button>
              </div>
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.email} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border) / 0.4)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", color: "white" }}>
                      {u.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{u.name}</p>
                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{u.email}</p>
                    </div>
                    <select className="px-2 py-1 rounded-lg text-xs" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", outline: "none" }} defaultValue={u.role}>
                      {roles.map(r => <option key={r}>{r}</option>)}
                    </select>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: u.active ? "hsl(142 70% 48%)" : "hsl(var(--muted-foreground))" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "Integraciones" && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Integraciones disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {integrations.map((int) => (
                  <div key={int.name} className="flex items-center gap-3 p-4 rounded-xl hover-glow" style={{ background: "hsl(var(--secondary) / 0.5)", border: `1px solid ${int.connected ? "hsl(142 70% 48% / 0.3)" : "hsl(var(--border) / 0.4)"}` }}>
                    <span className="text-2xl">{int.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{int.name}</p>
                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{int.desc}</p>
                    </div>
                    {int.connected ? (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full" style={{ background: "hsl(142 70% 48% / 0.15)", color: "hsl(142 70% 55%)" }}>
                        <Check size={10} /> Conectado
                      </span>
                    ) : (
                      <button className="text-[10px] px-2 py-1 rounded-full" style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}>
                        Conectar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeSection === "Notificaciones" || activeSection === "Seguridad" || activeSection === "Apariencia") && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">{activeSection}</h3>
              {activeSection === "Notificaciones" && (
                <div className="space-y-3">
                  {["Vencimientos de plazos", "Nuevas tareas asignadas", "Actualizaciones de casos", "Nuevos documentos", "Alertas de audiencias"].map(n => (
                    <div key={n} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}>
                      <span className="text-sm text-foreground">{n}</span>
                      <div className="flex gap-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {["Email", "App", "SMS"].map(ch => (
                          <label key={ch} className="flex items-center gap-1 cursor-pointer">
                            <input type="checkbox" defaultChecked className="accent-primary" />{ch}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeSection === "Seguridad" && (
                <div className="space-y-4">
                  {[
                    { label: "Autenticación en dos pasos", desc: "Añade una capa extra de seguridad", active: true },
                    { label: "Registro de auditoría", desc: "Registra todas las acciones del equipo", active: true },
                    { label: "Sesiones activas", desc: "Controla desde qué dispositivos se accede", active: false },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border) / 0.4)" }}>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{s.label}</p>
                        <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{s.desc}</p>
                      </div>
                      <div className="w-10 h-5 rounded-full relative cursor-pointer" style={{ background: s.active ? "hsl(var(--primary))" : "hsl(var(--border))" }}>
                        <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: s.active ? "22px" : "2px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeSection === "Apariencia" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Color de acento</p>
                    <div className="flex gap-2">
                      {["hsl(217 91% 60%)", "hsl(271 77% 62%)", "hsl(199 89% 55%)", "hsl(142 70% 48%)", "hsl(330 80% 58%)"].map(c => (
                        <button key={c} className="w-8 h-8 rounded-full border-2" style={{ background: c, borderColor: c === "hsl(217 91% 60%)" ? "white" : "transparent" }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Densidad de la interfaz</p>
                    <div className="flex gap-2">
                      {["Compacta", "Normal", "Espaciada"].map((d, i) => (
                        <button key={d} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: i === 1 ? "hsl(var(--primary) / 0.2)" : "hsl(var(--secondary))", color: i === 1 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", border: `1px solid ${i === 1 ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border))"}` }}>{d}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
