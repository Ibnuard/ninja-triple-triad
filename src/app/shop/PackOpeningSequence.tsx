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
  onClose 
}: PackOpeningSequenceProps) {
  const t = useTranslation();
  const [phase, setPhase] = useState<"summon" | "tension" | "explosion" | "reveal">("summon");
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
      setRevealedIndices(prev => [...prev, index]);
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
              scale: [1, 1.02, 1, 1.02, 1]
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
            className="w-full max-w-6xl p-4 flex flex-col items-center h-full justify-center"
          >
            {!showSummary && (
              <div className="mb-8 flex gap-4">
                <button 
                  onClick={revealAll}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-bold uppercase tracking-widest text-xs transition-all"
                >
                  {t.shop.revealAll}
                </button>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full">
              {cards.map((card, idx) => {
                const isRevealed = revealedIndices.includes(idx);
                const isDuplicate = duplicates.includes(card.id || "");
                const isRare = ["legend", "special", "epic"].includes(card.rarity || "common");

                return (
                  <motion.div
                    key={card.id + idx}
                    initial={{ scale: 0, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, type: "spring" }}
                    className="relative w-[30%] md:w-[18%] aspect-[3/4] perspective-1000 cursor-pointer"
                    onClick={() => revealCard(idx)}
                  >
                    <motion.div
                      animate={{ rotateY: isRevealed ? 180 : 0 }}
                      transition={{ duration: 0.6, type: "spring" }}
                      className="w-full h-full relative preserve-3d"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Card Back */}
                      <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl border-2 border-white/10 flex items-center justify-center shadow-xl">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                          <Star className="w-6 h-6 text-white/20" />
                        </div>
                      </div>

                      {/* Card Front */}
                      <div 
                        className="absolute inset-0 backface-hidden rotate-y-180"
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                      >
                        <div className="relative w-full h-full group">
                          {isRare && isRevealed && (
                            <div className="absolute -inset-4 pointer-events-none z-0">
                              <div className="absolute inset-0 bg-yellow-500/30 blur-xl animate-pulse rounded-full" />
                            </div>
                          )}
                          
                          <Card 
                            card={card} 
                            isPlaced={false} 
                            disableAnimations 
                            className="w-full h-full !max-w-none !max-h-none"
                          />

                          {/* Duplicate Stamp */}
                          {isDuplicate && isRevealed && (
                            <motion.div
                              initial={{ scale: 2, opacity: 0, rotate: -15 }}
                              animate={{ scale: 1, opacity: 1, rotate: -15 }}
                              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                            >
                              <div className="border-4 border-red-500/80 text-red-500/80 px-4 py-2 rounded-lg font-black text-xl md:text-3xl uppercase tracking-widest shadow-lg backdrop-blur-sm bg-black/20 whitespace-nowrap">
                                {t.shop.duplicate}
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

            {showSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 flex flex-col items-center gap-4"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-black text-white uppercase italic">{t.shop.packOpenedTitle}</h3>
                  {coinsGained > 0 && (
                    <p className="text-yellow-500 font-bold mt-2">
                      {t.shop.coinsFromDuplicates.replace("{count}", coinsGained.toString())}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="px-12 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105 transition-all"
                >
                  {t.shop.continue}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
