"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { LogOut, Info, Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";
import { BoardIntroAnimation } from "../../components/BoardIntroAnimation";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { Board } from "../../components/Board";
import { Hand } from "../../components/Hand";
import { PassiveInfoModal } from "../../components/PassiveInfoModal";
import { BoardMechanicModal } from "../../components/BoardMechanicModal";
import { useComputerAI } from "../../lib/useComputerAI";
import { cn } from "../../lib/utils";
import { useGameStore } from "../../store/useGameStore";
import { useGauntletStore, RANK_MULTIPLIERS } from "../../store/useGauntletStore";

import { useTranslation, useSettingsStore } from "../../store/useSettingsStore";
import { Card } from "../../types/game";

// Mock Cards
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
  const [showMechanicModal, setShowMechanicModal] = useState(false);
  const [showBoardIntro, setShowBoardIntro] = useState(true);
  
  // Use selective subscriptions to prevent re-renders on drag state changes
  const initGame = useGameStore((state) => state.initGame);
  const player1 = useGameStore((state) => state.player1);
  const player2 = useGameStore((state) => state.player2);
  const currentPlayerId = useGameStore((state) => state.currentPlayerId);
  const phase = useGameStore((state) => state.phase);
  const winner = useGameStore((state) => state.winner);
  const resetGame = useGameStore((state) => state.resetGame);
  const mechanic = useGameStore((state) => state.mechanic);

  const t = useTranslation().game;
  const { language } = useSettingsStore();

  const router = useRouter();

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
  
  // Gauntlet Store
  const gauntletRank = useGauntletStore((state) => state.rank);
  const gauntletScore = useGauntletStore((state) => state.score);
  const gauntletDeck = useGauntletStore((state) => state.deck);
  const processMatchResult = useGauntletStore((state) => state.processMatchResult);
  const getOpponentConfig = useGauntletStore((state) => state.getOpponentConfig);
  const isGauntletActive = useGauntletStore((state) => state.isActive);

  const isGauntletMode = 
    typeof window !== "undefined" && 
    window.location.search.includes("mode=gauntlet");

  // ... existing code

  const startGame = () => {
    const isCustom =
      typeof window !== "undefined" &&
      window.location.search.includes("mode=custom");
    
    const isGauntlet = 
      typeof window !== "undefined" &&
      window.location.search.includes("mode=gauntlet");

    // Parse mechanic from URL
    const urlParams = new URLSearchParams(window.location.search);
    const mechanicParam = urlParams.get("mechanic");
    const initialMechanic = mechanicParam as any; // Cast to BoardMechanicType

    if (isGauntlet) {
       // Gauntlet Initialization
       const config = getOpponentConfig();
       initGame("gauntlet-room", true, config.mechanic);
       
       useGameStore.setState((state) => ({
        mechanic: { 
          type: config.mechanic, 
          activeElement: config.activeElement || "none",
          jokerModifiers: { player1: 0, player2: 0 }
        },
        player1: {
          ...state.player1,
          hand: [...gauntletDeck].map(c => ({...c, id: c.id + Math.random()})), // Refresh IDs
          totalFlips: 0
        },
        player2: {
          ...state.player2,
          hand: config.deck,
          name: `Enemy ${gauntletRank}`,
          totalFlips: 0
        },
      }));
    } else {
      // Standard / Custom Initialization
      initGame("test-room", !isCustom, initialMechanic); 

      useGameStore.setState((state) => ({
        player1: {
          ...state.player1,
          hand: isCustom
            ? generateDiverseHand("p1")
            : [...MOCK_CARDS].sort(() => Math.random() - 0.5),
          totalFlips: 0
        },
        player2: {
          ...state.player2,
          hand: isCustom
            ? generateDiverseHand("p2")
            : [...OPPONENT_CARDS].sort(() => Math.random() - 0.5),
          name: isCustom ? "Player 2" : "Computer",
          totalFlips: 0
        },
      }));
    }
  };

  const [pInit, setPInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setPInit(true);
    });
  }, []);

  // Use AI Hook with Pause
  useComputerAI({ isPaused: showBoardIntro });

  const particlesOptions = useMemo(() => {
    const defaultColor = ["#ffffff"];
    let color = defaultColor;
    let direction: any = "top";
    let speed = { min: 1, max: 3 };
    let shape: any = "circle";
    let size: any = { min: 1, max: 3 };
    let particleCount = 40;
    let opacity: any = { min: 0.1, max: 0.4 };

    if (mechanic.type === "random_elemental") {
      switch (mechanic.activeElement) {
        case "fire":
          // Fire: Rising embers with varying sizes
          color = ["#ff3b00", "#ff7a00", "##ffd000", "#ff4500"];
          direction = "top";
          speed = { min: 2, max: 5 };
          shape = "circle";
          size = { min: 2, max: 6 };
          particleCount = 50;
          opacity = { min: 0.3, max: 0.8 };
          break;
        case "water":
          // Water: Falling droplets
          color = ["#3b82f6", "#60a5fa", "#93c5fd", "#0ea5e9"];
          direction = "bottom";
          speed = { min: 1, max: 4 };
          shape = "circle";
          size = { min: 1, max: 4 };
          particleCount = 60;
          opacity = { min: 0.2, max: 0.6 };
          break;
        case "earth":
          // Earth: Slow-moving rocks/crystals
          color = ["#d97706", "#b45309", "#92400e", "#78350f"];
          direction = "bottom-left";
          speed = { min: 0.5, max: 2 };
          shape = "square";
          size = { min: 2, max: 5 };
          particleCount = 30;
          opacity = { min: 0.3, max: 0.7 };
          break;
        case "wind":
          // Wind: Fast horizontal streaks
          color = ["#10b981", "#34d399", "#6ee7b7", "#059669"];
          direction = "right";
          speed = { min: 8, max: 15 };
          shape = "edge";
          size = { min: 3, max: 8 };
          particleCount = 35;
          opacity = { min: 0.1, max: 0.4 };
          break;
        case "lightning":
          // Lightning: Erratic stars/sparks
          color = ["#eab308", "#facc15", "#fef08a", "#fbbf24"];
          direction = "none";
          speed = { min: 3, max: 8 };
          shape = "star";
          size = { min: 2, max: 5 };
          particleCount = 45;
          opacity = { min: 0.4, max: 0.9 };
          break;
      }
    } else if (mechanic.type === "poison") {
      color = ["#a855f7", "#c084fc", "#d8b4fe", "#9333ea"];
      direction = "top";
      shape = "circle";
      size = { min: 1, max: 4 };
      opacity = { min: 0.2, max: 0.5 };
    } else if (mechanic.type === "foggy") {
      color = ["#9ca3af", "#d1d5db", "#f3f4f6", "#6b7280"];
      direction = "none";
      shape = "circle";
      size = { min: 10, max: 30 };
      particleCount = 20;
      opacity = { min: 0.05, max: 0.2 };
      speed = { min: 0.3, max: 1 };
    } else if (mechanic.type === "joker") {
      color = ["#ec4899", "#a855f7", "#3b82f6", "#f59e0b"];
      direction = "top";
      shape = "triangle";
      size = { min: 2, max: 5 };
      opacity = { min: 0.3, max: 0.7 };
    }

    return {
      fullScreen: { enable: false },
      fpsLimit: 120,
      particles: {
        number: { value: particleCount, density: { enable: true, area: 800 } },
        color: { value: color },
        shape: { type: shape },
        opacity: {
          value: opacity,
          animation: { enable: true, speed: 1, minimumValue: opacity.min, sync: false },
        },
        size: {
          value: size,
          animation: { enable: true, speed: 2, minimumValue: size.min, sync: false },
        },
        move: {
          enable: true,
          speed: speed,
          direction: direction,
          random: true,
          straight: shape === "edge", // Wind moves more straight
          outModes: { default: "out" },
        },
      },
      detectRetina: true,
    };
  }, [mechanic.type, mechanic.activeElement]);

  // Memoize the Particles component to prevent remounting
  const particlesComponent = useMemo(() => {
    if (!pInit) return null;
    return (
      <Particles
        id="tsparticles"
        options={particlesOptions as any}
        className="absolute inset-0 pointer-events-none"
      />
    );
  }, [pInit, particlesOptions]);

  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (phase === "game_over") {
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [phase]);

  useEffect(() => {
    // Always start game if in Gauntlet mode to ensure correct opponent name/config
    // Or if hand is empty (standard flow)
    if (isGauntletMode || player1.hand.length === 0) {
      startGame();
    }
  }, []);

  const isMyTurn = currentPlayerId === "player1";
  const isCustomMode =
    typeof window !== "undefined" &&
    window.location.search.includes("mode=custom");

  return (
    <div className="h-[100dvh] w-full bg-black text-white overflow-hidden flex flex-col relative select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black z-0 pointer-events-none overflow-hidden">
        {particlesComponent}
      </div>

      {/* Board Intro Animation */}
      {showBoardIntro && (
        <BoardIntroAnimation
          mechanicType={mechanic.type}
          activeElement={mechanic.activeElement}
          onComplete={() => setShowBoardIntro(false)}
        />
      )}

      {/* Header / Status Bar */}
      <div className="absolute top-1.5 left-0 right-0 z-50 flex items-center justify-center p-2 lg:p-4 pointer-events-none">
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
              : isGauntletMode
              ? player2.name
              : isCustomMode
              ? "Player 2 Turn"
              : t.opponentTurn}
          </div>
        )}
      </div>

      {/* Passive Info Modal */}
      <PassiveInfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      {/* Board Mechanic Modal */}
      <BoardMechanicModal
        isOpen={showMechanicModal}
        onClose={() => setShowMechanicModal(false)}
        mechanic={mechanic}
      />

      {/* Left Side: Board Effect & Passive Info */}
      {phase !== "game_over" && (
        <div className="absolute top-2 left-2 lg:top-4 lg:left-4 z-[60] flex flex-row gap-2 pointer-events-none">
          {/* Board Effect Chip - Clickable */}
          {mechanic.type !== "none" && (
            <button
              onClick={() => setShowMechanicModal(true)}
              className="flex items-center gap-2 px-2 py-2 lg:px-4 lg:py-2 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-xs lg:text-sm font-bold text-white shadow-lg hover:bg-black/80 hover:border-white/30 transition-all pointer-events-auto"
            >
              {mechanic.type === "random_elemental" && (
                <>
                  {mechanic.activeElement === "fire" && (
                    <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                      <img
                        src="/images/fire.webp"
                        alt="fire"
                        className="w-[60%] h-[60%] object-contain"
                      />
                    </div>
                  )}
                  {mechanic.activeElement === "water" && (
                    <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <img
                        src="/images/water.webp"
                        alt="water"
                        className="w-[60%] h-[60%] object-contain"
                      />
                    </div>
                  )}
                  {mechanic.activeElement === "earth" && (
                    <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-amber-800/20 flex items-center justify-center">
                      <img
                        src="/images/earth.webp"
                        alt="earth"
                        className="w-[60%] h-[60%] object-contain"
                      />
                    </div>
                  )}
                  {mechanic.activeElement === "wind" && (
                    <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <img
                        src="/images/wind.webp"
                        alt="wind"
                        className="w-[60%] h-[60%] object-contain"
                      />
                    </div>
                  )}
                  {mechanic.activeElement === "lightning" && (
                    <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-yellow-400/20 flex items-center justify-center">
                      <img
                        src="/images/lightning.webp"
                        alt="lightning"
                        className="w-[60%] h-[60%] object-contain"
                      />
                    </div>
                  )}
                </>
              )}
              {mechanic.type === "poison" && (
                <span className="text-purple-500">☠️</span>
              )}
              {mechanic.type === "foggy" && (
                <span className="text-gray-400">🌫️</span>
              )}
              {mechanic.type === "joker" && (
                <span className="text-pink-500">🎲</span>
              )}
              <span className="hidden lg:inline whitespace-nowrap">
                {mechanic.type === "random_elemental" &&
                  `${mechanic.activeElement
                    ?.charAt(0)
                    .toUpperCase()}${mechanic.activeElement?.slice(1)} Field`}
                {mechanic.type === "poison" && "Poison Field"}
                {mechanic.type === "foggy" && "Foggy Field"}
                {mechanic.type === "joker" && "Joker Field"}
              </span>
            </button>
          )}

          {/* Passive Info Button */}
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2 px-2 py-2 lg:px-4 lg:py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:border-blue-400 transition-all pointer-events-auto"
            title={t.passiveInfo}
          >
            <Info className="w-4 h-4" />
            {/* Label only on desktop */}
            <span className="hidden lg:inline whitespace-nowrap text-xs lg:text-sm font-bold">
              {t.passiveInfo}
            </span>
          </button>
        </div>
      )}

      {/* Right Side: Exit Button */}
      {phase !== "game_over" && (
        <div className="absolute top-2 right-2 lg:top-4 lg:right-4 z-[60] pointer-events-none flex flex-col items-end gap-2">
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
        <div
          className={cn(
            "order-3 lg:order-1 w-full h-full flex flex-col items-center justify-center relative p-1 lg:p-2",
            useGameStore.getState().draggingCardId && "z-[100]"
          )}
        >
          {/* Mobile View (Horizontal) */}
          <div className="lg:hidden w-full flex justify-center items-center">
            <Hand
              cards={player1.hand}
              ownerId="player1"
              isCurrentPlayer={isMyTurn}
              orientation="horizontal"
              isCustom={isCustomMode}
              gauntletRank={isGauntletMode ? gauntletRank : undefined}
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
              gauntletRank={isGauntletMode ? gauntletRank : undefined}
            />
          </div>

          {/* Turn label for player (Mobile) */}
          {/* <div className="md:hidden absolute bottom-full mb-2 text-xs font-bold text-blue-500 animate-pulse">
            {isMyTurn && t.yourTurn}
          </div> */}
        </div>

        {/* CENTER (Board) */}
        <div className="order-2 w-full h-full flex flex-col items-center justify-center relative min-h-0 min-w-0 gap-2 lg:gap-6">
          


          <div className="relative w-full h-full max-h-[50vh] sm:max-h-[55vh] lg:max-h-[75vh] aspect-square flex items-center justify-center">
            <div className="scale-85 sm:scale-75 lg:scale-95 transition-transform duration-500">
              <Board />
            </div>
          </div>

          {showResult && (
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
                {/* GAUNTLET MODE RESULT */}
                {isGauntletMode ? (
                  <div className="mb-6 w-full">
                    <h2 className="text-gray-400 text-sm font-bold tracking-[0.3em] mb-2 uppercase">
                      {winner === "player1" ? t.gauntlet.roundCleared : t.gauntlet.gauntletOver}
                    </h2>
                    
                    <h1 className={cn(
                      "text-5xl lg:text-6xl font-black tracking-tighter drop-shadow-2xl mb-4",
                      winner === "player1" ? "text-green-400" : "text-red-500"
                    )}>
                      {winner === "player1" ? t.victory : t.defeat}
                    </h1>

                    {/* Score Summary */}
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-6">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-gray-400 text-xs uppercase tracking-wider">{t.gauntlet.rank}</span>
                         <span className="text-yellow-400 font-black">{gauntletRank}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-gray-400 text-xs uppercase tracking-wider">{t.gauntlet.totalScore}</span>
                         <span className="text-white font-black text-xl">{gauntletScore}</span>
                      </div>
                      {winner === "player1" && (
                        <div className="text-xs text-green-400 font-bold mt-2 border-t border-white/10 pt-2">
                          + {player1.totalFlips || 0} {t.gauntlet.flipsBonus}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                      {winner === "player1" ? (
                        <button
                          onClick={() => {
                            // Process result and start next round
                            processMatchResult("player1", player1.totalFlips || 0);
                            const config = getOpponentConfig();
                            
                            // Re-init game with new config
                            initGame("gauntlet-room", true, config.mechanic);
                            useGameStore.setState((state) => ({
                              mechanic: { 
                                type: config.mechanic, 
                                activeElement: config.activeElement || "none",
                                jokerModifiers: { player1: 0, player2: 0 }
                              },
                              player1: {
                                ...state.player1,
                                hand: [...gauntletDeck].map(c => ({...c, id: c.id + Math.random()})), // Refresh IDs
                                totalFlips: 0
                              },
                              player2: {
                                ...state.player2,
                                hand: config.deck,
                                name: `Enemy ${gauntletRank}`,
                                totalFlips: 0
                              },
                            }));
                            setShowResult(false);
                            setShowBoardIntro(true);
                          }}
                          className="w-full py-4 bg-green-500 text-black font-black text-sm tracking-widest hover:bg-green-400 transition-colors rounded-2xl shadow-xl uppercase"
                        >
                          {t.gauntlet.nextBattle}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            processMatchResult(winner || "draw", player1.totalFlips || 0); // This ends the run
                            resetGame();
                            router.push("/single-player");
                          }}
                          className="w-full py-4 bg-white text-black font-black text-sm tracking-widest hover:bg-gray-200 transition-colors rounded-2xl shadow-xl uppercase"
                        >
                          {t.gauntlet.returnToMenu}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // STANDARD MODE RESULT
                  <>
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
                  </>
                )}
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
              name={player2.name}
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
              name={player2.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
