"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/useGameStore";
import { generateRoomCode } from "../../lib/utils";
import { motion } from "framer-motion";

import { useTranslation } from "../../store/useSettingsStore";

export default function LobbyPage() {
  const router = useRouter();
  const { initGame } = useGameStore();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const t = useTranslation().lobby;

  const handleCreateRoom = () => {
    setIsCreating(true);
    // Simulate API call to create room
    setTimeout(() => {
      const newRoomId = generateRoomCode();
      initGame(newRoomId, false); // vs Human (waiting)
      router.push(`/game?room=${newRoomId}`);
    }, 1000);
  };

  const handleJoinRoom = () => {
    if (!joinCode) return;
    // Simulate API call to join
    initGame(joinCode, false);
    router.push(`/game?room=${joinCode}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-blue-900/20 z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-gray-900/80 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-8 text-center tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
          {t.title}
        </h2>

        <div className="space-y-6">
          {/* Create Room */}
          <div className="p-6 bg-white/5 rounded-xl border border-white/5 hover:border-red-500/50 transition-colors group">
            <h3 className="text-xl font-bold mb-2">{t.createTitle}</h3>
            <p className="text-sm text-gray-400 mb-4">{t.createDesc}</p>
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold tracking-wider transition-all"
            >
              {isCreating ? t.createLoading : t.createButton}
            </button>
          </div>

          <div className="flex items-center gap-4 text-gray-500">
            <div className="h-px bg-white/10 flex-1" />
            <span>{t.or}</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Join Room */}
          <div className="p-6 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/50 transition-colors">
            <h3 className="text-xl font-bold mb-2">{t.joinTitle}</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t.joinPlaceholder}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-center tracking-widest focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!joinCode}
                className="px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
              >
                {t.joinButton}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-8 text-sm text-gray-500 hover:text-white transition-colors w-full text-center"
        >
          {t.back}
        </button>
      </motion.div>
    </div>
  );
}
