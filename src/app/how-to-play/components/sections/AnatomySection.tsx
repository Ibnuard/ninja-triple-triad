import React from "react";
import { motion } from "framer-motion";
import { Zap, Sword, Shield } from "lucide-react";
import { Card } from "../../../../components/Card";

interface AnatomySectionProps {
  title: string;
  desc: string;
  cp: string;
  atk: string;
  jt: string;
  df: string;
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

export function AnatomySection({
  title,
  desc,
  cp,
  atk,
  jt,
  df,
}: AnatomySectionProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">
          {title}
        </h2>
        <p className="text-base lg:text-lg text-gray-400 leading-relaxed italic border-l-4 border-red-500 pl-4">
          {desc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-8 lg:pt-10">
        <div className="flex justify-center flex-1 py-12 lg:py-0">
          <div className="relative scale-[1.2] lg:scale-150">
            <Card card={mockTutorialCard as any} owner="player1" isColorful />
            {/* Callouts */}
            {/* CHAKRA - TOP */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
            >
              <div className="bg-blue-500 text-black text-[8px] px-1.5 rounded font-black italic whitespace-nowrap">
                CHAKRA
              </div>
              <div className="h-4 lg:h-6 w-0.5 bg-blue-500/50" />
            </motion.div>

            {/* ATTACK - RIGHT */}
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: 0.5,
              }}
              className="absolute top-4 -right-12 lg:-right-16 flex items-center"
            >
              <div className="w-4 lg:w-6 h-0.5 bg-red-500/50" />
              <div className="bg-red-500 text-black text-[8px] px-1.5 rounded font-black italic whitespace-nowrap">
                ATTACK
              </div>
            </motion.div>

            {/* JUTSU - LEFT */}
            <motion.div
              animate={{ x: [0, -5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: 1,
              }}
              className="absolute top-4 -left-12 lg:-left-16 flex items-center"
            >
              <div className="bg-yellow-500 text-black text-[8px] px-1.5 rounded font-black italic whitespace-nowrap">
                JUTSU
              </div>
              <div className="w-4 lg:w-6 h-0.5 bg-yellow-500/50" />
            </motion.div>

            {/* DEFENSE - BOTTOM */}
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: 1.5,
              }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
            >
              <div className="h-4 lg:h-6 w-0.5 bg-green-500/50" />
              <div className="bg-green-500 text-black text-[8px] px-1.5 rounded font-black italic whitespace-nowrap">
                DEFENSE
              </div>
            </motion.div>
          </div>
        </div>
        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
            <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
            <p className="text-xs lg:text-sm font-medium leading-normal text-gray-300">
              <strong className="text-blue-400 block mb-1">CHAKRA (TOP)</strong>
              {cp}
            </p>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
            <Sword className="w-5 h-5 text-red-500 shrink-0 mt-1" />
            <p className="text-xs lg:text-sm font-medium leading-normal text-gray-300">
              <strong className="text-red-500 block mb-1">
                ATTACK (RIGHT)
              </strong>
              {atk}
            </p>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
            <Zap className="w-5 h-5 text-yellow-500 shrink-0 mt-1" />
            <p className="text-xs lg:text-sm font-medium leading-normal text-gray-300">
              <strong className="text-yellow-500 block mb-1">
                JUTSU (LEFT)
              </strong>
              {jt}
            </p>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
            <Shield className="w-5 h-5 text-green-500 shrink-0 mt-1" />
            <p className="text-xs lg:text-sm font-medium leading-normal text-gray-300">
              <strong className="text-green-500 block mb-1">
                DEFENSE (BOTTOM)
              </strong>
              {df}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
