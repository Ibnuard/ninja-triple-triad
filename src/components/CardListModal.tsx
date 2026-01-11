"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Info } from "lucide-react";
import { Card } from "./Card";
import { CARD_POOL } from "../data/cardPool";
import { useTranslation } from "../store/useSettingsStore";
import { cn } from "../lib/utils";

interface CardListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CardListModal({ isOpen, onClose }: CardListModalProps) {
  const t = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-6xl h-full max-h-[90vh] flex flex-col bg-gray-900/50 border border-white/10 rounded-[2.5rem] overflow-hidden relative shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 md:p-6 flex items-center justify-between gap-4 border-b border-white/5 bg-white/5">
              <div>
                <h2 className="text-red-500 text-[10px] font-black tracking-[0.4em] mb-0.5 uppercase italic">
                  NINJA ARCHIVE
                </h2>
                <h1 className="text-white text-xl md:text-2xl font-black italic uppercase tracking-tight">
                  {t.home.cardList}
                </h1>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Card Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-black/20">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {CARD_POOL.map((card, idx) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl p-3 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Left: Card Component */}
                    <div className="w-20 md:w-24 shrink-0 scale-[0.8] md:scale-[0.9] origin-left -my-2">
                      <Card card={card} isPlaced={false} />
                    </div>

                    {/* Right: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${
                          card.element === 'fire' ? 'bg-red-500' :
                          card.element === 'water' ? 'bg-blue-500' :
                          card.element === 'earth' ? 'bg-amber-700' :
                          card.element === 'wind' ? 'bg-green-500' :
                          card.element === 'lightning' ? 'bg-yellow-400' : 'bg-gray-400'
                        } shadow-[0_0_8px_currentColor]`} />
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">
                          {card.element}
                        </span>
                        
                        <div className="h-3 w-px bg-white/10 mx-1" />

                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border italic",
                          card.rarity === 'common' && "text-gray-400 border-gray-500/30 bg-gray-500/10",
                          card.rarity === 'rare' && "text-orange-400 border-orange-500/30 bg-orange-500/10",
                          card.rarity === 'epic' && "text-purple-400 border-purple-500/30 bg-purple-500/10",
                          card.rarity === 'legend' && "text-white border-white/30 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 animate-pulse",
                          card.rarity === 'special' && "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
                          !card.rarity && "text-gray-400 border-gray-500/30 bg-gray-500/10"
                        )}>
                          {card.rarity || 'common'}
                        </span>
                      </div>
                      <h3 className="text-white text-sm md:text-base font-black italic uppercase truncate group-hover:text-red-500 transition-colors">
                        {card.name}
                      </h3>
                      
                      <div className="flex items-start gap-1.5 mt-0.5">
                        <Info className="w-2.5 h-2.5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-gray-400 text-[10px] leading-tight italic line-clamp-2">
                          {t.game.gauntlet.obtainDummy}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer Decoration */}
            <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
              <p className="text-[10px] text-gray-500 font-black italic uppercase tracking-[0.2em]">
                Total Cards: {CARD_POOL.length}
              </p>
              <div className="flex gap-2">
                {['fire', 'water', 'earth', 'wind', 'lightning'].map(el => (
                  <div key={el} className={`w-1.5 h-1.5 rounded-full bg-current opacity-20`} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
