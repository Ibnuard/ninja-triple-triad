"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../store/useSettingsStore";

interface BossIntroAnimationProps {
  bossKey: string;
  bossImage: string;
  onComplete: () => void;
}

export function BossIntroAnimation({
  bossKey,
  bossImage,
  onComplete,
}: BossIntroAnimationProps) {
  const [show, setShow] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = useTranslation().game.gauntlet;

  const bossName = t.bosses[bossKey as keyof typeof t.bosses] || bossKey;

  useEffect(() => {
    // Play boss encounter sound
    const audio = new Audio("/sounds/boss-encounter.mp3");
    audio.volume = 0.7;
    audioRef.current = audio;
    audio.play().catch((err) => console.log("Audio play failed:", err));

    const timer = setTimeout(() => setShow(false), 2500);
    const completeTimer = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Cinematic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95"
          />

          {/* Dynamic Slash Background (Matching BoardIntro style) */}
          <motion.div
            initial={{ x: "150%", skewX: -15 }}
            animate={{ x: "-50%", skewX: -15 }}
            exit={{ x: "-250%", skewX: -15 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="absolute inset-y-0 w-[400%] left-0 bg-gradient-to-r from-red-900 via-red-950 to-black border-y-4 border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.5)]"
          />

          {/* Content Container */}
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center gap-6"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 100,
              delay: 0.1,
            }}
          >
             {/* Circular Avatar (Integrated into slash) */}
             <div className="relative">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"],
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-red-500 bg-black/80 shadow-[0_0_30px_rgba(220,38,38,0.6)] overflow-hidden"
                >
                    <motion.img 
                        src={bossImage}
                        alt={bossName}
                        className="w-full h-full object-cover grayscale contrast-125 brightness-90"
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 3 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 to-transparent" />
                </motion.div>
                
                {/* Particle Ring */}
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-red-500" />
             </div>

             {/* Text Overlay */}
             <div className="flex flex-col items-center text-center px-4">
                <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-red-500 font-black text-xs md:text-sm tracking-[0.5em] uppercase italic mb-2"
                >
                    {t.bossChallenge}
                </motion.span>
                <motion.h1
                    className="text-4xl md:text-7xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-tighter leading-none"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                >
                    {bossName}
                </motion.h1>
             </div>
          </motion.div>

          {/* Scanning Line Effect */}
          <motion.div 
            animate={{ y: ["0%", "100%", "0%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-[1px] bg-red-500/20 z-30"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
