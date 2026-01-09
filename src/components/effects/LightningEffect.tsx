import { useEffect, useRef, memo, useState } from "react";
import * as PIXI from "pixi.js";

interface LightningEffectProps {
  lastMove: { row: number; col: number; playerId: string } | null;
}

interface ElectricGrid {
  graphics: PIXI.Graphics;
  points: { x: number; y: number }[];
}

interface Particle {
  graphics: PIXI.Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface LightningArc {
  graphics: PIXI.Graphics;
  points: { x: number; y: number }[];
  life: number;
  maxLife: number;
}

export const LightningEffect = memo(({ lastMove }: LightningEffectProps) => {
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

        // 1. OBSIDIAN STATIC TEXTURE (Background)
        const bgLayer = new PIXI.Container();
        stage.addChild(bgLayer);

        const createObsidianTexture = () => {
          const size = 512;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Dark obsidian base
            ctx.fillStyle = "#020617"; // Slate 950
            ctx.fillRect(0, 0, size, size);

            // Metallic static noise
            for (let i = 0; i < 20000; i++) {
              ctx.fillStyle = `rgba(148, 163, 184, ${Math.random() * 0.05})`; // Slate 400
              ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
            }

            // Magnetic streaks
            for (let i = 0; i < 15; i++) {
              const x = Math.random() * size,
                y = Math.random() * size;
              const grad = ctx.createLinearGradient(x, y, x + 30, y + 5);
              grad.addColorStop(0, "rgba(56, 189, 248, 0.1)"); // Cyan 400
              grad.addColorStop(1, "rgba(56, 189, 248, 0)");
              ctx.fillStyle = grad;
              ctx.fillRect(x, y, 30, 2);
            }
          }
          return PIXI.Texture.from(canvas);
        };
        const bed = new PIXI.TilingSprite({
          texture: createObsidianTexture(),
          width,
          height,
        });
        bed.alpha = 0.85;
        bgLayer.addChild(bed);

        // 2. ELECTRIC PULSE GRID
        const gridLayer = new PIXI.Container();
        stage.addChild(gridLayer);

        const createElectricLine = (
          x1: number,
          y1: number,
          x2: number,
          y2: number
        ) => {
          const pts = [{ x: x1, y: y1 }];
          const dx = x2 - x1,
            dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const segments = Math.floor(dist / 15);
          for (let i = 1; i < segments; i++) {
            const p = i / segments;
            pts.push({
              x: x1 + dx * p + (Math.random() - 0.5) * 8,
              y: y1 + dy * p + (Math.random() - 0.5) * 8,
            });
          }
          pts.push({ x: x2, y: y2 });
          return pts;
        };

        const grids: ElectricGrid[] = [];
        for (let i = 1; i < 3; i++) {
          const vx = (i / 3) * width,
            hy = (i / 3) * height;
          grids.push({
            graphics: new PIXI.Graphics(),
            points: createElectricLine(vx, 0, vx, height),
          });
          grids.push({
            graphics: new PIXI.Graphics(),
            points: createElectricLine(0, hy, width, hy),
          });
        }
        grids.forEach((g) => gridLayer.addChild(g.graphics));

        // 3. IONIC STORM BORDER (Flickering arcs)
        const borderLayer = new PIXI.Container();
        stage.addChild(borderLayer);
        const borderArcs: LightningArc[] = [];

        const triggerBorderArc = (
          side: "top" | "bottom" | "left" | "right"
        ) => {
          const g = new PIXI.Graphics();
          const p1 = Math.random() * 100,
            p2 = p1 + (Math.random() - 0.5) * 20;
          let x1 = 0,
            y1 = 0,
            x2 = 0,
            y2 = 0;
          const pad = 10;
          if (side === "top") {
            x1 = (p1 / 100) * width;
            y1 = pad;
            x2 = (p2 / 100) * width;
            y2 = pad;
          } else if (side === "bottom") {
            x1 = (p1 / 100) * width;
            y1 = height - pad;
            x2 = (p2 / 100) * width;
            y2 = height - pad;
          } else if (side === "left") {
            x1 = pad;
            y1 = (p1 / 100) * height;
            x2 = pad;
            y2 = (p2 / 100) * height;
          } else {
            x1 = width - pad;
            y1 = (p1 / 100) * height;
            x2 = width - pad;
            y2 = (p2 / 100) * height;
          }

          borderLayer.addChild(g);
          borderArcs.push({
            graphics: g,
            points: createElectricLine(x1, y1, x2, y2),
            life: 0,
            maxLife: 0.1 + Math.random() * 0.2,
          });
        };

        // 4. MAGNETIC PARTICLES
        const partLayer = new PIXI.Container();
        stage.addChild(partLayer);
        const particles: Particle[] = [];
        const createParticle = () => {
          const g = new PIXI.Graphics();
          const size = 1 + Math.random() * 2;
          g.circle(0, 0, size).fill({ color: 0x0ea5e9, alpha: 0.8 }); // Sky 500
          partLayer.addChild(g);
          const p = {
            graphics: g,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 0,
            maxLife: 1 + Math.random() * 2,
          };
          g.x = Math.random() * width;
          g.y = Math.random() * height;
          particles.push(p);
        };
        for (let i = 0; i < 40; i++) createParticle();

        // 5. PLASMA IMPACT BLASTS
        const impactLayer = new PIXI.Container();
        stage.addChild(impactLayer);
        const impacts: {
          graphics: PIXI.Graphics;
          life: number;
          maxLife: number;
          x: number;
          y: number;
          arcs: { p: { x: number; y: number }[] }[];
        }[] = [];

        const triggerImpact = (x: number, y: number) => {
          const g = new PIXI.Graphics();
          const arcs = [];
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const tx = x + Math.cos(angle) * 80,
              ty = y + Math.sin(angle) * 80;
            arcs.push({ p: createElectricLine(x, y, tx, ty) });
          }
          impactLayer.addChild(g);
          impacts.push({ graphics: g, life: 0, maxLife: 0.5, x, y, arcs });
        };

