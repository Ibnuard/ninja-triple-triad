"use client";

import { useEffect } from "react";
import { Board } from "../../components/Board";
import { Hand } from "../../components/Hand";
import { useGameStore } from "../../store/useGameStore";
import { Card } from "../../types/game";
import { useRouter } from "next/navigation";
import { useComputerAI } from "../../lib/useComputerAI";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { useSettingsStore } from "../../store/useSettingsStore";

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
      <div className="absolute top-2 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div
          className={cn(
            "px-4 py-1 md:py-2 rounded-full border backdrop-blur-md font-bold text-xs md:text-xl uppercase tracking-[0.2em] shadow-lg transition-all duration-500",
            isMyTurn
              ? "bg-blue-500/10 border-blue-500 text-blue-400"
              : "bg-red-500/10 border-red-500 text-red-500"
          )}
        >
          {isMyTurn ? t.yourTurn : t.opponentTurn}
        </div>
      </div>

      {/* Main Layout Container */}
      {/* Mobile: Col. 
          Order: Opponent(1), Board(2), Player(3)
          
          Desktop: 3-Col Grid is better than Flex Row for equal spacing.
          Grid Areas: "player board opponent"
      */}
      <div className="relative z-10 w-full h-full p-2 md:p-8 grid grid-rows-[auto_1fr_auto] md:grid-rows-1 md:grid-cols-[250px_1fr_250px] gap-2 md:gap-8 justify-items-center items-center">
        {/* PLAYER HAND */}
        {/* Mobile: Order 3 (Bottom). Desktop: Col 1 (Left). 
                We need to change Hand orientation based on screen size? 
                The Hand component takes `orientation` prop. We can't change prop via CSS.
                SO we DO need two components OR a responsive Hand component.
                But user said "Player card double".
                
                Let's use a ResponsiveHand wrapper that handles the logic or just media-query based orientation inside Hand?
                Actually, simpler: Just Render ONE Hand, pass "responsive" orientation?
                No, let's keep it simple: Use `hidden md:flex` layout strategy again BUT make sure it works!
                
                WAIT, the previous issue "double cards" implies BOTH `hidden` and `flex` were displaying.
                Maybe `md:` breakpoint isn't triggering correctly or parent overrides?
                
                Let's try the FLEX ORDER approach with a single Hand component that adapts its style? 
                But `Hand` renders a `flex-col` or `flex-row` div. We can't change that with just CSS classes passed in unless we refactor Hand.
                
                Solution: Refactor Hand to accept `className` for the container and logic for internal layout.
                OR: Just Ensure `display: none` works. 
                
                Let's try a different approach:
                Use a `HandContainer` that is `flex` and switches direction using CSS classes, passing that down.
            */}

        {/* Let's go with the duplicate DOM but fix the hiding classes. 
                The issue might be `md:hidden` vs `flex` conflict.
                Explicitly: `className="flex ... md:hidden"` vs `className="hidden md:flex ..."`
                
                Actually, looking at previous code:
                <div className="hidden md:flex ..."> (Desktop Left)
                <div className="md:hidden ..."> (Mobile Top)
                
                If both showed up, maybe the viewport width was exactly at a weird spot or CSS clash.
                
                Let's try the Grid Area approach with ONE component instance?
                No, because React needs to render different props (orientation='vertical' vs 'horizontal').
                
                Mobile: Player Hand Horizontal.
                Desktop: Player Hand Vertical.
                
                So we DO need to render differently.
                
                Let's try to wrap them in a container that handles the layout more rigidly.
            */}

        {/* LEFT / BOTTOM (Player) */}
        <div className="order-3 md:order-1 w-full h-full flex flex-col items-center justify-center md:justify-center relative">
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
          <div className="hidden md:flex h-full items-center justify-center">
            <Hand
              cards={player1.hand}
              ownerId="player1"
              isCurrentPlayer={isMyTurn}
              orientation="vertical"
            />
          </div>

          {/* Turn label for player (Mobile) */}
          <div className="md:hidden absolute bottom-full mb-2 text-xs font-bold text-blue-500 animate-pulse">
            {isMyTurn && t.yourTurn}
          </div>
        </div>

        {/* CENTER (Board) */}
        <div className="order-2 w-full h-full flex items-center justify-center relative min-h-0">
          <div className="relative w-full h-full max-h-[60vh] md:max-h-[80vh] aspect-square flex items-center justify-center">
            <div className="scale-[0.65] sm:scale-75 md:scale-100 transition-transform">
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
        <div className="order-1 md:order-3 w-full h-full flex flex-col items-center justify-center md:justify-center relative">
          {/* Add Identity Header for Desktop */}
          <div className="hidden md:flex flex-col items-center mb-4">
            {/* Avatar or Icon could go here */}
          </div>

          {/* Mobile View (Horizontal Compact) */}
          <div className="md:hidden w-full flex justify-center">
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
          <div className="hidden md:flex h-full items-center justify-center">
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
        className="absolute top-4 left-4 z-50 text-xs text-white/30 border border-white/10 px-2 py-1 rounded hover:text-white"
      >
        {t.exit}
      </button>
    </div>
  );
}
