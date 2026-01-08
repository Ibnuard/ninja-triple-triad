import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const FullScreenLightning = memo(() => {
  const [bolt, setBolt] = useState<{
    id: number;
    path: string;
    x: number;
    scale: number;
    brightness: number;
  } | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const triggerStorm = () => {
      // Occasional: 4 to 10 seconds between "storm events"
      const delay = 3000 + Math.random() * 7000;

      timeoutId = setTimeout(() => {
        const id = Date.now();

        // Sometimes just a flash, sometimes a bolt + flash
        const hasBolt = Math.random() > 0.4;

        if (hasBolt) {
          // Generate a random jagged path for a full-height bolt
          const x = Math.random() * 100;
          const scale = 0.5 + Math.random() * 1.5;
          const brightness = 0.8 + Math.random() * 0.2;

          let path = "M 0 0 ";
          let currentY = 0;
          let currentX = 0;
          const segments = 8;
          for (let i = 0; i < segments; i++) {
            currentY += 100 / segments + (Math.random() - 0.5) * 5;
            currentX += (Math.random() - 0.5) * 40;
            path += `L ${currentX} ${currentY} `;
          }
          setBolt({ id, path, x, scale, brightness });
        }

        // Trigger screen flash
        setFlash(true);

        // Quick flicker effect for the flash
        setTimeout(() => setFlash(false), 50);
        setTimeout(() => {
          if (Math.random() > 0.5) setFlash(true);
          setTimeout(() => setFlash(false), 40);
        }, 100);

        // Clear bolt after animation
        setTimeout(() => setBolt(null), 300);

        triggerStorm();
      }, delay);
    };

    triggerStorm();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* SCREEN FLASH */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0.1, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white"
          />
        )}
      </AnimatePresence>

      {/* LIGHTNING BOLT */}
      <AnimatePresence>
        {bolt && (
          <motion.div
            key={bolt.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 h-full flex justify-center"
            style={{ left: `${bolt.x}%` }}
          >
            <svg
              width="300"
              height="100%"
              viewBox="-150 0 300 100"
              preserveAspectRatio="none"
              className="overflow-visible h-full"
            >
              <filter id="bolt-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Outer Glow (Blueish) */}
              <path
                d={bolt.path}
                fill="none"
                stroke="#60a5fa"
                strokeWidth={4 * bolt.scale}
                strokeLinecap="round"
                opacity="0.5"
                filter="url(#bolt-glow)"
              />
              {/* Core Bolt (White) */}
              <path
                d={bolt.path}
                fill="none"
                stroke="#fff"
                strokeWidth={1.5 * bolt.scale}
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FullScreenLightning.displayName = "FullScreenLightning";
