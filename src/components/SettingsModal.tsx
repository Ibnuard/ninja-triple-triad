"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Monitor, Play, Layers, Sparkles } from "lucide-react";
import { useSettingsStore, useTranslation } from "../store/useSettingsStore";
import { cn } from "../lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const t = useTranslation().game.settings;
  const {
    showFPS,
    showBoardAnimation,
    toggleFPS,
    toggleBoardAnimation,
  } = useSettingsStore();

  const settings = [
    {
      id: "fps",
      label: t.fpsCounter,
      icon: Monitor,
      value: showFPS,
      toggle: toggleFPS,
    },
    {
      id: "board-anim",
      label: t.boardAnimation,
      icon: Play,
      value: showBoardAnimation,
      toggle: toggleBoardAnimation,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <Settings className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-black uppercase italic tracking-wider text-white">
                  {t.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {settings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="font-bold text-gray-200 text-sm">
                      {item.label}
                    </span>
                  </div>

                  <button
                    onClick={item.toggle}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none",
                      item.value ? "bg-purple-500" : "bg-gray-700"
                    )}
                  >
                    <motion.div
                      animate={{ x: item.value ? 26 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 bg-black/40 border-t border-white/5">
              <button
                onClick={onClose}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-purple-400 transition-colors rounded-xl"
              >
                {t.close}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
