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
        "relative rounded-lg shadow-lg cursor-pointer transform transition-all duration-200 border-2 select-none overflow-hidden bg-gray-800",
        isPlaced
          ? "w-full h-full"
          : "w-[18vw] h-[25vw] max-w-[100px] max-h-[140px] lg:w-24 lg:h-32",
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
        <div
          className={cn(
            "absolute top-1 right-1 text-[8px] lg:text-xs font-bold px-1.5 py-0.5 rounded shadow-sm z-20",
            card.element === "fire" && "bg-orange-600 text-white",
            card.element === "water" && "bg-blue-600 text-white",
            card.element === "earth" && "bg-amber-700 text-white",
            card.element === "wind" && "bg-slate-500 text-white",
            card.element === "lightning" && "bg-yellow-500 text-black"
          )}
        >
          {card.element.toUpperCase()}
        </div>
      )}

      {/* Stats with Labels and Buff Highlight */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center font-mono text-white font-black pointer-events-none drop-shadow-lg",
          isPlaced
            ? "text-xs lg:text-xl"
            : "text-[10px] sm:text-xs lg:text-base"
        )}
      >
        {/* Top: Chakra */}
        <div
          className={cn(
            "absolute flex flex-col items-center leading-none",
            isPlaced ? "top-2 lg:top-4" : "top-2 lg:top-3",
            card.isBuffed && "text-green-400"
          )}
        >
          <span className="text-[6px] lg:text-[10px] opacity-70 mb-0.5">
            CP
          </span>
          {card.stats.top}
        </div>

        {/* Middle: Jutsu (Left) and ATK (Right) */}
        <div
          className={cn(
            "flex w-full justify-between items-center",
            isPlaced ? "px-3 lg:px-8" : "px-2 lg:px-6"
          )}
        >
          <div
            className={cn(
              "flex flex-col items-center leading-none",
              card.isBuffed && "text-green-400"
            )}
          >
            <span className="text-[6px] lg:text-[10px] opacity-70 mb-0.5">
              JT
            </span>
            {card.stats.left}
          </div>
          <div
            className={cn(
              "flex flex-col items-center leading-none",
              card.isBuffed && "text-green-400"
            )}
          >
            <span className="text-[6px] lg:text-[10px] opacity-70 mb-0.5">
              ATK
            </span>
            {card.stats.right}
          </div>
        </div>

        {/* Bottom: DEF */}
        <div
          className={cn(
            "absolute flex flex-col items-center leading-none",
            isPlaced ? "bottom-2 lg:bottom-4" : "bottom-2 lg:bottom-3",
            card.isBuffed && "text-green-400"
          )}
        >
          {card.stats.bottom}
          <span className="text-[6px] lg:text-[10px] opacity-70 mt-0.5">
            DF
          </span>
        </div>
      </div>

      {/* Active Passives Indicator */}
      {card.activePassives && card.activePassives.length > 0 && (
        <div className="absolute bottom-1 right-1 flex gap-1">
          {card.activePassives.map((p) => (
            <div
              key={p}
              className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"
              title={`Passive Active: ${p}`}
            />
          ))}
        </div>
      )}

      {/* Image / Name */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        {/* Placeholder for card art */}
        <span className="text-2xl lg:text-4xl">🥷</span>
      </div>

      <div className="absolute bottom-1 lg:bottom-2 w-full text-center text-[6px] lg:text-[10px] text-white/40 font-bold uppercase tracking-tighter truncate px-1">
        {card.name}
      </div>

      {/* Owner Indicator Overlay */}
      <div
        className={cn(
          "absolute inset-0 border-2 lg:border-4 rounded-lg transition-colors duration-300 pointer-events-none",
          owner === "player1"
            ? "border-blue-500/30"
            : owner === "player2"
            ? "border-red-500/30"
            : "border-transparent"
        )}
      />
    </motion.div>
  );
};
