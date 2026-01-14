"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Swords, Globe, X } from "lucide-react";
import { useSettingsStore, useTranslation } from "../store/useSettingsStore";
import { useEffect } from "react";

interface BattleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BattleModal({ isOpen, onClose }: BattleModalProps) {
  const t = useTranslation().home;
  const { language } = useSettingsStore();

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const battleOptions = [
    {
      href: "/single-player",
      label: t.singlePlayer,
      description: t.singlePlayerDesc,
      icon: Swords,
      color: "from-red-600 to-red-900",
      shadow: "shadow-red-900/40",
    },
    {
      href: "/online",
      label: t.onlineBattle,
      description: t.onlineBattleDesc,
      icon: Globe,
      color: "from-blue-600 to-blue-900",
      shadow: "shadow-blue-900/40",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Decorative background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-white/10 transition-colors group"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative p-8 md:p-12">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-black italic tracking-tight text-white mb-2">
                    CHOOSE BATTLE
                  </h2>
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-px w-8 bg-red-600/50" />
                    <p className="text-xs font-black tracking-widest text-red-500 uppercase">
                      {language === "id"
                        ? "Pilih Mode Battle"
                        : "Select Your Mode"}
                    </p>
                    <div className="h-px w-8 bg-red-600/50" />
                  </div>
                </div>

                {/* Battle options grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {battleOptions.map((option, idx) => (
                    <motion.div
                      key={option.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                    >
                      <Link
                        href={option.href}
                        className="block group"
                        onClick={onClose}
                      >
                        <BattleOptionCard option={option} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function BattleOptionCard({ option }: { option: any }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 transition-all duration-500 bg-gradient-to-br from-white/5 to-transparent hover:to-white/10 group-hover:border-white/20 group-hover:scale-[1.02] active:scale-[0.98] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col items-stretch justify-between p-6 h-[180px]">
      {/* Hover Background Accent */}
      <div
        className={`absolute inset-0 transition-all duration-700 opacity-0 group-hover:opacity-20 bg-gradient-to-br ${option.color}`}
      />

      {/* Large Background Icon */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-all duration-700 group-hover:scale-125 group-hover:-rotate-12 pointer-events-none">
        <option.icon className="w-32 h-32 text-white" />
      </div>

      <div className="flex items-center justify-between relative z-10 mb-4">
        <div
          className={`p-3 rounded-xl bg-black/60 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl ${option.shadow}`}
        >
          <option.icon className="w-6 h-6 text-white" />
        </div>

        <div className="flex items-center justify-center group-hover:translate-x-1 transition-transform">
          <div
            className={`w-2 h-2 rounded-full ${option.color
              .split(" ")[0]
              .replace("from-", "bg-")} shadow-[0_0_10px_currentColor]`}
          />
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="font-black text-lg tracking-wider uppercase italic text-white transition-colors group-hover:text-red-500 mb-1">
          {option.label}
        </h3>
        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors line-clamp-2">
          {option.description}
        </p>
      </div>

      {/* Decorative Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
