import { memo } from "react";
import { motion } from "framer-motion";

export const WaterEffect = memo(() => {
  return (
    <div className="absolute inset-[-12px] pointer-events-none z-0 rounded-2xl overflow-hidden">
      {/* DEEP BLUE BASE GLOW */}
      <div className="absolute inset-0 bg-blue-600/5 blur-xl animate-pulse-slow" />

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
              baseFrequency="0.015 0.02"
              numOctaves="3"
            >
              <animate
                attributeName="baseFrequency"
                dur="15s"
                values="0.015 0.02;0.02 0.015;0.015 0.02"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="10" />
          </filter>

          <linearGradient id="water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Shimmering Surface */}
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="url(#water-gradient)"
          filter="url(#water-turbulence)"
          className="opacity-40"
        />

        {/* Caustics / Light Refractions */}
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="none"
          stroke="white"
          strokeWidth="0.2"
          strokeDasharray="1 2"
          filter="url(#water-turbulence)"
          className="opacity-10"
        />
      </svg>

      {/* BUBBLES */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              bottom: "-5%",
              left: Math.random() * 100 + "%",
              scale: 0,
              opacity: 0,
            }}
            animate={{
              bottom: "105%",
              scale: [0, 1, 1, 0],
              opacity: [0, 0.4, 0.4, 0],
              x: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            className="absolute w-2 h-2 border border-blue-300/30 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent)",
            }}
          />
        ))}
      </div>

      {/* CAUSTIC OVERLAY */}
      <div
        className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-white/5 mix-blend-overlay animate-pulse-slow"
        style={{ animationDuration: "8s" }}
      />

      {/* BORDER GLOW */}
      <div className="absolute inset-[8px] border border-blue-400/20 rounded-xl shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]" />

      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
});

WaterEffect.displayName = "WaterEffect";
