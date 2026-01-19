"use client";

import { useGameStore } from "../store/useGameStore";
import { Card } from "./Card";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";
import {
  Flame,
  Droplets,
  Mountain,
  Wind,
  Zap,
  Skull,
  CloudFog,
  Dices,
} from "lucide-react";

import { BoardEffects } from "./BoardEffects";
import gameConfig from "../gameConfig.json";

const BoardCell = ({
  rIndex,
  cIndex,
  cell,
  isLastMove,
  isFirstTwoTurns,
  mechanic,
  placeCard,
  showAnimation,
}: {
  rIndex: number;
  cIndex: number;
  cell: any;
  isLastMove: boolean;
  isFirstTwoTurns: boolean;
  mechanic: any;
  placeCard: (r: number, c: number) => void;
  showAnimation?: boolean;
  onCardPlaced?: (row: number, col: number, cardId: string, card: any) => void;
}) => {
  const isHovered = useGameStore(
    (state) =>
      state.hoveredCell?.row === rIndex && state.hoveredCell?.col === cIndex
  );

  const draggingCard = useGameStore((state) => state.draggingCard);

  return (
    <motion.div
      key={`${rIndex}-${cIndex}`}
      data-cell-index={`${rIndex}-${cIndex}`}
      className={cn(
        "relative w-[28vw] h-[38vw] max-w-[120px] max-h-[160px] lg:w-28 lg:h-36 bg-black/40 rounded-lg flex items-center justify-center border border-white/5 transition-all",
        !cell.card && "hover:bg-white/5 cursor-pointer",
        isLastMove && "ring-2 ring-yellow-400/50",
        isHovered && !cell.card && "ring-2 ring-blue-500 bg-blue-500/20"
      )}
      transition={
        showAnimation
          ? { delay: (rIndex * 3 + cIndex) * 0.05 }
          : { duration: 0 }
      }
      onClick={() => placeCard(cell.row, cell.col)}
    >
      {cell.card ? (
        <Card
          card={cell.card}
          owner={cell.owner || undefined}
          isPlaced
          hideStats={
            mechanic.type === "foggy" &&
            isFirstTwoTurns &&
            cell.owner === "player2"
          }
        />
      ) : isHovered && draggingCard ? (
        <div className="absolute inset-0 p-1 opacity-50 scale-90 pointer-events-none">
          <Card card={draggingCard} owner="player1" isGhost isPlaced />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 user-select-none pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      )}
    </motion.div>
  );
};

