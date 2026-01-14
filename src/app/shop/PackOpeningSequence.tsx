import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Zap } from "lucide-react";
import { Card as CardType } from "../../types/game";
import { Card } from "../../components/Card";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../store/useSettingsStore";

interface PackOpeningSequenceProps {
  cards: CardType[];
  duplicates: string[];
  coinsGained?: number;
  onComplete: () => void;
  onClose: () => void;
}

export function PackOpeningSequence({
  cards,
  duplicates,
  coinsGained = 0,
  onComplete,
  onClose,
}: PackOpeningSequenceProps) {
  const t = useTranslation();
  const [phase, setPhase] = useState<
    "summon" | "tension" | "explosion" | "reveal"
  >("summon");
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  // Auto-advance from summon to tension
  useEffect(() => {
    if (phase === "summon") {
      const timer = setTimeout(() => setPhase("tension"), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handlePackClick = () => {
    if (phase === "tension") {
      setPhase("explosion");
      setTimeout(() => setPhase("reveal"), 800);
    }
  };

  const revealCard = (index: number) => {
    if (!revealedIndices.includes(index)) {
      setRevealedIndices((prev) => [...prev, index]);
      if (revealedIndices.length + 1 === cards.length) {
        setTimeout(() => {
          setShowSummary(true);
          onComplete();
        }, 1000);
      }
    }
  };

  const revealAll = () => {
    const allIndices = cards.map((_, i) => i);
    setRevealedIndices(allIndices);
    setTimeout(() => {
      setShowSummary(true);
      onComplete();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] bg-[radial-gradient(circle,_rgba(234,179,8,0.15)_0%,_transparent_70%)] animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      <AnimatePresence mode="wait">
        {phase === "summon" && (
          <motion.div
            key="summon"
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-48 h-64 bg-gradient-to-br from-yellow-600 to-yellow-900 rounded-xl border-4 border-yellow-400 shadow-[0_0_100px_rgba(234,179,8,0.5)] flex items-center justify-center relative">
              <Sparkles className="w-20 h-20 text-yellow-200 animate-pulse" />
            </div>
            <h2 className="mt-8 text-2xl font-black text-white uppercase tracking-[0.5em] animate-pulse">
              {t.shop.summoning}
            </h2>
          </motion.div>
        )}

        {phase === "tension" && (
          <motion.div
            key="tension"
            initial={{ scale: 1 }}
            animate={{
              rotate: [-1, 1, -1, 1, 0],
              scale: [1, 1.02, 1, 1.02, 1],
            }}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="cursor-pointer group"
            onClick={handlePackClick}
          >
            <div className="w-56 h-72 bg-gradient-to-br from-yellow-500 to-yellow-800 rounded-xl border-4 border-white/50 shadow-[0_0_100px_rgba(255,255,255,0.3)] flex items-center justify-center relative group-hover:shadow-[0_0_150px_rgba(234,179,8,0.8)] transition-shadow duration-300">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Zap className="w-24 h-24 text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
              <div className="absolute bottom-8 text-center w-full">
                <p className="text-white font-black uppercase tracking-widest text-sm animate-bounce">
                  {t.shop.clickToOpen}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "explosion" && (
          <motion.div
            key="explosion"
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 20, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full h-full bg-white rounded-full"
            />
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col items-center justify-center px-3 sm:px-6 py-4"
          >
            {/* Header with Reveal All button */}
            {!showSummary && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 sm:mb-6"
              >
                <button
                  onClick={revealAll}
                  className="group relative px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/50 rounded-xl text-yellow-400 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {t.shop.revealAll}
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </motion.div>
            )}

            {/* Cards Grid - Responsive with smaller cards on mobile */}
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 lg:gap-5 max-w-4xl">
              {cards.map((card, idx) => {
                const isRevealed = revealedIndices.includes(idx);
                const isDuplicate = duplicates.includes(card.id || "");
                const isRare = ["legend", "special", "epic"].includes(
                  card.rarity || "common"
                );

                return (
                  <motion.div
                    key={card.id + idx}
                    initial={{ scale: 0, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{
                      delay: idx * 0.08,
                      type: "spring",
                      stiffness: 150,
                      damping: 15,
                    }}
                    className="relative cursor-pointer group"
                    style={{
                      // Smaller on mobile (5 cards can fit), larger on tablet/desktop
                      width: "clamp(60px, 17vw, 150px)",
                      height: "clamp(80px, 23vw, 200px)",
                      perspective: "1000px",
                    }}
                    onClick={() => revealCard(idx)}
                  >
                    {/* Outer glow effect for rare cards */}
                    {isRare && isRevealed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -inset-2 sm:-inset-3 pointer-events-none z-0"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 via-orange-500/20 to-purple-500/40 blur-lg sm:blur-xl animate-pulse rounded-xl sm:rounded-2xl" />
                      </motion.div>
                    )}

                    <motion.div
                      animate={{ rotateY: isRevealed ? 180 : 0 }}
                      transition={{
                        duration: 0.6,
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
                      }}
                      className="w-full h-full relative"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Card Back */}
                      <div
                        className="absolute inset-0 rounded-lg sm:rounded-xl overflow-hidden shadow-xl sm:shadow-2xl group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] sm:group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-shadow duration-300"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        {/* Gradient Border */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 p-[1px] sm:p-[2px] rounded-lg sm:rounded-xl">
                          <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-[7px] sm:rounded-[10px] flex items-center justify-center relative overflow-hidden">
                            {/* Pattern overlay */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:8px_8px] sm:bg-[length:12px_12px]" />

                            {/* Center emblem */}
                            <div className="relative z-10">
                              <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-900/80 flex items-center justify-center border border-white/5 shadow-inner">
                                <Star className="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white/15" />
                              </div>
                            </div>

                            {/* Shimmer effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>
                        </div>
                      </div>

                      {/* Card Front */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div className="relative w-full h-full">
                          <Card
                            card={card}
                            isPlaced={false}
                            disableAnimations
                            className="!w-full !h-full !max-w-none !max-h-none !aspect-auto"
                          />

                          {/* Duplicate Stamp - Smaller on mobile */}
                          {isDuplicate && isRevealed && (
                            <motion.div
                              initial={{ scale: 3, opacity: 0, rotate: -20 }}
                              animate={{ scale: 1, opacity: 1, rotate: -12 }}
                              transition={{
                                delay: 0.4,
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                              }}
                              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                            >
                              <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 blur-sm sm:blur-md rounded" />
                                <div className="relative border border-red-500 sm:border-2 text-red-500 px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded sm:rounded-lg font-black text-[10px] sm:text-sm uppercase tracking-wide sm:tracking-wider bg-black/70 backdrop-blur-sm shadow-[0_0_10px_rgba(239,68,68,0.3)] sm:shadow-[0_0_20px_rgba(239,68,68,0.4)] whitespace-nowrap">
                                  {t.shop.duplicate}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Summary Section - Closer to cards */}
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="mt-4 sm:mt-6 flex flex-col items-center gap-3 sm:gap-4"
              >
                <div className="text-center">
                  <motion.h3
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 uppercase tracking-wide sm:tracking-wider"
                  >
                    {t.shop.packOpenedTitle}
                  </motion.h3>
                  {coinsGained > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-yellow-400/90 font-bold mt-2 text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      <span className="text-lg sm:text-2xl">💰</span>
                      {t.shop.coinsFromDuplicates.replace(
                        "{count}",
                        coinsGained.toString()
                      )}
                    </motion.p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-2.5 sm:px-10 sm:py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)] sm:shadow-[0_0_40px_rgba(234,179,8,0.5)] transition-all text-sm sm:text-base"
                >
                  {t.shop.continue}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
