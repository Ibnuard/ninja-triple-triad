"use client";

import { useEffect, useState, useRef } from "react";

export const FPSCounter = () => {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const tick = () => {
      frameCount.current++;
      const now = performance.now();
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastTime.current = now;
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="fixed bottom-2 left-2 z-[9999] px-2 py-1 bg-black/80 border border-white/20 rounded text-[10px] font-mono text-green-400 pointer-events-none">
      FPS: {fps}
    </div>
  );
};
