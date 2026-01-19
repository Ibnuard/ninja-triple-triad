"use client";

import { motion } from "framer-motion";
import { X, ChevronLeft, Layers } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Card } from "../../../components/Card";
import { Card as CardType } from "../../../types/game";

interface DeckSelectionViewProps {
  t: any;
  tempDeck: CardType[];
  cardPool: CardType[];
  onToggleCard: (card: CardType) => void;
  onSaveDeck: () => void;
  onCancelSelection: () => void;
}

export function DeckSelectionView({
  t,
  tempDeck,
  cardPool,
  onToggleCard,
  onSaveDeck,
  onCancelSelection,
}: DeckSelectionViewProps) {
  // Safe access for nested properties in case translation structure varies
  const gauntletT = t.modes?.gauntlet?.submenu || {};
  const title = t.modes?.gauntlet?.submenu?.selectCards || "Select 5 Cards";
  const cancelText = t.modes?.gauntlet?.submenu?.cancel || "Cancel";
  const saveText = t.modes?.gauntlet?.submenu?.saveDeck || "Save Deck";

  return (
    <div className="flex flex-col h-full relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black italic uppercase text-white">
          {title}
        </h3>
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "text-xl font-black",
              tempDeck.length === 5 ? "text-green-400" : "text-yellow-400"
            )}
          >
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

      {/* Card Grid */}
      <div className="flex-1 overflow-y-auto pr-2 min-h-[400px] max-h-[500px] custom-scrollbar">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 px-2 pb-2 pt-8">
          {cardPool.map((card) => {
            const isSelected = tempDeck.some((c) => c.id === card.id);
            const selectionIndex = tempDeck.findIndex((c) => c.id === card.id);

            return (
              <div key={card.id} className="relative group flex justify-center">
                <div
                  className={cn(
                    "transform transition-all duration-300",
                    isSelected ? "z-20" : "hover:scale-110 hover:z-10",
                    // Dim unselected cards if deck is full
                    !isSelected &&
                      tempDeck.length === 5 &&
                      "opacity-50 grayscale-[0.5] scale-95"
                  )}
                >
                  <Card
                    card={card}
                    onClick={() => onToggleCard(card)}
                    isSelected={isSelected}
                    isPlaced={false}
                  />
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg rotate-3 flex items-center justify-center text-white font-black text-sm z-30 shadow-[0_0_15px_rgba(34,197,94,0.6)] border-2 border-white/20"
                  >
                    {selectionIndex + 1}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-6 flex justify-end gap-4 border-t border-white/10 pt-4">
        <button
          onClick={onCancelSelection}
          className="px-6 py-2 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          {cancelText}
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
          {saveText}
        </button>
      </div>
    </div>
  );
}
