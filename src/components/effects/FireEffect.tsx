import { useEffect, useState } from "react";

export const FireEffect = () => {
  const [particles, setParticles] = useState<
    Array<{
      width: number;
      left: number;
      delay: number;
      duration: number;
      side: "top" | "right" | "bottom" | "left";
      offset: number;
    }>
  >([]);

  useEffect(() => {
    // Generate many small ember particles
    const particleCount = 150;
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      const sideIdx = Math.floor(Math.random() * 4);
      const sides: ("top" | "right" | "bottom" | "left")[] = [
        "top",
        "right",
        "bottom",
        "left",
      ];
      const side = sides[sideIdx];

      // Random usage
      // Embers are small (2-4px)
      const width = 2 + Math.random() * 3;

      newParticles.push({
        width,
        left: Math.random() * 100, // Position along the edge
        delay: Math.random() * 2,
        duration: 1 + Math.random() * 1.5,
        side,
        offset: (Math.random() - 0.5) * 10, // slight wobble from line
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-x-[-4px] inset-y-[-4px] pointer-events-none z-0 rounded-2xl overflow-visible">
      {/* Base Glow Container - Using box shadow for the main "hot" look */}
      <div className="absolute inset-0 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4),inset_0_0_10px_rgba(220,38,38,0.2)] border border-red-500/30" />

      {/* Particles Container */}
      <div className="w-full h-full relative">
        {particles.map((p, i) => {
          // Position logic
          let style: React.CSSProperties = {
            width: `${p.width}px`,
            height: `${p.width}px`,
            position: "absolute",
            backgroundColor: Math.random() > 0.6 ? "#fb923c" : "#ef4444", // Orange-400 or Red-500
            borderRadius: "50%",
            boxShadow: "0 0 4px #dc2626",
            opacity: 0,
            animation: `ember-rise ${p.duration}s linear ${p.delay}s infinite`,
          };

          if (p.side === "top") {
            style.top = "-2px";
            style.left = `${p.left}%`;
            style.transformOrigin = "bottom center";
          } else if (p.side === "bottom") {
            style.bottom = "-2px";
            style.left = `${p.left}%`;
            style.transformOrigin = "bottom center"; // actually they stick to border?
            // If it's bottom border, fire goes UP (inside board).
          } else if (p.side === "left") {
            style.left = "-2px";
            style.top = `${p.left}%`; // re-using 'left' var for linear pos
          } else if (p.side === "right") {
            style.right = "-2px";
            style.top = `${p.left}%`;
          }

          return <div key={i} style={style} />;
        })}
      </div>

      <style jsx>{`
        @keyframes ember-rise {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.5);
          }
          20% {
            opacity: 0.8;
            transform: translateY(-5px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0);
          }
        }
      `}</style>
    </div>
  );
};
