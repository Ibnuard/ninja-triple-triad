"use client";

import { motion } from "framer-motion";
import { Card as CardType } from "../types/game";
import { cn } from "../lib/utils"; // Assuming you have this helper

interface CardProps {
  card: CardType;
  owner?: "player1" | "player2";
  onClick?: () => void;
  isSelected?: boolean;
  isPlaced?: boolean;
}

export const Card = ({
  card,
  owner,
  onClick,
  isSelected,
  isPlaced,
}: CardProps) => {
  return (
    <motion.div
      // layoutId removed to prevent flash/disappear issues during debugging
      className={cn(
        "relative w-20 h-28 md:w-24 md:h-32 rounded-lg shadow-lg cursor-pointer transform transition-all duration-200 border-2 select-none overflow-hidden bg-gray-800", // Reduced size slightly
        isSelected
          ? "ring-4 ring-yellow-400 -translate-y-4 z-10"
          : "hover:-translate-y-1",
        owner === "player1"
          ? "bg-blue-900 border-blue-400"
          : owner === "player2"
          ? "bg-red-900 border-red-400"
          : "bg-gray-800 border-gray-600"
      )}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background Pattern (Ninja Theme Placeholder) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      />

      {/* Element Icon */}
      {card.element !== "none" && (
        <div className="absolute top-1 right-1 text-xs font-bold uppercase text-white/50 bg-black/30 px-1 rounded">
          {card.element}
        </div>
      )}

      {/* Stats */}
      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-white text-sm md:text-base font-bold pointer-events-none drop-shadow-md">
        <div className="absolute top-2">{card.stats.top}</div>
        <div className="flex w-full justify-between px-2 md:px-4">
          <span>{card.stats.left}</span>
          <span>{card.stats.right}</span>
        </div>
        <div className="absolute bottom-2">{card.stats.bottom}</div>
      </div>

      {/* Image / Name */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        {/* Placeholder for card art */}
        <span className="text-4xl">🥷</span>
      </div>

      <div className="absolute bottom-6 w-full text-center text-xs text-white/70 font-semibold truncate px-1">
        {card.name}
      </div>

      {/* Owner Indicator Overlay (For Board) */}
      <div
        className={cn(
          "absolute inset-0 border-4 rounded-lg transition-colors duration-300 pointer-events-none",
          owner === "player1"
            ? "border-blue-500/50"
            : owner === "player2"
            ? "border-red-500/50"
            : "border-transparent"
        )}
      />
    </motion.div>
  );
};
