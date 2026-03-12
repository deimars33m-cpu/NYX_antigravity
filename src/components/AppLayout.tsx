import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import NyxLexLogo from "./NyxLexLogo";
import { Bell, Search, Menu, Sun, Moon, BookOpen, Zap } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { Theme } from "@/context/ThemeContext";

const routeLabels: Record<string, string> = {
  "/": "Dashboard Principal",
  "/super-admin": "Super Admin",
  "/cases": "Gestión de Casos",
  "/clients": "Gestión de Clientes",
  "/ai-docs": "Taller Legal IA",
  "/calendar": "Plazos & Calendario",
  "/library": "Biblioteca Jurídica",
  "/tasks": "Tareas & Workflow",
  "/ai-assistant": "Asistente IA Legal",
  "/documents": "Gestión Documental",
  "/billing": "Facturación & Tiempo",
  "/reports": "Reportes & Analytics",
  "/settings": "Configuración",
};

const themeConfig: { id: Theme; label: string; icon: React.ReactNode; next: Theme }[] = [
  { id: "light", label: "LIGHT", icon: <Sun size={14} />, next: "classic" },
  { id: "classic", label: "Clásico", icon: <BookOpen size={14} />, next: "dark" },
  { id: "dark", label: "Nexus", icon: <Zap size={14} />, next: "light" },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const title = routeLabels[location.pathname] ?? "NYX LEX";

  const current = themeConfig.find((t) => t.id === theme) ?? themeConfig[0];
  const isClassic = theme === "classic";
  const isDark = theme === "dark";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: isClassic ? "hsl(38 30% 90%)" : undefined }}
    >
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 md:relative md:flex
          transition-transform duration-300
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 flex items-center gap-4 px-6 shrink-0"
          style={isClassic ? {
            background: "linear-gradient(180deg, hsl(24 28% 18%) 0%, hsl(24 25% 14%) 100%)",
            borderBottom: "3px solid hsl(38 70% 35%)",
            boxShadow: "0 2px 12px hsl(25 40% 18% / 0.3)",
          } : isDark ? {
            background: "hsl(220 30% 4% / 0.95)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid hsl(190 100% 50% / 0.1)",
            boxShadow: "0 1px 0 hsl(190 100% 50% / 0.06)",
          } : {
            background: "hsl(var(--background-secondary) / 0.8)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid hsl(var(--border) / 0.5)",
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: isClassic ? "hsl(38 60% 72%)" : "hsl(var(--muted-foreground))" }}
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 min-w-0" />

          {/* Date – right-aligned */}
          <p className="hidden sm:block text-xs whitespace-nowrap shrink-0" style={{
            color: isClassic ? "hsl(38 30% 60%)" : isDark ? "hsl(190 100% 50% / 0.5)" : "hsl(var(--muted-foreground))",
            fontFamily: isDark ? "'JetBrains Mono', monospace" : undefined,
            fontSize: isDark ? "10px" : "11px",
          }}>
            {isDark
              ? new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
              : new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>

          {/* Search */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm"
            style={isClassic ? {
              background: "hsl(24 25% 18%)",
              border: "1px solid hsl(24 22% 26%)",
              color: "hsl(38 30% 65%)",
              width: 200,
              borderRadius: "6px",
            } : isDark ? {
              background: "hsl(220 28% 8%)",
              border: "1px solid hsl(190 100% 50% / 0.15)",
              color: "hsl(190 100% 50% / 0.5)",
              width: 200,
              borderRadius: "6px",
              boxShadow: "0 0 12px hsl(190 100% 50% / 0.05)",
            } : {
              background: "hsl(var(--secondary))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--muted-foreground))",
              width: 200,
              borderRadius: "8px",
            }}
          >
            <Search size={13} />
            <span style={{ fontSize: "12px", fontFamily: isDark ? "'JetBrains Mono', monospace" : undefined }}>
              {isDark ? "SEARCH..." : "Buscar..."}
            </span>
            <span
              className="ml-auto text-[10px] px-1.5 py-0.5"
              style={{
                background: isClassic ? "hsl(24 35% 28%)" : isDark ? "hsl(190 100% 50% / 0.1)" : "hsl(var(--border))",
                border: isDark ? "1px solid hsl(190 100% 50% / 0.2)" : undefined,
                borderRadius: "3px",
                fontFamily: isDark ? "'JetBrains Mono', monospace" : undefined,
                color: isDark ? "hsl(190 100% 55%)" : undefined,
              }}
            >⌘K</span>
          </div>

          {/* Theme selector – 3 pills */}
          <div
            className="flex items-center gap-1 p-1"
            style={isClassic ? {
              background: "hsl(24 25% 18%)",
              border: "1px solid hsl(24 22% 24%)",
              borderRadius: "8px",
            } : isDark ? {
              background: "hsl(220 28% 7%)",
              border: "1px solid hsl(190 100% 50% / 0.12)",
              borderRadius: "6px",
            } : {
              background: "hsl(var(--secondary))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          >
            {themeConfig.map((t) => {
              const isActive = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-200"
                  style={isActive
                    ? isClassic
                      ? { background: "hsl(38 80% 42%)", color: "hsl(25 40% 12%)", borderRadius: "5px" }
                      : isDark
                        ? {
                          background: "hsl(190 100% 50% / 0.12)",
                          color: "hsl(190 100% 55%)",
                          border: "1px solid hsl(190 100% 50% / 0.3)",
                          borderRadius: "4px",
                          fontFamily: "'Space Grotesk', sans-serif",
                          letterSpacing: "0.04em",
                          boxShadow: "0 0 10px hsl(190 100% 50% / 0.15)",
                        }
                        : { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", borderRadius: "6px" }
                    : isClassic
                      ? { color: "hsl(38 30% 62%)" }
                      : isDark
                        ? { color: "hsl(210 15% 40%)", fontFamily: "'Space Grotesk', sans-serif" }
                        : { color: "hsl(var(--muted-foreground))" }
                  }
                >
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg transition-all duration-200"
            style={{ color: isClassic ? "hsl(38 40% 65%)" : isDark ? "hsl(190 100% 50% / 0.5)" : "hsl(var(--muted-foreground))" }}
          >
            <Bell size={16} />
            <span
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
              style={{
                background: isDark ? "hsl(190 100% 50%)" : "hsl(var(--destructive))",
                boxShadow: isDark ? "0 0 6px hsl(190 100% 50%)" : undefined,
              }}
            />
          </button>

          {/* Avatar */}
          <div
            className="w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer"
            style={isClassic ? {
              background: "linear-gradient(135deg, hsl(4 75% 42%), hsl(38 80% 42%))",
              color: "white",
              boxShadow: "0 2px 8px hsl(4 75% 42% / 0.4)",
              fontFamily: "'Playfair Display', Georgia, serif",
              borderRadius: "50%",
            } : isDark ? {
              background: "transparent",
              color: "hsl(190 100% 55%)",
              border: "1px solid hsl(190 100% 50% / 0.4)",
              borderRadius: "6px",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.04em",
              boxShadow: "0 0 12px hsl(190 100% 50% / 0.15)",
            } : {
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
              color: "white",
              boxShadow: "0 0 12px hsl(var(--primary) / 0.3)",
              borderRadius: "50%",
            }}
          >
            AD
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-6 relative"
          style={isClassic ? {
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")
            `,
            backgroundSize: "200px 200px",
          } : {}}
        >
          {/* Translucent NYX LEX watermark */}
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0" style={{ opacity: isDark ? 0.03 : isClassic ? 0.04 : 0.03 }}>
            <svg viewBox="0 0 400 400" width="60%" height="60%" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(200, 160)">
                <line x1={-150} y1={105} x2={150} y2={-105} stroke={isDark ? "#a5f3fc" : isClassic ? "hsl(38,80%,42%)" : "hsl(217,85%,52%)"} strokeWidth={1} opacity={0.5} />
                <line x1={-150} y1={-105} x2={150} y2={105} stroke={isDark ? "#a5f3fc" : isClassic ? "hsl(38,80%,42%)" : "hsl(217,85%,52%)"} strokeWidth={1} opacity={0.5} />
                <circle cx={0} cy={0} r={6} fill={isDark ? "#ffffff" : isClassic ? "#D4AF37" : "#3b82f6"} />
              </g>
              <text
                x={200}
                y={310}
                textAnchor="middle"
                fill={isDark ? "white" : isClassic ? "hsl(25,40%,18%)" : "hsl(220,20%,18%)"}
                fontSize={36}
                fontFamily="'Newsreader', serif"
                fontWeight={300}
                letterSpacing={18}
                className="uppercase"
              >NYX LEX</text>
            </svg>
          </div>
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
