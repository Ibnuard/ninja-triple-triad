"use client";

import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";
import { LucideIcon } from "lucide-react";

interface Mode {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  shadowColor: string;
  glowColor: string;
  accent: string;
  hasSubMenu?: boolean;
}

interface ModeSelectionGridProps {
  modes: Mode[];
  onModeClick: (modeId: string) => void;
}

export function ModeSelectionGrid({ modes, onModeClick }: ModeSelectionGridProps) {
  return (
    <motion.div
      key="mode-selection"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 px-4"
    >
      {modes.map((mode, index) => (
        <motion.button
          key={mode.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onModeClick(mode.id)}
          className="group relative h-[320px] lg:h-[400px] w-full bg-gray-900/50 hover:bg-gray-800/80 border border-white/5 hover:border-white/20 transition-all duration-300 overflow-hidden flex flex-col items-center text-center p-6 skew-x-0 md:-skew-x-6 hover:skew-x-0 hover:scale-105 hover:z-10 hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-xl md:rounded-3xl"
        >
          {/* Un-skew content for readability */}
          <div className="skew-x-0 md:skew-x-6 w-full h-full flex flex-col items-center justify-center gap-6">
            <div
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 bg-gradient-to-br",
                mode.color
              )}
            >
              <mode.icon className="w-10 h-10 text-white drop-shadow-md" />
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-black italic tracking-tighter text-white">
                {mode.title}
              </h3>
              <div className="h-0.5 w-12 bg-white/20 mx-auto group-hover:w-full group-hover:bg-white transition-all duration-500" />
              <p className="text-sm text-gray-400 font-medium max-w-[200px] mx-auto opacity-60 group-hover:opacity-100 transition-opacity">
                {mode.description}
              </p>
            </div>

            <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                Select Mode
              </span>
            </div>
          </div>

          {/* Decorative Background Elements */}
          <div
            className={cn(
              "absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none",
              mode.accent.replace("bg-", "bg-")
            )}
          />
        </motion.button>
      ))}
    </motion.div>
  );
}
