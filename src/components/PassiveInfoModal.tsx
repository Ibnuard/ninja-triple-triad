"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info } from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation } from "../store/useSettingsStore";

interface PassiveInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PassiveInfoModal = ({
  isOpen,
  onClose,
}: PassiveInfoModalProps) => {
  const t = useTranslation().passives;

  const passives = [
    {
      element: "fire",
      name: "Fire",
      icon: "/images/fire.webp",
      color: "bg-red-500/20 text-red-400 border-red-500/50",
      description: t.fire,
    },
    {
      element: "water",
      name: "Water",
      icon: "/images/water.webp",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      description: t.water,
    },
    {
      element: "earth",
      name: "Earth",
      icon: "/images/earth.webp",
      color: "bg-amber-800/20 text-yellow-600 border-amber-500/50",
      description: t.earth,
    },
    {
      element: "wind",
      name: "Wind",
      icon: "/images/wind.webp",
      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
      description: t.wind,
    },
    {
      element: "lightning",
      name: "Lightning",
      icon: "/images/lightning.webp",
      color: "bg-yellow-400/20 text-yellow-400 border-yellow-400/50",
      description: t.lightning,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Info className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-white italic">
                  {t.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left">
              {passives.map((p) => (
                <div
                  key={p.element}
                  className={cn(
                    "p-4 rounded-2xl border flex items-center gap-4 transition-all hover:scale-[1.02]",
                    p.color
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                    <img
                      src={p.icon}
                      alt={p.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider mb-1">
                      {p.name}
                    </h3>
                    <p className="text-xs font-medium text-white/70 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                {t.footer}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
