/* Stylized SVG illustration of a graduation cap on a stack of books with
   glowing stars and dollar coins — replaces the 3D render in the reference. */

export function HeroIllustration() {
  return (
    <div className="relative w-full aspect-[5/4] rounded-[1.75rem] border border-border overflow-hidden bg-bg-soft">
      {/* Inner ambient glow */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 60% 55%, rgba(34, 211, 238, 0.20), transparent 70%), radial-gradient(60% 50% at 30% 60%, rgba(168, 85, 247, 0.18), transparent 70%), radial-gradient(45% 35% at 75% 70%, rgba(236, 72, 153, 0.18), transparent 70%)",
        }}
      />

      <svg
        viewBox="0 0 500 400"
        className="absolute inset-0 w-full h-full float-soft"
        aria-hidden
      >
        <defs>
          <linearGradient id="bookA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="bookB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#A855F7" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id="bookC" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#1E274D" />
          </linearGradient>
          <linearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <radialGradient id="coinGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#FCD34D" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="coin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#22D3EE" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#A855F7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Constellation lines connecting stars */}
        <g stroke="url(#strokeGrad)" strokeWidth="1" fill="none" opacity="0.55">
          <path d="M 90 90 L 160 110 L 220 60 L 300 90 L 360 50 L 430 100" />
          <path d="M 60 250 L 110 280 L 80 340" />
          <path d="M 410 240 L 460 280 L 430 340" />
        </g>

        {/* Stars */}
        <g fill="#FCD34D">
          <Star x={90}  y={90}  r={3} delay="0s" />
          <Star x={160} y={110} r={2.4} delay="0.4s" />
          <Star x={220} y={60}  r={3.6} delay="0.8s" />
          <Star x={300} y={90}  r={2.6} delay="0.2s" />
          <Star x={360} y={50}  r={3} delay="1.2s" />
          <Star x={430} y={100} r={2.4} delay="0.6s" />
          <Star x={60}  y={250} r={2.6} delay="1s" />
          <Star x={110} y={280} r={3} delay="0.3s" />
          <Star x={80}  y={340} r={2.2} delay="0.9s" />
          <Star x={410} y={240} r={3} delay="0.5s" />
          <Star x={460} y={280} r={2.4} delay="1.1s" />
          <Star x={430} y={340} r={2.8} delay="0.1s" />
        </g>

        {/* Glowing coins */}
        <g>
          <circle cx="120" cy="200" r="42" fill="url(#coinGlow)" />
          <circle cx="120" cy="200" r="18" fill="url(#coin)" stroke="#92400E" strokeWidth="1" />
          <text x="120" y="206" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="20" fontWeight="800" fill="#7C2D12">$</text>

          <circle cx="400" cy="220" r="46" fill="url(#coinGlow)" />
          <circle cx="400" cy="220" r="20" fill="url(#coin)" stroke="#92400E" strokeWidth="1" />
          <text x="400" y="227" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="22" fontWeight="800" fill="#7C2D12">$</text>
        </g>

        {/* Book stack ----------------------------------------------- */}
        <g transform="translate(150 240)">
          {/* bottom book */}
          <rect x="0"  y="60" width="200" height="36" rx="3" fill="url(#bookC)" />
          <rect x="6"  y="64" width="188" height="3"  fill="#0B0F23" opacity="0.5" />
          <rect x="0"  y="92" width="200" height="6"  fill="#0B0F23" opacity="0.6" />

          {/* middle book */}
          <rect x="10" y="32" width="180" height="32" rx="3" fill="url(#bookB)" />
          <rect x="14" y="36" width="172" height="2"  fill="#0B0F23" opacity="0.4" />
          <rect x="10" y="60" width="180" height="6"  fill="#0B0F23" opacity="0.5" />

          {/* top book */}
          <rect x="22" y="4"  width="156" height="30" rx="3" fill="url(#bookA)" />
          <rect x="26" y="8"  width="148" height="2"  fill="#0B0F23" opacity="0.45" />
          <rect x="22" y="30" width="156" height="6"  fill="#0B0F23" opacity="0.55" />
        </g>

        {/* Graduation cap on top ------------------------------------ */}
        <g transform="translate(180 130)">
          {/* cap base */}
          <path
            d="M 5 60 Q 70 90 135 60 L 135 75 Q 70 105 5 75 Z"
            fill="url(#cap)"
          />
          {/* mortarboard top */}
          <polygon
            points="70,20 145,55 70,90 -5,55"
            fill="url(#cap)"
            stroke="#0B0F23"
            strokeWidth="1"
          />
          {/* button */}
          <circle cx="70" cy="55" r="3" fill="#FCD34D" />
          {/* tassel */}
          <path d="M 70 55 L 110 50 L 110 85" stroke="#FCD34D" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 110 85 L 105 96 M 110 85 L 110 96 M 110 85 L 115 96" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Tiny accent stars near the cap */}
        <g fill="#FCD34D">
          <Star x={170} y={120} r={2} delay="0.7s" />
          <Star x={340} y={150} r={2.2} delay="1.3s" />
          <Star x={250} y={80} r={1.8} delay="0.4s" />
        </g>
      </svg>
    </div>
  );
}

function Star({ x, y, r, delay }: { x: number; y: number; r: number; delay: string }) {
  return (
    <g transform={`translate(${x} ${y})`} className="twinkle" style={{ animationDelay: delay, transformOrigin: `${x}px ${y}px` }}>
      <circle r={r} />
      <path
        d={`M 0 ${-r * 2.2} L ${r * 0.5} ${-r * 0.5} L ${r * 2.2} 0 L ${r * 0.5} ${r * 0.5} L 0 ${r * 2.2} L ${-r * 0.5} ${r * 0.5} L ${-r * 2.2} 0 L ${-r * 0.5} ${-r * 0.5} Z`}
        fill="currentColor"
        opacity="0.7"
      />
    </g>
  );
}
