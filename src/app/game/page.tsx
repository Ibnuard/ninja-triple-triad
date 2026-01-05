"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Board } from "../../components/Board";
import { Hand } from "../../components/Hand";
import { useComputerAI } from "../../lib/useComputerAI";
import { cn } from "../../lib/utils";
import { useGameStore } from "../../store/useGameStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { Card } from "../../types/game";

// Mock Cards (Same as before)
const MOCK_CARDS: Card[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `card-${i}-${Math.random()}`,
  name: `Ninja ${i + 1}`,
  element: ["fire", "water", "earth", "wind", "lightning", "none"][
    Math.floor(Math.random() * 6)
  ] as any,
  image: "",
  stats: {
    top: Math.floor(Math.random() * 9) + 1,
    bottom: Math.floor(Math.random() * 9) + 1,
    left: Math.floor(Math.random() * 9) + 1,
    right: Math.floor(Math.random() * 9) + 1,
  },
}));

const OPPONENT_CARDS: Card[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `opp-card-${i}-${Math.random()}`,
  name: `Ronin ${i + 1}`,
  element: ["fire", "water", "earth", "wind", "lightning", "none"][
    Math.floor(Math.random() * 6)
  ] as any,
  image: "",
  stats: {
    top: Math.floor(Math.random() * 9) + 1,
    bottom: Math.floor(Math.random() * 9) + 1,
    left: Math.floor(Math.random() * 9) + 1,
    right: Math.floor(Math.random() * 9) + 1,
  },
}));

const GAME_TRANSLATIONS = {
  en: {
    yourTurn: "YOUR TURN",
    opponentTurn: "OPPONENT TURN",
    waiting: "WAITING...",
    victory: "VICTORY",
    defeat: "DEFEAT",
    draw: "DRAW",
    playAgain: "PLAY AGAIN",
    exit: "EXIT",
  },
  id: {
    yourTurn: "GILIRANMU",
    opponentTurn: "GILIRAN LAWAN",
    waiting: "MENUNGGU...",
    victory: "MENANG",
    defeat: "KALAH",
    draw: "SERI",
    playAgain: "MAIN LAGI",
    exit: "KELUAR",
  },
};

export default function GamePage() {
  const {
    initGame,
    player1,
    player2,
    currentPlayerId,
    phase,
    winner,
    resetGame,
  } = useGameStore();

  const { language } = useSettingsStore();
  const t = GAME_TRANSLATIONS[language];

  const router = useRouter();

  // Use AI Hook
  useComputerAI();

  useEffect(() => {
    if (player1.hand.length === 0) {
      initGame("test-room", true);
      useGameStore.setState((state) => ({
        player1: { ...state.player1, hand: MOCK_CARDS },
        player2: { ...state.player2, hand: OPPONENT_CARDS },
      }));
    }
  }, []);

  const isMyTurn = currentPlayerId === "player1";

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden flex flex-col relative select-none">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542256843-e38029d5d851?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black z-0 pointer-events-none" />

      {/* Turn Status Overlay (Central) */}
      <div className="absolute top-4 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div
          className={cn(
            "px-4 py-1 md:py-2 rounded-full border backdrop-blur-md font-bold text-xs md:text-xl uppercase tracking-[0.2em] shadow-lg transition-all duration-500",
            isMyTurn
              ? "bg-blue-500/10 border-blue-500 text-blue-400 animate-pulse ring-blue-500"
              : "bg-red-500/10 border-red-500 text-red-500"
          )}
        >
          {isMyTurn ? t.yourTurn : t.opponentTurn}
        </div>
      </div>

      {/* Main Layout Container */}
      {/* Mobile: Col. Order: Opponent(1), Board(2), Player(3) */}
      {/* Desktop: 3-Col Grid. */}
      {/* UPDATE: Use minmax for columns to prevent overlap on small desktops. Reduced min size to 200px. */}
      <div className="relative z-10 w-full h-full p-2 md:p-8 grid grid-rows-[auto_1fr_auto] md:grid-rows-1 md:grid-cols-[minmax(200px,280px)_1fr_minmax(200px,280px)] gap-2 md:gap-8 justify-items-center items-center max-w-[1600px] mx-auto">
        {/* LEFT / BOTTOM (Player) */}
        <div className="order-3 md:order-1 w-full h-full flex flex-col items-center justify-end md:justify-center relative p-2">
          {/* Mobile View (Horizontal) */}
          <div className="md:hidden w-full flex justify-center">
            <Hand
              cards={player1.hand}
              ownerId="player1"
              isCurrentPlayer={isMyTurn}
              orientation="horizontal"
            />
          </div>
          {/* Desktop View (Vertical) */}
          <div className="hidden md:flex w-full h-full items-center justify-center">
            <Hand
              cards={player1.hand}
              ownerId="player1"
              isCurrentPlayer={isMyTurn}
              orientation="vertical"
            />
          </div>

          {/* Turn label for player (Mobile) */}
          {/* <div className="md:hidden absolute bottom-full mb-2 text-xs font-bold text-blue-500 animate-pulse">
            {isMyTurn && t.yourTurn}
          </div> */}
        </div>

        {/* CENTER (Board) */}
        <div className="order-2 w-full h-full flex items-center justify-center relative min-h-0 min-w-0">
          <div className="relative w-full h-full max-h-[50vh] sm:max-h-[60vh] md:max-h-[80vh] aspect-square flex items-center justify-center">
            <div className="scale-[0.85] sm:scale-75 md:scale-95 lg:scale-100 transition-transform duration-500">
              <Board />
            </div>
          </div>

          {phase === "game_over" && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-xl">
              <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-red-600 mb-4 drop-shadow-2xl">
                {winner === "draw"
                  ? t.draw
                  : `${winner === "player1" ? t.victory : t.defeat}`}
              </h1>
              <button
                onClick={() => {
                  resetGame();
                  router.push("/");
                }}
                className="px-8 py-3 bg-white text-black font-bold text-lg uppercase tracking-widest hover:scale-105 transition-transform rounded-full shadow-xl"
              >
                {t.playAgain}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT / TOP (Opponent) */}
        <div className="order-1 md:order-3 w-full h-full flex flex-col items-center justify-start md:justify-center relative pt-12 md:pt-0 p-2">
          {/* Mobile View (Horizontal Compact) */}
          <div className={cn("md:hidden w-full flex justify-center")}>
            <Hand
              cards={player2.hand}
              ownerId="player2"
              isCurrentPlayer={false}
              orientation="horizontal"
              compact
              isHidden
            />
          </div>
          {/* Desktop View (Vertical Compact) */}
          {/* Made full width/height to center nicely */}
          <div className="hidden md:flex w-full h-full items-center justify-center">
            <Hand
              cards={player2.hand}
              ownerId="player2"
              isCurrentPlayer={false}
              orientation="vertical"
              compact
              isHidden
            />
          </div>
        </div>
      </div>

      {/* Exit Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 z-50 text-xs text-red-500/50 border border-red-500/50 px-2 py-1 rounded hover:text-red-400 hover:border-red-400"
      >
        {t.exit}
      </button>
    </div>
  );
}
