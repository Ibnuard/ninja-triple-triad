"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../store/useSettingsStore";
import { Swords, School, Layers, ChevronLeft, Disc, Zap } from "lucide-react";
import { cn } from "../../lib/utils";

export default function SinglePlayerModes() {
  const router = useRouter();
  const t = useTranslation().spSelection;
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [customMechanic, setCustomMechanic] = useState<string>("none");

  const modes = [
    {
      id: "gauntlet",
      title: t.modes.gauntlet.title,
      description: t.modes.gauntlet.description,
      icon: Swords,
      color: "from-red-600 to-orange-800",
      borderColor: "border-red-500/30",
      shadowColor: "shadow-red-900/40",
      glowColor: "group-hover:bg-red-500/10",
      accent: "bg-red-500",
    },
    {
      id: "training",
      title: t.modes.training.title,
      description: t.modes.training.description,
      icon: School,
      color: "from-blue-600 to-indigo-800",
      borderColor: "border-blue-500/30",
      shadowColor: "shadow-blue-900/40",
      glowColor: "group-hover:bg-blue-500/10",
      accent: "bg-blue-500",
      hasSubMenu: true,
    },
    {
      id: "custom",
      title: t.modes.custom.title,
      description: t.modes.custom.description,
      icon: Zap,
      color: "from-purple-600 to-pink-800",
      borderColor: "border-purple-500/30",
      shadowColor: "shadow-purple-900/40",
      glowColor: "group-hover:bg-purple-500/10",
      accent: "bg-purple-500",
    },
  ];

  const handleModeClick = (modeId: string) => {
    if (modeId === "training") {
      setSelectedMode("training");
    } else if (modeId === "custom") {
      setSelectedMode("custom");
    } else {
      router.push("/game");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-950 via-black to-black z-0" />
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-6xl flex flex-col gap-6 lg:gap-8"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2 lg:gap-0 border-b border-white/5 pb-2 lg:border-0 lg:pb-0">
          <button
            onClick={() =>
              selectedMode ? setSelectedMode(null) : router.push("/")
            }
            className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors self-start lg:self-auto"
          >
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">
              {selectedMode ? t.back : t.back}
            </span>
          </button>

          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-white to-gray-600 drop-shadow-2xl text-center">
            {t.title}
          </h1>

          <div className="hidden lg:block w-24 h-px bg-white/10" />
          {/* Spacer for mobile to maintain centering if needed, but flex-col handles it */}
        </div>

        {/* Modes Grid */}
        <AnimatePresence mode="wait">
          {!selectedMode ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
            >
              {modes.map((mode, index) => (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleModeClick(mode.id)}
                  className={cn(
                    "group relative flex flex-col text-left p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border bg-black/60 backdrop-blur-3xl transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-2xl overflow-hidden min-h-[160px] lg:min-h-[280px]",
                    mode.borderColor,
                    mode.shadowColor
                  )}
                >
                  {/* Ninja Accent Line */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 w-full h-1 opacity-50 group-hover:opacity-100 transition-opacity",
                      mode.accent
                    )}
                  />

                  {/* Glow background */}
                  <div
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500 pointer-events-none opacity-0 group-hover:opacity-100",
                      mode.glowColor
                    )}
                  />

                  <div
                    className={cn(
                      "w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-linear-to-br flex items-center justify-center mb-4 lg:mb-6 shadow-2xl ring-1 ring-white/10",
                      mode.color
                    )}
                  >
                    <mode.icon className="w-5 h-5 lg:w-7 lg:h-7 text-white drop-shadow-md" />
                  </div>

                  <h3 className="text-lg lg:text-2xl font-black uppercase tracking-tighter mb-2 lg:mb-4 group-hover:text-white transition-colors leading-none">
                    {mode.title}
                  </h3>

                  <p className="text-xs lg:text-sm leading-relaxed text-gray-400 group-hover:text-gray-200 transition-colors font-medium">
                    {mode.description}
                  </p>

                  <Zap
                    className={cn(
                      "absolute bottom-4 right-4 w-8 h-8 lg:w-10 lg:h-10 opacity-5 scale-0 group-hover:scale-100 transition-all duration-500",
                      mode.accent.replace("bg-", "text-")
                    )}
                  />
                </motion.button>
              ))}
            </motion.div>
          ) : selectedMode === "training" ? (
            <motion.div
              key="submenu-training"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center gap-8 py-12"
            >
              {/* Training Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-800 flex items-center justify-center mx-auto mb-6 shadow-2xl ring-1 ring-white/10">
                  <School className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
                  {t.modes.training.title}
                </h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  {t.modes.training.description}
                </p>
              </div>

              {/* Training Options */}
              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
                <button
                  onClick={() => router.push("/game")}
                  className="flex-1 group relative p-8 rounded-[2rem] border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all duration-300 text-center overflow-hidden active:scale-95 shadow-xl"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-50" />
                  <Disc className="w-8 h-8 mx-auto mb-4 text-blue-400 group-hover:rotate-180 transition-transform duration-700" />
                  <span className="text-xl font-black uppercase tracking-widest">
                    {t.trainingSub.ownDeck}
                  </span>
                </button>
                <button
                  onClick={() => router.push("/game")}
                  className="flex-1 group relative p-8 rounded-[2rem] border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all duration-300 text-center overflow-hidden active:scale-95 shadow-xl"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 opacity-50" />
                  <Layers className="w-8 h-8 mx-auto mb-4 text-cyan-400 group-hover:translate-y-[-4px] transition-transform duration-300" />
                  <span className="text-xl font-black uppercase tracking-widest">
                    {t.trainingSub.randomDeck}
                  </span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="submenu-custom"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center gap-8 py-12"
            >
              {/* Custom Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-purple-600 to-pink-800 flex items-center justify-center mx-auto mb-6 shadow-2xl ring-1 ring-white/10">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
                  {t.modes.custom.title}
                </h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  {t.modes.custom.description}
                </p>
              </div>

              {/* Board Mechanic Selector */}
              <div className="w-full max-w-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                  Select Board Effect
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["none", "random_elemental", "poison", "foggy", "joker"].map(
                    (mechanic) => (
                      <button
                        key={mechanic}
                        onClick={() => setCustomMechanic(mechanic)}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all",
                          customMechanic === mechanic
                            ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                            : "bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                        )}
                      >
                        {mechanic.replace("_", " ")}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={() =>
                  router.push(`/game?mode=custom&mechanic=${customMechanic}`)
                }
                className="w-full max-w-sm py-4 bg-white text-black font-black text-lg tracking-[0.2em] uppercase rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Start Battle
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
