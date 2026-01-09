"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { FireEffect } from "./effects/FireEffect";
import { LightningEffect } from "./effects/LightningEffect";
import { WaterEffect } from "./effects/WaterEffect";
import { EarthEffect } from "./effects/EarthEffect";
import { WindEffect } from "./effects/WindEffect";

interface BoardEffectsProps {
  mechanicType: string;
  activeElement?: string;
  lastMove: { row: number; col: number; playerId: string } | null;
  phase: string;
}

export const BoardEffects = ({
  mechanicType,
  activeElement,
  lastMove,
  phase,
}: BoardEffectsProps) => {
  if (phase === "game_over") return null;

  // Determine which effect to show
  const getEffectKey = () => {
    if (mechanicType === "random_elemental") return activeElement;
    return mechanicType;
  };

  const effectKey = getEffectKey();

  return (
    <div className="absolute -inset-1 lg:-inset-4 pointer-events-none z-0 rounded-2xl">
      {/* Lightning Effect */}
      {effectKey === "lightning" && <LightningEffect lastMove={lastMove} />}

      {/* Fire Effect */}
      {effectKey === "fire" && <FireEffect lastMove={lastMove} />}

      {/* Water Effect */}
      {effectKey === "water" && <WaterEffect lastMove={lastMove} />}

      {/* Earth Effect */}
      {effectKey === "earth" && <EarthEffect lastMove={lastMove} />}

      {/* Wind Effect */}
      {effectKey === "wind" && <WindEffect lastMove={lastMove} />}

      {/* Poison Effect */}
      {effectKey === "poison" && (
        <div className="absolute inset-0">
          <motion.div
            animate={{
              boxShadow: [
                "inset 0 0 30px rgba(168, 85, 247, 0.2)",
                "inset 0 0 60px rgba(168, 85, 247, 0.4)",
                "inset 0 0 30px rgba(168, 85, 247, 0.2)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 border-2 border-purple-500/20 rounded-2xl"
          />
          {/* Bubbles */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  bottom: "0%",
                  left: Math.random() * 100 + "%",
                  scale: 0,
                }}
                animate={{
                  bottom: "100%",
                  scale: [0, 1, 0.5, 0],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                }}
                className="absolute w-3 h-3 border border-purple-400/30 rounded-full"
              />
            ))}
          </div>
        </div>
      )}

      {/* Foggy Effect */}
      {effectKey === "foggy" && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] rounded-2xl border border-white/5">
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              x: [-10, 10, -10],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          />
        </div>
      )}

      {/* Joker Effect */}
      {effectKey === "joker" && (
        <motion.div
          animate={{
            borderColor: [
              "rgba(236, 72, 153, 0.2)",
              "rgba(168, 85, 247, 0.2)",
              "rgba(59, 130, 246, 0.2)",
              "rgba(236, 72, 153, 0.2)",
            ],
            boxShadow: [
              "inset 0 0 30px rgba(236, 72, 153, 0.2)",
              "inset 0 0 30px rgba(59, 130, 246, 0.2)",
              "inset 0 0 30px rgba(236, 72, 153, 0.2)",
            ],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-0 border-2 rounded-2xl"
        />
      )}
    </div>
  );
};
