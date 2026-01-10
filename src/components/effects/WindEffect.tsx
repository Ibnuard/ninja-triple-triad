import { useEffect, useRef, memo, useState } from "react";
import * as PIXI from "pixi.js";

interface WindEffectProps {
  lastMove: { row: number; col: number; playerId: string } | null;
}

interface WindParticle {
  graphics: PIXI.Graphics;
  points: { x: number; y: number }[];
  speed: number;
  life: number;
  maxLife: number;
}

interface VortexArc {
  graphics: PIXI.Graphics;
  side: "top" | "bottom" | "left" | "right";
  pos: number;
  life: number;
  maxLife: number;
}

export const WindEffect = memo(({ lastMove }: WindEffectProps) => {
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
    let handleResize: (() => void) | null = null;

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

        // 1. SKY-MIST TEXTURE (Background)
        const bgLayer = new PIXI.Container();
        stage.addChild(bgLayer);

        const createMistTexture = () => {
          const size = 512;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // High altitude sky blue
            ctx.fillStyle = "#0f172a"; // Slate 900
            ctx.fillRect(0, 0, size, size);

            // Mist noise
            for (let i = 0; i < 30; i++) {
              const x = Math.random() * size;
              const y = Math.random() * size;
              const rad = 40 + Math.random() * 80;
              const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
              grad.addColorStop(0, "rgba(255, 255, 255, 0.05)");
              grad.addColorStop(1, "rgba(255, 255, 255, 0)");
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(x, y, rad, 0, Math.PI * 2);
              ctx.fill();
            }

            // Drifting wisps
            ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
            ctx.lineWidth = 1;
            for (let i = 0; i < 20; i++) {
              ctx.beginPath();
              ctx.moveTo(0, Math.random() * size);
              ctx.lineTo(
                size,
                Math.random() * size + (Math.random() - 0.5) * 50
              );
              ctx.stroke();
            }
          }
          return PIXI.Texture.from(canvas);
        };
        const bed = new PIXI.TilingSprite({
          texture: createMistTexture(),
          width,
          height,
        });
        bed.alpha = 0.8;
        bgLayer.addChild(bed);

        // 2. AIR-PRESSURE GRID
        const gridLayer = new PIXI.Container();
        stage.addChild(gridLayer);
        const grids: PIXI.Graphics[] = [];
        for (let i = 1; i < 3; i++) {
          const g = new PIXI.Graphics();
          gridLayer.addChild(g);
          grids.push(g);
        }

        const drawGrid = (
          g: PIXI.Graphics,
          time: number,
          idx: number,
          isVertical: boolean
        ) => {
          g?.clear();
          const p = (Math.sin(time * 0.002 + idx) + 1) / 2;
          const pos = (idx / 3) * (isVertical ? width : height);

          g.moveTo(isVertical ? pos : 0, isVertical ? 0 : pos);
          for (let j = 0; j <= 10; j++) {
            const t = j / 10;
            const x = isVertical
              ? pos + Math.sin(time * 0.003 + t * 5) * 5
              : t * width;
            const y = isVertical
              ? t * height
              : pos + Math.sin(time * 0.003 + t * 5) * 5;
            g.lineTo(x, y);
          }
          g.stroke({ width: 1 + p * 2, color: 0xffffff, alpha: 0.1 + p * 0.1 });
        };

        // 3. SWIRLING WIND BORDER
        const borderLayer = new PIXI.Container();
        stage.addChild(borderLayer);
        const borderArcs: VortexArc[] = [];

        const createBorderArc = (
          side: "top" | "bottom" | "left" | "right",
          pos: number
        ) => {
          const g = new PIXI.Graphics();
          borderLayer.addChild(g);
          borderArcs.push({
            graphics: g,
            side,
            pos,
            life: Math.random(),
            maxLife: 1.5 + Math.random(),
          });
        };
        const sides: ("top" | "bottom" | "left" | "right")[] = [
          "top",
          "bottom",
          "left",
          "right",
        ];
        sides.forEach((s) => {
          for (let i = 0; i < 15; i++) createBorderArc(s, Math.random() * 100);
        });

        // 4. ZEPHYR PARTICLES (Wind lines)
        const partLayer = new PIXI.Container();
        stage.addChild(partLayer);
        const particles: WindParticle[] = [];

        const createWindLine = () => {
          const g = new PIXI.Graphics();
          partLayer.addChild(g);
          const points = [];
          for (let i = 0; i < 5; i++)
            points.push({ x: i * 15, y: (Math.random() - 0.5) * 10 });
          particles.push({
            graphics: g,
            points,
            speed: 2 + Math.random() * 4,
            life: 0,
            maxLife: 1 + Math.random() * 2,
          });
          g.x = -100;
          g.y = Math.random() * height;
        };
        for (let i = 0; i < 25; i++) createWindLine();

        // 5. TORNADO IMPACTS
        const impactLayer = new PIXI.Container();
        stage.addChild(impactLayer);
        const impacts: {
          graphics: PIXI.Graphics;
          x: number;
          y: number;
          life: number;
          maxLife: number;
        }[] = [];

        const triggerImpact = (x: number, y: number) => {
          const g = new PIXI.Graphics();
          impactLayer.addChild(g);
          impacts.push({ graphics: g, x, y, life: 0, maxLife: 1.5 });
        };

        // 6. ANIMATION LOOP
        const animate = (time: number) => {
          if (isDisposed || !app) return;
          const delta = lastTime ? (time - lastTime) / 1000 : 0.016;
          lastTime = time;

          // Grids
          grids.forEach((g, i) => {
            const idx = i % 2 === 0 ? 1 : 2;
            drawGrid(g, time, idx, i < 2);
          });

          // Border Vortex
          borderArcs.forEach((a) => {
            a.life += delta;
            if (a.life > a.maxLife) a.life = 0;
            const p = a.life / a.maxLife;
            const alpha = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
            a.graphics?.clear();
            const radius = 15 + Math.sin(time * 0.01 + a.pos) * 5;
            const rot = time * 0.01 + a.life * 5;

            // Draw a small vortex wisp
            a.graphics.moveTo(Math.cos(rot) * radius, Math.sin(rot) * radius);
            for (let i = 0; i < 5; i++) {
              const angle = rot + (i / 5) * Math.PI;
              const r = radius * (1 - i / 10);
              a.graphics.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            a.graphics.stroke({
              width: 1.5,
              color: 0xffffff,
              alpha: alpha * 0.3,
            });

            const margin = 15;
            if (a.side === "top") {
              a.graphics.x = (a.pos / 100) * width;
              a.graphics.y = margin;
            } else if (a.side === "bottom") {
              a.graphics.x = (a.pos / 100) * width;
              a.graphics.y = height - margin;
            } else if (a.side === "left") {
              a.graphics.x = margin;
              a.graphics.y = (a.pos / 100) * height;
            } else {
              a.graphics.x = width - margin;
              a.graphics.y = (a.pos / 100) * height;
            }
          });

          // Zephyr Particles
          particles.forEach((p) => {
            p.life += delta;
            if (p.life > p.maxLife || p.graphics.x > width + 100) {
              p.life = 0;
              p.graphics.x = -100;
              p.graphics.y = Math.random() * height;
            }
            p.graphics.x += p.speed;
            p.graphics.y += Math.sin(time * 0.005 + p.graphics.x * 0.01) * 2;
            const prog = p.life / p.maxLife;
            p.graphics?.clear().moveTo(p.points[0].x, p.points[0].y);
            p.points.forEach((pt) =>
              p.graphics.lineTo(pt.x, pt.y + Math.sin(time * 0.01 + pt.x) * 3)
            );
            p.graphics.stroke({
              width: 1,
              color: 0xffffff,
              alpha: (1 - prog) * 0.2,
            });
          });

          // Impacts (Natural Vortex/Tornado)
          for (let i = impacts.length - 1; i >= 0; i--) {
            const f = impacts[i];
            f.life += delta;
            if (f.life > f.maxLife) {
              f.graphics.destroy();
              impacts.splice(i, 1);
              continue;
            }
            const p = f.life / f.maxLife;
            f.graphics?.clear();
            const rings = 10;
            for (let j = 0; j < rings; j++) {
              // Staggered radial expansion
              const rp = Math.max(0, p * 1.4 - j * 0.1);
              if (rp > 0 && rp < 1) {
                // Expanding rings from center
                const r = rp * 90 * (1 + j * 0.05);
                const rot = time * 0.008 + j * 0.4 + p * 4;

                // Spiraling offset from center
                const ox = Math.cos(rot) * 15 * rp;
                const oy = Math.sin(rot) * 10 * rp;

                f.graphics.ellipse(f.x + ox, f.y + oy, r, r * 0.85);

                const alpha = (1 - rp) * 0.45;
                f.graphics.stroke({
                  width: 2.5 * (1 - rp),
                  color: 0xffffff,
                  alpha: alpha,
                });
              }
            }
          }

          bed.tilePosition.x += 0.3;
          bed.tilePosition.y += 0.1;

          while (impactQueue.current.length > 0) {
            const m = impactQueue.current.shift();
            if (m) triggerImpact(m.x * width, m.y * height);
          }

          animationId = requestAnimationFrame(animate);
        };
        animationId = requestAnimationFrame(animate);

        handleResize = () => {
          if (!app || isDisposed) return;
          const b = containerRef.current?.getBoundingClientRect();
          if (b && app.renderer) app.renderer.resize(b.width, b.height);
        };
        window.addEventListener("resize", handleResize);
      } catch (err) {
        console.error("Wind Vortex Error:", err);
      }
    };

    init();
    return () => {
      isDisposed = true;
      if (handleResize) window.removeEventListener("resize", handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (app && app.renderer) {
        try {
          app.destroy(true, { children: true, texture: true });
        } catch (e) {}
      }
      app = null;
      setIsReady(false);
    };
  }, []);

  return (
    <div className="absolute inset-[-15px] pointer-events-none z-0 rounded-2xl overflow-visible border-[3px] border-slate-700/30 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 via-transparent to-white/10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(255,255,255,0.1)_110%)]" />
      {!isReady && (
        <div className="absolute inset-0 bg-slate-900 animate-pulse" />
      )}
    </div>
  );
});

WindEffect.displayName = "WindEffect";
