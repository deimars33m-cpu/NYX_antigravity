interface NyxLexLogoProps {
  size?: number;
  variant?: "light" | "dark" | "auto";
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * NYX LEX brand logo – SVG vector.
 * Geometry: 35° intersecting lines with central gold orb.
 * Wordmark: "NYX LEX" in wide-tracked uppercase.
 * Tagline: "LEGAL TECHNOLOGIES".
 */
export default function NyxLexLogo({
  size = 80,
  variant = "auto",
  showText = true,
  showTagline = false,
  className = "",
  style,
}: NyxLexLogoProps) {
  // Determine colors based on variant
  const isDark = variant === "dark";
  const isLight = variant === "light";

  // Holographic Icy Palette
  const primaryColor = isDark ? "#a5f3fc" : isLight ? "hsl(221 83% 53%)" : "hsl(38 75% 55%)";
  const glowColor = isDark ? "#ffffff" : isLight ? "#ffffff" : "#D4AF37";
  const textColor = isDark ? "#ffffff" : isLight ? "hsl(220 20% 18%)" : "hsl(25 40% 12%)"; // Darker for Classic
  const taglineColor = isDark ? "rgba(165, 243, 252, 0.6)" : isLight ? "hsl(220 10% 50%)" : "hsl(25 20% 32%)";

  const iconSize = size;
  const paddingTop = 15; // Extra padding to avoid cutting at the top
  const totalHeight = showText ? iconSize + 45 : iconSize + paddingTop;
  const totalWidth = showText ? Math.max(iconSize, 140) : iconSize + 20;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      width={totalWidth}
      height={totalHeight}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        {/* Intensified glow for the central point */}
        <filter id="holographicGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
          <feFlood floodColor={isDark ? "#a5f3fc" : glowColor} floodOpacity="0.8" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" /> {/* Double merge for extra intensity */}
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle shimmer for lines */}
        <filter id="lineShimmer" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
          <feFlood floodColor={primaryColor} floodOpacity="0.4" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Icon group – centered */}
      <g transform={`translate(${totalWidth / 2}, ${iconSize / 2 + paddingTop})`}>
        {/* Intersecting lines - Crystal/Icy effect */}
        <line
          x1={-iconSize * 0.38}
          y1={iconSize * 0.27}
          x2={iconSize * 0.38}
          y2={-iconSize * 0.27}
          stroke={primaryColor}
          strokeWidth={0.8}
          opacity={isDark ? 0.5 : 0.7}
          filter="url(#lineShimmer)"
        />
        <line
          x1={-iconSize * 0.38}
          y1={-iconSize * 0.27}
          x2={iconSize * 0.38}
          y2={iconSize * 0.27}
          stroke={primaryColor}
          strokeWidth={0.8}
          opacity={isDark ? 0.5 : 0.7}
          filter="url(#lineShimmer)"
        />

        {/* Central High-Glow Point */}
        <circle
          cx={0}
          cy={0}
          r={iconSize * 0.045}
          fill="#ffffff"
          filter="url(#holographicGlow)"
        />

        {/* Inner core brightness */}
        <circle
          cx={0}
          cy={0}
          r={iconSize * 0.02}
          fill="#ffffff"
        />
      </g>

      {/* Wordmark - Newsreader Typography */}
      {showText && (
        <text
          x={totalWidth / 2}
          y={iconSize + paddingTop + 22}
          textAnchor="middle"
          fill={textColor}
          fontSize={iconSize * 0.22}
          fontFamily="'Newsreader', serif"
          fontWeight={300}
          letterSpacing={iconSize * 0.1}
          className="uppercase"
          style={{
            textShadow: isDark ? `0 0 15px rgba(165, 243, 252, 0.2)` : 'none'
          }}
        >
          NYX LEX
        </text>
      )}

    </svg>
  );
}
