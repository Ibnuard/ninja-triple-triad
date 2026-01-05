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
        "flex flex-col items-center gap-1 xl:gap-4 transition-all duration-300 w-full",
        isHidden && "opacity-80"
      )}
    >
      {/* Label: Outside the card container now */}
      <div
        className={cn(
          "font-black uppercase tracking-[0.2em] text-shadow-sm px-4 py-1 rounded-full border bg-black/40 backdrop-blur-sm shadow-xl transition-all",
          "hidden xl:block", // Hide on mobile for both players
          compact ? "text-[10px]" : "text-xs xl:text-sm",
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
          "flex items-center justify-center p-2 xl:p-6 rounded-2xl transition-all duration-500 relative w-full",
          orientation === "vertical"
            ? "flex-col gap-3 h-full"
            : "flex-row gap-1 xl:gap-6",
          // Modern Glassmorphism Styling
          isMyTurn && !isHidden
            ? "bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)]"
            : "bg-black/40 border border-white/5 shadow-inner",
          !isMyTurn && "scale-90 xl:scale-100 origin-center", // Less aggressive shrink
          isMyTurn && "scale-100 origin-center"
        )}
      >
        <div
          className={cn(
            "flex relative justify-center items-center transition-all duration-500",
            orientation === "vertical"
              ? "flex-col -space-y-12 xl:-space-y-16 hover:-space-y-8 xl:hover:-space-y-12 py-4" // Adjusted stacking
              : "flex-row -space-x-2 xl:space-x-4 lg:space-x-6" // Stack horizontally on mobile
          )}
        >
          {cards.map((card, index) => {
            const isSelected = selectedCardId === card.id;
            return (
              <motion.div
                key={card.id}
                className={cn(
                  "relative transition-all duration-300",
                  compact && "scale-90 origin-center",
                  // Stagger animations or hover lifts handled by Card component
                  orientation === "vertical" &&
                    "hover:z-10 hover:scale-110 hover:!my-2 xl:hover:!my-4 cursor-pointer",
                  orientation === "horizontal" &&
                    "hover:z-10 hover:scale-110 hover:!mx-2 cursor-pointer",
                  // Expansion for selected card in horizontal (mobile)
                  orientation === "horizontal" && isSelected && "scale-110 z-20 mx-2"
                )}
                style={{ zIndex: isSelected ? 50 : index }}
              >
                {isHidden ? (
                  // Card Back (Modernized)
                  <div className="w-[14vw] h-[20vw] max-w-[80px] max-h-[110px] xl:w-20 xl:h-28 rounded-lg border border-white/10 shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-gray-800 to-gray-950" />
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 xl:w-8 xl:h-8 rounded-full border border-white/10 flex items-center justify-center">
                        <span className="text-white/20 text-[10px] xl:text-xs">?</span>
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
