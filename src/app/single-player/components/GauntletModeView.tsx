"use client";

import { motion } from "framer-motion";
import { Swords, BookOpen, ChevronLeft, Layers, Trophy, Skull, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Card } from "../../../components/Card";
import { Card as CardType } from "../../../types/game";

interface GauntletModeViewProps {
  t: any;
  selectedDeck: CardType[];
  tempDeck: CardType[];
  showDeckSelection: boolean;
  isDeckComplete: () => boolean;
  lastRunScore: number;
  lastBoss: string;
  cardPool: CardType[];
  onStartGauntlet: () => void;
  onManageDeck: () => void;
  onToggleCard: (card: CardType) => void;
  onSaveDeck: () => void;
  onCancelSelection: () => void;
}

export function GauntletModeView({
  t,
  selectedDeck,
  tempDeck,
  showDeckSelection,
  isDeckComplete,
  lastRunScore,
  lastBoss,
  cardPool,
  onStartGauntlet,
  onManageDeck,
  onToggleCard,
  onSaveDeck,
  onCancelSelection,
}: GauntletModeViewProps) {
  return (
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
                onClick={onStartGauntlet}
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
                onClick={onManageDeck}
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
                  onClick={onCancelSelection}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 min-h-[400px] max-h-[500px] custom-scrollbar">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 p-2">
              {cardPool.map((card) => {
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
                        onClick={() => onToggleCard(card)}
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
              onClick={onCancelSelection}
              className="px-6 py-2 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {t.modes.gauntlet.submenu.cancel}
            </button>
            <button
              onClick={onSaveDeck}
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
  );
}
