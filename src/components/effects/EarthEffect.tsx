import { useEffect, useRef, memo, useState } from "react";
import * as PIXI from "pixi.js";

interface EarthEffectProps {
  lastMove: { row: number; col: number; playerId: string } | null;
  theme?: "cave" | "desert" | "crystal";
}

interface MagmaCrack {
  graphics: PIXI.Graphics;
  points: { x: number; y: number }[];
  life: number;
  maxLife: number;
  isPersistent?: boolean;
}

interface ImpactFlare {
  container: PIXI.Container;
  life: number;
  maxLife: number;
}

export const EarthEffect = memo(
  ({ lastMove, theme = "cave" }: EarthEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const impactQueue = useRef<{ x: number; y: number }[]>([]);
    const [isReady, setIsReady] = useState(false);

    const themeColors = {
      cave: {
        bg: 0x241b14,
        rock: 0x3d2b1f,
        lavaCore: 0xffdb3a,
        lavaGlow: 0xea580c,
        borderStone: 0x1c1917,
        mineral: 0xffd700,
      },
      desert: {
        bg: 0x633211,
        rock: 0x8b4513,
        lavaCore: 0xfef3c7,
        lavaGlow: 0xd97706,
        borderStone: 0x451a03,
        mineral: 0xfff8dc,
      },
      crystal: {
        bg: 0x161233,
        rock: 0x2e2763,
        lavaCore: 0xe0f2fe,
        lavaGlow: 0x3b82f6,
        borderStone: 0x020617,
        mineral: 0x00ffff,
      },
    };

    const colors = themeColors[theme];

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

          // 1. ADVANCED ROCK TEXTURE
          const bgLayer = new PIXI.Container();
          stage.addChild(bgLayer);

          const base = new PIXI.Graphics();
          base.rect(0, 0, width, height);
          base.fill({ color: colors.bg, alpha: 1 });
          bgLayer.addChild(base);

          const createEnhancedRockTexture = () => {
            const size = 512;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              // Base fill
              ctx.fillStyle = `#${colors.rock.toString(16).padStart(6, "0")}`;
              ctx.fillRect(0, 0, size, size);

              // Layer 1: Grainy noise
              for (let i = 0; i < 15000; i++) {
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
                ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
              }

              // Layer 2: Micro-cracks (Static)
              ctx.strokeStyle = `rgba(0,0,0,0.15)`;
              ctx.lineWidth = 0.5;
              for (let i = 0; i < 40; i++) {
                ctx.beginPath();
                let lx = Math.random() * size,
                  ly = Math.random() * size;
                ctx.moveTo(lx, ly);
                for (let j = 0; j < 5; j++) {
                  lx += (Math.random() - 0.5) * 30;
                  ly += (Math.random() - 0.5) * 30;
                  ctx.lineTo(lx, ly);
                }
                ctx.stroke();
              }

              // Layer 3: Mineral Specks
              for (let i = 0; i < 150; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const r = 0.5 + Math.random() * 1.5;
                const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
                grad.addColorStop(0, `rgba(255,255,255,0.4)`);
                grad.addColorStop(1, `rgba(255,255,255,0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
              }

              // Layer 4: Dark soot/patches
              for (let i = 0; i < 20; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const r = 20 + Math.random() * 40;
                const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
                grad.addColorStop(0, `rgba(0,0,0,0.1)`);
                grad.addColorStop(1, `rgba(0,0,0,0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            return PIXI.Texture.from(canvas);
          };

          const rocker = new PIXI.TilingSprite({
            texture: createEnhancedRockTexture(),
            width,
            height,
          });
          rocker.alpha = 0.6;
          bgLayer.addChild(rocker);

          // 2. MAGMA GRID LINES
          const gridLayer = new PIXI.Container();
          stage.addChild(gridLayer);

          const createJaggedLine = (
            x1: number,
            y1: number,
            x2: number,
            y2: number
          ) => {
            const pts = [{ x: x1, y: y1 }];
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const segments = Math.floor(dist / 15);

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

          const gridCracks: MagmaCrack[] = [];
          for (let i = 1; i < 3; i++) {
            const vx = (i / 3) * width;
            gridCracks.push({
              graphics: new PIXI.Graphics(),
              points: createJaggedLine(vx, 0, vx, height),
              life: 0,
              maxLife: 1,
              isPersistent: true,
            });
            const hy = (i / 3) * height;
            gridCracks.push({
              graphics: new PIXI.Graphics(),
              points: createJaggedLine(0, hy, width, hy),
              life: 0,
              maxLife: 1,
              isPersistent: true,
            });
          }
          gridCracks.forEach((c) => gridLayer.addChild(c.graphics));

          // 3. 3D ROCKY BORDER
          const borderLayer = new PIXI.Container();
          stage.addChild(borderLayer);

          const createBorderStone = (x: number, y: number, scale: number) => {
            const container = new PIXI.Container();
            const baseG = new PIXI.Graphics();
            const highlightG = new PIXI.Graphics();

            const sides = 5 + Math.floor(Math.random() * 3);
            const radius = 22 * scale;
            const points: { x: number; y: number }[] = [];
            for (let i = 0; i < sides; i++) {
              const angle = (i / sides) * Math.PI * 2;
              const r = radius * (0.8 + Math.random() * 0.4);
              points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
            }

            // Stone body
            baseG.poly(points).fill({ color: colors.borderStone, alpha: 1 });

            // Subtle 3D Edge Shading
            baseG.poly(points).stroke({
              width: 3 * scale,
              color: 0x000000,
              alpha: 0.3,
              alignment: 1,
            });

            // Top highlight (to give volume)
            highlightG
              .poly(points.slice(0, Math.floor(sides / 2)))
              .stroke({ width: 2, color: 0xffffff, alpha: 0.1 });

            container.addChild(baseG);
            container.addChild(highlightG);
            container.x = x;
            container.y = y;
            container.rotation = Math.random() * Math.PI * 2;
            borderLayer.addChild(container);
          };

          const pad = 12;
          for (let x = 0; x <= width; x += 35) {
            createBorderStone(
              x + (Math.random() - 0.5) * 15,
              pad,
              0.9 + Math.random() * 0.4
            );
            createBorderStone(
              x + (Math.random() - 0.5) * 15,
              height - pad,
              0.9 + Math.random() * 0.4
            );
          }
          for (let y = 0; y <= height; y += 35) {
            createBorderStone(
              pad,
              y + (Math.random() - 0.5) * 15,
              0.9 + Math.random() * 0.4
            );
            createBorderStone(
              width - pad,
              y + (Math.random() - 0.5) * 15,
              0.9 + Math.random() * 0.4
            );
          }

          // 4. IMPACT SYSTEM
          const impactLayer = new PIXI.Container();
          stage.addChild(impactLayer);
          const activeCracks: MagmaCrack[] = [];
          const flares: ImpactFlare[] = [];

          const triggerImpact = (x: number, y: number) => {
            const flareCont = new PIXI.Container();
            const fGlow = new PIXI.Graphics();
            const fCore = new PIXI.Graphics();
            flareCont.addChild(fGlow);
            flareCont.addChild(fCore);
            impactLayer.addChild(flareCont);
            flareCont.x = x;
            flareCont.y = y;
            flares.push({ container: flareCont, life: 0, maxLife: 0.6 });

            for (let i = 0; i < 4; i++) {
              const g = new PIXI.Graphics();
              const angle = (Math.PI * 2 * i) / 4 + (Math.random() - 0.5) * 0.8;
              const pts = [{ x: 0, y: 0 }];
              let lx = 0,
                ly = 0;
              for (let s = 0; s < 5; s++) {
                lx += Math.cos(angle + (Math.random() - 0.5) * 0.4) * 25;
                ly += Math.sin(angle + (Math.random() - 0.5) * 0.4) * 25;
                pts.push({ x: lx, y: ly });
              }
              const crack = { graphics: g, points: pts, life: 0, maxLife: 1.2 };
              g.x = x;
              g.y = y;
              impactLayer.addChild(g);
              activeCracks.push(crack);
            }
          };

          // 5. ANIMATION LOOP
          const animate = (time: number) => {
            if (isDisposed || !app) return;
            const delta = lastTime ? (time - lastTime) / 1000 : 0.016;
            lastTime = time;

            const pulse = (Math.sin(time * 0.002) + 1) / 2;

            gridCracks.forEach((c) => {
              c.graphics.clear();
              c.graphics.moveTo(c.points[0].x, c.points[0].y);
              c.points.forEach((p) => c.graphics.lineTo(p.x, p.y));
              c.graphics.stroke({
                width: 7 + pulse * 5,
                color: colors.lavaGlow,
                alpha: 0.2 + pulse * 0.2,
              });

              c.graphics.moveTo(c.points[0].x, c.points[0].y);
              c.points.forEach((p) => c.graphics.lineTo(p.x, p.y));
              c.graphics.stroke({
                width: 2 + pulse,
                color: colors.lavaCore,
                alpha: 0.6 + pulse * 0.4,
              });
            });

            for (let i = activeCracks.length - 1; i >= 0; i--) {
              const c = activeCracks[i];
              c.life += delta;
              if (c.life > c.maxLife) {
                c.graphics.destroy();
                activeCracks.splice(i, 1);
                continue;
              }
              const p = c.life / c.maxLife;
              c.graphics.clear().moveTo(0, 0);
              c.points.forEach((pt) => c.graphics.lineTo(pt.x, pt.y));
              c.graphics.stroke({
                width: 5 * (1 - p),
                color: colors.lavaGlow,
                alpha: (1 - p) * 0.7,
              });
              c.graphics.stroke({
                width: 2 * (1 - p),
                color: colors.lavaCore,
                alpha: 1 - p,
              });
            }

            for (let i = flares.length - 1; i >= 0; i--) {
              const f = flares[i];
              f.life += delta;
              if (f.life > f.maxLife) {
                f.container.destroy();
                flares.splice(i, 1);
                continue;
              }
              const p = f.life / f.maxLife;
              const glow = f.container.children[0] as PIXI.Graphics;
              const core = f.container.children[1] as PIXI.Graphics;
              glow
                .clear()
                .circle(0, 0, p * 100)
                .fill({ color: colors.lavaGlow, alpha: (1 - p) * 0.5 });
              core
                .clear()
                .circle(0, 0, p * 40)
                .fill({ color: colors.lavaCore, alpha: (1 - p) * 0.9 });
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
            if (b) app.renderer.resize(b.width, b.height);
          };
          window.addEventListener("resize", handleResize);
        } catch (err) {
          console.error("Earth Grid Error:", err);
        }
      };

      init();
      return () => {
        isDisposed = true;
        if (animationId) cancelAnimationFrame(animationId);
        if (app) app.destroy(true, { children: true, texture: true });
        setIsReady(false);
      };
    }, [theme]);

    return (
      <div className="absolute inset-[-14px] pointer-events-none z-0 rounded-2xl overflow-hidden border-[3px] border-stone-900 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div ref={containerRef} className="absolute inset-0" />

        {/* ATMOSPHERIC DEPTH */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.5)_110%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

        {!isReady && (
          <div className="absolute inset-0 bg-stone-900 animate-pulse" />
        )}
      </div>
    );
  }
);

EarthEffect.displayName = "EarthEffect";
