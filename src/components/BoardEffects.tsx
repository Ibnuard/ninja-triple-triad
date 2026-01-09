"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { FireEffect } from "./effects/FireEffect";
import { LightningEffect } from "./effects/LightningEffect";
import { WaterEffect } from "./effects/WaterEffect";
import { EarthEffect } from "./effects/EarthEffect";
import { WindEffect } from "./effects/WindEffect";
import { PoisonEffect } from "./effects/PoisonEffect";
import { FoggyEffect } from "./effects/FoggyEffect";

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
      {effectKey === "poison" && <PoisonEffect lastMove={lastMove} />}

      {/* Foggy Effect */}
      {effectKey === "foggy" && <FoggyEffect lastMove={lastMove} />}

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
