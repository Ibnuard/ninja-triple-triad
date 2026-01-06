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
      id: "draft",
      title: t.modes.draft.title,
      description: t.modes.draft.description,
      icon: Layers,
      color: "from-emerald-600 to-teal-800",
      borderColor: "border-emerald-500/30",
      shadowColor: "shadow-emerald-900/40",
      glowColor: "group-hover:bg-emerald-500/10",
      accent: "bg-emerald-500",
    },
  ];

  const handleModeClick = (modeId: string) => {
    if (modeId === "training") {
      setSelectedMode("training");
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
        className="relative z-10 w-full max-w-6xl flex flex-col gap-12"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              selectedMode ? setSelectedMode(null) : router.push("/")
            }
            className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-xs">
              {selectedMode ? t.back : t.back}
            </span>
          </button>

          <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-white to-gray-600 drop-shadow-2xl">
            {t.title}
          </h1>

          <div className="w-24 h-px bg-white/10 hidden lg:block" />
        </div>

        {/* Modes Grid */}
        <AnimatePresence mode="wait">
          {!selectedMode ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
            >
              {modes.map((mode, index) => (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleModeClick(mode.id)}
                  className={cn(
                    "group relative flex flex-col text-left p-10 rounded-[2.5rem] border bg-black/60 backdrop-blur-3xl transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-2xl overflow-hidden min-h-[400px]",
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
                      "w-16 h-16 rounded-2xl bg-linear-to-br flex items-center justify-center mb-10 shadow-2xl ring-1 ring-white/10",
                      mode.color
                    )}
                  >
                    <mode.icon className="w-8 h-8 text-white drop-shadow-md" />
                  </div>

                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-6 group-hover:text-white transition-colors leading-none">
                    {mode.title}
                  </h3>

                  <p className="text-base leading-relaxed text-gray-400 group-hover:text-gray-200 transition-colors font-medium">
                    {mode.description}
                  </p>

                  <Zap
                    className={cn(
                      "absolute bottom-10 right-10 w-12 h-12 opacity-5 scale-0 group-hover:scale-100 transition-all duration-500",
                      mode.accent.replace("bg-", "text-")
                    )}
                  />
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="submenu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center gap-8 py-12"
            >
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
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 left-0 w-full flex justify-center opacity-10 pointer-events-none">
        <p className="font-black uppercase tracking-[2em] text-xs">
          Uchiha Clan Protocol
        </p>
      </div>
    </div>
  );
}
