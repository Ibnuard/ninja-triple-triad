import { useEffect, useRef, memo, useState } from "react";
import * as PIXI from "pixi.js";

interface PoisonEffectProps {
  lastMove: { row: number; col: number; playerId: string } | null;
}

interface Bubble {
  graphics: PIXI.Graphics;
  speed: number;
  life: number;
  maxLife: number;
}

interface AcidSplash {
  graphics: PIXI.Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  isSkull?: boolean;
}

export const PoisonEffect = memo(({ lastMove }: PoisonEffectProps) => {
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

        // 1. TOXIC SLUDGE TEXTURE (Background)
        const bgLayer = new PIXI.Container();
        stage.addChild(bgLayer);

        const createSludgeTexture = () => {
          const size = 512;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Dark purple base
            ctx.fillStyle = "#1e1b4b"; // Indigo 950
            ctx.fillRect(0, 0, size, size);

            // Viscous gradients
            for (let i = 0; i < 40; i++) {
              const x = Math.random() * size,
                y = Math.random() * size;
              const rad = 50 + Math.random() * 100;
              const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
              grad.addColorStop(0, "rgba(74, 222, 128, 0.08)"); // Green 400
              grad.addColorStop(1, "rgba(74, 222, 128, 0)");
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(x, y, rad, 0, Math.PI * 2);
              ctx.fill();
            }

            // Gunk spots
            for (let i = 0; i < 100; i++) {
              ctx.fillStyle = "rgba(0,0,0,0.2)";
              ctx.fillRect(
                Math.random() * size,
                Math.random() * size,
                2 + Math.random() * 4,
                2 + Math.random() * 4
              );
            }
          }
          return PIXI.Texture.from(canvas);
        };
        const bed = new PIXI.TilingSprite({
          texture: createSludgeTexture(),
          width,
          height,
        });
        bed.alpha = 0.9;
        bgLayer.addChild(bed);

        // 2. CORRODED GRID
        const gridLayer = new PIXI.Container();
        stage.addChild(gridLayer);
        const grids: {
          graphics: PIXI.Graphics;
          points: { x: number; y: number }[];
        }[] = [];

        const createCorrodedLine = (
          x1: number,
          y1: number,
          x2: number,
          y2: number
        ) => {
          const pts = [{ x: x1, y: y1 }];
          const dx = x2 - x1,
            dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const segments = Math.floor(dist / 12);
          for (let i = 1; i < segments; i++) {
            const p = i / segments;
            pts.push({
              x: x1 + dx * p + (Math.random() - 0.5) * 10,
              y: y1 + dy * p + (Math.random() - 0.5) * 10,
            });
          }
          pts.push({ x: x2, y: y2 });
          return pts;
        };

        for (let i = 1; i < 3; i++) {
          const vx = (i / 3) * width,
            hy = (i / 3) * height;
          grids.push({
            graphics: new PIXI.Graphics(),
            points: createCorrodedLine(vx, 0, vx, height),
          });
          grids.push({
            graphics: new PIXI.Graphics(),
            points: createCorrodedLine(0, hy, width, hy),
          });
        }
        grids.forEach((g) => gridLayer.addChild(g.graphics));

        // 3. SKELETAL BORDER
        const borderLayer = new PIXI.Container();
        stage.addChild(borderLayer);

        const drawBone = (
          g: PIXI.Graphics,
          x: number,
          y: number,
          ang: number,
          len: number
        ) => {
          g.beginPath();
          const r = 6;
          const color = 0xd1d5db; // Slate 300

          g.ellipse(-len / 2, 0, r * (1 + Math.random() * 0.2), r * 1.4);
          g.ellipse(len / 2, 0, r * (1 + Math.random() * 0.2), r * 1.4);
          g.rect(-len / 2, -r / 2, len, r);
          g.fill({ color, alpha: 0.8 });
          g.stroke({ width: 1.5, color: 0x475569, alpha: 0.5 }); // Slate 600

          // Weathering/Cracks on bone
          if (Math.random() > 0.5) {
            g.moveTo(-len / 4, -r / 2)
              .lineTo(-len / 4 + 2, r / 2)
              .stroke({ width: 1, color: 0x000000, alpha: 0.2 });
          }

          g.x = x;
          g.y = y;
          g.rotation = ang;
        };

        const drawSkull = (
          g: PIXI.Graphics,
          x: number,
          y: number,
          scale = 1
        ) => {
          const color = 0xf1f5f9; // Slate 100
          // Cranium (more jagged/egg-shaped)
          g.ellipse(0, -6 * scale, 12 * scale, 10 * scale).fill({
            color,
            alpha: 1,
          });

          // Jaw (narrower)
          g.rect(-7 * scale, 2 * scale, 14 * scale, 7 * scale).fill({
            color,
            alpha: 1,
          });

          // Nasal cavity (triangular)
          g.poly([0, 0, -2 * scale, 2 * scale, 2 * scale, 2 * scale]).fill({
            color: 0x0f172a,
          });

          // Eyes (more sunken/angular)
          g.circle(-4.5 * scale, -5 * scale, 3 * scale).fill({
            color: 0x0f172a,
          });
          g.circle(4.5 * scale, -5 * scale, 3 * scale).fill({
            color: 0x0f172a,
          });

          // Teeth/Jaw lines
          for (let i = -2; i <= 2; i++) {
            g.moveTo(i * 2.5 * scale, 5 * scale)
              .lineTo(i * 2.5 * scale, 9 * scale)
              .stroke({ width: 1, color: 0x94a3b8, alpha: 0.6 });
          }

          // Cracks on skull
          g.moveTo(-8 * scale, -12 * scale)
            .lineTo(-4 * scale, -10 * scale)
            .stroke({ width: 1, color: 0x000000, alpha: 0.2 });

          g.x = x;
          g.y = y;
        };

        const borderGraphics = new PIXI.Graphics();
        borderLayer.addChild(borderGraphics);

        const updateBorder = () => {
          borderGraphics?.clear();
          const pad = 12;
          // Top & Bottom bones
          for (let x = pad + 30; x < width - pad; x += 50) {
            drawBone(borderGraphics, x, pad, 0, 40);
            drawBone(borderGraphics, x, height - pad, 0, 40);
          }
          // Sides
          for (let y = pad + 30; y < height - pad; y += 50) {
            drawBone(borderGraphics, pad, y, Math.PI / 2, 40);
            drawBone(borderGraphics, width - pad, y, Math.PI / 2, 40);
          }
          // Corner Skulls
          drawSkull(borderGraphics, pad, pad, 1.2);
          drawSkull(borderGraphics, width - pad, pad, 1.2);
          drawSkull(borderGraphics, pad, height - pad, 1.2);
          // Removed bottom-right skull
        };
        updateBorder();

        // 4. BUBBLES
        const bubbleLayer = new PIXI.Container();
        stage.addChild(bubbleLayer);
        const bubbles: Bubble[] = [];
        const createBubble = () => {
          const g = new PIXI.Graphics();
          const rad = 4 + Math.random() * 8;
          g.circle(0, 0, rad).stroke({ width: 1, color: 0xa855f7, alpha: 0.4 }); // Purple 500
          bubbleLayer.addChild(g);
          bubbles.push({
            graphics: g,
            speed: 0.5 + Math.random() * 1,
            life: 0,
            maxLife: 2 + Math.random() * 2,
          });
          g.x = Math.random() * width;
          g.y = height + 20;
        };
        for (let i = 0; i < 15; i++) createBubble();

        // 5. IMPACT SPLASH + VAPOR
        const impactLayer = new PIXI.Container();
        stage.addChild(impactLayer);
        const splashes: AcidSplash[] = [];

        const triggerImpact = (x: number, y: number) => {
          // Splashes
          for (let i = 0; i < 12; i++) {
            const g = new PIXI.Graphics();
            const angle = Math.random() * Math.PI * 2;
            const force = 2 + Math.random() * 4;
            g.circle(0, 0, 3 + Math.random() * 5).fill({
              color: 0x4ade80,
              alpha: 0.8,
            });
            g.x = x;
            g.y = y;
            impactLayer.addChild(g);
            splashes.push({
              graphics: g,
              vx: Math.cos(angle) * force,
              vy: Math.sin(angle) * force,
              life: 0,
              maxLife: 0.6 + Math.random() * 0.4,
            });
          }
          // Skull Vapor
          const svg = new PIXI.Graphics();
          drawSkull(svg, x, y, 0.8);
          svg.alpha = 0;
          impactLayer.addChild(svg);
          splashes.push({
            graphics: svg,
            vx: (Math.random() - 0.5) * 1,
            vy: -1.5,
            life: 0,
            maxLife: 1.5,
            isSkull: true,
          });
        };

        // 6. ANIMATION LOOP
        const animate = (time: number) => {
          if (isDisposed || !app) return;
          const delta = lastTime ? (time - lastTime) / 1000 : 0.016;
          lastTime = time;

          // Bubbling bed
          bed.tilePosition.y -= 0.2;
          bed.tilePosition.x += 0.1;

          // Corroded Grid + Grid Bubbles
          grids.forEach((g, idx) => {
            const pulse = (Math.sin(time * 0.003 + idx) + 1) / 2;
            g.graphics?.clear().moveTo(g.points[0].x, g.points[0].y);

            // Draw viscous jagged line
            g.points.forEach((pt, pIdx) => {
              const jitter = (Math.random() - 0.5) * 3;
              g.graphics.lineTo(pt.x + jitter, pt.y + jitter);

              // Occasionally spawn a bubble from a grid point
              if (Math.random() > 0.99 && bubbles.length < 30) {
                const bubG = new PIXI.Graphics();
                const rad = 2 + Math.random() * 5;
                bubG
                  .circle(0, 0, rad)
                  .stroke({ width: 1, color: 0x4ade80, alpha: 0.5 });
                bubG.x = pt.x;
                bubG.y = pt.y;
                bubbleLayer.addChild(bubG);
                bubbles.push({
                  graphics: bubG,
                  speed: 0.3 + Math.random() * 0.8,
                  life: 0,
                  maxLife: 1.5 + Math.random(),
                });
              }
            });

            g.graphics.stroke({
              width: 1.5 + pulse * 4,
              color: 0x4ade80, // Brighter neon green
              alpha: 0.15 + pulse * 0.25,
            });
          });

          // Bubbles
          for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            b.life += delta;
            if (b.life > b.maxLife) {
              b.life = 0;
              b.graphics.x = Math.random() * width;
              b.graphics.y = height + 20;
              continue;
            }
            b.graphics.y -= b.speed;
            b.graphics.x += Math.sin(time * 0.005 + b.graphics.y * 0.1) * 1;
            const p = b.life / b.maxLife;
            b.graphics.alpha = (1 - p) * 0.4;
            b.graphics.scale.set(1 + p * 0.5);
          }

          // Splashes & Vapors
          for (let i = splashes.length - 1; i >= 0; i--) {
            const s = splashes[i];
            s.life += delta;
            if (s.life > s.maxLife) {
              s.graphics.destroy();
              splashes.splice(i, 1);
              continue;
            }
            const p = s.life / s.maxLife;
            s.graphics.x += s.vx;
            s.graphics.y += s.vy;
            if (s.isSkull) {
              s.graphics.alpha = Math.min(1, p * 10) * (1 - p) * 0.4;
              s.graphics.scale.set(0.5 + p * 1.5);
            } else {
              s.graphics.alpha = (1 - p) * 0.8;
              s.graphics.scale.set(1 - p * 0.5);
            }
          }

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
          if (b) {
            app.renderer.resize(b.width, b.height);
            updateBorder();
          }
        };
        window.addEventListener("resize", handleResize);
      } catch (err) {
        console.error("Poison Bog Error:", err);
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
    <div className="absolute inset-[-15px] pointer-events-none z-0 rounded-2xl overflow-visible border-[3px] border-purple-900/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
      <div ref={containerRef} className="absolute inset-0" />
      {/* NOXIOUS OVERLAY */}
      <div className="absolute inset-0 bg-purple-950/20 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-green-950/30 via-transparent to-purple-950/30" />

      {!isReady && (
        <div className="absolute inset-0 bg-indigo-950 animate-pulse" />
      )}
    </div>
  );
});

PoisonEffect.displayName = "PoisonEffect";
