import { useEffect, useMemo } from "react";

type Side = "top" | "right" | "bottom" | "left";

type Particle = {
  side: Side;
  pos: number;
  size: number;
  delay: number;
  duration: number;
  hue: number;
};

export const FireEffect = () => {
  const particles = useMemo<Particle[]>(() => {
    const result: Particle[] = [];
    const sides: Side[] = ["top", "right", "bottom", "left"];

    const PER_SIDE = 80; // cukup padat, tapi kecil

    sides.forEach((side) => {
      for (let i = 0; i < PER_SIDE; i++) {
        result.push({
          side,
          pos: (i / PER_SIDE) * 100 + (Math.random() - 0.5) * 4,
          size: 5 + Math.random() * 6, // kecil → menyatu
          delay: Math.random() * 2,
          duration: 1.2 + Math.random() * 1.2,
          hue: Math.random() * 35, // 0-35: Red to Orange-Yellow
        });
      }
    });

    return result;
  }, []);

  const getStyle = (p: Particle): React.CSSProperties => {
    const style: React.CSSProperties = {
      position: "absolute",
      width: p.size,
      height: p.size,
      borderRadius: "50%",
      background: `hsl(${p.hue}, 100%, 60%)`,
      opacity: 0.6,
      animation: `fire-${p.side} ${p.duration}s linear ${p.delay}s infinite`,
      willChange: "transform, opacity",
    };

    const offset = "-6px";
    const jitter = (Math.random() - 0.5) * 6;

    if (p.side === "top") {
      style.top = offset;
      style.left = `calc(${p.pos}% + ${jitter}px)`;
    }

    if (p.side === "bottom") {
      style.bottom = offset;
      style.left = `calc(${p.pos}% + ${jitter}px)`;
    }

    if (p.side === "left") {
      style.left = offset;
      style.top = `calc(${p.pos}% + ${jitter}px)`;
    }

    if (p.side === "right") {
      style.right = offset;
      style.top = `calc(${p.pos}% + ${jitter}px)`;
    }

    return style;
  };

  return (
    <div className="absolute inset-[-10px] pointer-events-none rounded-xl">
      {/* HEATED BOARD TINT */}
      <div
        className="absolute inset-[10px] rounded-xl bg-orange-600/10 animate-pulse-slow"
        style={{
          boxShadow: "inset 0 0 40px rgba(251, 146, 60, 0.2)",
        }}
      />

      {/* CORE FIRE */}
      <div
        className="absolute inset-0"
        style={{
          filter: "blur(6px) contrast(4)",
        }}
      >
        {particles.map((p, i) => (
          <div key={i} style={getStyle(p)} />
        ))}
      </div>

      {/* SOFT GLOW */}
      <div
        className="absolute inset-0"
        style={{
          filter: "blur(14px)",
          opacity: 0.3,
        }}
      >
        {particles.map((p, i) => (
          <div key={`glow-${i}`} style={getStyle(p)} />
        ))}
      </div>

      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes fire-top {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-22px);
          }
        }

        @keyframes fire-bottom {
          0% {
            opacity: 0;
            transform: translateY(-6px);
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(22px);
          }
        }

        @keyframes fire-left {
          0% {
            opacity: 0;
            transform: translateX(6px);
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(-22px);
          }
        }

        @keyframes fire-right {
          0% {
            opacity: 0;
            transform: translateX(-6px);
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(22px);
          }
        }
      `}</style>
    </div>
  );
};
