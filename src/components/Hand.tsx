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
        "flex flex-col items-center gap-1 lg:gap-4 transition-all duration-300 w-full scale-90 sm:scale-100 origin-center",
        isHidden && "opacity-80"
      )}
    >
      {/* Label: Outside the card container now */}
      <div
        className={cn(
          "font-black uppercase tracking-[0.2em] text-shadow-sm px-4 py-1 rounded-full border bg-black/40 backdrop-blur-sm shadow-xl transition-all",
          "hidden lg:block", // Hide on mobile for both players
          compact ? "text-[10px]" : "text-xs lg:text-sm",
          ownerId === "player1"
            ? "text-blue-400 border-blue-500/30 shadow-blue-900/20"
            : "text-red-400 border-red-500/30 shadow-red-900/20",
          isMyTurn && "scale-105 border-opacity-80 animate-pulse"
        )}
      >
        {ownerId === "player1" ? "YOU" : "COMPUTER"}
      </div>

      {/* Card Container */}
      <div
        className={cn(
          "flex items-center justify-center p-2 lg:p-4 rounded-2xl transition-all duration-500 relative w-full",
          orientation === "vertical"
            ? "bg-black/20 border border-white/5 shadow-inner" // Simpler background for grid
            : isMyTurn && !isHidden
            ? "bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)]"
            : "bg-black/40 border border-white/5 shadow-inner",
          !isMyTurn && "scale-90 lg:scale-100 origin-center",
          isMyTurn && "scale-100 origin-center"
        )}
      >
        <div
          className={cn(
            "transition-all duration-500",
            orientation === "vertical"
              ? "grid grid-cols-2 gap-2 lg:gap-3 p-2" // 2-column grid for vertical
              : "flex flex-row -space-x-2 lg:space-x-4 lg:space-x-6 items-center justify-center" // Horizontal layout
          )}
        >
          {cards.map((card, index) => {
            const isSelected = selectedCardId === card.id;
            return (
              <motion.div
                key={card.id}
                className={cn(
                  "relative", // Removed transition-all duration-300 to avoid conflict
                  compact && "scale-90 origin-center",
                  orientation === "horizontal" && isSelected && "scale-110 z-20 mx-2",
                  "cursor-pointer"
                )}
                whileHover={
                  orientation === "horizontal"
                    ? { scale: 1.2, zIndex: 50, margin: "0 1.5rem" }
                    : { scale: 1.1, zIndex: 50 }
                }
                transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.8 }}
                style={{ zIndex: isSelected ? 50 : index }}
              >
                {isHidden ? (
                  // Card Back (Modernized)
                  <div className="w-[12vw] h-[17vw] max-w-[70px] max-h-[100px] lg:w-20 lg:h-28 rounded-lg border border-white/10 shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-gray-800 to-gray-950" />
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border border-white/10 flex items-center justify-center">
                        <span className="text-white/20 text-[10px] lg:text-xs">?</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Card
                    card={card}
                    owner={ownerId}
                    onClick={() => isMyTurn && selectCard(card.id)}
                    isSelected={isSelected}
                    isPlaced={false}
                  />
                )}
              </motion.div>
            );
          })}

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
