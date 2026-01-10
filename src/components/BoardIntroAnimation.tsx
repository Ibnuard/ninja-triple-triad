"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoardMechanicType, ElementType } from "../types/game";
import {
  Flame,
  Droplet,
  Mountain,
  Wind,
  Zap,
  Skull,
  Cloud,
  Smile,
  Swords,
} from "lucide-react";
import { useTranslation } from "../store/useSettingsStore";
import { SOUND_PATHS } from "../constants/assets";

interface BoardIntroAnimationProps {
  mechanicType: BoardMechanicType;
  activeElement?: ElementType;
  onComplete: () => void;
}

const ELEMENTAL_SOUNDS: Record<string, string> = {
  fire: SOUND_PATHS.FIRE,
  water: SOUND_PATHS.WATER,
  earth: SOUND_PATHS.EARTH,
  wind: SOUND_PATHS.WIND,
  lightning: SOUND_PATHS.LIGHTNING,
};

const BOARD_CONFIG = {
  none: {
    icon: Swords,
    color: "from-slate-800 via-gray-900 to-black",
    borderColor: "border-gray-500",
    shadow: "shadow-gray-500/50",
    sound: null,
  },
  random_elemental: {
    icon: Zap,
    color: "from-indigo-900 via-purple-900 to-black",
    borderColor: "border-purple-500",
    shadow: "shadow-purple-500/50",
    sound: null, // Dynamic
  },
  poison: {
    icon: Skull,
    color: "from-green-900 via-emerald-950 to-black",
    borderColor: "border-green-500",
    shadow: "shadow-green-500/50",
    sound: SOUND_PATHS.POISON_BOARD,
  },
  foggy: {
    icon: Cloud,
    color: "from-gray-800 via-slate-900 to-black",
    borderColor: "border-gray-400",
    shadow: "shadow-gray-400/50",
    sound: SOUND_PATHS.FOGGY_BOARD,
  },
  joker: {
    icon: Smile,
    color: "from-orange-900 via-red-950 to-black",
    borderColor: "border-orange-500",
    shadow: "shadow-orange-500/50",
    sound: SOUND_PATHS.JOKER_BOARD,
  },
  random: {
    icon: Zap,
    color: "from-indigo-900 via-purple-900 to-black",
    borderColor: "border-purple-500",
    shadow: "shadow-purple-500/50",
    sound: null,
  },
};

const ELEMENT_CONFIG: Record<string, any> = {
  fire: {
    icon: Flame,
    color: "from-red-600 via-red-900 to-black",
    borderColor: "border-red-500",
    shadow: "shadow-red-500/50",
  },
  water: {
    icon: Droplet,
    color: "from-blue-600 via-blue-900 to-black",
    borderColor: "border-blue-500",
    shadow: "shadow-blue-500/50",
  },
  earth: {
    icon: Mountain,
    color: "from-amber-700 via-amber-900 to-black",
    borderColor: "border-amber-600",
    shadow: "shadow-amber-600/50",
  },
  wind: {
    icon: Wind,
    color: "from-emerald-600 via-emerald-900 to-black",
    borderColor: "border-emerald-500",
    shadow: "shadow-emerald-500/50",
  },
  lightning: {
    icon: Zap,
    color: "from-purple-600 via-purple-900 to-black",
    borderColor: "border-purple-500",
    shadow: "shadow-purple-500/50",
  },
};

export function BoardIntroAnimation({
  mechanicType,
  activeElement,
  onComplete,
}: BoardIntroAnimationProps) {
  const [show, setShow] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gameT = useTranslation().game;
  const t = gameT.mechanics;

  // Determine config based on mechanic and element
  let config = BOARD_CONFIG[mechanicType] || BOARD_CONFIG.none;
  if (
    mechanicType === "random_elemental" &&
    activeElement &&
    activeElement !== "none"
  ) {
    const elConfig = ELEMENT_CONFIG[activeElement];
    if (elConfig) {
      config = { ...config, ...elConfig };
    }
  }

  const Icon = config.icon;

  // Get title from translations
  const getTitle = () => {
    if (mechanicType === "random_elemental" && activeElement && activeElement !== "none") {
      const re = t.randomElemental;
      switch (activeElement) {
        case "fire": return re.fireTitle;
        case "water": return re.waterTitle;
        case "earth": return re.earthTitle;
        case "wind": return re.windTitle;
        case "lightning": return re.lightningTitle;
        default: return re.title;
      }
    }

    switch (mechanicType) {
      case "random_elemental":
      case "random":
        return t.randomElemental.title;
      case "poison":
        return t.poison.title;
      case "foggy":
        return t.foggy.title;
      case "joker":
        return t.joker.title;
      default:
        return gameT.standardMatch;
    }
  };

  useEffect(() => {
    // Determine sound file
    let soundFile = config.sound;
    if (mechanicType === "random_elemental" && activeElement) {
      soundFile =
        ELEMENTAL_SOUNDS[activeElement] || SOUND_PATHS.LIGHTNING;
    }

    // Play sound effect
    if (soundFile) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(soundFile);
      audio.volume = 0.6;
      audioRef.current = audio;
      audio.play().catch((err) => console.log("Audio play failed:", err));
    }

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
  }, [mechanicType, activeElement, config.sound, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Cinematic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95"
          />

          {/* Dynamic Slash Background */}
          <motion.div
            initial={{ x: "150%", skewX: -15 }}
            animate={{ x: "-50%", skewX: -15 }}
            exit={{ x: "-250%", skewX: -15 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className={`absolute inset-y-0 w-[400%] left-0 bg-gradient-to-r ${config.color} border-y-4 ${config.borderColor} shadow-[0_0_100px_rgba(0,0,0,0.5)]`}
          />

          {/* Content Container */}
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center gap-4"
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
            {/* Icon with Glitch/Pulse Effect */}
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                  filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`w-32 h-32 flex items-center justify-center rounded-full border-4 ${config.borderColor} bg-black/80 ${config.shadow}`}
              >
                <Icon className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              </motion.div>

              {/* Particle Effects (Simple CSS) */}
              <div
                className={`absolute inset-0 rounded-full animate-ping opacity-20 bg-white`}
              />
            </div>

            {/* Title Text - Big & Bold */}
            <div className="flex flex-col items-center text-center px-4">
              <motion.h1
                className="text-4xl sm:text-6xl md:text-8xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-tighter leading-none mb-2"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                {getTitle()}
              </motion.h1>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
