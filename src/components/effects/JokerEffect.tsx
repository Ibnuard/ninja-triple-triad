import { useEffect, useRef, memo, useState } from "react";
import * as PIXI from "pixi.js";

interface JokerEffectProps {
  lastMove: { row: number; col: number; playerId: string } | null;
}

interface Confetti {
  graphics: PIXI.Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  color: number;
}

export const JokerEffect = memo(({ lastMove }: JokerEffectProps) => {
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

        const colors = {
          purple: 0x9333ea, // Purple 600
          green: 0x39ff14, // Neon Green
          pink: 0xdb2777, // Pink 600
          darkBase: 0x2e1065, // Purple 950
        };

        // --- 1. PSYCHEDELIC TEXTURE ---
        const bgLayer = new PIXI.Container();
        stage.addChild(bgLayer);

        // Create a twisted checkerboard texture
        const createPsychedelicTexture = () => {
          const size = 512;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) return PIXI.Texture.WHITE;

          // Fill bg
          ctx.fillStyle = "#2e1065";
          ctx.fillRect(0, 0, size, size);

          // Draw squares
          const count = 8;
          const step = size / count;
          for (let y = 0; y < count; y++) {
            for (let x = 0; x < count; x++) {
              if ((x + y) % 2 === 0) {
                ctx.fillStyle = "#4c1d95"; // Lighter purple
                ctx.fillRect(x * step, y * step, step, step);
              }
            }
          }

          // Add spiral overlay
          ctx.strokeStyle = "rgba(219, 39, 119, 0.2)"; // Pinkish
          ctx.lineWidth = 20;
          ctx.beginPath();
          const cx = size / 2;
          const cy = size / 2;
          for (let i = 0; i < 100; i++) {
            const angle = 0.1 * i;
            const r = 5 * angle;
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
          }
          ctx.stroke();

          return PIXI.Texture.from(canvas);
        };

        const bgSprite = new PIXI.TilingSprite({
          texture: createPsychedelicTexture(),
          width: width * 1.5, // oversize for rotation
          height: height * 1.5,
        });
        bgSprite.anchor.set(0.5);
        bgSprite.x = width / 2;
        bgSprite.y = height / 2;
        bgSprite.alpha = 0.4;
        bgLayer.addChild(bgSprite);

        // --- 2. CHAOTIC GRID (Glitch Lines) ---
        const gridLayer = new PIXI.Container();
        stage.addChild(gridLayer);
        const gridG = new PIXI.Graphics();
        gridLayer.addChild(gridG);

        // --- 3. FLOATING SUITS & MOTES ---
        const particleContainer = new PIXI.Container();
        stage.addChild(particleContainer);

        const suits = ["♠", "♣", "♥", "♦", "?"];
        const floatingItems: {
          text: PIXI.Text;
          x: number;
          y: number;
          vx: number;
          vy: number;
          rotationSpeed: number;
          phase: number;
        }[] = [];

        for (let i = 0; i < 20; i++) {
          const char = suits[Math.floor(Math.random() * suits.length)];
          const t = new PIXI.Text({
            text: char,
            style: {
              fontFamily: "Arial",
              fontSize: 24 + Math.random() * 24,
              fill:
                Math.random() > 0.5
                  ? colors.green
                  : Math.random() > 0.5
                  ? colors.pink
                  : 0xffffff,
              fontWeight: "bold",
              dropShadow: {
                color: "#000000",
                blur: 2,
                distance: 2,
                angle: Math.PI / 6,
                alpha: 0.5,
              },
            },
          });
          t.anchor.set(0.5);
          t.x = Math.random() * width;
          t.y = Math.random() * height;
          particleContainer.addChild(t);

          floatingItems.push({
            text: t,
            x: t.x,
            y: t.y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            phase: Math.random() * 10,
          });
        }

        // --- 4. BORDER RINGS ---
        const borderLayer = new PIXI.Container();
        stage.addChild(borderLayer);
        const borderG = new PIXI.Graphics();
        borderLayer.addChild(borderG);

        // --- 5. IMPACT CONFETTI ---
        const impactContainer = new PIXI.Container();
        stage.addChild(impactContainer);
        const confettiList: Confetti[] = [];

        const triggerImpact = (x: number, y: number) => {
          const count = 30;
          for (let i = 0; i < count; i++) {
            const g = new PIXI.Graphics();
            const color =
              Math.random() > 0.66
                ? colors.green
                : Math.random() > 0.33
                ? colors.pink
                : colors.purple;
            g.rect(-4, -4, 8, 8).fill({ color });

            // Random initial pos
            g.x = x;
            g.y = y;
            g.rotation = Math.random() * Math.PI * 2;
            impactContainer.addChild(g);

            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 150;

            confettiList.push({
              graphics: g,
              x: x,
              y: y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              rotationSpeed: (Math.random() - 0.5) * 0.5,
              life: 0,
              maxLife: 1.5,
              color,
            });
          }
        };

        // --- ANIMATION LOOP ---
        const animate = (time: number) => {
          if (isDisposed || !app) return;
          const delta = lastTime ? (time - lastTime) / 1000 : 0.016;
          lastTime = time;

          const t = time * 0.001;

          // 1. Background Spin & Zoom
          if (bgSprite && !bgSprite.destroyed) {
            bgSprite.rotation += 0.005;
            const scaleOsc = 1.5 + Math.sin(t * 0.5) * 0.2;
            bgSprite.scale.set(scaleOsc);
          }

          // 2. Glitch Grid
          gridG?.clear();
          // Draw random glitch lines
          const glitchChance = Math.sin(t * 5) > 0.5; // Pulsing chaos
          gridG.stroke({
            width: 2 + (glitchChance ? Math.random() * 2 : 0),
            color: colors.green,
            alpha: 0.3,
          });

          for (let i = 1; i < 3; i++) {
            const offset = glitchChance ? (Math.random() - 0.5) * 10 : 0;
            // Vert
            gridG
              .moveTo((i / 3) * width + offset, 0)
              .lineTo((i / 3) * width - offset, height);
            // Horiz
            gridG
              .moveTo(0, (i / 3) * height + offset)
              .lineTo(width, (i / 3) * height - offset);
          }
          // Diagonals for extra "circus" feel
          gridG
            .moveTo(0, 0)
            .lineTo(width, height)
            .stroke({ width: 1, color: colors.pink, alpha: 0.2 });
          gridG
            .moveTo(width, 0)
            .lineTo(0, height)
            .stroke({ width: 1, color: colors.pink, alpha: 0.2 });

          // 3. Floating Suits
          floatingItems.forEach((item) => {
            item.x += item.vx + Math.sin(t + item.phase) * 0.5;
            item.y += item.vy + Math.cos(t + item.phase) * 0.5;
            item.text.rotation += item.rotationSpeed;

            // Bounce off walls
            if (item.x < 0 || item.x > width) item.vx *= -1;
            if (item.y < 0 || item.y > height) item.vy *= -1;

            // Keep in bounds loosely
            if (item.x < -20) item.x = width + 20;
            if (item.x > width + 20) item.x = -20;
            if (item.y < -20) item.y = height + 20;
            if (item.y > height + 20) item.y = -20;

            item.text.x = item.x;
            item.text.y = item.y;

            // Pulse scale
            const s = 1 + Math.sin(t * 5 + item.phase) * 0.2;
            item.text.scale.set(s);
          });

          // 4. Border
          borderG?.clear();
          // const hue = (time * 0.1) % 360;
          // Rainbow border rect
          borderG
            .rect(0, 0, width, height)
            .stroke({ width: 6, color: 0xffffff, alpha: 0.5 }); // base
          const borderCol = [colors.purple, colors.pink, colors.green][
            Math.floor((time / 500) % 3)
          ];
          borderG
            .rect(0, 0, width, height)
            .stroke({ width: 4, color: borderCol, alpha: 0.8 });

          // 5. Confetti Impact
          for (let i = confettiList.length - 1; i >= 0; i--) {
            const c = confettiList[i];
            c.life += delta;
            if (c.life > c.maxLife) {
              c.graphics.destroy();
              confettiList.splice(i, 1);
              continue;
            }

            c.x += c.vx * delta;
            c.y += c.vy * delta;
            c.vy += 200 * delta; // Gravity
            c.graphics.rotation += c.rotationSpeed;

            c.graphics.x = c.x;
            c.graphics.y = c.y;
            c.graphics.alpha = 1 - c.life / c.maxLife;
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
            if (bgSprite && !bgSprite.destroyed) {
              bgSprite.width = b.width * 1.5;
              bgSprite.height = b.height * 1.5;
              bgSprite.x = b.width / 2;
              bgSprite.y = b.height / 2;
            }
          }
        };
        window.addEventListener("resize", handleResize);
      } catch (err) {
        console.error("Joker Effect Error:", err);
      }
    };

    init();
    return () => {
      isDisposed = true;
      if (handleResize) {
        window.removeEventListener("resize", handleResize);
      }
      if (animationId) cancelAnimationFrame(animationId);
      if (app && app.renderer) {
        try {
          app.destroy(true, { children: true, texture: true });
        } catch (e) {
          console.warn(e);
        }
      }
      app = null;
      setIsReady(false);
    };
  }, []);

  return (
    <div className="absolute inset-[-14px] pointer-events-none z-0 rounded-2xl overflow-hidden border-[3px] border-purple-500/30 shadow-[0_0_40px_rgba(219,39,119,0.3)]">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Overlay gradient for extra mood */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent mix-blend-overlay" />

      {!isReady && (
        <div className="absolute inset-0 bg-purple-950 animate-pulse" />
      )}
    </div>
  );
});

JokerEffect.displayName = "JokerEffect";
