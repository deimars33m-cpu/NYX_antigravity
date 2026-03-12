import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, Clock, CalendarDays, CalendarRange, Calendar as CalIcon, Sparkles, TrendingUp, ShieldAlert } from "lucide-react";
import { LawBadge, LawType } from "@/components/LawBadge";

/* ─── Data ───────────────────────────────────────────────── */
const events = [
  { day: 4,  hour: 9,  title: "Audiencia García vs Norte",        type: "civil"      as LawType, time: "09:00", urgent: true  },
  { day: 7,  hour: 14, title: "Presentar recurso – Pérez",        type: "penal"      as LawType, time: "14:00", urgent: true  },
  { day: 10, hour: 17, title: "Entrega documental – López",       type: "laboral"    as LawType, time: "17:00", urgent: false },
  { day: 12, hour: 11, title: "Reunión cliente TechCorp",         type: "mercantil"  as LawType, time: "11:30", urgent: false },
  { day: 15, hour: 12, title: "Vencimiento plazo contestación",   type: "civil"      as LawType, time: "12:00", urgent: true  },
  { day: 18, hour: 10, title: "Vista oral – Rodríguez",           type: "familia"    as LawType, time: "10:00", urgent: false },
  { day: 22, hour: 16, title: "Presentación escrito fiscal",      type: "fiscal"     as LawType, time: "16:00", urgent: false },
  { day: 28, hour: 13, title: "Firma contrato TechCorp",          type: "mercantil"  as LawType, time: "13:00", urgent: false },
];

const daysInMonth = 31;
const firstDay   = 5; // Marzo 2025 empieza sábado (0=L … 6=D → offset 5)
const monthDays  = Array.from({ length: daysInMonth }, (_, i) => i + 1);
const blanks     = Array.from({ length: firstDay },    (_, i) => i);

type ViewMode = "month" | "week" | "day";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00–19:00

/* ─── helpers ────────────────────────────────────────────── */
function getWeekDays(anchorDay: number) {
  // Returns Mon–Sun week containing anchorDay (clamped to 1-31)
  const dow = (anchorDay + firstDay - 1) % 7; // 0=L
  const monday = Math.max(1, anchorDay - dow);
  return Array.from({ length: 7 }, (_, i) => monday + i).filter(d => d <= daysInMonth);
}

const DAY_NAMES_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DAY_NAMES_FULL  = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function dayName(day: number, full = false) {
  const idx = (day + firstDay - 1) % 7;
  return full ? DAY_NAMES_FULL[idx] : DAY_NAMES_SHORT[idx];
}

