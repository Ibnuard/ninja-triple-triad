"use client";

import { motion } from "framer-motion";
import { Swords, Zap, Scroll, ChevronRight } from "lucide-react";
import { useTranslation } from "../store/useSettingsStore";
import { cn } from "../lib/utils";

interface RewardOption {
  id: number;
  icon: any;
  color: string;
  glow: string;
}

interface GauntletRewardModalProps {
  isOpen: boolean;
  onSelect: (optionId: number) => void;
}

export function GauntletRewardModal({ isOpen, onSelect }: GauntletRewardModalProps) {
  const t = useTranslation().game.gauntlet.rewards;

  if (!isOpen) return null;

  const options: RewardOption[] = [
    {
      id: 1,
      icon: Swords,
      color: "from-red-500 to-orange-700",
      glow: "shadow-red-500/20",
    },
    {
      id: 2,
      icon: Zap,
      color: "from-yellow-400 to-amber-600",
      glow: "shadow-yellow-500/20",
    },
    {
      id: 3,
      icon: Scroll,
      color: "from-blue-500 to-indigo-700",
      glow: "shadow-blue-500/20",
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-gray-900 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/10 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 text-center mb-4 md:mb-12">
          <h2 className="text-gray-500 text-[8px] md:text-xs font-black tracking-[0.4em] mb-1 md:mb-3 uppercase italic">
            {t.title}
          </h2>
          <h1 className="text-xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
            {t.subtitle}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 relative z-10">
          {options.map((option) => {
            const translation = (t as any)[`option${option.id}`];
            const Icon = option.icon;

            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(option.id)}
                className={cn(
                  "group relative flex md:flex-col items-center gap-4 md:gap-0 p-3 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 text-left md:text-center",
                  option.glow
                )}
              >
                <div className={cn(
                  "w-10 h-10 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br md:mb-6 flex-shrink-0 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500",
                  option.color
                )}>
                  <Icon className="w-5 h-5 md:w-10 md:h-10 text-white" />
                </div>

                <div className="flex flex-col">
                  <h3 className="text-sm md:text-xl font-black italic uppercase text-white mb-0.5 md:mb-2">
                    {translation.title}
                  </h3>
                  <p className="text-gray-400 text-[10px] md:text-sm leading-tight md:leading-relaxed mb-1 md:mb-6 line-clamp-2 md:line-clamp-none">
                    {translation.desc}
                  </p>

                  <div className="mt-auto flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                    {t.select}
                    <ChevronRight className="w-2 h-2 md:w-3 md:h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
