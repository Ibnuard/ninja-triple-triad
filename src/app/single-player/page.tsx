"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../store/useSettingsStore";
import { Swords, School, Layers, ChevronLeft, Disc, Zap, BookOpen, Check, X, Trophy, Skull } from "lucide-react";
import { cn } from "../../lib/utils";
import { useDeckStore } from "../../store/useDeckStore";
import { CARD_POOL } from "../../data/cardPool";
import { Card } from "../../components/Card";
import { Card as CardType } from "../../types/game";

export default function SinglePlayerModes() {
  const router = useRouter();
  const t = useTranslation().spSelection;
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [customMechanic, setCustomMechanic] = useState<string>("none");
  
  // Gauntlet Mode State
  const { selectedDeck, loadDeck, saveDeck, isDeckComplete, lastRunScore, lastBoss } = useDeckStore();
  const [showDeckSelection, setShowDeckSelection] = useState(false);
  const [tempDeck, setTempDeck] = useState<CardType[]>([]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  useEffect(() => {
    if (showDeckSelection) {
      setTempDeck(selectedDeck);
    }
  }, [showDeckSelection, selectedDeck]);

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
    if (modeId === "training" || modeId === "gauntlet") {
      setSelectedMode(modeId);
      if (modeId === "gauntlet") setShowDeckSelection(false);
    } else if (modeId === "custom") {
      setSelectedMode("custom");
    } else {
      router.push("/game");
    }
  };

  const toggleCardSelection = (card: CardType) => {
    const isSelected = tempDeck.some((c) => c.id === card.id);
    if (isSelected) {
      setTempDeck(tempDeck.filter((c) => c.id !== card.id));
    } else {
      if (tempDeck.length < 5) {
        setTempDeck([...tempDeck, card]);
      }
    }
  };

  const saveGauntletDeck = () => {
    if (tempDeck.length === 5) {
      saveDeck(tempDeck);
      setShowDeckSelection(false);
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
            ) : selectedMode === "gauntlet" ? (
              <motion.div
                key="gauntlet-submenu"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-5xl bg-gray-900/80 border border-red-500/30 rounded-[3rem] p-8 md:p-12 relative overflow-hidden"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/20 blur-[60px]" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/20 blur-[60px]" />

                {!showDeckSelection ? (
                  <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        <Swords className="w-3 h-3" /> {t.modes.gauntlet.submenu.survivalMode}
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black italic uppercase text-white mb-4 leading-none">
                        {t.modes.gauntlet.title}
                      </h2>
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-md">
                        {t.modes.gauntlet.description}
                      </p>

                      <div className="flex items-center gap-4 justify-center md:justify-start mb-8">
                        <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-bold text-gray-300">{t.modes.gauntlet.submenu.deckStatus}:</span>
                          <span className={cn(
                            "text-lg font-black",
                            isDeckComplete() ? "text-green-400" : "text-yellow-400"
                          )}>
                            {selectedDeck.length}/5
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => isDeckComplete() && router.push("/gauntlet/play")}
                          disabled={!isDeckComplete()}
                          className={cn(
                            "group relative px-8 py-4 font-black uppercase tracking-widest text-sm transition-all w-full sm:w-auto overflow-hidden rounded-xl flex items-center justify-center gap-2",
                            isDeckComplete() 
                              ? "bg-white text-black hover:bg-red-500 hover:text-white" 
                              : "bg-gray-800 text-gray-500 cursor-not-allowed"
                          )}
                        >
                          {t.modes.gauntlet.submenu.startGauntlet}
                          {isDeckComplete() && <ChevronLeft className="rotate-180 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                        <button
                          onClick={() => setShowDeckSelection(true)}
                          className="px-8 py-4 bg-gray-800 text-white font-black uppercase tracking-widest text-sm hover:bg-gray-700 transition-colors rounded-xl flex items-center justify-center gap-2"
                        >
                          <Layers className="w-4 h-4" />
                          {t.modes.gauntlet.submenu.manageDeck}
                        </button>
                      </div>
                    </div>
                    
                    {/* Visual Element / Stats */}
                    <div className="flex-1 flex justify-center">
                       <div className="relative w-full max-w-sm bg-black/40 rounded-3xl border border-white/5 p-6 flex flex-col gap-6">
                          <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-xl font-black italic uppercase text-white/50">Last Run</h3>
                            <div className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-gray-400">
                              {new Date().toLocaleDateString()}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-white/5">
                              <Trophy className="w-8 h-8 text-yellow-500" />
                              <div className="text-center">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Score</div>
                                <div className="text-2xl font-black text-white">{lastRunScore}</div>
                              </div>
                            </div>
                            <div className="bg-gray-800/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-white/5">
                              <Skull className="w-8 h-8 text-red-500" />
                              <div className="text-center">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Boss</div>
                                <div className="text-lg font-black text-white truncate max-w-[100px]">{lastBoss}</div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto pt-4 border-t border-white/10">
                             <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Deck Used</div>
                             <div className="flex justify-center -space-x-4">
                               {selectedDeck.length > 0 ? (
                                 selectedDeck.map((card, i) => (
                                   <div key={i} className="w-12 h-16 rounded-lg border-2 border-gray-900 relative overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300" style={{ zIndex: i }}>
                                      <div className={`absolute inset-0 bg-gradient-to-br ${
                                        card.element === 'fire' ? 'from-red-600' :
                                        card.element === 'water' ? 'from-blue-600' :
                                        card.element === 'earth' ? 'from-amber-600' :
                                        card.element === 'wind' ? 'from-emerald-600' :
                                        'from-yellow-600'
                                      } to-black`} />
                                      <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white/50">
                                        {card.stats.top}
                                      </div>
                                   </div>
                                 ))
                               ) : (
                                 <div className="text-sm text-gray-600 italic">No deck data</div>
                               )}
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black italic uppercase text-white">{t.modes.gauntlet.submenu.selectCards}</h3>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "text-xl font-black",
                          tempDeck.length === 5 ? "text-green-400" : "text-yellow-400"
                        )}>
                          {tempDeck.length}/5
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setShowDeckSelection(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 min-h-[400px] max-h-[500px] custom-scrollbar">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 p-2">
                        {CARD_POOL.map((card) => {
                          const isSelected = tempDeck.some(c => c.id === card.id);
                          const selectionIndex = tempDeck.findIndex(c => c.id === card.id);
                          
                          return (
                            <div 
                              key={card.id}
                              className="relative group flex justify-center"
                            >
                              <div className="transform transition-transform hover:scale-110 hover:z-10">
                                <Card 
                                  card={card}
                                  onClick={() => toggleCardSelection(card)}
                                  isSelected={isSelected}
                                  isPlaced={false}
                                />
                              </div>

                              {isSelected && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-xs z-30 shadow-lg border-2 border-gray-900 animate-bounce">
                                  {selectionIndex + 1}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4 border-t border-white/10 pt-4">
                      <button
                        onClick={() => setShowDeckSelection(false)}
                        className="px-6 py-2 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {t.modes.gauntlet.submenu.cancel}
                      </button>
                      <button
                        onClick={saveGauntletDeck}
                        disabled={tempDeck.length !== 5}
                        className={cn(
                          "px-8 py-2 rounded-lg font-bold uppercase tracking-wider transition-all",
                          tempDeck.length === 5
                            ? "bg-green-500 text-black hover:bg-green-400"
                            : "bg-gray-800 text-gray-600 cursor-not-allowed"
                        )}
                      >
                        {t.modes.gauntlet.submenu.saveDeck}
                      </button>
                    </div>
                  </div>
                )}
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
