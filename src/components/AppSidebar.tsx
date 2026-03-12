import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import NyxLexLogo from "./NyxLexLogo";
import {
  LayoutDashboard, FolderOpen, Users, FileText, Calendar,
  BookOpen, CheckSquare, MessageSquare, Archive, DollarSign,
  BarChart3, Settings, Shield, ChevronLeft, ChevronRight,
  Sparkles, LogOut
} from
  "lucide-react";

const navSections = [
  {
    label: "ADMINISTRACIÓN",
    items: [
      { icon: Shield, label: "Super Admin", path: "/super-admin", badge: null },
      { icon: LayoutDashboard, label: "Dashboard", path: "/", badge: null }]

  },
  {
    label: "GESTIÓN LEGAL",
    items: [
      { icon: FolderOpen, label: "Casos & Expedientes", path: "/cases", badge: "12" },
      { icon: Users, label: "Clientes", path: "/clients", badge: null },
      { icon: Calendar, label: "Plazos & Calendario", path: "/calendar", badge: "3" },
      { icon: CheckSquare, label: "Tareas & Workflow", path: "/tasks", badge: "8" }]

  },
  {
    label: "IA & DOCUMENTOS",
    items: [
      { icon: Sparkles, label: "Taller Legal IA", path: "/ai-docs", badge: "IA" },
      { icon: MessageSquare, label: "Asistente IA Legal", path: "/ai-assistant", badge: "IA" },
      { icon: BookOpen, label: "Biblioteca Jurídica", path: "/library", badge: null },
      { icon: Archive, label: "Gestión Documental", path: "/documents", badge: null }]

  },
  {
    label: "FINANZAS",
    items: [
      { icon: DollarSign, label: "Facturación & Tiempo", path: "/billing", badge: null },
      { icon: BarChart3, label: "Reportes & Analytics", path: "/reports", badge: null }]

  },
  {
    label: "SISTEMA",
    items: [
      { icon: Settings, label: "Configuración", path: "/settings", badge: null }]

  }];


interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  const isDark = theme === "dark";

  const sidebarStyle = isClassic ? {
    width: collapsed ? "72px" : "260px",
    background: "linear-gradient(180deg, hsl(24 28% 16%) 0%, hsl(24 25% 12%) 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRight: "4px solid hsl(38 70% 35%)",
    boxShadow: "4px 0 24px hsl(24 30% 10% / 0.4)",
    position: "relative" as const
  } : isDark ? {
    width: collapsed ? "72px" : "260px",
    background: "hsl(220 32% 4%)",
    borderRight: "1px solid hsl(190 100% 50% / 0.12)",
    boxShadow: "4px 0 32px hsl(220 30% 2% / 0.8), inset -1px 0 0 hsl(190 100% 50% / 0.06)"
  } : {
    width: collapsed ? "72px" : "260px",
    background: "hsl(var(--sidebar-background))",
    borderRight: "1px solid hsl(var(--sidebar-border))",
    boxShadow: "4px 0 24px hsl(222 28% 5% / 0.4)"
  };

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out"
      style={sidebarStyle}>

      {/* Dark overlay for wood – improves text legibility */}
      {isClassic &&
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
          pointerEvents: "none", zIndex: 0
        }} />
      }
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* Logo */}
        <div
          className="flex items-center h-24 px-4 shrink-0 pt-4"
          style={{
            borderBottom: isClassic ?
              "1px solid hsl(24 35% 26%)" :
              isDark ?
                "1px solid hsl(190 100% 50% / 0.1)" :
                "1px solid hsl(var(--sidebar-border))"
          }}>

          <div className="flex items-center gap-3 overflow-hidden">
            <NyxLexLogo
              size={36}
              variant={isDark ? "dark" : isClassic ? "auto" : "light"}
              showText={!collapsed}
              showTagline={!collapsed}
              className="transition-all duration-300"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navSections.map((section) =>
            <div key={section.label} className="mb-2">
              {!collapsed &&
                <p
                  className="text-[10px] font-semibold tracking-widest px-3 mb-1.5 mt-3"
                  style={isDark ? {
                    color: "hsl(190 100% 50% / 0.4)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "9px"
                  } : { color: "hsl(var(--muted-foreground))" }}>

                  {section.label}
                </p>
              }
              {collapsed &&
                <div
                  className="mx-1 my-2"
                  style={{
                    borderTop: `1px solid ${isDark ? "hsl(190 100% 50% / 0.08)" : "hsl(var(--sidebar-border))"}`
                  }} />

              }
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                const isAI = item.badge === "IA";
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                    className={`nav-item w-full ${isActive ? "active" : ""} ${collapsed ? "justify-center" : ""}`}>

                    <Icon
                      size={16}
                      className="shrink-0"
                      style={{
                        color: isActive ?
                          isDark ? "hsl(190 100% 55%)" : "hsl(var(--primary))" :
                          isAI ?
                            isDark ? "hsl(260 80% 70%)" : "hsl(var(--accent))" :
                            isDark ? "hsl(210 20% 45%)" : undefined
                      }} />

                    {!collapsed &&
                      <span
                        className="flex-1 text-left truncate animate-fade-in text-sm"
                        style={isDark ? {
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: "13px",
                          fontWeight: isActive ? 600 : 400
                        } : {}}>

                        {item.label}
                      </span>
                    }
                    {!collapsed && item.badge &&
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 shrink-0"
                        style={isDark ? {
                          background: isAI ? "hsl(260 80% 65% / 0.15)" : "hsl(190 100% 50% / 0.1)",
                          color: isAI ? "hsl(260 80% 70%)" : "hsl(190 100% 55%)",
                          border: `1px solid ${isAI ? "hsl(260 80% 65% / 0.3)" : "hsl(190 100% 50% / 0.25)"}`,
                          borderRadius: "3px",
                          fontFamily: "'JetBrains Mono', monospace"
                        } : {
                          background: isAI ?
                            "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)" :
                            "hsl(var(--primary) / 0.2)",
                          color: isAI ? "white" : "hsl(var(--primary))",
                          borderRadius: "9999px"
                        }}>

                        {item.badge}
                      </span>
                    }
                  </button>);

              })}
            </div>
          )}
        </nav>

        {/* User & Toggle */}
        <div
          className="shrink-0 p-3 space-y-2"
          style={{
            borderTop: isDark ?
              "1px solid hsl(190 100% 50% / 0.1)" :
              "1px solid hsl(var(--sidebar-border))"
          }}>

          {!collapsed &&
            <div
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
              style={isDark ? {
                background: "hsl(190 100% 50% / 0.04)",
                border: "1px solid hsl(190 100% 50% / 0.1)"
              } : { background: "hsl(var(--sidebar-accent) / 0.5)" }}>

              <div
                className="w-8 h-8 flex items-center justify-center shrink-0 text-xs font-bold"
                style={isDark ? {
                  background: "transparent",
                  border: "1px solid hsl(190 100% 50% / 0.5)",
                  borderRadius: "6px",
                  color: "hsl(190 100% 55%)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: "0 0 12px hsl(190 100% 50% / 0.2)"
                } : {
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                  color: "white",
                  borderRadius: "50%"
                }}>

                AD
              </div>
              <div className="flex-1 overflow-hidden">
                <p
                  className="text-xs font-semibold truncate"
                  style={isDark ? {
                    color: "hsl(190 100% 80%)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: "0.02em"
                  } : { color: "hsl(var(--foreground))" }}>

                  Admin Principal
                </p>
                <p
                  className="text-[10px]"
                  style={isDark ? {
                    color: "hsl(190 100% 50% / 0.5)",
                    fontFamily: "'JetBrains Mono', monospace"
                  } : { color: "hsl(var(--muted-foreground))" }}>

                  {isDark ? "ROOT ACCESS" : "Super Admin"}
                </p>
              </div>
              <LogOut size={14} style={{ color: isDark ? "hsl(190 100% 50% / 0.4)" : "hsl(var(--muted-foreground))" }} />
            </div>
          }

          {/* Collapse toggle */}
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-lg transition-all duration-200"
            style={{ color: isDark ? "hsl(190 100% 50% / 0.4)" : "hsl(var(--muted-foreground))" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = isDark ?
                "hsl(190 100% 50% / 0.06)" :
                "hsl(var(--sidebar-accent))";
              (e.currentTarget as HTMLButtonElement).style.color = isDark ?
                "hsl(190 100% 55%)" :
                "hsl(var(--primary))";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = isDark ?
                "hsl(190 100% 50% / 0.4)" :
                "hsl(var(--muted-foreground))";
            }}>

            {collapsed ? <ChevronRight size={16} /> :
              <span className="flex items-center gap-2 text-xs">
                <ChevronLeft size={16} />
                {isDark ? "COLLAPSE" : "Colapsar"}
              </span>
            }
          </button>
        </div>
      </div>
    </aside>);

}