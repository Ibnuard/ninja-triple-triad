"use client";

import { useGameStore } from "../store/useGameStore";
import { Card } from "./Card";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

export const Board = () => {
  const { board, placeCard, lastMove } = useGameStore();

  return (
    <div className="grid grid-cols-3 gap-1 lg:gap-4 p-1 lg:p-4 bg-gray-900/50 rounded-xl backdrop-blur-sm border border-white/10 shadow-2xl">
      {board.map((row, rIndex) =>
        row.map((cell, cIndex) => {
          const isLastMove =
            lastMove?.row === rIndex && lastMove?.col === cIndex;

          return (
            <motion.div
              key={`${rIndex}-${cIndex}`}
              className={cn(
                "relative w-[28vw] h-[38vw] max-w-[120px] max-h-[160px] lg:w-32 lg:h-40 bg-black/40 rounded-lg flex items-center justify-center border border-white/5 transition-all",
                !cell.card && "hover:bg-white/5 cursor-pointer",
                isLastMove && "ring-2 ring-yellow-400/50"
              )}
              onClick={() => placeCard(rIndex, cIndex)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (rIndex * 3 + cIndex) * 0.05 }}
            >
              {cell.card ? (
                <Card
                  card={cell.card}
                  owner={cell.owner || undefined}
                  isPlaced
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-10 user-select-none pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                </div>
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
};
