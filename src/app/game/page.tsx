"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Board } from "../../components/Board";
import { Hand } from "../../components/Hand";
import { PassiveInfoModal } from "../../components/PassiveInfoModal";
import { useComputerAI } from "../../lib/useComputerAI";
import { cn } from "../../lib/utils";
import { useGameStore } from "../../store/useGameStore";
import { useTranslation, useSettingsStore } from "../../store/useSettingsStore";
import { Card } from "../../types/game";

// Mock Cards (Same as before)
const MOCK_CARDS: Card[] = Array.from({ length: 5 }).map((_, i) => {
  const stats = {
    top: Math.floor(Math.random() * 9) + 1,
    bottom: Math.floor(Math.random() * 9) + 1,
    left: Math.floor(Math.random() * 9) + 1,
    right: Math.floor(Math.random() * 9) + 1,
  };
  return {
    id: `card-${i}-${Math.random()}`,
    name: `Ninja ${i + 1}`,
    element: ["fire", "water", "earth", "wind", "lightning"][
      Math.floor(Math.random() * 5)
    ] as any,
    image: "",
    stats: { ...stats },
    baseStats: { ...stats },
  };
});

const OPPONENT_CARDS: Card[] = Array.from({ length: 5 }).map((_, i) => {
  const stats = {
    top: Math.floor(Math.random() * 9) + 1,
    bottom: Math.floor(Math.random() * 9) + 1,
    left: Math.floor(Math.random() * 9) + 1,
    right: Math.floor(Math.random() * 9) + 1,
  };
  return {
    id: `opp-card-${i}-${Math.random()}`,
    name: `Ronin ${i + 1}`,
    element: ["fire", "water", "earth", "wind", "lightning"][
      Math.floor(Math.random() * 5)
    ] as any,
    image: "",
    stats: { ...stats },
    baseStats: { ...stats },
  };
});

