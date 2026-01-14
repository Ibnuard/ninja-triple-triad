"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Search, Save } from "lucide-react";
import { Card } from "./Card";
import { Card as CardType } from "../types/game";
import { cn } from "../lib/utils";
import { useState } from "react";

interface DeckSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardType[];
  selectedCards: CardType[];
  onToggleCard: (card: CardType) => void;
  maxSelection?: number;
  onSave: () => void;
}

export function DeckSelectionModal({
  isOpen,
  onClose,
  cards,
  selectedCards,
  onToggleCard,
  maxSelection = 5,
  onSave,
}: DeckSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCards = cards.filter((card) =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-blue-500 text-[10px] font-black tracking-[0.4em] mb-0.5 uppercase italic">
                    DECK BUILDER
                  </h2>
                  <h1 className="text-white text-xl md:text-2xl font-black italic uppercase tracking-tight">
                    SELECT {maxSelection} CARDS
                  </h1>
                </div>

                {/* Counter */}
                <div
                  className={cn(
                    "px-4 py-2 rounded-xl border flex items-center gap-2",
                    selectedCards.length === maxSelection
                      ? "bg-green-500/20 border-green-500/50 text-green-400"
                      : "bg-white/5 border-white/10 text-gray-400"
                  )}
                >
                  <span className="text-xl font-black">
                    {selectedCards.length}
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider">
                    / {maxSelection}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30 w-full md:w-64 transition-all"
                  />
                </div>

                <button
                  onClick={onSave}
                  disabled={selectedCards.length !== maxSelection}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-xl font-bold uppercase tracking-wider text-sm transition-all",
                    selectedCards.length === maxSelection
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95"
                      : "bg-white/5 text-gray-500 cursor-not-allowed"
                  )}
                >
                  <Save className="w-4 h-4" />
                  Save Deck
                </button>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-black/20">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredCards.map((card) => {
                  const isSelected = selectedCards.some(
                    (c) => c.id === card.id
                  );
                  return (
                    <div
                      key={card.id}
                      onClick={() => onToggleCard(card)}
                      className={cn(
                        "group relative rounded-xl p-3 border transition-all duration-200 cursor-pointer overflow-hidden",
                        isSelected
                          ? "bg-blue-500/20 border-blue-500/50 scale-[0.98]"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]"
                      )}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 md:w-20 shrink-0">
                          <Card
                            card={card}
                            isPlaced={false}
                            disableAnimations
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={cn(
                              "font-black italic uppercase text-sm truncate transition-colors",
                              isSelected
                                ? "text-blue-400"
                                : "text-white group-hover:text-blue-400"
                            )}
                          >
                            {card.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                `text-${
                                  card.element === "fire"
                                    ? "red"
                                    : card.element === "water"
                                    ? "blue"
                                    : "gray"
                                }-400 border-white/10`
                              )}
                            >
                              {card.element}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase">
                              {card.rarity}
                            </span>
                          </div>
                        </div>

                        {/* Checkbox Indicator */}
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "border-white/20 group-hover:border-white/40"
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