export const Board = ({
  showCardPlaceAnimation = true,
  showBoardEffect = true,
  isFlipped = false,
  swapOwners = false,
  onCardPlaced,
}: {
  showCardPlaceAnimation?: boolean;
  showBoardEffect?: boolean;
  isFlipped?: boolean;
  swapOwners?: boolean;
  onCardPlaced?: (row: number, col: number, cardId: string, card: any) => void;
}) => {
  // Use selective subscriptions to prevent unnecessary re-renders
  const board = useGameStore((state) => state.board);
  const storePlaceCard = useGameStore((state) => state.placeCard);
  const lastMove = useGameStore((state) => state.lastMove);
  const mechanic = useGameStore((state) => state.mechanic);
  const phase = useGameStore((state) => state.phase);
  const selectedCardId = useGameStore((state) => state.selectedCardId);
  const currentPlayerId = useGameStore((state) => state.currentPlayerId);
  const player1 = useGameStore((state) => state.player1);
  const player2 = useGameStore((state) => state.player2);
  const isGameOver = phase === "game_over";

  // Wrapped placeCard that also broadcasts for online
  const placeCard = (row: number, col: number) => {
    // Get the selected card before placing (for broadcast)
    const currentPlayer = currentPlayerId === "player1" ? player1 : player2;
    const selectedCard = currentPlayer.hand.find(
      (c) => c.id === selectedCardId
    );

    // Place card locally
    storePlaceCard(row, col);

    // Broadcast for online
    if (onCardPlaced && selectedCard && selectedCardId) {
      onCardPlaced(row, col, selectedCardId, selectedCard);
    }
  };

  // Transform Board for POV
  // If isFlipped, we reverse rows and cols.
  // Note: cell.row/cell.col properties remain LOGICAL, so click handler works.
  const displayBoard = isFlipped
    ? [...board].map((row) => [...row].reverse()).reverse()
    : board;

  // Calculate if we are in the first 2 turns (<= 4 cards placed)
  const occupiedCount = board.flat().filter((cell) => cell.card).length;
  const isFirstTwoTurns = occupiedCount <= 4;

  const getMechanicIcon = () => {
    if (isGameOver) return null;
    switch (mechanic.type) {
      case "random_elemental":
        switch (mechanic.activeElement) {
          case "fire":
            return <Flame className="w-4 h-4 text-red-500" />;
          case "water":
            return <Droplets className="w-4 h-4 text-blue-500" />;
          case "earth":
            return <Mountain className="w-4 h-4 text-amber-600" />;
          case "wind":
            return <Wind className="w-4 h-4 text-emerald-500" />;
          case "lightning":
            return <Zap className="w-4 h-4 text-yellow-500" />;
          default:
            return null;
        }
      case "poison":
        return <Skull className="w-4 h-4 text-purple-500" />;
      case "foggy":
        return <CloudFog className="w-4 h-4 text-gray-400" />;
      case "joker":
        return <Dices className="w-4 h-4 text-pink-500" />;
      default:
        return null;
    }
  };

  const getMechanicText = () => {
    if (isGameOver) return null;
    switch (mechanic.type) {
      case "random_elemental":
        return `${
          mechanic.activeElement.charAt(0).toUpperCase() +
          mechanic.activeElement.slice(1)
        } Field (+1 Stats)`;
      case "poison":
        return "Poison Field (-1 Stats)";
      case "foggy":
        return "Foggy Field (Hidden Enemy Stats)";
      case "joker":
        return "Joker Field (Random Mods)";
      default:
        return null;
    }
  };

  const getBoardBg = () => {
    if (isGameOver) return "bg-gray-900/40 border-white/5 shadow-none";

    if (mechanic.type === "random_elemental") {
      switch (mechanic.activeElement) {
        case "fire":
          return "bg-red-950/40 border-red-500/20";
        case "water":
          return "bg-blue-950/40 border-blue-500/20";
        case "earth":
          return "bg-amber-950/40 border-amber-500/20";
        case "wind":
          return "bg-emerald-950/40 border-emerald-500/20";
        case "lightning":
          return "bg-amber-950/40 border-yellow-500/20";
        default:
          return "bg-gray-900/50 border-white/10";
      }
    }
    if (mechanic.type === "poison")
      return "bg-purple-950/40 border-purple-500/20";
    if (mechanic.type === "foggy") return "bg-slate-900/80 border-white/5";
    if (mechanic.type === "joker") return "bg-pink-950/30 border-pink-500/20";
    return "bg-gray-900/50 border-white/10";
  };

  return (
    <div
      className={cn(
        "relative p-1 lg:p-4 rounded-xl border bg-black/40 shadow-2xl transition-all duration-1000",
        getBoardBg()
      )}
    >
      <div className="relative inline-block">
        {showBoardEffect && (
          <BoardEffects
            mechanicType={mechanic.type}
            activeElement={mechanic.activeElement}
            lastMove={lastMove}
            phase={phase}
          />
        )}
        <div className="grid grid-cols-3 gap-1 lg:gap-4 relative z-10">
          {displayBoard.map((row, rIndex) =>
            row.map((cell, cIndex) => {
              const isLastMove =
                lastMove?.row === cell.row && lastMove?.col === cell.col;

              return (
                <BoardCell
                  key={`${rIndex}-${cIndex}`}
                  rIndex={rIndex}
                  cIndex={cIndex}
                  cell={{
                    ...cell,
                    // Swap visual owner if needed (P2 looking at P2 card sees Blue)
                    owner: swapOwners
                      ? cell.owner === "player1"
                        ? "player2"
                        : cell.owner === "player2"
                        ? "player1"
                        : cell.owner
                      : cell.owner,
                  }}
                  isLastMove={isLastMove}
                  isFirstTwoTurns={isFirstTwoTurns}
                  mechanic={mechanic}
                  placeCard={placeCard}
                  showAnimation={showCardPlaceAnimation}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