export default function GamePage() {
  const [showInfo, setShowInfo] = useState(false);
  const {
    initGame,
    player1,
    player2,
    currentPlayerId,
    phase,
    winner,
    resetGame,
  } = useGameStore();

  const t = useTranslation().game;
  const { language } = useSettingsStore();

  const router = useRouter();

  // Use AI Hook
  useComputerAI();

  const generateDiverseHand = (prefix: string): Card[] => {
    const elements: any[] = ["fire", "water", "earth", "wind", "lightning"];
    return elements.map((el, i) => {
      const stats = {
        top: Math.floor(Math.random() * 5) + 3,
        bottom: Math.floor(Math.random() * 5) + 3,
        left: Math.floor(Math.random() * 5) + 3,
        right: Math.floor(Math.random() * 5) + 3,
      };
      return {
        id: `${prefix}-${el}-${i}`,
        name: `${el.charAt(0).toUpperCase() + el.slice(1)} Ninja`,
        element: el,
        image: "",
        stats: { ...stats },
        baseStats: { ...stats },
      } as Card;
    });
  };

  const startGame = () => {
    const isCustom =
      typeof window !== "undefined" &&
      window.location.search.includes("mode=custom");
    initGame("test-room", !isCustom); // vsComputer true unless mode is custom

    useGameStore.setState((state) => ({
      player1: {
        ...state.player1,
        hand: isCustom
          ? generateDiverseHand("p1")
          : [...MOCK_CARDS].sort(() => Math.random() - 0.5),
      },
      player2: {
        ...state.player2,
        hand: isCustom
          ? generateDiverseHand("p2")
          : [...OPPONENT_CARDS].sort(() => Math.random() - 0.5),
        name: isCustom ? "Player 2" : "Computer",
      },
    }));
  };

  useEffect(() => {
    if (player1.hand.length === 0) {
      startGame();
    }
  }, []);

  const isMyTurn = currentPlayerId === "player1";
  const isCustomMode =
    typeof window !== "undefined" &&
    window.location.search.includes("mode=custom");

  return (
    <div className="h-[100dvh] w-full bg-black text-white overflow-hidden flex flex-col relative select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black z-0 pointer-events-none" />

      {/* Header / Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center p-2 lg:p-4 pointer-events-none">
        {/* Turn Status Overlay (Central) */}
        {phase !== "game_over" && (
          <div
            className={cn(
              "px-3 py-1 lg:px-4 lg:py-2 rounded-full border backdrop-blur-md font-bold text-[10px] lg:text-xl tracking-[0.2em] shadow-lg transition-all duration-500 pointer-events-auto",
              isMyTurn
                ? "bg-blue-500/10 border-blue-500 text-blue-400 animate-pulse ring-blue-500"
                : "bg-red-500/10 border-red-500 text-red-500"
            )}
          >
            {isMyTurn
              ? t.yourTurn
              : isCustomMode
              ? "Player 2 Turn"
              : t.opponentTurn}
          </div>
        )}
      </div>

      {/* Passive Info Modal */}
      <PassiveInfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      {/* Exit & Info Buttons (Absolute Positioned) */}
      {phase !== "game_over" && (
        <div className="absolute top-2 right-2 lg:top-4 lg:right-4 z-[60] flex items-center gap-2 pointer-events-none">
          {/* Info Button */}
          <button
            onClick={() => setShowInfo(true)}
            className="p-2 lg:px-3 lg:py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:border-blue-400 transition-all pointer-events-auto"
            title={t.passiveInfo}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Exit Button */}
          <button
            onClick={() => {
              resetGame();
              router.push("/");
            }}
            className="p-2 lg:px-3 lg:py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-500/70 hover:text-red-400 hover:border-red-400 transition-colors pointer-events-auto"
            title={t.exit}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Layout Container */}
      {/* Mobile: Col. Order: Opponent(1), Board(2), Player(3) */}
      {/* Desktop: 3-Col Grid. */}
      <div className="relative z-10 w-full h-full p-1 lg:p-8 grid grid-rows-[auto_1fr_auto] lg:grid-rows-1 lg:grid-cols-[minmax(200px,280px)_1fr_minmax(200px,280px)] gap-1 lg:gap-8 justify-items-center items-center max-w-[1600px] mx-auto">
        {/* PLAYER 1 HAND */}
        <div className="order-3 lg:order-1 w-full h-full flex flex-col items-center justify-center relative p-1 lg:p-2">
          {/* Mobile View (Horizontal) */}
          <div className="lg:hidden w-full flex justify-center items-center">
            <Hand
              cards={player1.hand}
              ownerId="player1"
              isCurrentPlayer={isMyTurn}
              orientation="horizontal"
              isCustom={isCustomMode}
            />
          </div>
          {/* Desktop View (Vertical) */}
          <div className="hidden lg:flex w-full h-full items-center justify-center">
            <Hand
              cards={player1.hand}
              ownerId="player1"
              isCurrentPlayer={isMyTurn}
              orientation="vertical"
              isCustom={isCustomMode}
            />
          </div>

          {/* Turn label for player (Mobile) */}
          {/* <div className="md:hidden absolute bottom-full mb-2 text-xs font-bold text-blue-500 animate-pulse">
            {isMyTurn && t.yourTurn}
          </div> */}
        </div>

        {/* CENTER (Board) */}
        <div className="order-2 w-full h-full flex items-center justify-center relative min-h-0 min-w-0">
          <div className="relative w-full h-full max-h-[55vh] sm:max-h-[60vh] lg:max-h-[80vh] aspect-square flex items-center justify-center">
            <div className="scale-85 sm:scale-75 lg:scale-95 transition-transform duration-500">
              <Board />
            </div>
          </div>

          {phase === "game_over" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, scale: 1, backdropFilter: "blur(12px)" }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900/80 border border-white/10 p-8 lg:p-12 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-[90vw] w-[400px] text-center"
              >
                <div className="mb-6">
                  <h2 className="text-gray-400 text-sm font-bold tracking-[0.3em] mb-2">
                    Game Result
                  </h2>
                  <h1
                    className={cn(
                      "text-5xl lg:text-7xl font-black tracking-tighter drop-shadow-2xl",
                      winner === "player1"
                        ? "text-blue-400"
                        : winner === "player2"
                        ? "text-red-500"
                        : "text-yellow-500"
                    )}
                  >
                    {winner === "draw"
                      ? t.draw
                      : `${winner === "player1" ? t.victory : t.defeat}`}
                  </h1>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => {
                      startGame();
                    }}
                    className="w-full py-4 bg-white text-black font-black text-sm tracking-widest hover:bg-gray-200 transition-colors rounded-2xl shadow-xl"
                  >
                    {t.playAgain}
                  </button>
                  <button
                    onClick={() => {
                      resetGame();
                      router.push("/");
                    }}
                    className="w-full py-4 bg-white/5 text-white/50 font-bold text-sm tracking-widest hover:bg-white/10 hover:text-white transition-all rounded-2xl"
                  >
                    {t.exit}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* PLAYER 2 / OPPONENT HAND */}
        <div className="order-1 lg:order-3 w-full h-full flex flex-col items-center justify-center relative p-1 lg:p-2">
          {/* Mobile View (Horizontal Compact) */}
          <div className={cn("lg:hidden w-full flex justify-center")}>
            <Hand
              cards={player2.hand}
              ownerId="player2"
              isCurrentPlayer={currentPlayerId === "player2"}
              orientation="horizontal"
              compact
              minimal={true}
              isHidden={isCustomMode ? false : true}
              isCustom={isCustomMode}
            />
          </div>
          {/* Desktop View (Vertical Compact) */}
          {/* Made full width/height to center nicely */}
          <div className="hidden lg:flex w-full h-full items-center justify-center">
            <Hand
              cards={player2.hand}
              ownerId="player2"
              isCurrentPlayer={currentPlayerId === "player2"}
              orientation="vertical"
              compact
              isHidden={isCustomMode ? false : true}
              isCustom={isCustomMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
