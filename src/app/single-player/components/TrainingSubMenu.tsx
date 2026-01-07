"use client";

import { motion } from "framer-motion";
import { Disc, Layers, ChevronLeft } from "lucide-react";

interface TrainingSubMenuProps {
  t: any;
  onNavigate: () => void;
}

export function TrainingSubMenu({ t, onNavigate }: TrainingSubMenuProps) {
  return (
    <motion.div
      key="training-submenu"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-4xl flex flex-col md:flex-row gap-6 items-stretch"
    >
      {/* Training Option 1 */}
      <button
        onClick={onNavigate}
        className="flex-1 group relative bg-gray-900/80 border border-blue-500/30 p-8 rounded-3xl hover:bg-blue-900/20 transition-all hover:-translate-y-2 overflow-hidden text-left"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Disc className="w-32 h-32 text-blue-500 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 text-black">
              <Disc className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black italic uppercase text-white mb-2">
              {t.trainingSub.ownDeck}
            </h3>
            <p className="text-sm text-gray-400">
              Use your collection to train strategies.
            </p>
          </div>
          <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs mt-8 group-hover:translate-x-2 transition-transform">
            Select <ChevronLeft className="rotate-180 w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Training Option 2 */}
      <button
        onClick={onNavigate}
        className="flex-1 group relative bg-gray-900/80 border border-cyan-500/30 p-8 rounded-3xl hover:bg-cyan-900/20 transition-all hover:-translate-y-2 overflow-hidden text-left"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Layers className="w-32 h-32 text-cyan-500 -rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mb-4 text-black">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black italic uppercase text-white mb-2">
              {t.trainingSub.randomDeck}
            </h3>
            <p className="text-sm text-gray-400">
              Challenge yourself with randomized cards.
            </p>
          </div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-xs mt-8 group-hover:translate-x-2 transition-transform">
            Select <ChevronLeft className="rotate-180 w-4 h-4" />
          </div>
        </div>
      </button>
    </motion.div>
  );
}
