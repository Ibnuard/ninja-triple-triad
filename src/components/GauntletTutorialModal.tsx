"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Swords,
  Trophy,
  Zap,
  Sparkles,
  Skull,
} from "lucide-react";
import { useTranslation } from "../store/useSettingsStore";
import { cn } from "../lib/utils";

interface GauntletTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GauntletTutorialModal({
  isOpen,
  onClose,
}: GauntletTutorialModalProps) {
  const t = useTranslation().game.gauntletTutorial;
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: "overview",
      title: t.slides.overview.title,
      desc: t.slides.overview.desc,
      icon: Swords,
      color: "text-red-500",
      bg: "bg-red-500/10",
      illustration: (
        <div className="relative w-full h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full" />
          <div className="flex gap-4 items-center">
            <div className="w-12 h-16 bg-gray-800 rounded border border-white/10 flex items-center justify-center">
              <Swords className="w-6 h-6 text-red-500" />
            </div>
            <ChevronRight className="w-6 h-6 text-gray-600" />
            <div className="w-12 h-16 bg-gray-800 rounded border border-white/10 flex items-center justify-center">
              <Swords className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
            <ChevronRight className="w-6 h-6 text-gray-600" />
            <div className="w-12 h-16 bg-gray-800 rounded border border-white/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "scoring",
      title: t.slides.scoring.title,
      desc: t.slides.scoring.desc,
      icon: Trophy,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      illustration: (
        <div className="relative w-full h-32 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-end gap-1 h-12">
              <div className="w-4 h-4 bg-gray-800 rounded-t border border-white/10" />
              <div className="w-4 h-8 bg-gray-700 rounded-t border border-white/10" />
              <div className="w-4 h-12 bg-red-600 rounded-t border border-white/10 animate-bounce" />
            </div>
            <div className="text-[10px] font-black text-red-500 uppercase italic">
              Rank Up!
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "mechanics",
      title: t.slides.mechanics.title,
      desc: t.slides.mechanics.desc,
      icon: Zap,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      illustration: (
        <div className="relative w-full h-32 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <Skull className="w-5 h-5 text-orange-400" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "arts",
      title: t.slides.arts.title,
      desc: t.slides.arts.desc,
      icon: Sparkles,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      illustration: (
        <div className="relative w-full h-32 flex items-center justify-center">
          <div className="flex gap-2 md:gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-14 h-18 md:w-16 md:h-20 rounded-xl border border-white/10 bg-gray-800 flex flex-col items-center justify-center p-2 transition-all",
                  i === 4 ? "scale-110 border-emerald-500/50 bg-emerald-500/5" : "opacity-40"
                )}
              >
                {i < 4 ? (
                  <div className="w-8 h-10 bg-white/5 rounded flex items-center justify-center">
                    <Swords className="w-4 h-4 text-gray-600" />
                  </div>
                ) : (
                  <Sparkles className="w-6 h-6 mb-1 text-emerald-400" />
                )}
                <div className="w-8 h-1 bg-white/10 rounded-full mt-2" />
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "bosses",
      title: t.slides.bosses.title,
      desc: t.slides.bosses.desc,
      icon: Skull,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      illustration: (
        <div className="relative w-full h-32 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full animate-pulse" />
            <div className="w-20 h-20 rounded-full border-2 border-purple-500/50 bg-black flex items-center justify-center relative z-10">
              <Skull className="w-10 h-10 text-purple-500" />
            </div>
            <div className="absolute -top-2 -right-2 bg-red-600 text-[8px] font-black px-1.5 py-0.5 rounded italic uppercase shadow-lg">
              Rank Boss
            </div>
            <div className="absolute -bottom-2 -left-2 bg-yellow-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">
              Threshold
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                  <Swords className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-xl font-black italic uppercase tracking-tight text-white">
                  {t.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className={cn("p-4 rounded-3xl mb-6", slides[currentSlide].bg)}>
                    {(() => {
                      const Icon = slides[currentSlide].icon;
                      return <Icon className={cn("w-10 h-10", slides[currentSlide].color)} />;
                    })()}
                  </div>

                  <h3 className="text-2xl font-black italic uppercase text-white mb-4">
                    {slides[currentSlide].title}
                  </h3>

                  <div className="w-full mb-8">
                    {slides[currentSlide].illustration}
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    {slides[currentSlide].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
              {/* Progress Dots */}
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentSlide ? "w-6 bg-red-500" : "w-1.5 bg-white/10"
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {currentSlide > 0 && (
                  <button
                    onClick={prevSlide}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t.back}
                  </button>
                )}
                <button
                  onClick={nextSlide}
                  className="px-6 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                >
                  {currentSlide === slides.length - 1 ? t.finish : t.next}
                  {currentSlide < slides.length - 1 && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
