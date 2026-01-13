"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Card } from "./Card";
import { Card as CardType } from "../types/game";
import { cn } from "../lib/utils";

interface RewardSelectionOverlayProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  cards: CardType[];
  onSelect: (cards: CardType[]) => void;
  onCancel: () => void;
  isHidden?: boolean;
  maxSelect?: number;
}

export function RewardSelectionOverlay({
  isOpen,
  title,
  subtitle,
  cards,
  onSelect,
  onCancel,
  isHidden,
  maxSelect = 1,
}: RewardSelectionOverlayProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
    }
  }, [isOpen]);

  const handleCardClick = (card: CardType) => {
    if (maxSelect === 1) {
      onSelect([card]);
      return;
    }

    setSelectedIds((prev) => {
      if (prev.includes(card.id)) {
        return prev.filter((id) => id !== card.id);
      }
      if (prev.length < maxSelect) {
        return [...prev, card.id];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    const selectedCards = cards.filter((c) => selectedIds.includes(c.id));
    onSelect(selectedCards);
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-5xl h-full max-h-[90vh] flex flex-col bg-gray-900/50 border border-white/10 rounded-[2.5rem] overflow-hidden relative"
          >
            {/* Header */}
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5">
              <div className="text-left">
                <h2 className="text-gray-500 text-[10px] md:text-xs font-black tracking-[0.4em] mb-1 uppercase italic">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-white text-sm md:text-xl font-black italic uppercase tracking-tight">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Card Grid */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 justify-items-center">
                {cards.map((card) => {
                  const isSelected = selectedIds.includes(card.id);
                  const selectionIndex = selectedIds.indexOf(card.id);

                  return (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <Card
                        card={card}
                        onClick={() => handleCardClick(card)}
                        isPlaced={false}
                        isHidden={isHidden}
                        isSelected={isSelected}
                      />
                      {isSelected && maxSelect > 1 && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg rotate-3 flex items-center justify-center text-white font-black text-sm z-30 shadow-[0_0_15px_rgba(59,130,246,0.6)] border-2 border-white/20"
                        >
                          {selectionIndex + 1}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer / Confirm Button */}
            <div className="p-6 border-t border-white/5 flex justify-end gap-4 bg-black/20">
              {maxSelect > 1 && (
                <button
                  onClick={handleConfirm}
                  disabled={selectedIds.length !== maxSelect}
                  className={cn(
                    "px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all",
                    selectedIds.length === maxSelect
                      ? "bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  )}
                >
                  Konfirmasi ({selectedIds.length}/{maxSelect})
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
