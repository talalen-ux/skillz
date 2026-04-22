/**
 * SVG placeholder for the hero's brand moment. Mimics the reference's
 * bronze-metallic coil without a real 3D render — uses layered stroked
 * Bezier curves with a copper → steel gradient, orbital rings, and a
 * soft radial glow. Swap for a real 3D asset when available.
 */
export function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative aspect-square w-full ${className}`} aria-hidden>
      {/* Radial glow backdrop */}
      <div className="absolute inset-0 bg-accent-radial" />

      <svg
        viewBox="0 0 600 600"
        className="relative h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Copper → deep bronze → gunmetal, used for each coil strand */}
          <linearGradient id="coilGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F2C097" />
            <stop offset="35%" stopColor="#D4A373" />
            <stop offset="65%" stopColor="#8B5A3D" />
            <stop offset="100%" stopColor="#2A2A2E" />
          </linearGradient>

          {/* Subtle inner highlight along each ribbon */}
          <linearGradient id="highlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="35%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <radialGradient id="orbGlow" cx="55%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(212,163,115,0.35)" />
            <stop offset="60%" stopColor="rgba(212,163,115,0.05)" />
            <stop offset="100%" stopColor="rgba(212,163,115,0)" />
          </radialGradient>
        </defs>

        {/* Orbital rings — distant */}
        <circle
          cx="300"
          cy="300"
          r="280"
          stroke="#1F1F22"
          strokeWidth="1"
          fill="none"
          strokeDasharray="2 8"
        />
        <circle
          cx="300"
          cy="300"
          r="230"
          stroke="#16161A"
          strokeWidth="1"
          fill="none"
        />

        {/* Orbital ring — accent arc (partial) */}
        <path
          d="M 60 300 A 240 240 0 0 1 300 60"
          stroke="#3A2A22"
          strokeWidth="1"
          fill="none"
        />

        {/* Central orb glow */}
        <circle cx="330" cy="280" r="200" fill="url(#orbGlow)" />

        {/* Coil strands — five layered sweeping curves to read as a "fan" */}
        <g opacity="0.95">
          {[0, 1, 2, 3, 4].map((i) => {
            const offset = i * 14 - 28;
            return (
              <path
                key={i}
                d={`M ${140 + offset} ${380 + offset * 0.5}
                    C ${260 + offset} ${90 + offset * 0.3},
                      ${480 + offset * 0.2} ${180 + offset * 0.4},
                      ${500 + offset * 0.4} ${360 + offset * 0.6}
                    S ${360 + offset * 0.2} ${540}, ${260 + offset} ${460 + offset * 0.3}`}
                stroke="url(#coilGrad)"
                strokeWidth="22"
                strokeLinecap="round"
                fill="none"
                opacity={1 - i * 0.12}
              />
            );
          })}
        </g>

        {/* Ribbon highlights — a single thin stroke running along the top edge */}
        <g opacity="0.5">
          {[0, 1, 2].map((i) => {
            const offset = i * 14 - 14;
            return (
              <path
                key={`h-${i}`}
                d={`M ${140 + offset} ${380 + offset * 0.5}
                    C ${260 + offset} ${90 + offset * 0.3},
                      ${480 + offset * 0.2} ${180 + offset * 0.4},
                      ${500 + offset * 0.4} ${360 + offset * 0.6}`}
                stroke="url(#highlight)"
                strokeWidth="2"
                fill="none"
              />
            );
          })}
        </g>

        {/* Tiny particle dots */}
        <g fill="#57534E">
          <circle cx="90" cy="140" r="1.5" />
          <circle cx="520" cy="110" r="1.5" />
          <circle cx="540" cy="460" r="1.5" />
          <circle cx="130" cy="520" r="1.5" />
        </g>
      </svg>
    </div>
  );
}
