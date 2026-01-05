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
  const [hoveredCard, setHoveredCard] = React.useState<CardType | null>(null);

  const isMyTurn = currentPlayerId === ownerId;

  return (
    <div
      className={cn(
        "flex items-center justify-center p-2 rounded-xl transition-colors duration-300 relative w-full", // Added w-full
        orientation === "vertical" ? "flex-col gap-2 h-full" : "flex-row gap-2", // Added h-full for vertical to be safe
        isMyTurn && !isHidden && "bg-white/5 border border-white/10" // Only highlight normal hand
      )}
    >
      {/* Tooltip for Vertical Orientation (Desktop) */}
      {hoveredCard && orientation === "vertical" && !isHidden && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          className="absolute left-full ml-4 z-50 pointer-events-none"
        >
          <div className="bg-black/90 border border-white/20 p-2 rounded-xl shadow-2xl relative">
            {/* Arrow */}
            <div className="absolute top-1/2 -left-2 w-4 h-4 bg-black/90 border-l border-b border-white/20 transform rotate-45 -translate-y-1/2" />

            <div className="flex flex-col items-center">
              <div className="text-xs text-blue-400 font-bold mb-1 uppercase tracking-wider">
                Preview
              </div>
              <Card
                card={hoveredCard}
                owner={ownerId} // Preview with owner color
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Label: Always show owner ID styled nicely */}
      <div
        className={cn(
          "font-bold uppercase tracking-widest text-shadow mb-2",
          compact ? "text-xs" : "text-sm md:text-lg",
          orientation === "horizontal" && "md:writing-mode-horizontal",
          ownerId === "player1" ? "text-blue-400" : "text-red-400"
        )}
      >
        {ownerId === "player1" ? "YOU" : "COMPUTER"}
      </div>

      <div
        className={cn(
          "flex relative justify-center",
          orientation === "vertical" ? "flex-col -space-y-12" : "flex-row gap-1" // Use Gap for top row instead of overlap? User sketch shows gaps.
        )}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className={cn(
              "relative transition-all",
              compact && "scale-75 origin-center",
              isHidden &&
                "w-10 h-14 md:w-16 md:h-24 bg-gray-800 rounded border border-white/20" // Placeholder for back
            )}
            style={
              {
                // No z-index logic needed if not overlapping
              }
            }
            onMouseEnter={() => setHoveredCard(card)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {isHidden ? (
              // Card Back
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <div className="w-1/2 h-1/2 border border-white/10 rounded-sm" />
              </div>
            ) : (
              <Card
                card={card}
                owner={ownerId === "player1" ? "player1" : "player2"}
                onClick={() => isCurrentPlayer && selectCard(card.id)}
                isSelected={selectedCardId === card.id}
              />
            )}
          </motion.div>
        ))}
        {cards.length === 0 && (
          <div className="text-white/30 italic text-xs">Empty</div>
        )}
      </div>
    </div>
  );
};
