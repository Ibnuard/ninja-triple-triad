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
  isColorful?: boolean;
}

const elementColors: Record<string, string> = {
  fire: "bg-red-500/20",
  water: "bg-blue-500/20",
  earth: "bg-amber-800/20",
  wind: "bg-emerald-500/20",
  lightning: "bg-yellow-400/20",
  none: "bg-gray-500/20",
};

export const Card = ({
  card,
  owner,
  onClick,
  isSelected,
  isPlaced,
  isColorful,
}: CardProps) => {
  return (
    <motion.div
      className={cn(
        "relative aspect-[2.5/3.5] rounded-xl lg:rounded-2xl transition-all duration-500 cursor-pointer overflow-hidden border-2",
        isPlaced
          ? "w-full h-full"
          : "w-[18vw] h-[25vw] max-w-[100px] max-h-[140px] lg:w-24 lg:h-32",
        isSelected
          ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-black scale-105 z-20 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          : "hover:shadow-2xl hover:-translate-y-1",
        owner === "player1"
          ? "border-blue-500/30 bg-gray-900/90"
          : "border-red-500/30 bg-gray-900/90"
      )}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background Pattern / Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

      {/* Owner Overlay (Visible when placed on board) */}
      {isPlaced && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-colors duration-500",
            owner === "player1"
              ? "bg-blue-600/10 shadow-[inset_0_0_40px_rgba(37,99,235,0.2)]"
              : "bg-red-600/10 shadow-[inset_0_0_40px_rgba(220,38,38,0.2)]"
          )}
        />
      )}

      {/* STATS AREA: Top Left Diamond Grid */}
      <div className="absolute top-2 left-2 lg:top-3 lg:left-3 z-10 flex flex-col items-start select-none">
        <div className="grid grid-cols-3 grid-rows-3 gap-0 lg:gap-0.5 items-center justify-items-center font-black text-[10px] lg:text-[12px] leading-none">
          {/* Top: Chakra */}
          <div
            className={cn(
              "col-start-2 row-start-1 flex items-center",
              card.stats.top > card.baseStats.top
                ? "text-green-400"
                : "text-gray-200",
              isColorful ? "text-blue-500" : ""
            )}
          >
            {card.stats.top}
            {card.stats.top > card.baseStats.top && (
              <span className="text-[8px] lg:text-[12px] ml-0.5">↑</span>
            )}
          </div>

          {/* Left: Jutsu */}
          <div
            className={cn(
              "col-start-1 row-start-2 flex items-center",
              card.stats.left > card.baseStats.left
                ? "text-green-400"
                : "text-gray-200",
              isColorful ? "text-yellow-500" : ""
            )}
          >
            {card.stats.left}
            {card.stats.left > card.baseStats.left && (
              <span className="text-[8px] lg:text-[12px] ml-0.5">↑</span>
            )}
          </div>

          {/* Right: ATK */}
          <div
            className={cn(
              "col-start-3 row-start-2 flex items-center",
              card.stats.right > card.baseStats.right
                ? "text-green-400"
                : "text-gray-200",
              isColorful ? "text-red-500" : ""
            )}
          >
            {card.stats.right}
            {card.stats.right > card.baseStats.right && (
              <span className="text-[8px] lg:text-[12px] ml-0.5">↑</span>
            )}
          </div>

          {/* Bottom: DEF */}
          <div
            className={cn(
              "col-start-2 row-start-3 flex items-center",
              card.stats.bottom > card.baseStats.bottom
                ? "text-green-400"
                : "text-gray-200",
              isColorful ? "text-green-500" : ""
            )}
          >
            {card.stats.bottom}
            {card.stats.bottom > card.baseStats.bottom && (
              <span className="text-[8px] lg:text-[12px] ml-0.5">↑</span>
            )}
          </div>
        </div>
      </div>

      {/* ELEMENT BADGE: Bottom Right Circle */}
      <div className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 z-10">
        <motion.div
          animate={
            card.activePassives && card.activePassives.length > 0
              ? {
                  scale: [1, 1.25, 1],
                  filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
                }
              : { scale: 1 }
          }
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={cn(
            "w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden",
            elementColors[card.element] || "bg-gray-500"
          )}
        >
          {card.element !== "none" ? (
            <img
              src={`/images/${card.element}.webp`}
              alt={card.element}
              className="w-[60%] h-[60%] object-contain drop-shadow-md"
            />
          ) : (
            <span className="text-[10px] lg:text-sm font-black text-white drop-shadow-md">
              ?
            </span>
          )}
        </motion.div>
      </div>

      {/* Center Image Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <span className="text-3xl lg:text-5xl">🥷</span>
      </div>

      {/* Card Name / Footer */}
      {/* <div className="absolute bottom-0 left-0 right-0 p-1.5 lg:p-2 bg-gradient-to-t from-black via-black/40 to-transparent">
        <p className="text-[8px] lg:text-[10px] font-bold text-white/80 truncate tracking-widest uppercase text-center">
          {card.name}
        </p>
      </div> */}
    </motion.div>
  );
};
