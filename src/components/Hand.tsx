"use client";

import { motion } from "framer-motion";
import React from "react";
import { Trophy } from "lucide-react";
import { Card as CardType } from "../types/game";
import { Card } from "./Card";
import { useGameStore } from "../store/useGameStore";
import { cn } from "../lib/utils";

import { useTranslation } from "../store/useSettingsStore";

interface HandProps {
  cards: CardType[];
  ownerId: "player1" | "player2";
  isCurrentPlayer: boolean;
  orientation?: "horizontal" | "vertical"; // New prop
  compact?: boolean; // New prop for visual scaling
  isHidden?: boolean; // New prop
  isCustom?: boolean;
  minimal?: boolean; // New prop for mobile indicator
  name?: string; // New prop for dynamic name
  gauntletRank?: string; // New prop for Gauntlet Rank
}

export const Hand = ({
  cards,
  ownerId,
  isCurrentPlayer,
  orientation = "vertical",
  compact = false,
  isHidden = false,
  isCustom = false,
  minimal = false,
  name,
  gauntletRank,
}: HandProps) => {
  const { selectCard, selectedCardId, currentPlayerId, draggingCardId, phase } =
    useGameStore();
  const t = useTranslation().game;

  const isMyTurn = currentPlayerId === ownerId;
  const isAnyCardDragging = !!draggingCardId;
  const isGameOver = phase === "game_over";

  // Minimal mode for mobile opponent indicator
  if (minimal) {
    return (
      <div className="flex flex-col items-center gap-1 mt-14 lg:mt-0">
        <motion.div
          animate={
            isGameOver
              ? { scale: 0, opacity: 0, filter: "blur(10px)" }
              : { scale: 1, opacity: 1, filter: "blur(0px)" }
          }
          transition={{ duration: 1, ease: "circIn" }}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/80 rounded-xl border border-white/10 shadow-lg"
        >
          <span className="text-[9px] font-black tracking-widest text-gray-500 uppercase mr-1">
            {name || t.opponent}
          </span>
          <div className="flex gap-1">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="w-3 h-4.5 bg-gray-800 rounded-sm border border-white/10 relative overflow-hidden shadow-sm"
              >
                <div className="absolute inset-0 bg-linear-to-br from-gray-700/50 to-transparent" />
                <div className="absolute inset-[1px] border border-white/5 rounded-[1px]" />
              </motion.div>
            ))}
            {cards.length === 0 && (
              <span className="text-[10px] text-gray-600 italic">Empty</span>
            )}
          </div>
          <span className="ml-1 text-[10px] font-black text-gray-400 font-mono bg-black/40 px-1.5 py-0.5 rounded-md border border-white/5">
            {cards.length}
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      animate={
        isGameOver
          ? { scale: 0, opacity: 0, y: 100, filter: "blur(10px)" }
          : { scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }
      }
      transition={{ duration: 1.5, ease: "circOut" }}
      className={cn(
        "flex flex-col items-center gap-1 lg:gap-4 transition-all duration-300 w-full scale-90 sm:scale-100 origin-center",
        isHidden && "opacity-80"
      )}
    >
      {/* Label: Outside the card container now */}
      <div
        className={cn(
          "font-black tracking-[0.2em] text-shadow-sm px-4 py-1 rounded-full border bg-black/60 shadow-xl transition-all",
          "hidden lg:block", // Hide on mobile for both players
          compact ? "text-[10px]" : "text-xs lg:text-sm",
          ownerId === "player1"
            ? "text-blue-400 border-blue-500/30 shadow-blue-900/20"
            : "text-red-400 border-red-500/30 shadow-red-900/20",
          isMyTurn && "scale-105 border-opacity-80 animate-pulse"
        )}
      >
        <div className="flex items-center gap-3">
          <span>
            {ownerId === "player1"
              ? t.player
              : name || (isCustom ? "Player 2" : t.opponent)}
          </span>
          {gauntletRank && (
            <div className="flex items-center gap-1.5 pl-3 border-l border-white/20">
              <Trophy size={12} className="text-yellow-500" />
              <span className="text-xs font-black text-yellow-100 uppercase tracking-wider">
                {gauntletRank}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Wrapper for alignment */}
      <div className="flex flex-col w-fit relative">
        {/* Mobile Rank Display (Left Aligned) */}
        {gauntletRank && !minimal && (
          <div className="lg:hidden self-start mb-2 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 rounded-lg border border-yellow-500/20 backdrop-blur-sm shadow-lg">
              <Trophy size={10} className="text-yellow-500" />
              <span className="text-[10px] font-black text-yellow-100 uppercase tracking-wider">
                {gauntletRank}
              </span>
            </div>
          </div>
        )}

        {/* Card Container */}
        <div
          className={cn(
            "flex items-center justify-center p-2 lg:p-4 rounded-2xl transition-all duration-500 relative",
            orientation === "vertical"
              ? "bg-gray-900/80 border border-white/5 shadow-inner min-h-[320px] lg:min-h-[460px] w-full"
              : isMyTurn && !isHidden
              ? "bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)] min-h-[100px] lg:min-h-[150px] w-fit min-w-[280px] lg:min-w-[400px]"
              : "bg-black/40 border border-white/5 shadow-inner min-h-[100px] lg:min-h-[150px] w-fit min-w-[280px] lg:min-w-[400px]",
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
              const isDraggingThisCard = draggingCardId === card.id;

              return (
                <motion.div
                  key={card.id}
                  className={cn(
                    "relative", // Removed transition-all duration-300 to avoid conflict
                    compact && "scale-90 origin-center",
                    orientation === "horizontal" &&
                      isSelected &&
                      !isAnyCardDragging &&
                      "scale-110 z-20 mx-2",
                    "cursor-pointer"
                  )}
                  whileHover={
                    orientation === "vertical" && !isAnyCardDragging
                      ? { scale: 1.1, zIndex: 50 }
                      : undefined
                  }
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.8,
                  }}
                  style={{
                    zIndex: isSelected || isDraggingThisCard ? 50 : index,
                  }}
                >
                  {isHidden ? (
                    // Card Back (Modernized)
                    <div className="w-[12vw] h-[17vw] max-w-[70px] max-h-[100px] lg:w-20 lg:h-28 rounded-lg border border-white/10 shadow-lg relative overflow-hidden group">
                      <div className="absolute inset-0 bg-linear-to-br from-gray-800 to-gray-950" />
                      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border border-white/10 flex items-center justify-center">
                          <span className="text-white/20 text-[10px] lg:text-xs">
                            ?
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Card
                      card={
                        {
                          ...card,
                          dragProps: isMyTurn
                            ? {
                                drag: true,
                                dragSnapToOrigin: true,
                                dragElastic: 0,
                                dragTransition: {
                                  bounceStiffness: 10000,
                                  bounceDamping: 100,
                                },
                                onDragStart: () => {
                                  selectCard(card.id);
                                  useGameStore
                                    .getState()
                                    .setDraggingCardId(card.id);
                                },
                                onDrag: (_: any, info: any) => {
                                  const x = info.point.x;
                                  const y = info.point.y;
                                  const element = document.elementFromPoint(
                                    x,
                                    y
                                  );
                                  const cellData = element
                                    ?.closest("[data-cell-index]")
                                    ?.getAttribute("data-cell-index");
                                  if (cellData) {
                                    const [r, c] = cellData
                                      .split("-")
                                      .map(Number);
                                    useGameStore
                                      .getState()
                                      .setHoveredCell({ row: r, col: c });
                                  } else {
                                    useGameStore
                                      .getState()
                                      .setHoveredCell(null);
                                  }
                                },
                                onDragEnd: () => {
                                  const { hoveredCell, placeCard } =
                                    useGameStore.getState();
                                  if (hoveredCell) {
                                    placeCard(hoveredCell.row, hoveredCell.col);
                                  }
                                  useGameStore
                                    .getState()
                                    .setDraggingCardId(null);
                                  useGameStore.getState().setHoveredCell(null);
                                },
                                whileDrag: { scale: 1.1, zIndex: 1000 },
                              }
                            : undefined,
                        } as any
                      }
                      owner={ownerId}
                      onClick={() => isMyTurn && selectCard(card.id)}
                      isSelected={isSelected && !isAnyCardDragging}
                      isPlaced={false}
                      isDragging={isDraggingThisCard}
                    />
                  )}
                </motion.div>
              );
            })}

            {/* Empty Placeholder slots to maintain height/width? */}
            {cards.length === 0 && (
              <div className="text-white/20 text-xs tracking-widest py-8">
                {t.emptyHand}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
