type LawType = "civil" | "penal" | "laboral" | "mercantil" | "administrativo" | "familia" | "fiscal";

const lawConfig: Record<LawType, { label: string; color: string; bg: string; border: string }> = {
  civil:          { label: "Civil",          color: "hsl(217 91% 70%)", bg: "hsl(217 91% 60% / 0.12)", border: "hsl(217 91% 60% / 0.35)" },
  penal:          { label: "Penal",          color: "hsl(0 72% 65%)",   bg: "hsl(0 72% 55% / 0.12)",   border: "hsl(0 72% 55% / 0.35)" },
  laboral:        { label: "Laboral",        color: "hsl(38 92% 65%)",  bg: "hsl(38 92% 55% / 0.12)",  border: "hsl(38 92% 55% / 0.35)" },
  mercantil:      { label: "Mercantil",      color: "hsl(142 70% 55%)", bg: "hsl(142 70% 48% / 0.12)", border: "hsl(142 70% 48% / 0.35)" },
  administrativo: { label: "Administrativo", color: "hsl(271 77% 72%)", bg: "hsl(271 77% 62% / 0.12)", border: "hsl(271 77% 62% / 0.35)" },
  familia:        { label: "Familia",        color: "hsl(330 80% 68%)", bg: "hsl(330 80% 58% / 0.12)", border: "hsl(330 80% 58% / 0.35)" },
  fiscal:         { label: "Fiscal",         color: "hsl(199 89% 65%)", bg: "hsl(199 89% 55% / 0.12)", border: "hsl(199 89% 55% / 0.35)" },
};

export function LawBadge({ type }: { type: LawType }) {
  const cfg = lawConfig[type];
  return (
    <span
      className="law-badge"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

export type { LawType };
export { lawConfig };
