import { useEffect, useRef, memo } from "react";
import * as PIXI from "pixi.js";

type Side = "top" | "right" | "bottom" | "left";

interface ParticleData {
  sprite: PIXI.Graphics;
  side: Side;
  pos: number;
  jitter: number;
  maxLife: number;
  life: number;
}

export const FireEffect = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let app: PIXI.Application | null = null;
    let isDisposed = false;

    const init = async () => {
      if (!containerRef.current) return;

      const newApp = new PIXI.Application();

      try {
        await newApp.init({
          resizeTo: containerRef.current,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (isDisposed) {
          newApp.destroy(true, { children: true, texture: true });
          return;
        }

        app = newApp;
        containerRef.current.appendChild(app.canvas);

        const particlesContainer = new PIXI.Container();
        app.stage.addChild(particlesContainer);

        // Core Fire look: Blur + Brighten
        const blurFilter = new PIXI.BlurFilter();
        blurFilter.blur = 6;

        // We can use a color matrix to boost the "glow" and contrast
        const colorMatrix = new PIXI.ColorMatrixFilter();
        colorMatrix.matrix = [
          1.5, 0, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 0, 1, 0,
        ];

        particlesContainer.filters = [blurFilter, colorMatrix];

        const particles: ParticleData[] = [];
        const PER_SIDE = 80;
        const sides: Side[] = ["top", "right", "bottom", "left"];

        const createParticle = (side: Side, pos: number): ParticleData => {
          const graphics = new PIXI.Graphics();
          const size = 5 + Math.random() * 6;
          const hue = Math.random() * 35;

          graphics.circle(0, 0, size);
          graphics.fill({
            color: PIXI.Color.shared
              .setValue(`hsl(${hue}, 100%, 60%)`)
              .toNumber(),
            alpha: 0.6,
          });

          particlesContainer.addChild(graphics);

          return {
            sprite: graphics,
            side,
            pos,
            jitter: (Math.random() - 0.5) * 6,
            maxLife: 1.2 + Math.random() * 1.2,
            life: Math.random() * (1.2 + Math.random() * 1.2),
          };
        };

        sides.forEach((side) => {
          for (let i = 0; i < PER_SIDE; i++) {
            const pos = (i / PER_SIDE) * 100 + (Math.random() - 0.5) * 4;
            particles.push(createParticle(side, pos));
          }
        });

        app.ticker.add((ticker) => {
          if (isDisposed || !app) return;

          const deltaInSeconds = ticker.deltaTime / 60;
          const { width, height } = app.screen;

          // The margin where the board border lies relative to the container
          const MARGIN = 40;

          particles.forEach((p) => {
            p.life += deltaInSeconds;
            if (p.life > p.maxLife) {
              p.life = 0;
            }

            const progress = p.life / p.maxLife;
            const alpha =
              progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
            p.sprite.alpha = alpha * 0.8;

            const travel = progress * 30; // Float upwards/outwards

            if (p.side === "top") {
              p.sprite.x =
                (p.pos / 100) * (width - MARGIN * 2) + MARGIN + p.jitter;
              p.sprite.y = MARGIN - travel;
            } else if (p.side === "bottom") {
              p.sprite.x =
                (p.pos / 100) * (width - MARGIN * 2) + MARGIN + p.jitter;
              p.sprite.y = height - MARGIN + travel;
            } else if (p.side === "left") {
              p.sprite.x = MARGIN - travel;
              p.sprite.y =
                (p.pos / 100) * (height - MARGIN * 2) + MARGIN + p.jitter;
            } else if (p.side === "right") {
              p.sprite.x = width - MARGIN + travel;
              p.sprite.y =
                (p.pos / 100) * (height - MARGIN * 2) + MARGIN + p.jitter;
            }
          });
        });
      } catch (error) {
        console.error("Failed to initialize PixiJS:", error);
      }
    };

    init();

    return () => {
      isDisposed = true;
      if (app) {
        app.destroy(true, { children: true, texture: true });
        app = null;
      }
    };
  }, []);

  return (
    <div className="absolute inset-[-40px] pointer-events-none rounded-xl overflow-visible z-20">
      {/* HEATED BOARD TINT */}
      <div
        className="absolute inset-[40px] rounded-xl bg-orange-600/10"
        style={{
          boxShadow: "inset 0 0 50px rgba(251, 146, 60, 0.3)",
          animation: "pulse-slow 4s ease-in-out infinite",
        }}
      />

      {/* PIXI CANVAS CONTAINER */}
      <div ref={containerRef} className="absolute inset-0" />

      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
});

FireEffect.displayName = "FireEffect";
