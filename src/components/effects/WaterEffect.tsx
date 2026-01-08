import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WaterEffectProps {
  lastMove: { row: number; col: number; playerId: string } | null;
}

type Ripple = {
  id: number;
  x: number;
  y: number;
};

export const WaterEffect = memo(({ lastMove }: WaterEffectProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    if (lastMove) {
      const newRipple: Ripple = {
        id: Date.now(),
        x: ((lastMove.col + 0.5) / 3) * 100,
        y: ((lastMove.row + 0.5) / 3) * 100,
      };

      setRipples((prev) => [...prev, newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 1500);
    }
  }, [lastMove]);

  return (
    <div className="absolute inset-[-24px] pointer-events-none z-0 rounded-2xl overflow-hidden">
      {/* DEEP BLUE BASE GLOW - No blur, use opacity/gradient instead */}
      <div className="absolute inset-0 bg-blue-900/10 animate-pulse-slow" />

      {/* REACTIVE WATER SURFACE - SVG FILTER */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="water-turbulence">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.015"
              numOctaves="2"
            >
              <animate
                attributeName="baseFrequency"
                dur="20s"
                values="0.01 0.015;0.015 0.01;0.01 0.015"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="15" />
          </filter>

          <linearGradient id="water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="url(#water-gradient)"
          filter="url(#water-turbulence)"
          className="opacity-40"
        />

        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.1"
          filter="url(#water-turbulence)"
        />
      </svg>

      {/* BUBBLES - CSS ANIMATION FOR PERFORMANCE */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bubble absolute rounded-full border border-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: "-10px",
              width: `${4 + Math.random() * 4}px`,
              height: `${4 + Math.random() * 4}px`,
              animation: `float ${6 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              background: "rgba(255, 255, 255, 0.1)",
            }}
          />
        ))}
      </div>

      {/* PLACEMENT RIPPLES */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 5.0, opacity: 0 }}
                transition={{
                  duration: 1.4,
                  delay: i * 0.2,
                  ease: "easeOut",
                }}
                className="absolute border-2 border-blue-100/40 rounded-full"
                style={{
                  width: "50px",
                  height: "50px",
                  left: "-25px",
                  top: "-25px",
                }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>

      <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay pointer-events-none" />

      {/* BORDER GLOW */}
      <div className="absolute inset-[8px] border border-blue-400/10 rounded-xl" />

      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          20% {
            opacity: 0.4;
          }
          80% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-400px) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
});

WaterEffect.displayName = "WaterEffect";
