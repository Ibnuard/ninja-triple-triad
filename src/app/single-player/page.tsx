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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black z-0" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-7xl flex flex-col gap-8"
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mx-4 lg:mx-0">
          <button
            onClick={() =>
              selectedMode ? setSelectedMode(null) : router.push("/")
            }
            className="group flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-widest text-xs uppercase">
              {selectedMode ? "BACK" : "MAIN MENU"}
            </span>
          </button>

          <h1 className="text-3xl lg:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 uppercase">
            {t.title}
          </h1>

          <div className="hidden lg:block w-32 h-1 bg-white/10 skew-x-[-45deg]" />
        </div>

        {/* Content Area */}
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!selectedMode ? (
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
                    onClick={() => handleModeClick(mode.id)}
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
            ) : selectedMode === "training" ? (
              <motion.div
                key="training-submenu"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-4xl flex flex-col md:flex-row gap-6 items-stretch"
              >
                {/* Training Option 1 */}
                <button
                  onClick={() => router.push("/game")}
                  className="flex-1 group relative bg-gray-900/80 border border-blue-500/30 p-8 rounded-3xl hover:bg-blue-900/20 transition-all hover:-translate-y-2 overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Disc className="w-32 h-32 text-blue-500 rotate-12" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 text-black">
                        <Disc className="w-6 h-6" />
                      </div>
                      <h3 className="text-3xl font-black italic uppercase text-white mb-2">
                        {t.trainingSub.ownDeck}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Use your collection to train strategies.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs mt-8 group-hover:translate-x-2 transition-transform">
                      Select <ChevronLeft className="rotate-180 w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Training Option 2 */}
                <button
                  onClick={() => router.push("/game")}
                  className="flex-1 group relative bg-gray-900/80 border border-cyan-500/30 p-8 rounded-3xl hover:bg-cyan-900/20 transition-all hover:-translate-y-2 overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Layers className="w-32 h-32 text-cyan-500 -rotate-12" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mb-4 text-black">
                        <Layers className="w-6 h-6" />
                      </div>
                      <h3 className="text-3xl font-black italic uppercase text-white mb-2">
                        {t.trainingSub.randomDeck}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Challenge yourself with randomized cards.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-xs mt-8 group-hover:translate-x-2 transition-transform">
                      Select <ChevronLeft className="rotate-180 w-4 h-4" />
                    </div>
                  </div>
                </button>
              </motion.div>
            ) : (
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
                <div className="flex-1 text-center md:text-left z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    <Zap className="w-3 h-3" /> Sandbox Mode
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black italic uppercase text-white mb-4 leading-none">
                    {t.modes.custom.title}
                  </h2>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-md">
                    {t.modes.custom.description}
                  </p>

                  <button
                    onClick={() =>
                      router.push(
                        `/game?mode=custom&mechanic=${customMechanic}`
                      )
                    }
                    className="group relative px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-purple-400 transition-colors w-full md:w-auto overflow-hidden rounded-xl"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Start Battle{" "}
                      <ChevronLeft className="rotate-180 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>

                {/* Right Side: Mechanic Selector */}
                <div className="flex-1 w-full z-10 bg-black/40 rounded-2xl p-6 border border-white/5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block text-center">
                    Board Mechanic Configuration
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "none",
                      "random_elemental",
                      "poison",
                      "foggy",
                      "joker",
                    ].map((mechanic) => (
                      <button
                        key={mechanic}
                        onClick={() => setCustomMechanic(mechanic)}
                        className={cn(
                          "relative h-16 rounded-xl border-2 transition-all flex items-center justify-center uppercase font-black italic text-[10px] sm:text-xs",
                          customMechanic === mechanic
                            ? "border-purple-500 bg-purple-500/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105 z-10"
                            : "border-white/5 bg-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300"
                        )}
                      >
                        {mechanic.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
