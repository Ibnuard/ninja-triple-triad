"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSettingsStore, Language } from "../store/useSettingsStore";

const TRANSLATIONS = {
  en: {
    title: "TRIPLE\nTRIAD",
    subtitle: "Ninja Edition",
    singlePlayer: "Single Player",
    multiplayer: "Multiplayer",
    konami: "KONAMI CODE NOT ENABLED",
    start: "PRESS START",
  },
  id: {
    title: "TRIPLE\nTRIAD",
    subtitle: "Edisi Ninja",
    singlePlayer: "Main Sendiri",
    multiplayer: "Main Bareng",
    konami: "KODE KONAMI TIDAK AKTIF",
    start: "TEKAN MULAI",
  },
};

export default function Home() {
  const { language, setLanguage } = useSettingsStore();
  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background Placeholder */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-black" />
      </div>

      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setLanguage("id")}
          className={`px-3 py-1 rounded border transition-colors ${
            language === "id"
              ? "bg-red-600 border-red-500 text-white"
              : "bg-transparent border-white/20 text-white/50 hover:text-white"
          }`}
        >
          ID
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={`px-3 py-1 rounded border transition-colors ${
            language === "en"
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-transparent border-white/20 text-white/50 hover:text-white"
          }`}
        >
          EN
        </button>
      </div>

      <div className="relative z-10 text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 drop-shadow-sm whitespace-pre-line">
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-[0.5em] text-red-500 mt-2 uppercase">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-4 w-64 mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Link href="/game">
            <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-red-600 hover:border-red-500 hover:text-black transition-all duration-300 rounded-lg font-bold tracking-widest uppercase backdrop-blur-sm group">
              <span className="group-hover:mr-2 transition-all">
                {t.singlePlayer}
              </span>
            </button>
          </Link>
          <Link href="/lobby">
            <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-blue-600 hover:border-blue-500 hover:text-black transition-all duration-300 rounded-lg font-bold tracking-widest uppercase backdrop-blur-sm group">
              <span className="group-hover:mr-2 transition-all">
                {t.multiplayer}
              </span>
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between text-white/10 font-mono text-sm">
        <span>{t.konami}</span>
        <span>{t.start}</span>
      </div>
    </div>
  );
}
