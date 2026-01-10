import { useEffect, useRef, memo } from "react";
import * as PIXI from "pixi.js";

interface FullScreenEffectsProps {
  mechanicType: string; // 'lightning', 'fire', 'water', etc.
  activeElement?: string; // for 'random_elemental'
}

type EffectSystem = {
  update: (delta: number) => void;
  resize: (width: number, height: number) => void;
  destroy: () => void;
};

export const FullScreenEffects = memo(
  ({ mechanicType, activeElement }: FullScreenEffectsProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Determine the active effect key
    const effectKey =
      mechanicType === "random_elemental"
        ? activeElement || "none"
        : mechanicType;

    useEffect(() => {
      let app: PIXI.Application | null = null;
      let currentEffect: EffectSystem | null = null;
      let animationId: number | null = null;
      let isDisposed = false;
      let lastTime = 0;

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
          const localApp = newApp; // Local reference for closures
          containerRef.current.appendChild(localApp.canvas);

          const { width, height } = localApp.screen;
          const stage = localApp.stage;

          // --- EFFECT FACTORIES ---

          // 1. LIGHTNING
          const createLightningEffect = (): EffectSystem => {
            const container = new PIXI.Container();
            const flashGraph = new PIXI.Graphics();
            stage.addChild(container);
            stage.addChild(flashGraph);

            let flashAlpha = 0;
            let activeBolts: {
              graphics: PIXI.Graphics;
              life: number;
              maxLife: number;
            }[] = [];
            let timer = 0;
            let nextStorm = 1 + Math.random() * 3;

            return {
              update: (delta) => {
                if (isDisposed) return;

                timer += delta;
                if (timer > nextStorm) {
                  timer = 0;
                  nextStorm = 3 + Math.random() * 7;
                  if (Math.random() > 0.4) {
                    const bx = Math.random() * localApp.screen.width;
                    const bScale = 0.5 + Math.random() * 1.5;
                    const g = new PIXI.Graphics();
                    const segments = 12;
                    let cx = bx;
                    let cy = 0;
                    const segH = localApp.screen.height / segments;
                    const path = [{ x: cx, y: 0 }];
                    for (let i = 0; i < segments; i++) {
                      cy += segH + (Math.random() - 0.5) * 20;
                      cx += (Math.random() - 0.5) * 80;
                      path.push({ x: cx, y: cy });
                    }
                    g.moveTo(path[0].x, path[0].y);
                    path.forEach((p) => g.lineTo(p.x, p.y));
                    g.stroke({
                      width: 8 * bScale,
                      color: 0x60a5fa,
                      alpha: 0.5,
                      cap: "round",
                      join: "round",
                    });
                    g.moveTo(path[0].x, path[0].y);
                    path.forEach((p) => g.lineTo(p.x, p.y));
                    g.stroke({
                      width: 3 * bScale,
                      color: 0xffffff,
                      alpha: 1,
                      cap: "round",
                      join: "round",
                    });

                    container.addChild(g);
                    activeBolts.push({ graphics: g, life: 0.3, maxLife: 0.3 });
                  }
                  flashAlpha = 0.6 + Math.random() * 0.4;
                }

                if (flashAlpha > 0) {
                  flashAlpha -= delta * 3;
                  if (flashAlpha < 0) flashAlpha = 0;
                  if (!flashGraph.destroyed) {
                    flashGraph.clear();
                    flashGraph
                      .rect(0, 0, localApp.screen.width, localApp.screen.height)
                      .fill({ color: 0xffffff, alpha: flashAlpha * 0.3 });
                  }
                } else {
                  if (!flashGraph.destroyed) {
                    flashGraph.clear();
                  }
                }

                for (let i = activeBolts.length - 1; i >= 0; i--) {
                  const b = activeBolts[i];
                  b.life -= delta;
                  b.graphics.alpha = b.life > 0.15 ? 1 : Math.random();
                  if (b.life <= 0) {
                    b.graphics.destroy();
                    activeBolts.splice(i, 1);
                  }
                }
              },
              resize: () => {},
              destroy: () => {
                if (!container.destroyed) container.destroy({ children: true });
                if (!flashGraph.destroyed) flashGraph.destroy();
              },
            };
          };

          // 2. FIRE
          const createFireEffect = (): EffectSystem => {
            const container = new PIXI.Container();
            stage.addChild(container);

            interface Ember {
              g: PIXI.Graphics;
              x: number;
              y: number;
              vy: number;
              life: number;
              maxLife: number;
              sway: number;
              baseScale: number;
            }
            const embers: Ember[] = [];

            const bottomGradTex = (() => {
              const c = document.createElement("canvas");
              c.width = 1;
              c.height = 256;
              const ctx = c.getContext("2d");
              if (ctx) {
                const g = ctx.createLinearGradient(0, 0, 0, 256);
                g.addColorStop(0, "rgba(0,0,0,0)");
                g.addColorStop(1, "rgba(255, 69, 0, 0.4)");
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, 1, 256);
              }
              return PIXI.Texture.from(c);
            })();
            const bottomGlow = new PIXI.Sprite(bottomGradTex);
            bottomGlow.width = width;
            bottomGlow.height = 300;
            bottomGlow.y = height - 300;
            bottomGlow.blendMode = "add";
            container.addChild(bottomGlow);

            return {
              update: (delta) => {
                if (isDisposed) return;
                const t = Date.now() * 0.001;
                bottomGlow.alpha = 0.6 + Math.sin(t * 2) * 0.2;

                if (Math.random() < 0.4) {
                  const g = new PIXI.Graphics();
                  g.circle(0, 0, 4).fill({ color: 0xffaa00, alpha: 0.8 });
                  g.blendMode = "add";

                  g.x = Math.random() * localApp.screen.width;
                  g.y = localApp.screen.height + 10;
                  const scale = 0.5 + Math.random();
                  g.scale.set(scale);

                  container.addChild(g);
                  embers.push({
                    g,
                    x: g.x,
                    y: g.y,
                    vy: 50 + Math.random() * 80,
                    life: 0,
                    maxLife: 3 + Math.random() * 2,
                    sway: Math.random() * 10,
                    baseScale: scale,
                  });
                }

                for (let i = embers.length - 1; i >= 0; i--) {
                  const e = embers[i];
                  e.life += delta;
                  if (e.life > e.maxLife) {
                    e.g.destroy();
                    embers.splice(i, 1);
                    continue;
                  }

                  e.y -= e.vy * delta;
                  const swayOffset =
                    Math.sin(t * 2 + e.sway) * 20 * (e.life / e.maxLife);
                  e.g.x = e.x + swayOffset;
                  e.g.y = e.y;

                  const p = e.life / e.maxLife;
                  e.g.alpha = 1 - p;
                  e.g.scale.set(e.baseScale * (1 - p * 0.5));
                }
              },
              resize: (w, h) => {
                if (!bottomGlow.destroyed) {
                  bottomGlow.width = w;
                  bottomGlow.y = h - 300;
                }
              },
              destroy: () => {
                if (!container.destroyed) container.destroy({ children: true });
              },
            };
          };

          // 3. WATER
          const createWaterEffect = (): EffectSystem => {
            const container = new PIXI.Container();
            stage.addChild(container);

            const overlay = new PIXI.Graphics();
            overlay
              .rect(0, 0, width, height)
              .fill({ color: 0x001133, alpha: 0.2 });
            container.addChild(overlay);

            interface Bubble {
              g: PIXI.Graphics;
              x: number;
              y: number;
              vy: number;
              amp: number;
            }
            const bubbles: Bubble[] = [];

            for (let i = 0; i < 30; i++) {
              const g = new PIXI.Graphics();
              g.circle(0, 0, 2 + Math.random() * 4).stroke({
                width: 1,
                color: 0x88ccff,
                alpha: 0.5,
              });
              g.x = Math.random() * width;
              g.y = Math.random() * height;
              container.addChild(g);
              bubbles.push({
                g,
                x: g.x,
                y: g.y,
                vy: 20 + Math.random() * 30,
                amp: Math.random() * 20,
              });
            }

            return {
              update: (delta) => {
                if (isDisposed) return;
                const t = Date.now() * 0.001;
                bubbles.forEach((b) => {
                  b.y -= b.vy * delta;
                  if (b.y < -10) {
                    b.y = localApp.screen.height + 10;
                    b.x = Math.random() * localApp.screen.width;
                  }
                  b.g.y = b.y;
                  b.g.x = b.x + Math.sin(t + b.amp) * 10;
                });
              },
              resize: (w, h) => {
                if (!overlay.destroyed) {
                  overlay.clear();
                  overlay.rect(0, 0, w, h).fill({ color: 0x001133, alpha: 0.2 });
                }
              },
              destroy: () => {
                if (!container.destroyed) container.destroy({ children: true });
              },
            };
          };

          // 4. EARTH
          const createEarthEffect = (): EffectSystem => {
            const container = new PIXI.Container();
            stage.addChild(container);

            const dusts: {
              g: PIXI.Graphics;
              x: number;
              y: number;
              vx: number;
            }[] = [];
            for (let i = 0; i < 50; i++) {
              const g = new PIXI.Graphics();
              g.circle(0, 0, 1 + Math.random()).fill({
                color: 0xc2b280,
                alpha: 0.6,
              });
              g.x = Math.random() * width;
              g.y = Math.random() * height;
              container.addChild(g);
              dusts.push({ g, x: g.x, y: g.y, vx: 10 + Math.random() * 20 });
            }

            let shakeTime = 0;

            return {
              update: (delta) => {
                if (isDisposed) return;
                dusts.forEach((d) => {
                  d.x += d.vx * delta;
                  if (d.x > localApp.screen.width) d.x = 0;
                  d.g.x = d.x;
                });

                if (Math.random() < 0.005) shakeTime = 0.5;
                if (shakeTime > 0) {
                  shakeTime -= delta;
                  stage.position.x = (Math.random() - 0.5) * 5;
                  stage.position.y = (Math.random() - 0.5) * 5;
                } else {
                  stage.position.set(0, 0);
                }
              },
              resize: () => {},
              destroy: () => {
                if (!stage.destroyed) stage.position.set(0, 0);
                if (!container.destroyed) container.destroy({ children: true });
              },
            };
          };

          // 5. WIND
          const createWindEffect = (): EffectSystem => {
            const container = new PIXI.Container();
            stage.addChild(container);

            const lines: {
              g: PIXI.Graphics;
              x: number;
              y: number;
              speed: number;
            }[] = [];
            const createLine = () => {
              const g = new PIXI.Graphics();
              g.rect(0, 0, 20 + Math.random() * 50, 1).fill({
                color: 0xffffff,
                alpha: 0.3,
              });
              g.x = Math.random() * width;
              g.y = Math.random() * height;
              container.addChild(g);
              return { g, x: g.x, y: g.y, speed: 500 + Math.random() * 500 };
            };

            for (let i = 0; i < 20; i++) lines.push(createLine());

            return {
              update: (delta) => {
                if (isDisposed) return;
                lines.forEach((l) => {
                  l.x += l.speed * delta;
                  if (l.x > localApp.screen.width) {
                    l.x = -100;
                    l.y = Math.random() * localApp.screen.height;
                  }
                  l.g.x = l.x;
                  l.g.y = l.y;
                });
              },
              resize: () => {},
              destroy: () => {
                if (!container.destroyed) container.destroy({ children: true });
              },
            };
          };

          // 6. POISON
          const createPoisonEffect = (): EffectSystem => {
            const container = new PIXI.Container();
            stage.addChild(container);

            const spores: {
              g: PIXI.Graphics;
              x: number;
              y: number;
              vx: number;
              vy: number;
            }[] = [];
            for (let i = 0; i < 60; i++) {
              const g = new PIXI.Graphics();
              g.circle(0, 0, 2).fill({ color: 0x88ff88, alpha: 0.4 });
              g.x = Math.random() * width;
              g.y = Math.random() * height;
              container.addChild(g);
              spores.push({
                g,
                x: g.x,
                y: g.y,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
              });
            }

            const vig = new PIXI.Graphics();
            container.addChild(vig);

            return {
              update: (delta) => {
                if (isDisposed) return;
                spores.forEach((s) => {
                  s.x += s.vx * delta;
                  s.y += s.vy * delta;
                  if (s.x < 0) s.x = localApp.screen.width;
                  if (s.x > localApp.screen.width) s.x = 0;
                  if (s.y < 0) s.y = localApp.screen.height;
                  if (s.y > localApp.screen.height) s.y = 0;
                  s.g.x = s.x;
                  s.g.y = s.y;
                });

                const t = Date.now() * 0.001;
                const alpha = 0.2 + Math.sin(t) * 0.1;
                if (!vig.destroyed) {
                  vig.clear();
                  vig
                    .rect(0, 0, localApp.screen.width, localApp.screen.height)
                    .fill({ color: 0x004400, alpha: alpha * 0.3 });
                }
              },
              resize: () => {},
              destroy: () => {
                if (!container.destroyed) container.destroy({ children: true });
              },
            };
          };

          // 7. JOKER
          const createJokerEffect = (): EffectSystem => {
            const container = new PIXI.Container();
            stage.addChild(container);

            const confetti: {
              g: PIXI.Graphics;
              x: number;
              y: number;
              vy: number;
              vr: number;
            }[] = [];
            const colors = [0xff00ff, 0x00ff00, 0xffff00, 0x00ffff];

            for (let i = 0; i < 40; i++) {
              const g = new PIXI.Graphics();
              g.position.set(Math.random() * width, Math.random() * height);
              g.rect(-5, -5, 10, 10).fill({
                color: colors[Math.floor(Math.random() * colors.length)],
              });
              container.addChild(g);
              confetti.push({
                g,
                x: g.x,
                y: g.y,
                vy: 100 + Math.random() * 100,
                vr: (Math.random() - 0.5) * 5,
              });
            }

            return {
              update: (delta) => {
                if (isDisposed) return;
                confetti.forEach((c) => {
                  c.y += c.vy * delta;
                  c.g.rotation += c.vr * delta;
                  if (c.y > localApp.screen.height) {
                    c.y = -10;
                    c.x = Math.random() * localApp.screen.width;
                  }
                  c.g.y = c.y;
                  c.g.x = c.x;
                });

                if (Math.random() < 0.01) {
                  stage.position.x = (Math.random() - 0.5) * 20;
                  container.alpha = 0.5;
                } else {
                  stage.position.x = 0;
                  container.alpha = 1;
                }
              },
              resize: () => {},
              destroy: () => {
                if (!stage.destroyed) stage.position.x = 0;
                if (!container.destroyed) container.destroy({ children: true });
              },
            };
          };

          // 8. FOGGY
          const createFoggyEffect = (): EffectSystem => {
            const container = new PIXI.Container();
            stage.addChild(container);

            const createMistTexture = () => {
              const size = 256;
              const canvas = document.createElement("canvas");
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                const g = ctx.createRadialGradient(
                  size / 2,
                  size / 2,
                  0,
                  size / 2,
                  size / 2,
                  size / 2
                );
                g.addColorStop(0, "rgba(255,255,255,0.2)");
                g.addColorStop(1, "rgba(255,255,255,0)");
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, size, size);
              }
              return PIXI.Texture.from(canvas);
            };

            const mistTex = createMistTexture();
            const mists: { s: PIXI.Sprite; vx: number }[] = [];

            for (let i = 0; i < 20; i++) {
              const s = new PIXI.Sprite(mistTex);
              s.anchor.set(0.5);
              s.scale.set(2 + Math.random() * 3);
              s.x = Math.random() * width;
              s.y = Math.random() * height;
              s.alpha = 0.3;
              container.addChild(s);
              mists.push({ s, vx: 10 + Math.random() * 20 });
            }

            const grain = new PIXI.Graphics();
            for (let i = 0; i < 500; i++) {
              grain
                .rect(Math.random() * width, Math.random() * height, 2, 2)
                .fill({ color: 0xffffff, alpha: 0.1 });
            }
            container.addChild(grain);

            return {
              update: (delta) => {
                if (isDisposed) return;
                mists.forEach((m) => {
                  m.s.x -= m.vx * delta;
                  if (m.s.x < -200) m.s.x = localApp.screen.width + 200;
                });

                grain.position.set(
                  (Math.random() - 0.5) * 5,
                  (Math.random() - 0.5) * 5
                );
              },
              resize: () => {},
              destroy: () => {
                if (!container.destroyed) container.destroy({ children: true });
              },
            };
          };

          // --- SWITCHER ---
          const switchEffect = (key: string) => {
            if (currentEffect) {
              currentEffect.destroy();
              currentEffect = null;
            }

            switch (key) {
              case "lightning":
                currentEffect = createLightningEffect();
                break;
              case "fire":
                currentEffect = createFireEffect();
                break;
              case "water":
                currentEffect = createWaterEffect();
                break;
              case "earth":
                currentEffect = createEarthEffect();
                break;
              case "wind":
                currentEffect = createWindEffect();
                break;
              case "poison":
                currentEffect = createPoisonEffect();
                break;
              case "joker":
                currentEffect = createJokerEffect();
                break;
              case "foggy":
                currentEffect = createFoggyEffect();
                break;
              default:
                break;
            }
          };

          switchEffect(effectKey);

          // Animation Loop
          const animate = (time: number) => {
            if (isDisposed || !app || !app.renderer) return;
            try {
              const delta = lastTime ? (time - lastTime) / 1000 : 0.016;
              lastTime = time;

              if (currentEffect) currentEffect.update(delta);

              animationId = requestAnimationFrame(animate);
            } catch (err) {
              console.error("FullScreenEffects Animation Error:", err);
            }
          };
          animationId = requestAnimationFrame(animate);

          const handleResize = () => {
            if (!app || !app.renderer || isDisposed) return;
            app.renderer.resize(window.innerWidth, window.innerHeight);
            if (currentEffect)
              currentEffect.resize(window.innerWidth, window.innerHeight);
          };
          window.addEventListener("resize", handleResize);
        } catch (err) {
          console.error("FullScreenEffects Pixi Error:", err);
        }
      };

      init();

      return () => {
        isDisposed = true;
        if (animationId) cancelAnimationFrame(animationId);
        if (currentEffect) {
          try {
            currentEffect.destroy();
          } catch (e) {}
          currentEffect = null;
        }
        if (app) {
          try {
            app.destroy(true, { children: true, texture: true });
          } catch (e) {}
          app = null;
        }
      };
    }, [effectKey]); // Re-run when effectKey changes

    // Determine z-index based on effect type
    // Lightning needs to be on top (z-[100]), others should be background (z-[5])
    // The Board/Hand is z-10.
    const isForeground =
      mechanicType === "random_elemental" && activeElement === "lightning";
    const zIndexClass = isForeground ? "z-[100]" : "z-[5]";

    return (
      <div
        ref={containerRef}
        className={`fixed inset-0 ${zIndexClass} pointer-events-none overflow-hidden`}
      />
    );
  }
);

FullScreenEffects.displayName = "FullScreenEffects";
