"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronLeft } from "lucide-react";
import { cn } from "../../../lib/utils";

interface CustomModeViewProps {
  t: any;
  customMechanic: string;
  activeElement: string;
  onMechanicChange: (mechanic: string) => void;
  onActiveElementChange: (element: string) => void;
  onStartBattle: () => void;
}

export function CustomModeView({
  t,
  customMechanic,
  activeElement,
  onMechanicChange,
  onActiveElementChange,
  onStartBattle,
}: CustomModeViewProps) {
  const mechanics = ["none", "random", "random_elemental", "poison", "foggy", "joker"];

  const elements = ["random", "fire", "water", "earth", "wind", "lightning"];

  return (
    <motion.div
      key="custom-submenu"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-4xl bg-gray-900/80 border border-purple-500/30 rounded-[3rem] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 blur-[60px]" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500/20 blur-[60px]" />

      {/* Left Side: Info */}
      <div className="flex-1 text-center md:text-left z-10 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-4">
          <Zap className="w-3 h-3" /> {t.customSub.sandboxMode}
        </div>
        <h2 className="text-4xl md:text-5xl font-black italic uppercase text-white mb-4 leading-none">
          {t.modes.custom.title}
        </h2>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-md">
          {t.modes.custom.description}
        </p>

        <button
          onClick={onStartBattle}
          className="group relative px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-purple-400 transition-colors w-full md:w-auto overflow-hidden rounded-xl"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {t.customSub.startBattle}{" "}
            <ChevronLeft className="rotate-180 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </div>

      {/* Right Side: Mechanic Selector */}
      <div className="flex-1 w-full z-10 space-y-4">
        <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block text-center">
            {t.customSub.mechanicConfig}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {mechanics.map((mechanic) => (
              <button
                key={mechanic}
                onClick={() => onMechanicChange(mechanic)}
                className={cn(
                  "relative h-16 rounded-xl border-2 transition-all flex items-center justify-center uppercase font-black italic text-[10px] sm:text-xs",
                  customMechanic === mechanic
                    ? "border-purple-500 bg-purple-500/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105 z-10"
                    : "border-white/5 bg-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300"
                )}
              >
                {t.customSub.mechanics[mechanic]}
              </button>
            ))}
          </div>
        </div>

        {/* Element Selector Sub-menu */}
        <AnimatePresence>
          {customMechanic === "random_elemental" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black/40 rounded-2xl p-6 border border-white/5"
            >
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block text-center">
                {t.customSub.selectElement}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {elements.map((el) => (
                  <button
                    key={el}
                    onClick={() => onActiveElementChange(el)}
                    className={cn(
                      "relative h-10 rounded-lg border transition-all flex items-center justify-center uppercase font-bold text-[10px]",
                      activeElement === el
                        ? "border-purple-500 bg-purple-500/20 text-white"
                        : "border-white/5 bg-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300"
                    )}
                  >
                    {t.customSub.elements[el]}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
