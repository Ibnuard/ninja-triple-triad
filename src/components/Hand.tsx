"use client";

import { motion } from "framer-motion";
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
        "flex items-center justify-center p-2 rounded-xl transition-colors duration-300",
        orientation === "vertical" ? "flex-col gap-2" : "flex-row gap-2",
        isMyTurn && !isHidden && "bg-white/5 border border-white/10" // Only highlight normal hand
      )}
    >
      {/* Hide label if hidden/compact mode? Or keep it small? */}
      {!isHidden && (
        <h3
          className={cn(
            "font-bold uppercase tracking-widest text-shadow",
            compact ? "text-xs" : "text-sm md:text-lg",
            orientation === "horizontal" && "md:writing-mode-horizontal",
            ownerId === "player1" ? "text-blue-400" : "text-red-400"
          )}
        >
          {ownerId === "player1" ? "YOU" : "COM"}
        </h3>
      )}

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
