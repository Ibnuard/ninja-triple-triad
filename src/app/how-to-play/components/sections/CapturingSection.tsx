import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sword } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { Card } from "../../../../components/Card";

interface CapturingSectionProps {
  title: string;
  desc: string;
  captureStep: number;
  captured: string;
  ready: string;
  comparison: string;
}

const mockTutorialCard = {
  id: "tutorial-card",
  name: "Ninja Basic",
  element: "fire" as const,
  image: "",
  stats: { top: 5, right: 7, bottom: 4, left: 3 },
  baseStats: { top: 5, right: 7, bottom: 4, left: 3 },
  isBuffed: false,
  activePassives: [],
};

export function CapturingSection({
  title,
  desc,
  captureStep,
  captured,
  ready,
  comparison,
}: CapturingSectionProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">
          {title}
        </h2>
        <p className="text-base lg:text-lg text-gray-400 leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="relative h-48 lg:h-64 bg-white/5 rounded-2xl lg:rounded-3xl border border-white/10 flex items-center justify-center gap-2 lg:gap-4 overflow-hidden">
        <div className="flex items-center gap-2 lg:gap-4 scale-90 lg:scale-100">
          <AnimatePresence>
            {captureStep >= 1 && (
              <motion.div
                key="player-card"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  card={
                    {
                      ...mockTutorialCard,
                      stats: {
                        top: 5,
                        right: 9,
                        bottom: 4,
                        left: 3,
                      },
                    } as any
                  }
                  owner="player1"
                />
                <div className="mt-2 text-[8px] lg:text-[10px] text-center font-bold text-blue-400">
                  YOUR CARD (RIGHT: 9)
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center">
            <AnimatePresence>
              {captureStep === 2 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sword className="w-4 h-4 lg:w-6 lg:h-6 text-red-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            animate={{
              scale: captureStep >= 2 ? [1, 1.05, 1] : 1,
            }}
          >
            <Card
              card={
                {
                  ...mockTutorialCard,
                  name: "Enemy Genin",
                  element: "water",
                  stats: { top: 5, right: 3, bottom: 4, left: 6 },
                } as any
              }
              owner={captureStep >= 2 ? "player1" : "player2"}
            />
            <div
              className={cn(
                "mt-2 text-[8px] lg:text-[10px] text-center font-bold transition-colors duration-500",
                captureStep >= 2 ? "text-blue-400" : "text-red-500"
              )}
            >
              {captureStep >= 2 ? captured : "ENEMY (LEFT: 6)"}
            </div>
          </motion.div>
        </div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div
        className={cn(
          "p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-500 border",
          captureStep >= 2
            ? "bg-blue-500/10 border-blue-500/30"
            : "bg-red-500/10 border-red-500/30"
        )}
      >
        <p
          className={cn(
            "text-xs lg:text-sm font-bold uppercase tracking-widest text-center transition-colors duration-500",
            captureStep >= 2 ? "text-blue-400" : "text-red-400"
          )}
        >
          {captureStep >= 2 ? comparison : ready}
        </p>
      </div>
    </div>
  );
}
