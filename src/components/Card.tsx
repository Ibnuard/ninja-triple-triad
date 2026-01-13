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
  hideStats?: boolean;
  isDragging?: boolean;
  isGhost?: boolean;
  disableAnimations?: boolean;
  isHidden?: boolean;
  className?: string;
}

const elementGlows: Record<string, string> = {
  fire: "border-red-500/50",
  water: "border-blue-500/50",
  earth: "border-amber-800/50",
  wind: "border-emerald-500/50",
  lightning: "border-yellow-400/50",
  none: "border-gray-500/50",
};

const rarityStyles: Record<string, string> = {
  common: "border-gray-500/50",
  rare: "border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]",
  epic: "border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]",
  legend: "animate-rainbow-border shadow-[0_0_15px_rgba(255,255,255,0.3)]",
  special: "border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]",
};

export const Card = ({
  card,
  owner,
  onClick,
  isSelected,
  isPlaced,
  isColorful,
  hideStats,
  isDragging,
  isGhost,
  disableAnimations,
  isHidden,
  className,
}: CardProps) => {
  const rarity = card.rarity || "common";
  const rarityStyle = rarityStyles[rarity];

  return (
    <motion.div
      className={cn(
        "relative aspect-[2.5/3.5] rounded-xl lg:rounded-2xl cursor-pointer overflow-hidden",
        isPlaced ? "border-4" : "border-2",
        !isDragging && "transition-all duration-500",
        isPlaced
          ? "w-full h-full"
          : "w-[18vw] h-[25vw] max-w-[100px] max-h-[140px] lg:w-24 lg:h-32",
        isSelected
          ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-black z-20 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          : !isGhost && "hover:shadow-2xl hover:-translate-y-1",
        // Rarity Border
        rarityStyle,
        // Owner Glow (if placed)
        isPlaced &&
          (owner === "player1"
            ? "shadow-[0_0_20px_rgba(59,130,246,0.6)]"
            : "shadow-[0_0_20px_rgba(239,68,68,0.6)]"),

        // Owner Border Override (Stronger visibility)
        isPlaced && owner === "player1" && "border-blue-500",
        isPlaced && owner === "player2" && "border-red-500",

        // Background
        "bg-gray-900/95",
        isGhost &&
          "opacity-40 grayscale-[0.2] border-dashed border-blue-400/50",
        isDragging && "z-[1000] rotate-2 shadow-2xl pointer-events-none",
        className
      )}
      onClick={onClick}
      initial={disableAnimations ? false : { opacity: 0, scale: 0.8 }}
      animate={disableAnimations ? false : { opacity: 1, scale: 1 }}
      whileHover={disableAnimations ? undefined : { scale: 1.05 }}
      whileTap={disableAnimations ? undefined : { scale: 0.95 }}
      whileDrag={{
        scale: 1.1,
        zIndex: 100,
        pointerEvents: "none", // CRITICAL: Allow elementFromPoint to see through
      }}
      {...((card as any).dragProps || {})}
    >
      {/* Background Pattern / Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

      {/* HIDDEN / CARD BACK STATE */}
      {isHidden && (
        <div className="absolute inset-0 z-[20] bg-gray-950 border border-white/10 flex items-center justify-center bg-[url('/images/card-back.png')] bg-cover bg-center">
          {/* Fallback pattern if image fails or isn't there */}
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black opacity-90 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-red-900/50 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-red-500/20 bg-red-500/10" />
            </div>
          </div>
        </div>
      )}

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

      {/* STATS AREA: Diamond Grid */}
      <div className="absolute top-1 left-1 lg:top-1.5 lg:left-1.5 z-10 flex flex-col items-start select-none">
        <div className="grid grid-cols-3 grid-rows-3 gap-0 items-center justify-items-center font-luckiest text-[14px] lg:text-[16px] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,1)] filter text-stroke">
          {/* Top: Genjutsu (Top) */}
          <div
            className={cn(
              "col-start-2 row-start-1 flex items-center justify-center relative",
              card.stats.top > card.baseStats.top
                ? "text-green-400"
                : card.stats.top < card.baseStats.top
                ? "text-red-400"
                : "text-gray-100",
              isColorful ? "text-blue-500" : ""
            )}
          >
            {hideStats ? "?" : card.stats.top}
            {!hideStats && card.stats.top > card.baseStats.top && (
              <span className="absolute -right-1.5 -top-0.5 text-[8px] text-green-400">
                ▲
              </span>
            )}
            {!hideStats && card.stats.top < card.baseStats.top && (
              <span className="absolute -right-1.5 -top-0.5 text-[8px] text-red-400">
                ▼
              </span>
            )}
          </div>

          {/* Left: Ninjutsu (Left) */}
          <div
            className={cn(
              "col-start-1 row-start-2 flex items-center justify-center relative",
              card.stats.left > card.baseStats.left
                ? "text-green-400"
                : card.stats.left < card.baseStats.left
                ? "text-red-400"
                : "text-gray-100",
              isColorful ? "text-yellow-500" : ""
            )}
          >
            {hideStats ? "?" : card.stats.left}
            {!hideStats && card.stats.left > card.baseStats.left && (
              <span className="absolute -left-1.5 -top-0.5 text-[8px] text-green-400">
                ▲
              </span>
            )}
            {!hideStats && card.stats.left < card.baseStats.left && (
              <span className="absolute -left-1.5 -top-0.5 text-[8px] text-red-400">
                ▼
              </span>
            )}
          </div>

          {/* Right: Taijutsu (Right) */}
          <div
            className={cn(
              "col-start-3 row-start-2 flex items-center justify-center relative",
              card.stats.right > card.baseStats.right
                ? "text-green-400"
                : card.stats.right < card.baseStats.right
                ? "text-red-400"
                : "text-gray-100",
              isColorful ? "text-red-500" : ""
            )}
          >
            {hideStats ? "?" : card.stats.right}
            {!hideStats && card.stats.right > card.baseStats.right && (
              <span className="absolute -right-1.5 -top-0.5 text-[8px] text-green-400">
                ▲
              </span>
            )}
            {!hideStats && card.stats.right < card.baseStats.right && (
              <span className="absolute -right-1.5 -top-0.5 text-[8px] text-red-400">
                ▼
              </span>
            )}
          </div>

          {/* Bottom: Chakra (Bottom) */}
          <div
            className={cn(
              "col-start-2 row-start-3 flex items-center justify-center relative",
              card.stats.bottom > card.baseStats.bottom
                ? "text-green-400"
                : card.stats.bottom < card.baseStats.bottom
                ? "text-red-400"
                : "text-gray-100",
              isColorful ? "text-green-500" : ""
            )}
          >
            {hideStats ? "?" : card.stats.bottom}
            {!hideStats && card.stats.bottom > card.baseStats.bottom && (
              <span className="absolute -right-1.5 -bottom-0.5 text-[8px] text-green-400">
                ▲
              </span>
            )}
            {!hideStats && card.stats.bottom < card.baseStats.bottom && (
              <span className="absolute -right-1.5 -bottom-0.5 text-[8px] text-red-400">
                ▼
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ELEMENT BADGE: Bottom Right Circle */}
      <div className="absolute bottom-0.5 right-0.5 lg:bottom-1 lg:right-1 z-10">
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
            "w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center border overflow-hidden bg-slate-900 shadow-sm",
            elementGlows[card.element] || "border-white/20"
          )}
        >
          {card.element !== "none" ? (
            <img
              src={`/images/${card.element}.webp`}
              alt={card.element}
              className="w-[70%] h-[70%] object-contain drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"
            />
          ) : (
            <span className="text-[10px] lg:text-sm font-black text-white drop-shadow-md">
              ?
            </span>
          )}
        </motion.div>
      </div>

      {/* Center Image Placeholder */}
      {/* Center Image Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-xl lg:rounded-2xl">
        <img
          src={card.image || "/images/dummy-ninja.webp"}
          alt={card.name}
          className="w-full h-full object-cover opacity-80"
        />
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
