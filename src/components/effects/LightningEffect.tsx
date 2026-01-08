import { memo, useMemo } from "react";

export const LightningEffect = memo(() => {
  // We'll create 3 layers of electric currents for depth

  return (
    <div className="absolute inset-[-12px] pointer-events-none z-0 rounded-2xl overflow-visible">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id="lightning-jagged"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.15"
              numOctaves="4"
              result="noise"
            >
              <animate
                attributeName="seed"
                from="1"
                to="50"
                dur="3s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <linearGradient
            id="electric-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#60a5fa" /> {/* Blue-400 */}
            <stop offset="50%" stopColor="#facc15" /> {/* Yellow-400 */}
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Outer Electric Glow - Blueish */}
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="4"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
          filter="url(#lightning-jagged)"
          className="opacity-40"
        />

        {/* Primary Bolt - Yellow/Blue Gradient */}
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="4"
          fill="none"
          stroke="url(#electric-gradient)"
          strokeWidth="1"
          filter="url(#lightning-jagged)"
          className="opacity-80"
          style={{
            animation: "bolt-flicker 0.15s infinite alternate",
          }}
        />

        {/* Core Hot Spark - White/Yellow */}
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="4"
          fill="none"
          stroke="#fff"
          strokeWidth="0.5"
          filter="url(#lightning-jagged)"
          className="opacity-90"
        />
      </svg>

      {/* Outer Border Glow Overlay */}
      <div className="absolute inset-[10px] border border-yellow-400/20 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3),inset_0_0_15px_rgba(250,204,21,0.2)] animate-pulse-slow" />

      <style jsx>{`
        @keyframes bolt-flicker {
          0%,
          100% {
            opacity: 0.8;
            stroke-width: 1;
          }
          50% {
            opacity: 1;
            stroke-width: 1.3;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.005);
          }
        }
      `}</style>
    </div>
  );
});

LightningEffect.displayName = "LightningEffect";
