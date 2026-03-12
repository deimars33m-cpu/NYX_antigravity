import { useTheme } from "@/context/ThemeContext";

/**
 * Animated neural-network nodes that light up while the AI is thinking.
 * Nexus → cyan glow · Light → blue glow · Classic → gold glow
 */
export default function AiThinkingNodes({ compact = false }: { compact?: boolean }) {
  const { theme } = useTheme();

  const color =
    theme === "dark"
      ? { node: "hsl(190 100% 55%)", line: "hsl(190 100% 50% / 0.35)", glow: "hsl(190 100% 55% / 0.6)" }
      : theme === "classic"
      ? { node: "hsl(38 80% 50%)", line: "hsl(38 70% 45% / 0.3)", glow: "hsl(38 80% 50% / 0.5)" }
      : { node: "hsl(217 91% 60%)", line: "hsl(217 85% 55% / 0.3)", glow: "hsl(217 91% 60% / 0.55)" };

  const w = compact ? 120 : 180;
  const h = compact ? 32 : 44;

  // Node positions (x, y, delay)
  const nodes: [number, number, number][] = compact
    ? [[15, 16, 0], [38, 8, 0.3], [60, 24, 0.6], [82, 10, 0.9], [105, 18, 1.2]]
    : [[14, 22, 0], [42, 10, 0.25], [68, 32, 0.5], [94, 14, 0.75], [120, 28, 1.0], [146, 16, 1.25], [166, 26, 1.5]];

  // Connections between nodes
  const lines = compact
    ? [[0,1],[1,2],[2,3],[3,4],[1,3]]
    : [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[1,3],[2,4],[3,5]];

  return (
    <div className="flex items-center gap-2">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        <defs>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Lines */}
        {lines.map(([a, b], i) => (
          <line
            key={`l${i}`}
            x1={nodes[a][0]} y1={nodes[a][1]}
            x2={nodes[b][0]} y2={nodes[b][1]}
            stroke={color.line}
            strokeWidth={1}
          >
            <animate
              attributeName="opacity"
              values="0.2;0.7;0.2"
              dur="2s"
              begin={`${nodes[a][2]}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}

        {/* Nodes */}
        {nodes.map(([x, y, delay], i) => (
          <g key={`n${i}`} filter="url(#node-glow)">
            <circle cx={x} cy={y} r={compact ? 2.5 : 3.5} fill={color.node}>
              <animate
                attributeName="opacity"
                values="0.15;1;0.15"
                dur="1.8s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values={compact ? "2;3.5;2" : "2.5;4.5;2.5"}
                dur="1.8s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>
      <span
        className="text-[11px] font-medium animate-pulse"
        style={{ color: color.node, fontFamily: theme === "dark" ? "'JetBrains Mono', monospace" : undefined }}
      >
        {theme === "dark" ? "PROCESSING..." : "Pensando..."}
      </span>
    </div>
  );
}
