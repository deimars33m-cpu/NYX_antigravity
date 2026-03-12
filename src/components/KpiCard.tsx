import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
  trend?: { value: string; up: boolean };
  children?: ReactNode;
  delay?: number;
  stickyIndex?: number;
}

const stickyPalette = [
  { bg: "hsl(50 88% 83%)", shadow: "hsl(48 70% 55% / 0.35)", rotate: "-1.2deg" },
  { bg: "hsl(140 52% 82%)", shadow: "hsl(140 45% 45% / 0.3)", rotate: "0.8deg" },
  { bg: "hsl(200 62% 82%)", shadow: "hsl(200 50% 45% / 0.3)", rotate: "-0.5deg" },
  { bg: "hsl(280 48% 84%)", shadow: "hsl(280 40% 50% / 0.3)", rotate: "1.0deg" },
  { bg: "hsl(10 68% 84%)", shadow: "hsl(10 60% 50% / 0.3)", rotate: "-0.7deg" },
];

export default function KpiCard({
  title, value, subtitle, icon: Icon,
  accentColor = "hsl(var(--primary))",
  trend, children, delay = 0, stickyIndex = 0,
}: KpiCardProps) {
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  const sticky = stickyPalette[stickyIndex % stickyPalette.length];

  if (isClassic) {
    return (
      <div
        className="animate-fade-in-up"
        style={{
          animationDelay: `${delay}ms`,
          position: "relative",
          paddingTop: "8px",
        }}
      >
        <div
          className="paper-texture paper-ruled"
          style={{
            borderRadius: "2px",
            padding: "20px",
            pl: "14px", /* Add padding for the margin line */
            transform: `rotate(${sticky.rotate})`,
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
            boxShadow: `3px 3px 0 hsl(25 30% 55% / 0.22), 5px 6px 14px ${sticky.shadow}`,
            cursor: "default",
            position: "relative",
            minHeight: "140px",
            border: "1px solid hsl(32 25% 72%)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) translateY(-5px) scale(1.02)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = `4px 4px 0 hsl(25 30% 55% / 0.18), 8px 14px 22px ${sticky.shadow}`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = `rotate(${sticky.rotate})`;
            (e.currentTarget as HTMLDivElement).style.boxShadow = `3px 3px 0 hsl(25 30% 55% / 0.22), 5px 6px 14px ${sticky.shadow}`;
          }}
        >
          {/* Tape strip */}
          <div style={{
            position: "absolute",
            top: "-7px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "38px",
            height: "13px",
            background: "hsl(40 50% 90% / 0.8)",
            border: "1px solid hsl(32 25% 72%)",
            borderRadius: "2px",
            boxShadow: "0 1px 3px hsl(25 40% 18% / 0.1)",
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
            <div>
              <p style={{
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "hsl(25 30% 45%)",
                marginBottom: "4px",
                fontFamily: "'Inter', sans-serif",
              }}>{title}</p>
              <p style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "hsl(25 40% 16%)",
                fontFamily: "'Playfair Display', Georgia, serif",
                lineHeight: 1.1,
              }}>{value}</p>
              {subtitle && (
                <p style={{ fontSize: "11px", color: "hsl(25 20% 48%)", marginTop: "2px", fontFamily: "'Inter', sans-serif" }}>
                  {subtitle}
                </p>
              )}
            </div>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "hsl(25 30% 18% / 0.08)",
              border: "1px solid hsl(25 30% 18% / 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon size={16} style={{ color: "hsl(25 40% 28%)" }} />
            </div>
          </div>
          <div className="flex justify-end opacity-20 mt-2">
            <div className="office-stamp border-current text-[7px] rotate-[-5deg]">VALIDADO</div>
          </div>
          {trend && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", borderTop: "1px dashed hsl(25 30% 18% / 0.18)", paddingTop: "8px" }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                color: trend.up ? "hsl(142 50% 36%)" : "hsl(4 70% 42%)",
                fontFamily: "'Inter', sans-serif",
              }}>
                {trend.up ? "↑" : "↓"} {trend.value}
              </span>
              <span style={{ fontSize: "10px", color: "hsl(25 20% 52%)", fontFamily: "'Inter', sans-serif" }}>vs mes anterior</span>
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      className="kpi-card animate-fade-in-up"
      style={{
        "--kpi-accent": accentColor,
        "--kpi-accent-glow": `${accentColor.replace(")", " / 0.25)").replace("hsl(", "hsl(")}`,
        animationDelay: `${delay}ms`,
      } as React.CSSProperties}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p
            className="text-xs font-medium mb-1"
            style={{
              color: isDark ? "hsl(210 15% 40%)" : "hsl(var(--muted-foreground))",
              fontFamily: isDark ? "'JetBrains Mono', monospace" : undefined,
              fontSize: isDark ? "10px" : undefined,
              letterSpacing: isDark ? "0.06em" : undefined,
              textTransform: isDark ? "uppercase" as const : undefined,
            }}
          >
            {title}
          </p>
          <p
            className="text-2xl font-bold"
            style={{
              color: isDark ? accentColor : "hsl(var(--foreground))",
              fontFamily: isDark ? "'Space Grotesk', sans-serif" : undefined,
              textShadow: isDark ? `0 0 20px ${accentColor}66` : undefined,
              letterSpacing: isDark ? "-0.02em" : undefined,
            }}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className="text-xs mt-0.5"
              style={{
                color: isDark ? "hsl(210 15% 35%)" : "hsl(var(--muted-foreground))",
                fontFamily: isDark ? "'JetBrains Mono', monospace" : undefined,
                fontSize: isDark ? "10px" : undefined,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="w-10 h-10 flex items-center justify-center shrink-0"
          style={isDark ? {
            background: `${accentColor.replace(")", " / 0.08)").replace("hsl(", "hsl(")}`,
            border: `1px solid ${accentColor.replace(")", " / 0.25)").replace("hsl(", "hsl(")}`,
            borderRadius: "8px",
            boxShadow: `0 0 16px ${accentColor.replace(")", " / 0.15)").replace("hsl(", "hsl(")}`,
          } : {
            background: `${accentColor}1A`,
            border: `1px solid ${accentColor}33`,
            borderRadius: "12px",
          }}
        >
          <Icon size={18} style={{ color: accentColor }} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <span
            className="text-xs font-semibold"
            style={{
              color: trend.up
                ? isDark ? "hsl(150 90% 45%)" : "hsl(142 70% 55%)"
                : isDark ? "hsl(0 90% 60%)" : "hsl(0 72% 65%)",
              fontFamily: isDark ? "'JetBrains Mono', monospace" : undefined,
              textShadow: isDark && trend.up ? "0 0 10px hsl(150 90% 45% / 0.5)" : isDark ? "0 0 10px hsl(0 90% 60% / 0.5)" : undefined,
            }}
          >
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
          <span className="text-xs" style={{ color: isDark ? "hsl(210 15% 35%)" : "hsl(var(--muted-foreground))" }}>
            vs mes anterior
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
