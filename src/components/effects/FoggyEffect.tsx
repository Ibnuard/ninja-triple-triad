import { useEffect, useRef, memo, useState } from "react";
import * as PIXI from "pixi.js";

interface FoggyEffectProps {
  lastMove: { row: number; col: number; playerId: string } | null;
}

interface FogLayer {
  sprite: PIXI.TilingSprite;
  speedX: number;
  speedY: number;
}

export const FoggyEffect = memo(({ lastMove }: FoggyEffectProps) => {
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

        // --- 1. ADVANCED MIST TEXTURE GENERATION ---
        // We create a more turbulent, cloud-like texture
        const createMistTexture = (color: string, density: number) => {
          const size = 1024;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) return PIXI.Texture.WHITE;

          ctx.clearRect(0, 0, size, size);

          // Base wash
          // ctx.fillStyle = `rgba(${color}, ${density * 0.1})`;
          // ctx.fillRect(0,0,size,size);

          // Cloud puffs
          for (let i = 0; i < 60; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 100 + Math.random() * 250;

            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, `rgba(${color}, ${density * 0.3})`);
            grad.addColorStop(0.4, `rgba(${color}, ${density * 0.1})`);
            grad.addColorStop(1, `rgba(${color}, 0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            // Seamless tiling wrapping
            if (x < r) {
              ctx.save();
              ctx.translate(size, 0);
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(x, y, r, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
            if (x > size - r) {
              ctx.save();
              ctx.translate(-size, 0);
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(x, y, r, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
            if (y < r) {
              ctx.save();
              ctx.translate(0, size);
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(x, y, r, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
            if (y > size - r) {
              ctx.save();
              ctx.translate(0, -size);
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(x, y, r, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }

          // Noise/Grain
          const id = ctx.getImageData(0, 0, size, size);
          const d = id.data;
          for (let i = 0; i < d.length; i += 4) {
            if (Math.random() > 0.95) {
              d[i + 3] = Math.min(255, d[i + 3] + 10); // Slight noise
            }
          }
          ctx.putImageData(id, 0, 0);

          return PIXI.Texture.from(canvas);
        };

        const fogContainer = new PIXI.Container();
        stage.addChild(fogContainer);

        const fogLayers: FogLayer[] = [
          // Deep slow layer - Increased density/opacity for background coverage
          {
            sprite: new PIXI.TilingSprite({
              texture: createMistTexture("200,210,230", 0.15), // Increased from 0.05
              width,
              height,
            }),
            speedX: 0.05,
            speedY: 0.02,
          },
          // Mid wandering layer
          {
            sprite: new PIXI.TilingSprite({
              texture: createMistTexture("220,230,255", 0.12), // Increased from 0.08
              width,
              height,
            }),
            speedX: -0.08,
            speedY: 0.04,
          },
          // Top fast wisp layer
          {
            sprite: new PIXI.TilingSprite({
              texture: createMistTexture("255,255,255", 0.05), // Increased from 0.03
              width,
              height,
            }),
            speedX: 0.12,
            speedY: -0.05,
          },
        ];

        fogLayers.forEach((l, i) => {
          // Screen blend mode makes fog glow slightly against dark background
          l.sprite.blendMode = "screen";
          l.sprite.tileScale.set(1.5 + i * 0.5); // Varying scales for depth
          l.sprite.alpha = 0.8; // Increased from 0.6 to make it more visible in center
          fogContainer.addChild(l.sprite);
        });

        // --- 2. ORGANIC FOG GRID (Sine Waves) ---
        const gridLayer = new PIXI.Container();
        stage.addChild(gridLayer);
        // We'll draw these dynamically in the animate loop
        const gridG = new PIXI.Graphics();
        gridLayer.addChild(gridG);

        // --- 3. SUSPENDED PARTICLES (Motes) ---
        const particleContainer = new PIXI.Container();
        stage.addChild(particleContainer);
        const particles: {
          x: number;
          y: number;
          vx: number;
          vy: number;
          r: number;
          alpha: number;
          phase: number;
        }[] = [];

        for (let i = 0; i < 80; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            r: Math.random() * 2,
            alpha: 0.1 + Math.random() * 0.4,
            phase: Math.random() * Math.PI * 2,
          });
        }

        const particleG = new PIXI.Graphics();
        particleContainer.addChild(particleG);

        // --- 4. DENSE BORDER CLOUDS ---
        const borderLayer = new PIXI.Container();
        stage.addChild(borderLayer);
        const borderWisps: {
          x: number;
          y: number;
          r: number;
          phase: number;
          speed: number;
        }[] = [];

        // Populate border wisps
        for (let i = 0; i < 50; i++) {
          borderWisps.push({
            x: 0, // Set in loop
            y: 0,
            r: 20 + Math.random() * 40,
            phase: Math.random() * Math.PI * 2,
            speed: 0.0002 + Math.random() * 0.0005, // SIGNIFICANTLY SLOWED DOWN (was 0.001+)
          });
        }
        const borderG = new PIXI.Graphics();
        borderLayer.addChild(borderG);
        // Slightly blur the border implementation for fluffiness
        const borderBlur = new PIXI.BlurFilter();
        borderBlur.blur = 8;
        borderLayer.filters = [borderBlur];

        // --- 5. NATURAL/RANDOM IMPACTS (Smoke Swirls) ---
        const impactContainer = new PIXI.Container();
        stage.addChild(impactContainer);

        interface SmokePuff {
          graphics: PIXI.Graphics;
          x: number;
          y: number;
          vx: number;
          vy: number;
          life: number;
          maxLife: number;
          rotationSpeed: number;
          scale: number;
        }

        const smokes: SmokePuff[] = [];

        const triggerImpact = (x: number, y: number) => {
          // Spawn multiple puffs to create a "Cloud Burst" effect
          const count = 8 + Math.floor(Math.random() * 5);
          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 60;

            const g = new PIXI.Graphics();
            g.blendMode = "screen";
            impactContainer.addChild(g);

            smokes.push({
              graphics: g,
              x: x,
              y: y,
              vx: Math.cos(angle) * speed * 0.5,
              vy: Math.sin(angle) * speed * 0.5,
              life: 0,
              maxLife: 1.0 + Math.random() * 0.8,
              rotationSpeed: (Math.random() - 0.5) * 0.1,
              scale: 0.5 + Math.random() * 1.0,
            });
          }
        };

        // --- ANIMATION LOOP ---
        const animate = (time: number) => {
          if (isDisposed || !app) return;
          const delta = lastTime ? (time - lastTime) / 1000 : 0.016;
          lastTime = time;

          // 1. Drift Fog
          fogLayers.forEach((l, i) => {
            l.sprite.tilePosition.x +=
              l.speedX * (1 + Math.sin(time * 0.0005 + i) * 0.2); // Variable speed
            l.sprite.tilePosition.y += l.speedY;
          });

          // 2. Draw Organic Grid
          gridG?.clear();
          const t = time * 0.001;

          const drawSineLine = (
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            orient: "h" | "v",
            index: number
          ) => {
            gridG.moveTo(x1, y1);
            const segments = 20;
            const dx = x2 - x1;
            const dy = y2 - y1;

            for (let s = 1; s <= segments; s++) {
              const p = s / segments;
              const tx = x1 + dx * p;
              const ty = y1 + dy * p;

              // Wave offset
              const wave =
                Math.sin(t + p * 5 + index) * 10 +
                Math.sin(t * 0.5 + p * 2) * 5;

              if (orient === "v") gridG.lineTo(tx + wave, ty);
              else gridG.lineTo(tx, ty + wave);
            }
          };

          gridG.stroke({ width: 2, color: 0xffffff, alpha: 0.15 });

          for (let i = 1; i < 3; i++) {
            drawSineLine((i / 3) * width, 0, (i / 3) * width, height, "v", i);
            drawSineLine(
              0,
              (i / 3) * height,
              width,
              (i / 3) * height,
              "h",
              i + 10
            );
          }

          // 3. Draw Particles
          particleG?.clear();
          particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap
            if (p.x < 0) p.x += width;
            if (p.x > width) p.x -= width;
            if (p.y < 0) p.y += height;
            if (p.y > height) p.y -= height;

            const shimmer = Math.sin(time * 0.002 + p.phase) * 0.2;
            particleG
              .circle(p.x, p.y, p.r)
              .fill({ color: 0xffffff, alpha: Math.max(0, p.alpha + shimmer) });
          });

          // 4. Draw Border Wisps
          borderG?.clear();
          borderWisps.forEach((w, i) => {
            w.phase += w.speed;

            const perimeter = (width + height) * 2;
            const rawPos =
              (w.phase * 5000 + i * (perimeter / borderWisps.length)) %
              perimeter;

            let bx = 0,
              by = 0;
            if (rawPos < width) {
              bx = rawPos;
              by = 0;
            } else if (rawPos < width + height) {
              bx = width;
              by = rawPos - width;
            } else if (rawPos < width * 2 + height) {
              bx = width - (rawPos - (width + height));
              by = height;
            } else {
              bx = 0;
              by = height - (rawPos - (width * 2 + height));
            }

            const wobbleX = Math.sin(time * 0.001 + i) * 15;
            const wobbleY = Math.cos(time * 0.001 + i) * 15;

            borderG
              .circle(bx + wobbleX, by + wobbleY, w.r)
              .fill({ color: 0xffffff, alpha: 0.15 });
          });

          // 5. Update Smoke Puffs (Random Swirls)
          for (let i = smokes.length - 1; i >= 0; i--) {
            const s = smokes[i];
            s.life += delta;
            if (s.life > s.maxLife) {
              s.graphics.destroy();
              smokes.splice(i, 1);
              continue;
            }

            s.x += s.vx * delta * 60; // normalize speed
            s.y += s.vy * delta * 60;
            s.vx *= 0.95; // drag
            s.vy *= 0.95;

            s.graphics.rotation += s.rotationSpeed;

            const p = s.life / s.maxLife; // 0 -> 1
            const alpha = (1 - p) * 0.6;
            const scale = s.scale * (1 + p * 0.5); // Expand slightly

            s.graphics?.clear();
            // Draw a "wispy" shape instead of circle
            // A cluster of 3 circles to look like a cloud puff
            s.graphics
              .circle(0, 0, 40 * scale)
              .fill({ color: 0xffffff, alpha: alpha });
            s.graphics
              .circle(20 * scale, 10 * scale, 25 * scale)
              .fill({ color: 0xffffff, alpha: alpha * 0.8 });
            s.graphics
              .circle(-15 * scale, 25 * scale, 20 * scale)
              .fill({ color: 0xffffff, alpha: alpha * 0.8 });

            s.graphics.x = s.x;
            s.graphics.y = s.y;
          }

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
          if (b && app.renderer) {
            app.renderer.resize(b.width, b.height);
            fogLayers.forEach((l) => {
              l.sprite.width = b.width;
              l.sprite.height = b.height;
            });
          }
        };
        window.addEventListener("resize", handleResize);
      } catch (err) {
        console.error("Foggy Abyss Error:", err);
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
    <div className="absolute inset-[-15px] pointer-events-none z-0 rounded-2xl overflow-visible border-[3px] border-slate-400/20 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
      <div ref={containerRef} className="absolute inset-0" />

      {/* ABYSSAL OVERLAYS - Enhanced depth */}
      <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 via-transparent to-slate-950/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.6)_120%)]" />

      {!isReady && (
        <div className="absolute inset-0 bg-slate-900 animate-pulse" />
      )}
    </div>
  );
});

FoggyEffect.displayName = "FoggyEffect";
