"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./Card";
import { Card as CardType } from "../types/game";
import { ArrowRight } from "lucide-react";

interface SwapAnimationOverlayProps {
  isOpen: boolean;
  oldCard: CardType | null;
  newCard: CardType | null;
}

export function SwapAnimationOverlay({
  isOpen,
  oldCard,
  newCard,
}: SwapAnimationOverlayProps) {
  if (!oldCard || !newCard) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
        >
          <div className="flex flex-col items-center gap-8 md:gap-12">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-gray-500 text-[10px] md:text-xs font-black tracking-[0.4em] mb-2 uppercase italic">
                Seni Ninja: Pertukaran
              </h2>
              <h1 className="text-2xl md:text-4xl font-black italic uppercase text-white tracking-tighter">
                Kartu Telah Ditukar!
              </h1>
            </motion.div>

            <div className="flex items-center gap-4 md:gap-12">
              {/* Old Card */}
              <motion.div
                initial={{ x: -50, opacity: 0, rotateY: 0 }}
                animate={{ 
                  x: 0, 
                  opacity: 1,
                  rotateY: 180,
                  scale: 0.8,
                  filter: "grayscale(1) opacity(0.5)"
                }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="relative"
              >
                <Card card={oldCard} isPlaced={false} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-500/20 text-red-500 font-black text-4xl -rotate-12 border-4 border-red-500 px-4 py-2 rounded-xl backdrop-blur-sm">
                    OUT
                  </div>
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 p-4 rounded-full"
              >
                <ArrowRight className="w-8 h-8 md:w-12 md:h-12 text-white" />
              </motion.div>

              {/* New Card */}
              <motion.div
                initial={{ x: 50, opacity: 0, scale: 1.5, rotateY: -180 }}
                animate={{ 
                  x: 0, 
                  opacity: 1, 
                  scale: 1.1,
                  rotateY: 0 
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 100 
                }}
                className="relative"
              >
                <Card card={newCard} isPlaced={false} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute -top-4 -right-4 bg-green-500 text-white font-black text-xl px-4 py-1 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)] border-2 border-white/20"
                >
                  NEW!
                </motion.div>
              </motion.div>
            </div>

            {/* Particle Effects (Subtle) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 pointer-events-none overflow-hidden"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: "50%", 
                    y: "50%", 
                    scale: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    x: `${Math.random() * 100}%`, 
                    y: `${Math.random() * 100}%`,
                    scale: Math.random() * 2,
                    opacity: 0 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2
                  }}
                  className="absolute w-1 h-1 bg-white rounded-full"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
