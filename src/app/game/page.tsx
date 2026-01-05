"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut } from "lucide-react";
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
    <div className="h-[100dvh] w-full bg-black text-white overflow-hidden flex flex-col relative select-none">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542256843-e38029d5d851?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black z-0 pointer-events-none" />

      {/* Header / Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-2 lg:p-4 pointer-events-none">
        {/* Empty space for balance on desktop */}
        <div className="w-10 lg:hidden" /> 

        {/* Turn Status Overlay (Central) */}
        <div
          className={cn(
            "px-3 py-1 lg:px-4 lg:py-2 rounded-full border backdrop-blur-md font-bold text-[10px] lg:text-xl uppercase tracking-[0.2em] shadow-lg transition-all duration-500 pointer-events-auto",
            isMyTurn
              ? "bg-blue-500/10 border-blue-500 text-blue-400 animate-pulse ring-blue-500"
              : "bg-red-500/10 border-red-500 text-red-500"
          )}
        >
          {isMyTurn ? t.yourTurn : t.opponentTurn}
        </div>

        {/* Exit Button */}
        <button
          onClick={() => router.push("/")}
          className="p-2 lg:px-3 lg:py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500/70 hover:text-red-400 hover:border-red-400 transition-colors pointer-events-auto"
          title={t.exit}
        >
          <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">{t.exit}</span>
          <LogOut className="w-4 h-4 lg:hidden" />
        </button>
      </div>

      {/* Main Layout Container */}
      {/* Mobile: Col. Order: Opponent(1), Board(2), Player(3) */}
      {/* Desktop: 3-Col Grid. */}
      <div className="relative z-10 w-full h-full p-1 lg:p-8 grid grid-rows-[1fr_2fr_1fr] lg:grid-rows-1 lg:grid-cols-[minmax(200px,280px)_1fr_minmax(200px,280px)] gap-1 lg:gap-8 justify-items-center items-center max-w-[1600px] mx-auto">
        {/* LEFT / BOTTOM (Player) */}
        <div className="order-3 lg:order-1 w-full h-full flex flex-col items-center justify-center relative p-1 lg:p-2">
          {/* Mobile View (Horizontal) */}
          <div className="lg:hidden w-full flex justify-center items-center">
            <Hand
              cards={player1.hand}
              ownerId="player1"
              isCurrentPlayer={isMyTurn}
              orientation="horizontal"
            />
          </div>
          {/* Desktop View (Vertical) */}
          <div className="hidden lg:flex w-full h-full items-center justify-center">
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
          <div className="relative w-full h-full max-h-[65vh] sm:max-h-[60vh] lg:max-h-[80vh] aspect-square flex items-center justify-center">
            <div className="scale-100 sm:scale-75 lg:scale-95 transition-transform duration-500">
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
        <div className="order-1 lg:order-3 w-full h-full flex flex-col items-center justify-center relative p-1 lg:p-2">
          {/* Mobile View (Horizontal Compact) */}
          <div className={cn("lg:hidden w-full flex justify-center")}>
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
          <div className="hidden lg:flex w-full h-full items-center justify-center">
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

    </div>
  );
}
