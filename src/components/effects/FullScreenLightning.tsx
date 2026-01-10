import { useEffect, useRef, memo } from "react";
import * as PIXI from "pixi.js";

export const FullScreenLightning = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let app: PIXI.Application | null = null;
    let isDisposed = false;
    let animationId: number | null = null;
    let lastTime = 0;
    let timeoutId: NodeJS.Timeout;

    const init = async () => {
      if (!containerRef.current) return;

      const newApp = new PIXI.Application();
      try {
        await newApp.init({
          resizeTo: window,
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

        const { width, height } = app.screen;
        const stage = app.stage;

        // Layers
        const boltContainer = new PIXI.Container();
        const flashGraphics = new PIXI.Graphics();
        stage.addChild(boltContainer);
        stage.addChild(flashGraphics);

        // State for animations
        let flashAlpha = 0;
        let activeBolts: {
          graphics: PIXI.Graphics;
          life: number;
          maxLife: number;
        }[] = [];

        const triggerStorm = () => {
          if (isDisposed) return;

          // Queue next storm
          const delay = 3000 + Math.random() * 7000;
          timeoutId = setTimeout(triggerStorm, delay);

          // Chance for bolt
          const hasBolt = Math.random() > 0.4;
          if (hasBolt) {
            const x = Math.random() * width;
            const scale = 0.5 + Math.random() * 1.5;

            const g = new PIXI.Graphics();
            boltContainer.addChild(g);

            // Draw Bolt
            g?.clear();
            // Outer Glow
            g.moveTo(x, 0);

            const segments = 12;
            let currentX = x;
            let currentY = 0;
            const segHeight = height / segments;

            const path: { x: number; y: number }[] = [{ x, y: 0 }];

            for (let i = 0; i < segments; i++) {
              currentY += segHeight + (Math.random() - 0.5) * 20;
              currentX += (Math.random() - 0.5) * 80;
              path.push({ x: currentX, y: currentY });
            }

            // Render bold twice: glow and core
            // Glow
            g.moveTo(path[0].x, path[0].y);
            path.forEach((p) => g.lineTo(p.x, p.y));
            g.stroke({
              width: 8 * scale,
              color: 0x60a5fa,
              alpha: 0.5,
              cap: "round",
              join: "round",
            });

            // Core
            g.moveTo(path[0].x, path[0].y);
            path.forEach((p) => g.lineTo(p.x, p.y));
            g.stroke({
              width: 3 * scale,
              color: 0xffffff,
              alpha: 1,
              cap: "round",
              join: "round",
            });

            // Add to active with life
            activeBolts.push({
              graphics: g,
              life: 0.3, // seconds
              maxLife: 0.3,
            });
          }

          // Trigger Flash
          flashAlpha = 0.6 + Math.random() * 0.4;
        };

        // Start Loop
        triggerStorm();

        // Animation Loop
        const animate = (time: number) => {
          if (isDisposed || !app) return;
          const delta = lastTime ? (time - lastTime) / 1000 : 0.016;
          lastTime = time;

          // 1. Update Flash
          if (flashAlpha > 0) {
            // Flicker down
            flashAlpha -= delta * 3; // Fade speed
            if (flashAlpha < 0) flashAlpha = 0;

            flashGraphics?.clear();
            flashGraphics
              .rect(0, 0, width, height)
              .fill({ color: 0xffffff, alpha: flashAlpha * 0.5 });
          } else {
            flashGraphics?.clear();
          }

          // 2. Update Bolts
          for (let i = activeBolts.length - 1; i >= 0; i--) {
            const b = activeBolts[i];
            b.life -= delta;

            // Flicker opacity
            b.graphics.alpha = b.life > 0.15 ? 1 : Math.random();

            if (b.life <= 0) {
              b.graphics.destroy();
              activeBolts.splice(i, 1);
            }
          }

          animationId = requestAnimationFrame(animate);
        };
        animationId = requestAnimationFrame(animate);

        const handleResize = () => {
          if (!app || isDisposed) return;
          app.renderer.resize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);
      } catch (err) {
        console.error("Lightning Pixi Error:", err);
      }
    };

    init();

    return () => {
      isDisposed = true;
      clearTimeout(timeoutId);
      if (animationId) cancelAnimationFrame(animationId);
      if (app) app.destroy(true, { children: true, texture: true });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
    />
  );
});

FullScreenLightning.displayName = "FullScreenLightning";
