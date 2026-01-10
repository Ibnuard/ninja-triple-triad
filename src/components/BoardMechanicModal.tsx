"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Zap,
  Skull,
  CloudFog,
  Dices,
} from "lucide-react";
import { useTranslation } from "../store/useSettingsStore";
import { BoardMechanicState } from "../types/game";

interface BoardMechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  mechanic: BoardMechanicState;
}

export function BoardMechanicModal({
  isOpen,
  onClose,
  mechanic,
}: BoardMechanicModalProps) {
  const t = useTranslation().game.mechanics;

  const getMechanicIcon = () => {
    switch (mechanic.type) {
      case "random_elemental":
        switch (mechanic.activeElement) {
          case "fire":
            return <Flame className="w-12 h-12 text-red-500" />;
          case "water":
            return <Droplets className="w-12 h-12 text-blue-500" />;
          case "earth":
            return <Mountain className="w-12 h-12 text-amber-600" />;
          case "wind":
            return <Wind className="w-12 h-12 text-emerald-500" />;
          case "lightning":
            return <Zap className="w-12 h-12 text-yellow-500" />;
          default:
            return <Zap className="w-12 h-12 text-purple-500" />;
        }
      case "poison":
        return <Skull className="w-12 h-12 text-purple-500" />;
      case "foggy":
        return <CloudFog className="w-12 h-12 text-gray-400" />;
      case "joker":
        return <Dices className="w-12 h-12 text-pink-500" />;
      default:
        return null;
    }
  };

  const getMechanicContent = () => {
    switch (mechanic.type) {
      case "random_elemental":
        const element = mechanic.activeElement || "fire";
        const elementName = element.charAt(0).toUpperCase() + element.slice(1);
        return {
          title: t.randomElemental.title,
          desc: t.randomElemental.desc.replace(/{element}/g, elementName),
        };
      case "poison":
        return {
          title: t.poison.title,
          desc: t.poison.desc,
        };
      case "foggy":
        return {
          title: t.foggy.title,
          desc: t.foggy.desc,
        };
      case "joker":
        return {
          title: t.joker.title,
          desc: t.joker.desc,
        };
      default:
        return { title: "", desc: "" };
    }
  };

  const content = getMechanicContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 border border-white/20 rounded-3xl shadow-2xl max-w-md w-full p-6 lg:p-8 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                {getMechanicIcon()}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl lg:text-3xl font-black text-center mb-4 text-white">
              {content.title}
            </h2>

            {/* Description */}
            <p className="text-sm lg:text-base text-gray-300 leading-relaxed text-center">
              {content.desc}
            </p>

            {/* Close Button (Bottom) */}
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
