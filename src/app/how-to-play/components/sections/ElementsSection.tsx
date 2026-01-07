import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { Card } from "../../../../components/Card";

interface ElementDetail {
  element: string;
  name: string;
  icon: string;
  desc: string;
  color: string;
}

interface ElementsSectionProps {
  title: string;
  desc: string;
  elementalDetails: ElementDetail[];
  buffIndicator: string;
  debuffIndicator: string;
  buff: string;
  debuff: string;
  note: string;
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

export function ElementsSection({
  title,
  desc,
  elementalDetails,
  buffIndicator,
  debuffIndicator,
  buff,
  debuff,
  note,
}: ElementsSectionProps) {
  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">
            {title}
          </h2>
          <p className="text-base lg:text-lg text-gray-400 leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Indicators Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buff Indicator */}
          <div className="bg-green-500/5 border border-green-500/20 p-3 lg:p-4 rounded-2xl flex items-center gap-4">
            <div className="relative scale-75 lg:scale-90 origin-center shrink-0">
              <div className="absolute inset-0 bg-green-500/20 blur-[20px] rounded-full animate-pulse" />
              <Card
                card={{
                  ...mockTutorialCard,
                  element: "fire",
                  stats: { top: 9, right: 8, bottom: 6, left: 7 },
                  baseStats: {
                    top: 7,
                    right: 8,
                    bottom: 4,
                    left: 7,
                  },
                }}
                owner="player1"
                isPlaced
              />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {buffIndicator}
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">{buff}</p>
            </div>
          </div>

          {/* Debuff Indicator */}
          <div className="bg-red-500/5 border border-red-500/20 p-3 lg:p-4 rounded-2xl flex items-center gap-4">
            <div className="relative scale-75 lg:scale-90 origin-center shrink-0">
              <div className="absolute inset-0 bg-red-500/20 blur-[20px] rounded-full animate-pulse" />
              <Card
                card={{
                  ...mockTutorialCard,
                  element: "water",
                  stats: { top: 3, right: 6, bottom: 2, left: 2 },
                  baseStats: {
                    top: 5,
                    right: 7,
                    bottom: 4,
                    left: 3,
                  },
                }}
                owner="player1"
                isPlaced
              />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {debuffIndicator}
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                {debuff}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {elementalDetails.map((el) => (
          <motion.div
            key={el.element}
            whileHover={{ y: -5 }}
            className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center text-center gap-4 group transition-all hover:bg-white/[0.07] hover:border-white/20"
          >
            <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:border-white/30 transition-colors shadow-inner">
              <img
                src={el.icon}
                alt={el.name}
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h3
                className={cn(
                  "font-black uppercase tracking-[0.2em] text-sm lg:text-base mb-2",
                  el.color
                )}
              >
                {el.name}
              </h3>
              <p className="text-xs lg:text-sm text-gray-400 leading-relaxed">
                {el.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-6 lg:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
          <Info className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-sm lg:text-base text-blue-200 italic leading-relaxed text-center md:text-left">
          {note}
        </p>
      </div>
    </div>
  );
}
