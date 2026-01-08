"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { FireEffect } from "./effects/FireEffect";

interface BoardEffectsProps {
  mechanicType: string;
  activeElement?: string;
}

export const BoardEffects = ({
  mechanicType,
  activeElement,
}: BoardEffectsProps) => {
  // Determine which effect to show
  const getEffectKey = () => {
    if (mechanicType === "random_elemental") return activeElement;
    return mechanicType;
  };

  const effectKey = getEffectKey();

  return (
    <div className="absolute -inset-1 lg:-inset-4 pointer-events-none z-0 rounded-2xl">
      {/* Lightning Effect */}
      {effectKey === "lightning" && (
        <div className="absolute inset-0">
          <motion.div
            animate={{
              opacity: [0.2, 0.5, 0.2, 0.8, 0.3],
              boxShadow: [
                "inset 0 0 20px rgba(234, 179, 8, 0.2)",
                "inset 0 0 50px rgba(234, 179, 8, 0.4)",
                "inset 0 0 30px rgba(234, 179, 8, 0.1)",
              ],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 border-2 border-yellow-500/30 rounded-2xl"
          />
          {/* Animated Sparks */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                  opacity: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 0.2 + Math.random() * 0.3,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2,
                }}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full blur-[1px] shadow-[0_0_8px_#fbbf24]"
              />
            ))}
          </div>
        </div>
      )}

      {/* Fire Effect */}
      {effectKey === "fire" && <FireEffect />}

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

      {/* Water Effect */}
      {effectKey === "water" && (
        <div className="absolute inset-0">
          <motion.div
            animate={{
              boxShadow: [
                "inset 0 0 30px rgba(59, 130, 246, 0.1)",
                "inset 0 0 50px rgba(59, 130, 246, 0.3)",
                "inset 0 0 30px rgba(59, 130, 246, 0.1)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 border-2 border-blue-500/10 rounded-2xl"
          />
          {/* Subtle Waves or Ripples could go here */}
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