/* ─── EventChip ─────────────────────────────────────────── */
function EventChip({ ev, compact = false }: { ev: typeof events[0]; compact?: boolean }) {
  return (
    <div
      className={`rounded-md px-2 ${compact ? "py-0.5" : "py-1"} flex items-start gap-1.5 transition-all hover:opacity-90`}
      style={{
        background: ev.urgent ? "hsl(0 72% 55% / 0.12)" : "hsl(var(--primary) / 0.10)",
        border: `1px solid ${ev.urgent ? "hsl(0 72% 55% / 0.35)" : "hsl(var(--primary) / 0.25)"}`,
      }}
    >
      {!compact && <Clock size={9} className="shrink-0 mt-0.5" style={{ color: ev.urgent ? "hsl(0 72% 55%)" : "hsl(var(--primary))" }} />}
      <div className="min-w-0">
        <p className={`font-medium truncate ${compact ? "text-[9px]" : "text-[10px]"}`} style={{ color: ev.urgent ? "hsl(0 72% 55%)" : "hsl(var(--foreground))" }}>
          {ev.time} {ev.title}
        </p>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function CalendarPage() {
  const { theme } = useTheme();
  const isClassic = theme === "classic";
  const [view, setView]         = useState<ViewMode>("month");
  const [selectedDay, setSelectedDay] = useState<number>(4);
  const anchorDay = selectedDay;

  const weekDays  = getWeekDays(anchorDay);
  const dayEvents = (d: number) => events.filter(e => e.day === d);

  /* nav helpers */
  const prevMonth = () => {};
  const nextMonth = () => {};
  const prevWeek  = () => setSelectedDay(d => Math.max(1, d - 7));
  const nextWeek  = () => setSelectedDay(d => Math.min(daysInMonth, d + 7));
  const prevDay   = () => setSelectedDay(d => Math.max(1, d - 1));
  const nextDay   = () => setSelectedDay(d => Math.min(daysInMonth, d + 1));

  const onPrev = view === "month" ? prevMonth : view === "week" ? prevWeek : prevDay;
  const onNext = view === "month" ? nextMonth : view === "week" ? nextWeek : nextDay;

  const navLabel = view === "month"
    ? "Marzo 2025"
    : view === "week"
    ? `${weekDays[0]} – ${weekDays[weekDays.length - 1]} Mar 2025`
    : `${dayName(selectedDay, true)}, ${selectedDay} de Marzo 2025`;

  /* ─── View toggle ─────────────────────────────────────── */
  const ViewToggle = () => (
    <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid hsl(var(--border))" }}>
      {([
        { mode: "month" as ViewMode, icon: CalIcon,       label: "Mes"   },
        { mode: "week"  as ViewMode, icon: CalendarRange, label: "Semana" },
        { mode: "day"   as ViewMode, icon: CalendarDays,  label: "Día"   },
      ]).map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          type="button"
          onClick={() => setView(mode)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all"
          style={{
            background: view === mode ? "hsl(var(--primary))" : "hsl(var(--secondary))",
            color: view === mode ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
          }}
        >
          <Icon size={13} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );

  /* ─── AI Insights ──────────────────────────────────────── */
  const aiInsights = (() => {
    const urgentCount = events.filter(e => e.urgent).length;
    const busyDays = [4, 7, 15]; // days with urgent events
    const tips: { icon: typeof Sparkles; text: string; type: "warn" | "info" | "tip" }[] = [];
    if (urgentCount >= 3) tips.push({ icon: ShieldAlert, text: `${urgentCount} plazos urgentes este mes. Riesgo de sobresaturación entre los días 4–15. Considere delegar o reprogramar tareas no críticas.`, type: "warn" });
    tips.push({ icon: TrendingUp, text: "La semana del 4–10 concentra el 37% de las actividades del mes. Se recomienda bloquear tiempo de preparación los días 3 y 6.", type: "info" });
    tips.push({ icon: Sparkles, text: "Los días 19–21 están libres. Ideal para reuniones de planificación estratégica o revisión de expedientes pendientes.", type: "tip" });
    return tips;
  })();

  const AiInsightsBanner = () => (
    <div className="mt-4 rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--primary) / 0.2)", background: "hsl(var(--primary) / 0.04)" }}>
      <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: "1px solid hsl(var(--primary) / 0.1)", background: "hsl(var(--primary) / 0.08)" }}>
        <Sparkles size={14} style={{ color: "hsl(var(--primary))" }} />
        <span className="text-xs font-semibold" style={{ color: "hsl(var(--primary))" }}>Análisis IA — Recomendaciones</span>
      </div>
      <div className="divide-y" style={{ borderColor: "hsl(var(--primary) / 0.08)" }}>
        {aiInsights.map((tip, i) => {
          const Icon = tip.icon;
          const color = tip.type === "warn" ? "hsl(0 72% 55%)" : tip.type === "info" ? "hsl(var(--primary))" : "hsl(142 60% 40%)";
          return (
            <div key={i} className="flex items-start gap-3 px-4 py-2.5">
              <Icon size={13} className="shrink-0 mt-0.5" style={{ color }} />
              <p className="text-[11px] leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.85)" }}>{tip.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ─── MONTH VIEW ─────────────────────────────────────── */
  const MonthView = () => (
    <div>
      <div className="glass-card rounded-xl p-5">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["L","M","X","J","V","S","D"].map(d => (
            <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: "hsl(var(--muted-foreground))" }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map(i => <div key={`b${i}`} />)}
          {monthDays.map(day => {
            const evs = dayEvents(day);
            const isSelected = selectedDay === day;
            const hasUrgent  = evs.some(e => e.urgent);
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className="rounded-lg flex flex-col items-center justify-start text-xs relative transition-all duration-200 p-1 min-h-[52px]"
                style={{
                  background: isSelected ? "hsl(var(--primary) / 0.2)" : evs.length ? "hsl(var(--secondary) / 0.8)" : "transparent",
                  border: isSelected ? "1px solid hsl(var(--primary) / 0.5)" : evs.length ? "1px solid hsl(var(--border) / 0.5)" : "1px solid transparent",
                  color: isSelected ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                  fontWeight: evs.length ? "600" : "400",
                }}
              >
                <span className="text-xs mb-0.5">{day}</span>
                <div className="w-full space-y-0.5 hidden lg:block">
                  {evs.slice(0, 2).map((ev, i) => (
                    <EventChip key={i} ev={ev} compact />
                  ))}
                  {evs.length > 2 && (
                    <p className="text-[8px] text-center" style={{ color: "hsl(var(--muted-foreground))" }}>+{evs.length - 2} más</p>
                  )}
                </div>
                {evs.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 lg:hidden">
                    {evs.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full" style={{ background: hasUrgent ? "hsl(0 72% 55%)" : "hsl(var(--primary))" }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <AiInsightsBanner />
    </div>
  );

  /* ─── WEEK VIEW ──────────────────────────────────────── */
  const WeekView = () => (
    <div>
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid gap-0" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
          <div className="border-b p-2" style={{ borderColor: "hsl(var(--border))" }} />
          {weekDays.map(d => {
            const evs = dayEvents(d);
            const isToday = d === selectedDay;
            return (
              <div
                key={d}
                onClick={() => setSelectedDay(d)}
                className="border-b border-l p-2 text-center cursor-pointer transition-all"
                style={{
                  borderColor: "hsl(var(--border))",
                  background: isToday ? "hsl(var(--primary) / 0.1)" : "transparent",
                }}
              >
                <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{dayName(d)}</p>
                <p className="text-sm font-bold" style={{ color: isToday ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}>{d}</p>
                {evs.length > 0 && <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ background: evs.some(e => e.urgent) ? "hsl(0 72% 55%)" : "hsl(var(--primary))" }} />}
              </div>
            );
          })}
        </div>

        {/* Hour rows */}
        <div className="overflow-y-auto max-h-[420px]">
          {HOURS.map(h => (
            <div key={h} className="grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)", minHeight: 52 }}>
              <div className="text-[10px] text-right pr-2 pt-1 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>{String(h).padStart(2,"0")}:00</div>
              {weekDays.map(d => {
                const evs = events.filter(e => e.day === d && e.hour === h);
                return (
                  <div
                    key={d}
                    className="border-t border-l p-1 space-y-0.5"
                    style={{ borderColor: "hsl(var(--border) / 0.4)", background: d === selectedDay ? "hsl(var(--primary) / 0.03)" : "transparent" }}
                  >
                    {evs.map((ev, i) => <EventChip key={i} ev={ev} compact />)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <AiInsightsBanner />
    </div>
  );

  /* ─── DAY VIEW ───────────────────────────────────────── */
  const DayView = () => {
    const evs = dayEvents(selectedDay);
    return (
      <div className={`${isClassic ? "notepad-card" : "glass-card"} rounded-xl overflow-hidden`}>
        {/* Day header */}
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <div>
            <p className="text-base font-bold text-foreground">{dayName(selectedDay, true)}, {selectedDay} de Marzo 2025</p>
            <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{evs.length} evento{evs.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {evs.map((ev, i) => <LawBadge key={i} type={ev.type} />)}
          </div>
        </div>

        {/* Hour slots */}
        <div className="overflow-y-auto max-h-[480px]">
          {HOURS.map(h => {
            const slot = events.filter(e => e.day === selectedDay && e.hour === h);
            return (
              <div
                key={h}
                className="flex gap-4 px-4 py-2 transition-colors"
                style={{
                  borderBottom: "1px solid hsl(var(--border) / 0.3)",
                  background: slot.length ? "hsl(var(--secondary) / 0.4)" : "transparent",
                  minHeight: 52,
                }}
              >
                <div className="w-12 shrink-0 text-right pt-1">
                  <span className="text-xs font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>{String(h).padStart(2,"0")}:00</span>
                </div>
                <div className="flex-1 space-y-1.5 py-1">
                  {slot.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg"
                      style={{ background: ev.urgent ? "hsl(0 72% 55% / 0.10)" : "hsl(var(--primary) / 0.08)", border: `1px solid ${ev.urgent ? "hsl(0 72% 55% / 0.3)" : "hsl(var(--primary) / 0.2)"}` }}>
                      <div className="shrink-0">
                        <p className="text-xs font-bold" style={{ color: ev.urgent ? "hsl(0 72% 55%)" : "hsl(var(--primary))" }}>{ev.time}</p>
                      </div>
                      <div>
                        <LawBadge type={ev.type} />
                        <p className="text-xs font-medium text-foreground mt-1">{ev.title}</p>
                        {ev.urgent && <p className="text-[10px] mt-0.5 font-semibold" style={{ color: "hsl(0 72% 55%)" }}>⚠ Plazo urgente</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ─── Sidebar: upcoming events ───────────────────────── */
  const Sidebar = () => {
    const list = view === "month"
      ? events.slice(0, 6)
      : view === "week"
      ? events.filter(e => weekDays.includes(e.day))
      : dayEvents(selectedDay);

    return (
      <div className={`${isClassic ? "notepad-card" : "glass-card"} rounded-xl p-5 h-fit relative`}>
        <h3 className="text-sm font-semibold text-foreground mb-4">
          {view === "month" ? "Próximos eventos" : view === "week" ? `Semana ${weekDays[0]}–${weekDays[weekDays.length-1]} Mar` : `${dayName(selectedDay, true)}, ${selectedDay} Mar`}
        </h3>
        <div className="space-y-3">
          {list.map((e, i) => (
            <div key={i} className="flex gap-3 p-2 rounded-lg cursor-pointer transition-all hover:opacity-80"
              style={{ background: "hsl(var(--secondary) / 0.5)", border: `1px solid ${e.urgent ? "hsl(0 72% 55% / 0.3)" : "hsl(var(--border) / 0.4)"}` }}
              onClick={() => { setSelectedDay(e.day); if (view === "month") setView("day"); }}
            >
              <div className="text-center shrink-0">
                <p className="text-lg font-bold font-display" style={{ color: e.urgent ? "hsl(0 72% 55%)" : "hsl(var(--primary))" }}>{e.day}</p>
                <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{e.time}</p>
              </div>
              <div className="min-w-0">
                <LawBadge type={e.type} />
                <p className="text-xs font-medium text-foreground mt-1 truncate">{e.title}</p>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-xs text-center py-8" style={{ color: "hsl(var(--muted-foreground))" }}>Sin eventos</p>
          )}
        </div>
      </div>
    );
  };

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground font-display">Plazos & Calendario</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            Marzo 2025 · {events.filter(e => e.urgent).length} plazos urgentes
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ViewToggle />
          <button className="btn-primary flex items-center gap-2"><Plus size={16} /> Añadir Evento</button>
        </div>
      </div>

      {/* Urgent alerts — sticky notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.filter(e => e.urgent).map((e, idx) => {
          const stickyColors = ["hsl(50 88% 83%)", "hsl(10 68% 84%)", "hsl(200 62% 82%)"];
          const rotations = ["-1.2deg", "0.8deg", "-0.5deg"];
          return (
            <div
              key={e.day}
              className="kpi-card p-4 flex items-start gap-3 cursor-pointer transition-all"
              style={{
                "--sticky-color": stickyColors[idx % 3],
                "--sticky-rotate": rotations[idx % 3],
              } as React.CSSProperties}
              onClick={() => { setSelectedDay(e.day); setView("day"); }}
            >
              <AlertTriangle size={16} style={{ color: "hsl(0 72% 55%)" }} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold" style={{ color: "hsl(25 40% 20%)" }}>{e.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={10} style={{ color: "hsl(25 30% 45%)" }} />
                  <span className="text-[10px] font-medium" style={{ color: "hsl(25 30% 45%)" }}>Mar {e.day} · {e.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nav bar */}
      <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
        <button type="button" onClick={onPrev} className="p-1.5 rounded-lg transition-all hover-glow"
          style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
          <ChevronLeft size={14} />
        </button>
        <p className="flex-1 text-center text-sm font-semibold text-foreground">{navLabel}</p>
        <button type="button" onClick={onNext} className="p-1.5 rounded-lg transition-all hover-glow"
          style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {view === "month" && <MonthView />}
          {view === "week"  && <WeekView />}
          {view === "day"   && <DayView />}
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
