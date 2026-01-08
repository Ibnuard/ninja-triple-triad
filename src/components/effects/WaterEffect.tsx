import { useEffect, useRef, memo } from "react";
import * as PIXI from "pixi.js";

interface WaterEffectProps {
  lastMove: { row: number; col: number; playerId: string } | null;
}

interface BubbleData {
  graphics: PIXI.Graphics;
  speed: number;
  jitter: number;
  x: number;
  y: number;
}

interface RippleData {
  graphics: PIXI.Graphics;
  life: number;
  maxLife: number;
  isRain?: boolean;
}

interface FishData {
  container: PIXI.Container;
  body: PIXI.Graphics;
  fins: PIXI.Graphics;
  tail: PIXI.Graphics;
  speed: number;
  turnSpeed: number;
  angle: number;
  targetAngle: number;
  x: number;
  y: number;
  color: number;
}

export const WaterEffect = memo(({ lastMove }: WaterEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleQueue = useRef<{ x: number; y: number }[]>([]);

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

        const { width, height } = app.screen;

        // 1. Uniform Water Surface & Displacement
        const noiseSize = 256;
        const noiseCanvas = document.createElement("canvas");
        noiseCanvas.width = noiseSize;
        noiseCanvas.height = noiseSize;
        const ctx = noiseCanvas.getContext("2d");
        if (ctx) {
          const imageData = ctx.createImageData(noiseSize, noiseSize);
          for (let i = 0; i < imageData.data.length; i += 4) {
            const px = (i / 4) % noiseSize;
            const py = Math.floor(i / 4 / noiseSize);
            const val = 127 + Math.sin(px / 20) * 60 + Math.cos(py / 20) * 60;
            imageData.data[i] = val;
            imageData.data[i + 1] = val;
            imageData.data[i + 2] = val;
            imageData.data[i + 3] = 255;
          }
          ctx.putImageData(imageData, 0, 0);
        }
        const noiseTexture = PIXI.Texture.from(noiseCanvas);
        noiseTexture.source.addressMode = "repeat";
        const displacementSprite = new PIXI.Sprite(noiseTexture);
        displacementSprite.scale.set(4);
        displacementSprite.position.set(-100, -100);

        const displacementFilter = new PIXI.DisplacementFilter(
          displacementSprite
        );
        displacementFilter.scale.set(20);

        const surfaceContainer = new PIXI.Container();
        surfaceContainer.filters = [displacementFilter];
        app.stage.addChild(displacementSprite);
        app.stage.addChild(surfaceContainer);

        const bg = new PIXI.Graphics();
        bg.rect(-50, -50, width + 100, height + 100);
        bg.fill({ color: 0x1e40af, alpha: 0.25 });
        surfaceContainer.addChild(bg);

        // 2. High-Quality Fish (Koi)
        const fishes: FishData[] = [];
        const fishLayer = new PIXI.Container();
        surfaceContainer.addChild(fishLayer);

        const createFish = () => {
          const container = new PIXI.Container();
          const body = new PIXI.Graphics();
          const fins = new PIXI.Graphics();
          const tail = new PIXI.Graphics();

          const color = Math.random() > 0.4 ? 0xfb923c : 0xffffff;

          // Body
          body.moveTo(0, 0);
          body.bezierCurveTo(8, -4, 8, 4, 0, 0);
          body.bezierCurveTo(-10, 3, -10, -3, 0, 0);
          body.fill({ color: color, alpha: 0.85 });

          // Eyes
          body.circle(6, -1.5, 0.8);
          body.fill(0x000000);
          body.circle(6, 1.5, 0.8);
          body.fill(0x000000);

          // Fins
          fins.moveTo(2, -2);
          fins.quadraticCurveTo(4, -6, 0, -5);
          fins.fill({ color: color, alpha: 0.6 });
          fins.moveTo(2, 2);
          fins.quadraticCurveTo(4, 6, 0, 5);
          fins.fill({ color: color, alpha: 0.6 });

          // Tail
          tail.moveTo(0, 0);
          tail.bezierCurveTo(-4, -6, -8, -4, -6, 0);
          tail.bezierCurveTo(-8, 4, -4, 6, 0, 0);
          tail.fill({ color: color, alpha: 0.7 });
          tail.x = -8;

          container.addChild(fins);
          container.addChild(tail);
          container.addChild(body);
          fishLayer.addChild(container);

          fishes.push({
            container,
            body,
            fins,
            tail,
            speed: 0.3 + Math.random() * 0.5,
            turnSpeed: 0.012,
            angle: Math.random() * Math.PI * 2,
            targetAngle: Math.random() * Math.PI * 2,
            x: Math.random() * width,
            y: Math.random() * height,
            color,
          });
        };
        for (let i = 0; i < 5; i++) createFish();

        // 3. Ambient Raindrops & Ripples
        const ripples: RippleData[] = [];
        const rippleLayer = new PIXI.Container();
        app.stage.addChild(rippleLayer);

        const createRipple = (x: number, y: number, isRain = false) => {
          const g = new PIXI.Graphics();
          rippleLayer.addChild(g);
          ripples.push({
            graphics: g,
            life: 0,
            maxLife: isRain ? 0.7 : 1.4,
            isRain,
          });
          g.x = x * width;
          g.y = y * height;
        };

        // 4. Shimmer/Reflections
        const shimmerLayer = new PIXI.Container();
        shimmerLayer.alpha = 0.25;
        surfaceContainer.addChild(shimmerLayer);
        const shimmers: PIXI.Graphics[] = [];
        for (let i = 0; i < 10; i++) {
          const s = new PIXI.Graphics();
          s.ellipse(0, 0, 30 + Math.random() * 30, 2 + Math.random() * 3);
          s.fill({ color: 0xffffff, alpha: 0.3 });
          s.x = Math.random() * width;
          s.y = Math.random() * height;
          shimmerLayer.addChild(s);
          shimmers.push(s);
        }

        let totalTime = 0;
        let rainTimer = 0;

        app.ticker.add((ticker) => {
          if (isDisposed || !app) return;
          const deltaInSeconds = ticker.deltaTime / 60;
          totalTime += deltaInSeconds;

          // Smooth Liquid Movement
          displacementSprite.x += 0.5;
          displacementSprite.y += 0.3;
          if (displacementSprite.x > 0) displacementSprite.x = -100;
          if (displacementSprite.y > 0) displacementSprite.y = -100;

          // Rain
          rainTimer += deltaInSeconds;
          if (rainTimer > 0.5 + Math.random() * 1.0) {
            createRipple(Math.random(), Math.random(), true);
            rainTimer = 0;
          }

          // Liquid Fish Logic
          fishes.forEach((f) => {
            if (Math.random() < 0.01)
              f.targetAngle += (Math.random() - 0.5) * 3;
            let dAngle = f.targetAngle - f.angle;
            while (dAngle > Math.PI) dAngle -= Math.PI * 2;
            while (dAngle < -Math.PI) dAngle += Math.PI * 2;
            f.angle += dAngle * f.turnSpeed;

            f.x += Math.cos(f.angle) * f.speed;
            f.y += Math.sin(f.angle) * f.speed;

            if (f.x < -10) f.x = width + 10;
            if (f.x > width + 10) f.x = -10;
            if (f.y < -10) f.y = height + 10;
            if (f.y > height + 10) f.y = -10;

            f.container.x = f.x;
            f.container.y = f.y;
            f.container.rotation = f.angle;
            f.tail.rotation = Math.sin(totalTime * 8) * 0.35;
            f.fins.scale.y = 0.9 + Math.sin(totalTime * 4) * 0.1;
          });

          // Shimmer animation
          shimmers.forEach((s, i) => {
            s.x += Math.cos(totalTime * 0.4 + i) * 0.3;
            s.alpha = 0.2 + Math.sin(totalTime + i) * 0.15;
          });

          // Handle Placement Ripples
          while (rippleQueue.current.length > 0) {
            const r = rippleQueue.current.shift();
            if (r) createRipple(r.x, r.y);
          }

          // Ripples update
          for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            r.life += deltaInSeconds;
            if (r.life >= r.maxLife) {
              r.graphics.destroy();
              ripples.splice(i, 1);
              continue;
            }
            const prog = r.life / r.maxLife;
            r.graphics.clear();
            const count = r.isRain ? 1 : 2;
            for (let ring = 0; ring < count; ring++) {
              const ringProg = Math.max(0, prog - ring * 0.15);
              if (ringProg <= 0) continue;
              const radius = ringProg * (r.isRain ? 25 : 120);
              r.graphics.circle(0, 0, radius);
              r.graphics.stroke({
                width: 1.5,
                color: 0x93c5fd,
                alpha: (1 - ringProg) * (r.isRain ? 0.4 : 0.6),
              });
            }
          }
        });
      } catch (err) {
        console.error("PixiJS Water Error:", err);
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
    <div className="absolute inset-[-12px] pointer-events-none z-0 rounded-xl overflow-hidden shadow-[inset_0_0_30px_rgba(30,64,175,0.4)]">
      {/* DEEP BASE */}
      <div className="absolute inset-0 bg-blue-900/15" />

      {/* CANVAS */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* LIQUID BORDER HIGHLIGHT */}
      <div className="absolute inset-0 border-[3px] border-blue-400/10 rounded-xl mix-blend-screen" />
      <div className="absolute inset-2 border border-white/5 rounded-lg pointer-events-none" />
    </div>
  );
});

WaterEffect.displayName = "WaterEffect";
