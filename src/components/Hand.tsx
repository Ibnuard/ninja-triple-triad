"use client";

import { motion } from "framer-motion";
import React from "react";
import { Card as CardType } from "../types/game";
import { Card } from "./Card";
import { useGameStore } from "../store/useGameStore";
import { cn } from "../lib/utils";

interface HandProps {
  cards: CardType[];
  ownerId: "player1" | "player2";
  isCurrentPlayer: boolean;
  orientation?: "horizontal" | "vertical"; // New prop
  compact?: boolean; // New prop for visual scaling
  isHidden?: boolean; // New prop
}

export const Hand = ({
  cards,
  ownerId,
  isCurrentPlayer,
  orientation = "vertical",
  compact = false,
  isHidden = false,
}: HandProps) => {
  const { selectCard, selectedCardId, currentPlayerId } = useGameStore();

  const isMyTurn = currentPlayerId === ownerId;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 md:gap-4 transition-all duration-300 w-full",
        isHidden && "opacity-80"
      )}
    >
      {/* Label: Outside the card container now */}
      <div
        className={cn(
          "font-black uppercase tracking-[0.2em] text-shadow-sm px-4 py-1 rounded-full border bg-black/40 backdrop-blur-sm shadow-xl transition-all",
          compact ? "text-[10px]" : "text-xs md:text-sm",
          ownerId === "player1"
            ? "text-blue-400 border-blue-500/30 shadow-blue-900/20"
            : "text-red-400 border-red-500/30 shadow-red-900/20",
          isMyTurn && "scale-105 border-opacity-80 animate-pulse",
          !isMyTurn && "hidden md:block" // Hide on mobile if not my turn
        )}
      >
        {ownerId === "player1" ? "YOU" : "COMPUTER"}
      </div>

      {/* Card Container */}
      <div
        className={cn(
          "flex items-center justify-center p-3 md:p-6 rounded-2xl transition-all duration-500 relative w-full",
          orientation === "vertical"
            ? "flex-col gap-3 h-full"
            : "flex-row gap-3 md:gap-6",
          // Modern Glassmorphism Styling
          isMyTurn && !isHidden
            ? "bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)]"
            : "bg-black/40 border border-white/5 shadow-inner",
          !isMyTurn && "scale-[0.6] md:scale-100 origin-center", // Shrink on mobile if not my turn
          isMyTurn && "scale-[0.8] md:scale-100 origin-center" // Slightly shrink active hand on mobile
        )}
      >
        <div
          className={cn(
            "flex relative justify-center items-center transition-all duration-500",
            orientation === "vertical"
              ? "flex-col -space-y-16 hover:-space-y-12 py-4" // Hover effect to expand stack!
              : "flex-row gap-2 md:gap-4 lg:gap-6"
          )}
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className={cn(
                "relative transition-all duration-300",
                compact && "scale-90 origin-center",
                // Stagger animations or hover lifts handled by Card component
                orientation === "vertical" &&
                  "hover:z-10 hover:scale-110 hover:!my-4 cursor-pointer" // Vertical stack interaction
              )}
              style={{ zIndex: index }}
            >
              {isHidden ? (
                // Card Back (Modernized)
                <div className="w-16 h-20 md:w-20 md:h-28 rounded-lg border border-white/10 shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-linear-to-br from-gray-800 to-gray-950" />
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                      <span className="text-white/20 text-xs">?</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Card
                  card={card}
                  owner={ownerId}
                  onClick={() => isMyTurn && selectCard(card.id)}
                  isSelected={selectedCardId === card.id}
                  isPlaced={false}
                />
              )}
            </motion.div>
          ))}

          {/* Empty Placeholder slots to maintain height/width? */}
          {cards.length === 0 && (
            <div className="text-white/20 text-xs uppercase tracking-widest py-8">
              Empty Hand
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
