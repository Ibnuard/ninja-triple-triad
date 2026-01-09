import { useEffect, useRef, memo, useState } from "react";
import * as PIXI from "pixi.js";

interface WaterEffectProps {
  lastMove: { row: number; col: number; playerId: string } | null;
  waveIntensity?: number;
  rainFrequency?: number; // Kontrol frekuensi raindrop
}

interface WavePoint {
  x: number;
  baseY: number;
  offset: number;
  speed: number;
  amplitude: number;
  phase: number;
}

interface SideWave {
  points: WavePoint[];
  graphics: PIXI.Graphics;
  side: "top" | "right" | "bottom" | "left";
}

interface RaindropData {
  graphics: PIXI.Graphics;
  x: number;
  y: number;
  speed: number;
  life: number;
  maxLife: number;
  size: number;
  hasSpawnedRipple?: boolean;
}

export const WaterEffect = memo(
  ({
    lastMove,
    waveIntensity = 0.5,
    rainFrequency = 0.5, // Default: medium frequency
  }: WaterEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rippleQueue = useRef<{ x: number; y: number }[]>([]);
    const rainTimerRef = useRef<number>(0);
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
      let sideWaves: SideWave[] = [];
      let waveUpdateId: number | null = null;
      let lastTime = 0;

      const init = async () => {
        if (!containerRef.current) return;

        const newApp = new PIXI.Application();
        try {
          await newApp.init({
            resizeTo: containerRef.current,
            backgroundAlpha: 0,
            antialias: false,
            resolution: Math.min(1.5, window.devicePixelRatio || 1),
            autoDensity: true,
            powerPreference: "low-power",
          });

          if (isDisposed) {
            newApp.destroy(true, { children: true, texture: true });
            return;
          }

          app = newApp;
          containerRef.current.appendChild(app.canvas);
          setIsReady(true);

          const { width, height } = app.screen;
          const waveLayer = new PIXI.Container();
          app.stage.addChild(waveLayer);

          // 1. CREATE SIDE WAVES
          const createSideWave = (
            side: "top" | "right" | "bottom" | "left",
            segments: number = 40
          ): SideWave => {
            const points: WavePoint[] = [];
            const graphics = new PIXI.Graphics();
            waveLayer.addChild(graphics);

            for (let i = 0; i <= segments; i++) {
              const t = i / segments;
              const amplitude = 10 + Math.random() * 15;
              const speed = 0.5 + Math.random() * 0.7;
              const phase = Math.random() * Math.PI * 2;

              let baseX = 0,
                baseY = 0;

              switch (side) {
                case "top":
                  baseX = t * width;
                  baseY = 0;
                  break;
                case "right":
                  baseX = width;
                  baseY = t * height;
                  break;
                case "bottom":
                  baseX = width - t * width;
                  baseY = height;
                  break;
                case "left":
                  baseX = 0;
                  baseY = height - t * height;
                  break;
              }

              points.push({
                x: baseX,
                baseY: baseY,
                offset: 0,
                speed,
                amplitude,
                phase,
              });
            }

            return { points, graphics, side };
          };

          // Initialize all 4 sides
          sideWaves = [
            createSideWave("top", 30),
            createSideWave("right", 20),
            createSideWave("bottom", 30),
            createSideWave("left", 20),
          ];

          // 2. UNIFORM WATER SURFACE
          const waterContainer = new PIXI.Container();
          app.stage.addChild(waterContainer);

          const bg = new PIXI.Graphics();
          bg.rect(0, 0, width, height);
          bg.fill({ color: 0x1e40af, alpha: 0.12 });
          waterContainer.addChild(bg);

          // Create subtle noise for water surface
          const createNoiseTexture = (): PIXI.Texture => {
            const size = 64;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");

            if (ctx) {
              const imageData = ctx.createImageData(size, size);
              for (let i = 0; i < imageData.data.length; i += 4) {
                const val = Math.random() * 255;
                imageData.data[i] = val;
                imageData.data[i + 1] = val;
                imageData.data[i + 2] = val;
                imageData.data[i + 3] = 255;
              }
              ctx.putImageData(imageData, 0, 0);
            }

            return PIXI.Texture.from(canvas);
          };

          const noiseTexture = createNoiseTexture();
          const noiseSprite = new PIXI.TilingSprite({
            texture: noiseTexture,
            width,
            height,
          });
          noiseSprite.alpha = 0.04;
          waterContainer.addChild(noiseSprite);

          // 3. RAINDROP SYSTEM - OPTIMIZED
          const raindrops: RaindropData[] = [];

          const raindropLayer = new PIXI.Container();
          waterContainer.addChild(raindropLayer);

          const createRaindrop = (): RaindropData => {
            // Biarkan lebih banyak jatuh di tengah, bukan hanya di tepi
            const distribution = Math.random();
            let x, y;

            if (distribution < 0.7) {
              // 70% jatuh di area tengah (lebih natural)
              x = Math.random() * width;
              y = -10; // Mulai dari atas layar
            } else {
              // 30% jatuh di tepi (untuk variasi)
              const edge = Math.random();
              if (edge < 0.25) {
                // Top edge
                x = Math.random() * width;
                y = -5;
              } else if (edge < 0.5) {
                // Right edge
                x = width + 5;
                y = Math.random() * height;
              } else if (edge < 0.75) {
                // Bottom edge (dari bawah)
                x = Math.random() * width;
                y = height + 5;
              } else {
                // Left edge
                x = -5;
                y = Math.random() * height;
              }
            }

            const size = 2.5 + Math.random() * 2.5; // Ukuran lebih besar (2.5-5px)
            const g = new PIXI.Graphics();
            raindropLayer.addChild(g);

            // Gambar raindrop dengan bentuk lebih jelas
            // Bulat dengan sedikit ekor
            g.circle(0, 0, size);
            g.fill({ color: 0x93c5fd, alpha: 0.9 });

            // Tambahkan highlight kecil
            g.circle(-size * 0.3, -size * 0.3, size * 0.3);
            g.fill({ color: 0xffffff, alpha: 0.6 });

            g.x = x;
            g.y = y;

            const dropData: RaindropData = {
              graphics: g,
              x,
              y,
              speed: 0.8 + Math.random() * 1.2, // Lebih lambat
              life: 0,
              maxLife: 2 + Math.random() * 1.5, // Hidup lebih lama
              size,
              hasSpawnedRipple: false,
            };

            raindrops.push(dropData);

            // Cleanup jika terlalu banyak
            if (raindrops.length > 40) {
              // Kurangi limit
              const oldDrop = raindrops.shift();
              if (oldDrop) oldDrop.graphics.destroy();
            }

            return dropData;
          };

          // 4. RIPPLE SYSTEM (Raindrop + Click)
          const ripples: Array<{
            graphics: PIXI.Graphics;
            life: number;
            maxLife: number;
            isRaindrop?: boolean;
            x: number;
            y: number;
          }> = [];

          const rippleLayer = new PIXI.Container();
          app.stage.addChild(rippleLayer);

          const createRipple = (x: number, y: number, isRaindrop = false) => {
            const g = new PIXI.Graphics();
            rippleLayer.addChild(g);

            const ripple = {
              graphics: g,
              life: 0,
              maxLife: isRaindrop ? 0.8 : 1.4,
              isRaindrop,
              x,
              y,
            };

            ripples.push(ripple);
            g.x = x;
            g.y = y;

            return ripple;
          };

          // 5. BUBBLES (Performance Optimized)
          const bubbles: PIXI.Graphics[] = [];
          const bubbleLayer = new PIXI.Container();
          waterContainer.addChild(bubbleLayer);

          const createBubble = (x: number, y: number) => {
            const bubble = new PIXI.Graphics();
            const size = 1 + Math.random() * 3;
            bubble.circle(0, 0, size);
            bubble.fill({ color: 0x93c5fd, alpha: 0.2 + Math.random() * 0.2 });
            bubble.x = x;
            bubble.y = y;
            bubbleLayer.addChild(bubble);
            bubbles.push(bubble);

            // Remove if too many
            if (bubbles.length > 60) {
              const oldBubble = bubbles.shift();
              if (oldBubble) oldBubble.destroy();
            }
          };

          // 6. ANIMATION LOOP
          const updateWaves = (currentTime: number) => {
            if (!app || isDisposed) return;

            const deltaTime = lastTime
              ? (currentTime - lastTime) / 1000
              : 0.016;
            lastTime = currentTime;

            // Update noise position
            noiseSprite.tilePosition.x += 0.2 * deltaTime * 60;
            noiseSprite.tilePosition.y += 0.1 * deltaTime * 60;

            // RAINDROP SPAWN LOGIC
            rainTimerRef.current += deltaTime;
            const rainSpawnRate = 0.3 + (1 - rainFrequency) * 0.7; // Inverse frequency

            if (rainTimerRef.current > rainSpawnRate) {
              createRaindrop();
              rainTimerRef.current = 0;

              // Kadang spawn 2-3 sekaligus untuk efek gerimis
              if (Math.random() < 0.3) {
                setTimeout(() => {
                  if (!isDisposed) createRaindrop();
                }, 100);
              }
            }

            // UPDATE RAINDROPS
            // UPDATE RAINDROPS
            for (let i = raindrops.length - 1; i >= 0; i--) {
              const drop = raindrops[i];
              drop.life += deltaTime;

              // Animate falling dengan percepatan gravitasi
              const gravity = 0.1;
              drop.speed += gravity * deltaTime * 60; // Tambah kecepatan seiring waktu
              drop.y += drop.speed;

              // Tambahkan sedikit gerakan horizontal acak
              drop.x += Math.sin(drop.life * 3) * 0.3;

              drop.graphics.y = drop.y;
              drop.graphics.x = drop.x;

              // Fade out sebelum hilang
              const fadeStart = drop.maxLife * 0.7;
              if (drop.life > fadeStart) {
                const fadeProgress =
                  (drop.life - fadeStart) / (drop.maxLife - fadeStart);
                drop.graphics.alpha = 1 - fadeProgress;
              }

              // Jika raindrop mencapai water surface, buat ripple
              // Cek berdasarkan posisi Y atau life
              const shouldCreateRipple =
                (drop.y > height * 0.8 || drop.life >= drop.maxLife * 0.4) &&
                !drop.hasSpawnedRipple;

              if (shouldCreateRipple) {
                createRipple(drop.x, drop.y, true);
                drop.hasSpawnedRipple = true;

                // Tambahkan efek splash kecil
                createBubble(drop.x, drop.y - 5);
              }

              // Cleanup jika keluar layar atau habis lifetime
              const isOutOfBounds =
                drop.y > height + 50 ||
                drop.y < -50 ||
                drop.x < -50 ||
                drop.x > width + 50;

              if (drop.life >= drop.maxLife || isOutOfBounds) {
                drop.graphics.destroy();
                raindrops.splice(i, 1);
              }
            }

            // UPDATE SIDE WAVES
            sideWaves.forEach((sideWave) => {
              const { points, graphics, side } = sideWave;

              graphics.clear();

              // Draw wave with gradient
              graphics.moveTo(points[0].x, points[0].baseY + points[0].offset);

              for (let i = 1; i < points.length; i++) {
                const point = points[i];

                // Update wave offset dengan time-based animation
                point.offset =
                  Math.sin(currentTime * 0.001 * point.speed + point.phase) *
                  point.amplitude *
                  waveIntensity;

                // Adjust based on side
                let x = point.x;
                let y = point.baseY;

                if (side === "top" || side === "bottom") {
                  y += point.offset;
                } else {
                  x += point.offset;
                }

                graphics.lineTo(x, y);
              }

              // Complete the path back to start for fill
              if (points.length > 0) {
                const first = points[0];
                let firstX = first.x;
                let firstY = first.baseY;

                if (side === "top" || side === "bottom") {
                  firstY += first.offset;
                } else {
                  firstX += first.offset;
                }
                graphics.lineTo(firstX, firstY);
              }

              // Fill dengan gradient effect
              graphics.fill({
                color: 0x3b82f6,
                alpha: 0.07,
              });

              // Add wave line
              graphics.stroke({
                width: 1.2,
                color: 0x60a5fa,
                alpha: 0.15,
              });
            });

            // SPAWN BUBBLES NEAR WAVES
            if (Math.random() < 0.02) {
              const waveSide = Math.floor(Math.random() * 4);
              let x = 0,
                y = 0;

              switch (waveSide) {
                case 0: // top wave
                  x = Math.random() * width;
                  y = 8 + Math.sin(currentTime * 0.002 + x * 0.01) * 5;
                  break;
                case 1: // right wave
                  y = Math.random() * height;
                  x = width - 8 + Math.sin(currentTime * 0.002 + y * 0.01) * 5;
                  break;
                case 2: // bottom wave
                  x = Math.random() * width;
                  y = height - 8 + Math.sin(currentTime * 0.002 + x * 0.01) * 5;
                  break;
                case 3: // left wave
                  y = Math.random() * height;
                  x = 8 + Math.sin(currentTime * 0.002 + y * 0.01) * 5;
                  break;
              }

              createBubble(x, y);
            }

            // UPDATE BUBBLES
            bubbles.forEach((bubble, index) => {
              bubble.y -= 0.4;
              bubble.x += Math.sin(currentTime * 0.001 + index) * 0.1;
              bubble.alpha *= 0.99;

              if (bubble.alpha < 0.05) {
                bubble.destroy();
                bubbles.splice(index, 1);
              }
            });

            // HANDLE CLICK RIPPLE QUEUE
            while (rippleQueue.current.length > 0) {
              const r = rippleQueue.current.shift();
              if (r) {
                createRipple(r.x * width, r.y * height, false);
              }
            }

            // UPDATE RIPPLE ANIMATIONS
            for (let i = ripples.length - 1; i >= 0; i--) {
              const ripple = ripples[i];
              ripple.life += deltaTime;

              if (ripple.life >= ripple.maxLife) {
                ripple.graphics.destroy();
                ripples.splice(i, 1);
                continue;
              }

              const progress = ripple.life / ripple.maxLife;
              ripple.graphics.clear();

              // Draw ripple rings
              const ringCount = ripple.isRaindrop ? 2 : 3;

              for (let ring = 0; ring < ringCount; ring++) {
                const ringProgress = Math.max(0, progress - ring * 0.2);
                if (ringProgress <= 0) continue;

                const radius = ringProgress * (ripple.isRaindrop ? 20 : 100);
                const alpha =
                  (1 - ringProgress) * (ripple.isRaindrop ? 0.6 : 0.8);

                ripple.graphics.circle(0, 0, radius);
                ripple.graphics.stroke({
                  width: ripple.isRaindrop ? 1 : 1.5,
                  color: ripple.isRaindrop ? 0xbfdbfe : 0x93c5fd,
                  alpha: alpha,
                });
              }
            }

            waveUpdateId = requestAnimationFrame(updateWaves);
          };

          // Start animation
          waveUpdateId = requestAnimationFrame(updateWaves);

          // Handle resize
          const handleResize = () => {
            if (!app || !containerRef.current) return;

            const bounds = containerRef.current.getBoundingClientRect();
            app.renderer.resize(bounds.width, bounds.height);

            // Update wave points for new dimensions
            sideWaves.forEach((sideWave) => {
              const { width, height } = app!.screen;
              const segments = sideWave.points.length - 1;

              sideWave.points.forEach((point, i) => {
                const t = i / segments;

                switch (sideWave.side) {
                  case "top":
                    point.x = t * width;
                    point.baseY = 0;
                    break;
                  case "right":
                    point.x = width;
                    point.baseY = t * height;
                    break;
                  case "bottom":
                    point.x = width - t * width;
                    point.baseY = height;
                    break;
                  case "left":
                    point.x = 0;
                    point.baseY = height - t * height;
                    break;
                }
              });
            });

            // Update tiling sprite size
            if (noiseSprite) {
              noiseSprite.width = bounds.width;
              noiseSprite.height = bounds.height;
            }
          };

          window.addEventListener("resize", handleResize);

          // Cleanup function
          return () => {
            window.removeEventListener("resize", handleResize);
          };
        } catch (err) {
          console.error("PixiJS Water Error:", err);
        }
      };

      init();
      return () => {
        isDisposed = true;
        if (waveUpdateId) cancelAnimationFrame(waveUpdateId);
        if (app) {
          app.destroy(true, { children: true, texture: true });
          app = null;
        }
        setIsReady(false);
      };
    }, [waveIntensity, rainFrequency]);

    return (
      <div className="absolute inset-[-8px] pointer-events-none z-0 rounded-xl overflow-hidden">
        {/* CANVAS CONTAINER */}
        <div ref={containerRef} className="absolute inset-0" />

        {/* LOADING STATE */}
        {!isReady && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/10 animate-pulse" />
        )}

        {/* GLOW EFFECT */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />

        {/* BORDER HIGHLIGHTS */}
        <div className="absolute inset-0 border-2 border-blue-400/10 rounded-xl" />
        <div className="absolute inset-1 border border-white/5 rounded-lg" />

        {/* SUBTLE REFLECTION */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white/10 to-transparent opacity-30" />
      </div>
    );
  }
);

WaterEffect.displayName = "WaterEffect";
