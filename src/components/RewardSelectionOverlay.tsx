"use client";

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
  onSelect: (card: CardType) => void;
  onCancel: () => void;
}

export function RewardSelectionOverlay({
  isOpen,
  title,
  subtitle,
  cards,
  onSelect,
  onCancel,
}: RewardSelectionOverlayProps) {
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
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      card={card}
                      onClick={() => onSelect(card)}
                      isPlaced={false}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer Decoration */}
            <div className="h-2 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
