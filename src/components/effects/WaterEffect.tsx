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
}

export const WaterEffect = memo(({ lastMove }: WaterEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleQueue = useRef<{ x: number; y: number }[]>([]);

  // Queue ripples when lastMove changes
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

        // 1. Water Surface with Displacement
        // We'll use a generated noise texture for displacement
        const noiseSize = 512;
        const noiseCanvas = document.createElement("canvas");
        noiseCanvas.width = noiseSize;
        noiseCanvas.height = noiseSize;
        const ctx = noiseCanvas.getContext("2d");
        if (ctx) {
          const imageData = ctx.createImageData(noiseSize, noiseSize);
          for (let i = 0; i < imageData.data.length; i += 4) {
            const val = Math.random() * 255;
            imageData.data[i] = val; // R
            imageData.data[i + 1] = val; // G
            imageData.data[i + 2] = val; // B
            imageData.data[i + 3] = 255; // A
          }
          ctx.putImageData(imageData, 0, 0);
        }

        const noiseTexture = PIXI.Texture.from(noiseCanvas);
        const displacementSprite = new PIXI.Sprite(noiseTexture);
        displacementSprite.texture.baseTexture.wrapMode = "repeat";
        displacementSprite.scale.set(2);

        const displacementFilter = new PIXI.DisplacementFilter(
          displacementSprite
        );
        displacementFilter.scale.set(20);

        const surfaceContainer = new PIXI.Container();
        surfaceContainer.filters = [displacementFilter];
        app.stage.addChild(displacementSprite);
        app.stage.addChild(surfaceContainer);

        // Add a blue tint background sprite to be displaced
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, width, height);
        bg.fill({ color: 0x1e40af, alpha: 0.2 });
        surfaceContainer.addChild(bg);

        // 2. Bubbles System
        const bubbles: BubbleData[] = [];
        const bubbleContainer = new PIXI.Container();
        app.stage.addChild(bubbleContainer);

        const createBubble = () => {
          const g = new PIXI.Graphics();
          const size = 2 + Math.random() * 4;
          g.circle(0, 0, size);
          g.stroke({ width: 1, color: 0xffffff, alpha: 0.3 });
          g.fill({ color: 0xffffff, alpha: 0.1 });

          const b: BubbleData = {
            graphics: g,
            speed: 1 + Math.random() * 2,
            jitter: (Math.random() - 0.5) * 0.5,
            x: Math.random() * width,
            y: height + 10,
          };

          bubbleContainer.addChild(g);
          bubbles.push(b);
        };

        for (let i = 0; i < 15; i++) createBubble();

        // 3. Ripples System
        const ripples: RippleData[] = [];
        const rippleLayer = new PIXI.Container();
        app.stage.addChild(rippleLayer);

        const createRipple = (x: number, y: number) => {
          const g = new PIXI.Graphics();
          rippleLayer.addChild(g);
          ripples.push({
            graphics: g,
            life: 0,
            maxLife: 1.5,
          });
          // Initial position
          g.x = x * width;
          g.y = y * height;
        };

        // Animation Loop
        app.ticker.add((ticker) => {
          if (isDisposed || !app) return;
          const deltaInSeconds = ticker.deltaTime / 60;

          // Animate displacement noise
          displacementSprite.x += 1;
          displacementSprite.y += 0.8;

          // Update Bubbles
          bubbles.forEach((b) => {
            b.y -= b.speed;
            b.x += Math.sin(b.y / 20) * b.jitter;

            if (b.y < -20) {
              b.y = height + 20;
              b.x = Math.random() * width;
            }

            b.graphics.x = b.x;
            b.graphics.y = b.y;
            b.graphics.alpha = Math.min(1, (b.y / height) * 2);
          });

          // Handle queued ripples
          while (rippleQueue.current.length > 0) {
            const r = rippleQueue.current.shift();
            if (r) createRipple(r.x, r.y);
          }

          // Update Ripples
          for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            r.life += deltaInSeconds;

            if (r.life >= r.maxLife) {
              rippleLayer.removeChild(r.graphics);
              r.graphics.destroy();
              ripples.splice(i, 1);
              continue;
            }

            const progress = r.life / r.maxLife;
            r.graphics.clear();

            // Multiple rings
            for (let ring = 0; ring < 2; ring++) {
              const ringProgress = Math.max(0, progress - ring * 0.2);
              if (ringProgress <= 0) continue;

              const radius = ringProgress * 80;
              const alpha = (1 - ringProgress) * 0.5;

              r.graphics.circle(0, 0, radius);
              r.graphics.stroke({ width: 2, color: 0x93c5fd, alpha });
            }
          }
        });
      } catch (error) {
        console.error("Failed to initialize PixiJS WaterEffect:", error);
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
    <div className="absolute inset-[-24px] pointer-events-none z-0 rounded-2xl overflow-hidden">
      {/* BASE TINT */}
      <div className="absolute inset-0 bg-blue-900/10" />

      {/* PIXI CANVAS */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* STATIC OVERLAYS */}
      <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-[8px] border border-blue-400/10 rounded-xl" />
    </div>
  );
});

WaterEffect.displayName = "WaterEffect";
