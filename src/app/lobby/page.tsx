"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/useGameStore";
import { generateRoomCode } from "../../lib/utils";
import { motion } from "framer-motion";
import React from "react";

import { useTranslation } from "../../store/useSettingsStore";

const FireParticle = ({ delay }: { delay: number }) => {
  const [props] = React.useState(() => ({
    size: Math.random() * 3 + 2,
    color: ["#ef4444", "#f97316", "#f59e0b"][Math.floor(Math.random() * 3)],
    startX: Math.random() * 100 + "vw",
    driftX: Math.random() * 20 - 10 + "vw",
    duration: Math.random() * 5 + 5,
  }));

  return (
    <motion.div
      initial={{ y: "110vh", x: props.startX, opacity: 0, scale: 0 }}
      animate={{
        y: "-10vh",
        opacity: [0, 1, 0.7, 0],
        x: [
          props.startX,
          `calc(${props.startX} + ${props.driftX})`,
          props.startX,
        ],
        scale: [0.5, 1.3, 0.8, 0],
      }}
      transition={{
        duration: props.duration,
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
      className="absolute rounded-full blur-[2px] z-0"
      style={{
        width: props.size,
        height: props.size,
        backgroundColor: props.color,
        boxShadow: `0 0 15px ${props.color}`,
      }}
    />
  );
};

export default function LobbyPage() {
  const router = useRouter();
  const { initGame } = useGameStore();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslation().lobby;

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative p-4 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-black to-blue-950/20 z-0" />

      {/* Fiery Particles */}
      {isMounted && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <FireParticle key={i} delay={i * 0.2} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-gray-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.15)]"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-red-600/20 blur-3xl rounded-full" />

        <h2 className="text-4xl font-black mb-10 text-center tracking-[0.2em] uppercase text-transparent bg-clip-text bg-linear-to-b from-red-400 via-red-500 to-red-800 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">
          {t.title}
        </h2>

        <div className="space-y-8">
          {/* Create Room */}
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-red-500/30 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-xl font-black mb-2 relative z-10 tracking-widest uppercase">
              {t.createTitle}
            </h3>
            <p className="text-xs text-gray-400 mb-6 relative z-10 leading-relaxed font-medium">
              {t.createDesc}
            </p>
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 rounded-2xl font-black tracking-[0.2em] uppercase transition-all shadow-xl shadow-red-900/20 hover:shadow-red-600/30 active:scale-[0.98] relative z-10"
            >
              {isCreating ? t.createLoading : t.createButton}
            </button>
          </div>

          <div className="flex items-center gap-6 text-gray-600">
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-[10px] font-black tracking-widest uppercase italic">
              {t.or}
            </span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          {/* Join Room */}
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-xl font-black mb-2 relative z-10 tracking-widest uppercase">
              {t.joinTitle}
            </h3>
            <div className="flex flex-col gap-3 relative z-10">
              <input
                type="text"
                placeholder={t.joinPlaceholder}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 font-mono text-center text-xl tracking-[0.5em] focus:outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all placeholder:text-gray-700 placeholder:tracking-normal placeholder:text-sm"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!joinCode}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-black tracking-[0.2em] uppercase transition-all shadow-xl shadow-blue-900/20 hover:shadow-blue-600/30 active:scale-[0.98]"
              >
                {t.joinButton}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-10 text-[10px] font-black tracking-[0.3em] text-gray-600 hover:text-white uppercase transition-all w-full text-center hover:scale-105 active:scale-95"
        >
          {t.back}
        </button>
      </motion.div>
    </div>
  );
}