        // 6. ANIMATION LOOP
        const animate = (time: number) => {
          if (isDisposed || !app) return;
          const delta = lastTime ? (time - lastTime) / 1000 : 0.016;
          lastTime = time;

          // Electric Pulse Grid
          grids.forEach((g, idx) => {
            const pulse = (Math.sin(time * 0.005 + idx) + 1) / 2;
            g.graphics.clear().moveTo(g.points[0].x, g.points[0].y);
            g.points.forEach((pt) => {
              const ox = (Math.random() - 0.5) * 3;
              const oy = (Math.random() - 0.5) * 3;
              g.graphics.lineTo(pt.x + ox, pt.y + oy);
            });
            g.graphics.stroke({
              width: 2 + pulse * 3,
              color: 0x06b6d4,
              alpha: 0.1 + pulse * 0.2,
            });
          });

          // Border Storm
          if (Math.random() > 0.7) {
            const s = ["top", "bottom", "left", "right"][
              Math.floor(Math.random() * 4)
            ] as any;
            triggerBorderArc(s);
          }

          for (let i = borderArcs.length - 1; i >= 0; i--) {
            const a = borderArcs[i];
            a.life += delta;
            if (a.life > a.maxLife) {
              a.graphics.destroy();
              borderArcs.splice(i, 1);
              continue;
            }
            a.graphics.clear().moveTo(a.points[0].x, a.points[0].y);
            a.points.forEach((pt) =>
              a.graphics.lineTo(
                pt.x + (Math.random() - 0.5) * 6,
                pt.y + (Math.random() - 0.5) * 6
              )
            );
            a.graphics.stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
          }

          // magnetic Particles
          particles.forEach((p) => {
            p.life += delta;
            if (p.life > p.maxLife) {
              p.life = 0;
              p.graphics.x = Math.random() * width;
              p.graphics.y = Math.random() * height;
            }
            p.graphics.x += p.vx + Math.sin(time * 0.01 + p.graphics.y) * 2;
            p.graphics.y += p.vy + Math.cos(time * 0.01 + p.graphics.x) * 2;
            p.graphics.alpha = (1 - p.life / p.maxLife) * 0.6;
          });

          // Impacts
          for (let i = impacts.length - 1; i >= 0; i--) {
            const f = impacts[i];
            f.life += delta;
            if (f.life > f.maxLife) {
              f.graphics.destroy();
              impacts.splice(i, 1);
              continue;
            }
            const prog = f.life / f.maxLife;
            f.graphics.clear();
            // Core shockwave
            f.graphics
              .circle(f.x, f.y, prog * 140)
              .stroke({
                width: 4 * (1 - prog),
                color: 0x0ea5e9,
                alpha: (1 - prog) * 0.5,
              });
            // Electric bursts
            f.arcs.forEach((arc) => {
              f.graphics.moveTo(arc.p[0].x, arc.p[0].y);
              arc.p.forEach((pt) =>
                f.graphics.lineTo(
                  pt.x + (Math.random() - 0.5) * 10,
                  pt.y + (Math.random() - 0.5) * 10
                )
              );
              f.graphics.stroke({
                width: 2 * (1 - prog),
                color: 0xffffff,
                alpha: (1 - prog) * 0.7,
              });
            });
          }

          bed.tilePosition.x += 0.2;
          bed.tilePosition.y += 0.1;

          while (impactQueue.current.length > 0) {
            const m = impactQueue.current.shift();
            if (m) triggerImpact(m.x * width, m.y * height);
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
        console.error("Lightning Storm Error:", err);
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
    <div className="absolute inset-[-14px] pointer-events-none z-0 rounded-2xl overflow-visible border-[3px] border-cyan-900/40 shadow-[0_0_50px_rgba(8,145,178,0.3)]">
      <div ref={containerRef} className="absolute inset-0" />

      {/* STORM OVERLAYS */}
      <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-transparent to-purple-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(8,145,178,0.2)_120%)]" />

      {!isReady && (
        <div className="absolute inset-0 bg-slate-950 animate-pulse" />
      )}
    </div>
  );
});

LightningEffect.displayName = "LightningEffect";
