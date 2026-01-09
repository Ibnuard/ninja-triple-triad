import { useEffect, useRef, memo, useState } from "react";
import * as PIXI from "pixi.js";

interface WaterEffectProps {
  lastMove: { row: number; col: number; playerId: string } | null;
}

interface Ripple {
  graphics: PIXI.Graphics;
  life: number;
  maxLife: number;
  isRaindrop: boolean;
  x: number;
  y: number;
}

interface CausticGrid {
  graphics: PIXI.Graphics;
  points: { x: number; y: number }[];
}

interface Raindrop {
  graphics: PIXI.Graphics;
  x: number;
  y: number;
  speed: number;
  life: number;
  maxLife: number;
  spawnedRipple: boolean;
}

export const WaterEffect = memo(({ lastMove }: WaterEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleQueue = useRef<{ x: number; y: number }[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (lastMove) {
      rippleQueue.current.push({
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
    let rainTimer = 0;

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

        // 1. UNDERWATER BED TEXTURE
        const bedLayer = new PIXI.Container();
        stage.addChild(bedLayer);

        const createBedTexture = () => {
          const size = 512;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#1e3a5f";
            ctx.fillRect(0, 0, size, size);
            // Texture noise
            for (let i = 0; i < 8000; i++) {
              ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
              ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
            }
            // Sandy depth
            for (let i = 0; i < 40; i++) {
              ctx.fillStyle = "rgba(0,0,0,0.1)";
              ctx.beginPath();
              ctx.arc(
                Math.random() * size,
                Math.random() * size,
                2 + Math.random() * 4,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          }
          return PIXI.Texture.from(canvas);
        };
        const bed = new PIXI.TilingSprite({
          texture: createBedTexture(),
          width,
          height,
        });
        bed.alpha = 0.7;
        bedLayer.addChild(bed);

        // 2. CAUSTIC GRID
        const causticLayer = new PIXI.Container();
        stage.addChild(causticLayer);

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
              x: x1 + dx * p + (Math.random() - 0.5) * 15,
              y: y1 + dy * p + (Math.random() - 0.5) * 15,
            });
          }
          pts.push({ x: x2, y: y2 });
          return pts;
        };

        const caustics: CausticGrid[] = [];
        for (let i = 1; i < 3; i++) {
          const vx = (i / 3) * width,
            hy = (i / 3) * height;
          caustics.push({
            graphics: new PIXI.Graphics(),
            points: createJaggedLine(vx, 0, vx, height),
          });
          caustics.push({
            graphics: new PIXI.Graphics(),
            points: createJaggedLine(0, hy, width, hy),
          });
        }
        caustics.forEach((c) => causticLayer.addChild(c.graphics));

        // 3. LIQUID BORDER (Glowing Fluid)
        const borderLayer = new PIXI.Container();
        stage.addChild(borderLayer);
        const borderPulse = new PIXI.Graphics();
        borderLayer.addChild(borderPulse);

        // 4. RAINDROPS & RIPPLES SYSTEM
        const rainLayer = new PIXI.Container();
        const rippleLayer = new PIXI.Container();
        stage.addChild(rippleLayer);
        stage.addChild(rainLayer);

        const raindrops: Raindrop[] = [];
        const activeRipples: Ripple[] = [];

        const createRaindrop = () => {
          const g = new PIXI.Graphics();
          const size = 1.5 + Math.random() * 2;
          g.circle(0, 0, size).fill({ color: 0x93c5fd, alpha: 0.6 });
          rainLayer.addChild(g);
          const x = Math.random() * width,
            y = -10;
          g.x = x;
          g.y = y;
          raindrops.push({
            graphics: g,
            x,
            y,
            speed: 4 + Math.random() * 4,
            life: 0,
            maxLife: 2,
            spawnedRipple: false,
          });
        };

        const triggerRipple = (x: number, y: number, isRain = false) => {
          const g = new PIXI.Graphics();
          rippleLayer.addChild(g);
          activeRipples.push({
            graphics: g,
            life: 0,
            maxLife: isRain ? 0.8 : 1.5,
            isRaindrop: isRain,
            x,
            y,
          });
        };

        // 5. ANIMATION LOOP
        const animate = (time: number) => {
          if (isDisposed || !app) return;
          const delta = lastTime ? (time - lastTime) / 1000 : 0.016;
          lastTime = time;

          // Spawn raindrops
          rainTimer += delta;
          if (rainTimer > 0.4) {
            createRaindrop();
            rainTimer = 0;
          }

          // Process Raindrops
          for (let i = raindrops.length - 1; i >= 0; i--) {
            const d = raindrops[i];
            d.y += d.speed;
            d.graphics.y = d.y;
            // Splash at ground/surface level (randomized for depth feel)
            if (
              !d.spawnedRipple &&
              d.y > height * 0.7 + Math.random() * height * 0.2
            ) {
              triggerRipple(d.x, d.y, true);
              d.spawnedRipple = true;
            }
            if (d.y > height + 20) {
              d.graphics.destroy();
              raindrops.splice(i, 1);
            }
          }

          // Process Ripples
          for (let i = activeRipples.length - 1; i >= 0; i--) {
            const r = activeRipples[i];
            r.life += delta;
            if (r.life > r.maxLife) {
              r.graphics.destroy();
              activeRipples.splice(i, 1);
              continue;
            }
            const p = r.life / r.maxLife;
            r.graphics.clear();
            const ringCount = r.isRaindrop ? 1 : 3;
            for (let ring = 0; ring < ringCount; ring++) {
              const rp = Math.max(0, p - ring * 0.15);
              if (rp > 0) {
                r.graphics.circle(r.x, r.y, rp * (r.isRaindrop ? 30 : 250));
                r.graphics.stroke({
                  width: (r.isRaindrop ? 1.5 : 2.5) * (1 - rp),
                  color: 0xffffff,
                  alpha: (1 - rp) * (r.isRaindrop ? 0.3 : 0.5),
                });
              }
            }
          }

          // Liquid Border Animation
          const bp = (Math.sin(time * 0.003) + 1) / 2;
          borderPulse.clear();
          borderPulse.rect(0, 0, width, height);
          borderPulse.stroke({
            width: 4 + bp * 4,
            color: 0x60a5fa,
            alpha: 0.1 + bp * 0.1,
            alignment: 1,
          });
          // Inner glow
          borderPulse.rect(8, 8, width - 16, height - 16);
          borderPulse.stroke({
            width: 2,
            color: 0x3b82f6,
            alpha: 0.05 + bp * 0.05,
            alignment: 0,
          });

          // Caustic Grid
          caustics.forEach((c, idx) => {
            const p = (Math.sin(time * 0.0015 + idx) + 1) / 2;
            c.graphics.clear().moveTo(c.points[0].x, c.points[0].y);
            c.points.forEach((pt) => {
              const ox = Math.sin(time * 0.003 + pt.x * 0.01) * 7;
              const oy = Math.cos(time * 0.003 + pt.y * 0.01) * 7;
              c.graphics.lineTo(pt.x + ox, pt.y + oy);
            });
            c.graphics.stroke({
              width: 4 + p * 3,
              color: 0x93c5fd,
              alpha: 0.08 + p * 0.08,
            });
          });

          bed.tilePosition.x += 0.05;
          bed.tilePosition.y += 0.03;

          while (rippleQueue.current.length > 0) {
            const m = rippleQueue.current.shift();
            if (m) triggerRipple(m.x * width, m.y * height, false);
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
        console.error("Water Liquid Error:", err);
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
    <div className="absolute inset-[-14px] pointer-events-none z-0 rounded-2xl overflow-hidden border-[2px] border-blue-400/20 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
      <div ref={containerRef} className="absolute inset-0" />

      {/* ATMOSPHERIC OVERLAYS */}
      <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400/5 via-transparent to-blue-900/20" />

      {!isReady && (
        <div className="absolute inset-0 bg-blue-950 animate-pulse" />
      )}
    </div>
  );
});

WaterEffect.displayName = "WaterEffect";
