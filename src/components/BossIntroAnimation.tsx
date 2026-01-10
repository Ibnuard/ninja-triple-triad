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

    const timer = setTimeout(() => setShow(false), 3000);
    const completeTimer = setTimeout(() => onComplete(), 3500);

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
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          />

          {/* Red Flash / Glitch Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0.1, 0.3, 0.1] }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-900/20 mix-blend-overlay"
          />

          {/* Boss Intro Container */}
          <div className="relative flex flex-col items-center justify-center">
             {/* Circular Avatar */}
             <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 100 }}
                className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] overflow-hidden mb-6"
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

             {/* Text Overlay */}
             <div className="relative z-20 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="flex flex-col items-center"
                >
                    <span className="text-red-600 font-black text-xs md:text-sm tracking-[0.4em] uppercase italic drop-shadow-[0_0_8px_rgba(220,38,38,0.6)] mb-1">
                        {t.bossChallenge}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                        {bossName}
                    </h1>
                </motion.div>

                {/* Decorative Slashes (Smaller) */}
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "150%" }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="absolute h-[1px] bg-red-600/50 rotate-[-10deg] shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                />
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "150%" }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="absolute h-[1px] bg-red-600/50 rotate-[10deg] shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                />
             </div>
          </div>

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
