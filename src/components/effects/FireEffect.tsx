import { useEffect, useState } from "react";

export const FireEffect = () => {
  const [baseParticles, setBaseParticles] = useState<
    Array<{
      width: number;
      left: number;
      delay: number;
      duration: number;
      side: "top" | "right" | "bottom" | "left";
      color: string;
    }>
  >([]);

  const [sparkParticles, setSparkParticles] = useState<
    Array<{
      width: number;
      left: number;
      delay: number;
      duration: number;
      side: "top" | "right" | "bottom" | "left";
    }>
  >([]);

  useEffect(() => {
    // 1. CARTOON BASE FIRE
    // Large, dense particles that merge into a "solid" shape via contrast filter
    const baseCount = 200;
    const newBase = [];
    // Using bold, flat colors for cartoon look
    const colors = ["#ef4444", "#f97316", "#fbbf24"]; // Red-500, Orange-500, Amber-400

    for (let i = 0; i < baseCount; i++) {
      const sideIdx = Math.floor(Math.random() * 4);
      const sides: ("top" | "right" | "bottom" | "left")[] = [
        "top",
        "right",
        "bottom",
        "left",
      ];
      newBase.push({
        width: 15 + Math.random() * 10, // BIG particles to form a solid line
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.5 + Math.random() * 0.5,
        side: sides[sideIdx],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setBaseParticles(newBase);

    // 2. SPARKS (Cartoon debris)
    // Fewer, but distinct
    const sparkCount = 40;
    const newSparks = [];
    for (let i = 0; i < sparkCount; i++) {
      const sideIdx = Math.floor(Math.random() * 4);
      const sides: ("top" | "right" | "bottom" | "left")[] = [
        "top",
        "right",
        "bottom",
        "left",
      ];
      newSparks.push({
        width: 3 + Math.random() * 3, // slightly chunkier sparks
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.8 + Math.random() * 1,
        side: sides[sideIdx],
      });
    }
    setSparkParticles(newSparks);
  }, []);

  const getPositionStyle = (p: any, type: "base" | "spark") => {
    let style: React.CSSProperties = {
      width: `${p.width}px`,
      height: `${p.width}px`,
      position: "absolute",
      borderRadius: "50%",
    };

    if (type === "base") {
      style.backgroundColor = p.color;
      style.opacity = 1; // Full opacity for cartoon look (filter handles edging)
      style.animation = `fire-cartoon ${p.duration}s ease-in-out ${p.delay}s infinite alternate`;
    } else {
      style.backgroundColor = "#fbbf24"; // Amber-400
      style.opacity = 0;
      style.animation = `ember-fly ${p.duration}s linear ${p.delay}s infinite`;
    }

    // Tighter offset to ensure it overlaps the board border
    const offset = "-10px";

    if (p.side === "top") {
      style.top = offset;
      style.left = `${p.left}%`;
    } else if (p.side === "bottom") {
      style.bottom = offset;
      style.left = `${p.left}%`; // Inside? To burn UP?
      // If we want it to look "attached", it should span the edge.
      // Let's keep it consistent.
    } else if (p.side === "left") {
      style.left = offset;
      style.top = `${p.left}%`;
    } else if (p.side === "right") {
      style.right = offset;
      style.top = `${p.left}%`;
    }

    return style;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-visible rounded-2xl">
      {/* CARTOON FILTER CONTAINER */}
      {/* High contrast + Blur = Sharp edges (Metaball effect) */}
      <div
        className="absolute inset-x-[-15px] inset-y-[-15px]"
        style={{ filter: "blur(5px) contrast(10)" }}
      >
        {/* Background additive layer for "hot" core */}
        <div className="absolute inset-0 bg-red-600/20 blur-xl" />

        {baseParticles.map((p, i) => (
          <div key={`base-${i}`} style={getPositionStyle(p, "base")} />
        ))}
      </div>

      {/* SPARKS LAYER (No Filter) */}
      <div className="absolute inset-0">
        {sparkParticles.map((p, i) => (
          <div key={`spark-${i}`} style={getPositionStyle(p, "spark")} />
        ))}
      </div>

      <style jsx>{`
        @keyframes fire-cartoon {
          0% {
            transform: scale(0.9) translate(0, 0);
          }
          100% {
            transform: scale(1.1) translate(0, -8px);
          } /* Simply move UP */
        }

        /* Rotate side fires? For now simple UP movement works for "burning" 
               but for sides it effectively shears. */

        @keyframes ember-fly {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          20% {
            opacity: 1;
            transform: translateY(-5px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) scale(0);
          }
        }
      `}</style>
    </div>
  );
};
