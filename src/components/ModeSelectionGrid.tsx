"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";
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
  t: any;
  modes: Mode[];
  onModeClick: (modeId: string) => void;
  // Optional override for button text
  selectText?: string;
}

export function ModeSelectionGrid({
  t,
  modes,
  onModeClick,
  selectText,
}: ModeSelectionGridProps) {
  return (
    <motion.div
      key="mode-selection"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-full flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 px-4 justify-center max-w-6xl mx-auto"
    >
      {modes.map((mode, index) => (
        <motion.button
          key={mode.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onModeClick(mode.id)}
          className="group relative w-full bg-gray-900/50 hover:bg-gray-800/80 border border-white/5 hover:border-white/20 transition-all duration-300 overflow-hidden md:skew-x-0 md:-skew-x-6 hover:skew-x-0 hover:scale-105 hover:z-10 hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-xl md:rounded-3xl
          /* Mobile: horizontal compact layout */
          flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-5 md:pt-10 md:pb-8 px-6 gap-4 md:gap-6
          /* Desktop: fit exactly in viewport */
          md:h-[320px]"
        >
          {/* Un-skew content for readability (desktop only) */}
          <div className="md:skew-x-6 w-full h-full flex flex-row md:flex-col items-center md:justify-center gap-4 md:gap-6">
            {/* Icon */}
            <div
              className={cn(
                "w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl md:shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 bg-gradient-to-br shrink-0",
                mode.color
              )}
            >
              <mode.icon className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white drop-shadow-md" />
            </div>

            {/* Content */}
            <div className="flex-1 md:space-y-2">
              <h3 className="text-lg md:text-2xl lg:text-3xl font-black italic tracking-tighter text-white">
                {mode.title}
              </h3>
              <div className="hidden md:block h-0.5 w-12 bg-white/20 mx-auto group-hover:w-full group-hover:bg-white transition-all duration-500" />
              <p className="text-xs md:text-xs text-gray-400 font-medium md:max-w-[200px] md:mx-auto opacity-60 group-hover:opacity-100 transition-opacity line-clamp-2 md:line-clamp-none">
                {mode.description}
              </p>
            </div>

            {/* CTA - Desktop only */}
            <div className="hidden md:block mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                {selectText || (t.selectMode ?? "Select")}
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
