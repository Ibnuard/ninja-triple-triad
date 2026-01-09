import { useEffect, useRef, memo, useState } from "react";
import * as PIXI from "pixi.js";

interface FireEffectProps {
  lastMove: { row: number; col: number; playerId: string } | null;
}

interface EmberGrid {
  graphics: PIXI.Graphics;
  points: { x: number; y: number }[];
}

interface Particle {
  graphics: PIXI.Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  isSmoke: boolean;
}

interface FlameParticle {
  graphics: PIXI.Graphics;
  side: "top" | "bottom" | "left" | "right";
  pos: number;
  life: number;
  maxLife: number;
  speed: number;
}

export const FireEffect = memo(({ lastMove }: FireEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const impactQueue = useRef<{ x: number; y: number }[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (lastMove) {
      impactQueue.current.push({
        x: (lastMove.col + 0.5) / 3,
        y: (lastMove.row + 0.5) / 3,
      });
    }
  }, [lastMove]);

  useEffect(() => {
    let app: PIXI.Application | null = null;
    let isDisposed = false;
    let animationId: number | null = null;
    let lastTime = 0;

    const init = async () => {
      if (!containerRef.current) return;

      const newApp = new PIXI.Application();
      try {
        await newApp.init({
          resizeTo: containerRef.current,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(1.5, window.devicePixelRatio || 1),
          autoDensity: true,
          powerPreference: "high-performance",
        });

        if (isDisposed) {
          newApp.destroy(true, { children: true, texture: true });
          return;
        }

        app = newApp;
        containerRef.current.appendChild(app.canvas);
        setIsReady(true);

        const { width, height } = app.screen;
        const stage = app.stage;

        // 1. CHARRED COAL TEXTURE (Background)
        const bgLayer = new PIXI.Container();
        stage.addChild(bgLayer);

        const createCharredTexture = () => {
          const size = 512;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Dark charred base
            ctx.fillStyle = "#0c0a09"; // Stone 950
            ctx.fillRect(0, 0, size, size);

            // Texture noise
            for (let i = 0; i < 15000; i++) {
              ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`;
              ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
            }

            // Burnt grain
            for (let i = 0; i < 100; i++) {
              const x = Math.random() * size,
                y = Math.random() * size;
              const w = 2 + Math.random() * 15,
                h = 1 + Math.random() * 2;
              ctx.fillStyle = "rgba(0,0,0,0.4)";
              ctx.fillRect(x, y, w, h);
            }

            // Subtle glowing coal patches
            for (let i = 0; i < 15; i++) {
              const x = Math.random() * size,
                y = Math.random() * size;
              const rad = 20 + Math.random() * 40;
              const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
              grad.addColorStop(0, "rgba(124, 45, 18, 0.15)"); // Orange 900
              grad.addColorStop(1, "rgba(124, 45, 18, 0)");
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(x, y, rad, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          return PIXI.Texture.from(canvas);
        };
        const bed = new PIXI.TilingSprite({
          texture: createCharredTexture(),
          width,
          height,
        });
        bed.alpha = 0.9;
        bgLayer.addChild(bed);

        // 2. EMBER GRID LINES
        const gridLayer = new PIXI.Container();
        stage.addChild(gridLayer);

        const createJaggedLine = (
          x1: number,
          y1: number,
          x2: number,
          y2: number
        ) => {
          const pts = [{ x: x1, y: y1 }];
          const dx = x2 - x1,
            dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const segments = Math.floor(dist / 20);
          for (let i = 1; i < segments; i++) {
            const p = i / segments;
            pts.push({
              x: x1 + dx * p + (Math.random() - 0.5) * 12,
              y: y1 + dy * p + (Math.random() - 0.5) * 12,
            });
          }
          pts.push({ x: x2, y: y2 });
          return pts;
        };

        const grids: EmberGrid[] = [];
        for (let i = 1; i < 3; i++) {
          const vx = (i / 3) * width,
            hy = (i / 3) * height;
          grids.push({
            graphics: new PIXI.Graphics(),
            points: createJaggedLine(vx, 0, vx, height),
          });
          grids.push({
            graphics: new PIXI.Graphics(),
            points: createJaggedLine(0, hy, width, hy),
          });
        }
        grids.forEach((g) => gridLayer.addChild(g.graphics));

        // 3. FLAME BORDER (Animated Sprites/Graphics)
        const borderLayer = new PIXI.Container();
        stage.addChild(borderLayer);
        const flameParticles: FlameParticle[] = [];

        const createFlameParticle = (
          side: "top" | "bottom" | "left" | "right",
          pos: number
        ) => {
          const g = new PIXI.Graphics();
          const size = 6 + Math.random() * 8;
          g.circle(0, 0, size).fill({ color: 0xf97316, alpha: 0.6 }); // Orange 500
          borderLayer.addChild(g);
          flameParticles.push({
            graphics: g,
            side,
            pos,
            life: 0,
            maxLife: 0.8 + Math.random() * 0.8,
            speed: 1 + Math.random() * 2,
          });
        };

        const sides: ("top" | "bottom" | "left" | "right")[] = [
          "top",
          "bottom",
          "left",
          "right",
        ];
        sides.forEach((s) => {
          for (let i = 0; i < 40; i++)
            createFlameParticle(s, Math.random() * 100);
        });

        // 4. PARTICLES (Smoke & Ember Sparks)
        const partLayer = new PIXI.Container();
        stage.addChild(partLayer);
        const particles: Particle[] = [];

        const createParticle = () => {
          const isSmoke = Math.random() > 0.4;
          const g = new PIXI.Graphics();
          const size = isSmoke ? 4 + Math.random() * 8 : 1 + Math.random() * 2;
          if (isSmoke) {
            g.circle(0, 0, size).fill({ color: 0x1c1917, alpha: 0.1 }); // Gray 900
          } else {
            g.circle(0, 0, size).fill({ color: 0xfde047, alpha: 0.8 }); // Yellow 300
          }
          partLayer.addChild(g);
          const p = {
            graphics: g,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -0.8 - Math.random() * 1.2,
            life: 0,
            maxLife: 2 + Math.random() * 3,
            isSmoke,
          };
          g.x = Math.random() * width;
          g.y = height + 20;
          particles.push(p);
        };
        for (let i = 0; i < 50; i++) createParticle();

        // 5. IMPACT HEAT BURSTS (Heat Waves)
        const impactLayer = new PIXI.Container();
        stage.addChild(impactLayer);
        const activeBursts: {
          graphics: PIXI.Graphics;
          vx: number;
          vy: number;
          life: number;
          maxLife: number;
        }[] = [];

        const triggerImpactBurst = (x: number, y: number) => {
          // Spawn 15-20 "heat wave" particles
          for (let i = 0; i < 18; i++) {
            const g = new PIXI.Graphics();
            const angle = Math.random() * Math.PI * 2;
            const force = 2 + Math.random() * 5;
            const size = 6 + Math.random() * 10;

            // Long fire-like shape
            g.ellipse(0, 0, size, size * 0.4);
            g.fill({ color: 0xfde047, alpha: 0.8 }); // Yellow-hot
            g.rotation = angle;

            g.x = x;
            g.y = y;
            impactLayer.addChild(g);

            activeBursts.push({
              graphics: g,
              vx: Math.cos(angle) * force,
              vy: Math.sin(angle) * force,
              life: 0,
              maxLife: 0.6 + Math.random() * 0.6,
            });
          }
        };

        // 6. ANIMATION LOOP
        const animate = (time: number) => {
          if (isDisposed || !app) return;
          const delta = lastTime ? (time - lastTime) / 1000 : 0.016;
          lastTime = time;

          // Ember Grid Pulsing
          grids.forEach((g, idx) => {
            const p = (Math.sin(time * 0.003 + idx) + 1) / 2;
            g.graphics.clear().moveTo(g.points[0].x, g.points[0].y);
            g.points.forEach((pt) => {
              const ox = (Math.random() - 0.5) * 2;
              const oy = (Math.random() - 0.5) * 2;
              g.graphics.lineTo(pt.x + ox, pt.y + oy);
            });
            g.graphics.stroke({
              width: 3 + p * 4,
              color: 0xea580c, // Orange 600
              alpha: 0.2 + p * 0.3,
            });
          });

          // Flame Border
          flameParticles.forEach((p) => {
            p.life += delta;
            if (p.life > p.maxLife) {
              p.life = 0;
              p.pos = Math.random() * 100;
            }
            const prog = p.life / p.maxLife;
            const travel = prog * 40;
            const alpha = prog < 0.2 ? prog / 0.2 : 1 - (prog - 0.2) / 0.8;
            p.graphics.alpha = alpha * 0.6;
            p.graphics.scale.set(1 - prog * 0.5);

            const margin = 10;
            if (p.side === "top") {
              p.graphics.x = (p.pos / 100) * width;
              p.graphics.y = margin - travel;
            } else if (p.side === "bottom") {
              p.graphics.x = (p.pos / 100) * width;
              p.graphics.y = height - margin + travel;
            } else if (p.side === "left") {
              p.graphics.x = margin - travel;
              p.graphics.y = (p.pos / 100) * height;
            } else if (p.side === "right") {
              p.graphics.x = width - margin + travel;
              p.graphics.y = (p.pos / 100) * height;
            }
          });

          // Particles (Smoke & Embers)
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life += delta;
            if (p.life > p.maxLife) {
              p.life = 0;
              p.graphics.x = Math.random() * width;
              p.graphics.y = height + 20;
              continue;
            }
            p.graphics.x += p.vx;
            p.graphics.y += p.vy;
            const alphaProgress = 1 - p.life / p.maxLife;
            p.graphics.alpha = alphaProgress * (p.isSmoke ? 0.15 : 0.8);
            if (!p.isSmoke) p.graphics.scale.set(alphaProgress);
          }

          // Impact Bursts (Heat Waves)
          for (let i = activeBursts.length - 1; i >= 0; i--) {
            const b = activeBursts[i];
            b.life += delta;
            if (b.life > b.maxLife) {
              b.graphics.destroy();
              activeBursts.splice(i, 1);
              continue;
            }
            const prog = b.life / b.maxLife;
            b.graphics.x += b.vx * (1 - prog); // Slow down
            b.graphics.y += b.vy * (1 - prog);
            b.graphics.alpha = (1 - prog) * 0.8;
            b.graphics.scale.set(1 + prog * 0.5); // Grow slightly
          }

          // Move bed texture slowly
          bed.tilePosition.x += 0.1;
          bed.tilePosition.y += 0.05;

          // Impact Queue
          while (impactQueue.current.length > 0) {
            const m = impactQueue.current.shift();
            if (m) triggerImpactBurst(m.x * width, m.y * height);
          }

          animationId = requestAnimationFrame(animate);
        };
        animationId = requestAnimationFrame(animate);

        const handleResize = () => {
          if (!app || isDisposed) return;
          const b = containerRef.current?.getBoundingClientRect();
          if (b) app.renderer.resize(b.width, b.height);
        };
        window.addEventListener("resize", handleResize);
      } catch (err) {
        console.error("Fire Inferno Error:", err);
      }
    };

    init();
    return () => {
      isDisposed = true;
      if (animationId) cancelAnimationFrame(animationId);
      if (app) app.destroy(true, { children: true, texture: true });
      setIsReady(false);
    };
  }, []);

  return (
    <div className="absolute inset-[-15px] pointer-events-none z-0 rounded-2xl overflow-visible border-[3px] border-orange-900/50 shadow-[0_0_60px_rgba(194,65,12,0.4)]">
      <div ref={containerRef} className="absolute inset-0" />

      {/* HEAT OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-950/40 via-transparent to-red-950/20 mix-blend-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(124,45,18,0.3)_110%)]" />

      {!isReady && (
        <div className="absolute inset-0 bg-stone-950 animate-pulse" />
      )}
    </div>
  );
});

FireEffect.displayName = "FireEffect";
