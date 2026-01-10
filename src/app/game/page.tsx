"use client";

import { motion } from "framer-motion";
import { Info, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Board } from "../../components/Board";
import { BoardIntroAnimation } from "../../components/BoardIntroAnimation";
import { BoardMechanicModal } from "../../components/BoardMechanicModal";
import { Hand } from "../../components/Hand";
import { PassiveInfoModal } from "../../components/PassiveInfoModal";
import { SettingsModal } from "../../components/SettingsModal";
import { useComputerAI } from "../../lib/useComputerAI";
import { cn } from "../../lib/utils";
import { useGameStore } from "../../store/useGameStore";
import { useGauntletStore } from "../../store/useGauntletStore";

import { FullScreenEffects } from "@/components/effects/FullScreenEffects";
import { FPSCounter } from "../../components/FPSCounter";
import { useSettingsStore, useTranslation } from "../../store/useSettingsStore";
import { Card } from "../../types/game";
import gameConfig from "../../gameConfig.json";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { useGameConfigStore } from "../../store/useGameConfigStore";
import { Settings as SettingsIcon } from "lucide-react";

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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBoardIntro, setShowBoardIntro] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const {
    showFPS: userShowFPS,
    showBoardAnimation: userShowBoardAnimation,
  } = useSettingsStore();

  // Active Settings (Respect devMode)
  const activeSettings = useMemo(() => {
    if (gameConfig.devMode) {
      return {
        showFPS: true, // Always show FPS in devMode
        showBoardAnimation: gameConfig.showAnimation,
        showCardPlaceAnimation: gameConfig.showAnimation,
        showBoardEffect: gameConfig.showBoardEffect,
        showFullScreenEffect: gameConfig.showFullScreenEffect,
      };
    }
    return {
      showFPS: userShowFPS,
      showBoardAnimation: userShowBoardAnimation,
      showCardPlaceAnimation: userShowBoardAnimation,
      showBoardEffect: userShowBoardAnimation,
      showFullScreenEffect: userShowBoardAnimation,
    };
  }, [
    userShowFPS,
    userShowBoardAnimation,
    gameConfig.devMode,
    gameConfig.showAnimation,
    gameConfig.showBoardEffect,
    gameConfig.showFullScreenEffect,
  ]);

  // Fix: Ensure intro is marked as "done" if animations are disabled
  useEffect(() => {
    if (!activeSettings.showBoardAnimation && showBoardIntro) {
      setShowBoardIntro(false);
    }
  }, [activeSettings.showBoardAnimation, showBoardIntro]);

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
  const processMatchResult = useGauntletStore(
    (state) => state.processMatchResult
  );
  const getOpponentConfig = useGauntletStore(
    (state) => state.getOpponentConfig
  );
  const isGauntletActive = useGauntletStore((state) => state.isActive);

  const {
    mode: configMode,
    mechanic: configMechanic,
    element: configElement,
  } = useGameConfigStore();

  const isGauntletMode = configMode === "gauntlet";
  const isCustomMode = configMode === "custom";

  const startGame = async (isRestart = false) => {
    setLoadingMessage(isRestart ? t.cleaning : t.preparing);

    // Artificial delay for cleanup/prep
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const isCustom = isCustomMode;
    const isGauntlet = isGauntletMode;
    const initialMechanic = configMechanic;
    const activeElement = configElement;

    if (isGauntlet) {
      // Gauntlet Initialization
      const config = getOpponentConfig();
      initGame(
        "gauntlet-room",
        true,
        config.mechanic,
        config.activeElement as any
      );

      useGameStore.setState((state) => ({
        mechanic: {
          type: config.mechanic,
          activeElement: config.activeElement || "none",
          jokerModifiers: { player1: 0, player2: 0 },
        },
        player1: {
          ...state.player1,
          hand: [...gauntletDeck].map((c) => ({
            ...c,
            id: c.id + Math.random(),
          })), // Refresh IDs
          totalFlips: 0,
        },
        player2: {
          ...state.player2,
          hand: config.deck,
          name: `Enemy ${gauntletRank}`,
          totalFlips: 0,
        },
      }));
    } else {
      // Standard / Custom Initialization
      initGame("test-room", !isCustom, initialMechanic, activeElement);

      useGameStore.setState((state) => ({
        player1: {
          ...state.player1,
          hand: isCustom
            ? generateDiverseHand("p1")
            : [...MOCK_CARDS].sort(() => Math.random() - 0.5),
          totalFlips: 0,
        },
        player2: {
          ...state.player2,
          hand: isCustom
            ? generateDiverseHand("p2")
            : [...OPPONENT_CARDS].sort(() => Math.random() - 0.5),
          name: isCustom ? "Player 2" : "Computer",
          totalFlips: 0,
        },
      }));
    }

    setLoadingMessage(null);
    setShowBoardIntro(true);
  };


  // Auto-skip intro if animation disabled
  useEffect(() => {
    if (!activeSettings.showBoardAnimation && showBoardIntro) {
      setShowBoardIntro(false);
    }
  }, [showBoardIntro, activeSettings.showBoardAnimation]);

  // Use AI Hook with Pause
  useComputerAI({ isPaused: showBoardIntro });


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

  return (
    <div className="h-[100dvh] w-full bg-black text-white overflow-hidden flex flex-col relative select-none">
      {loadingMessage && <LoadingOverlay message={loadingMessage} />}

      {!loadingMessage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black z-0 pointer-events-none overflow-hidden" />

          {/* Board Intro Animation */}
          {showBoardIntro && activeSettings.showBoardAnimation && (
            <BoardIntroAnimation
              mechanicType={mechanic.type}
              activeElement={mechanic.activeElement}
              onComplete={() => setShowBoardIntro(false)}
            />
          )}

          {/* Main Game UI - Only render after Intro OR if animation is disabled/skipped */}
          {(!showBoardIntro || !activeSettings.showBoardAnimation) && (
            <>
              {/* Full-Screen Effects */}
              {activeSettings.showFullScreenEffect && (
                <FullScreenEffects
                  mechanicType={mechanic.type}
                  activeElement={mechanic.activeElement}
                />
              )}

              {/* Header / Status Bar */}
              <div className="absolute top-1.5 left-0 right-0 z-50 flex items-center justify-center p-2 lg:p-4 pointer-events-none">
                {/* Turn Status Overlay (Central) */}
                {phase !== "game_over" && (
                  <div
                    className={cn(
                      "px-3 py-1 lg:px-4 lg:py-2 rounded-full border bg-black/80 font-bold text-[10px] lg:text-xl tracking-[0.2em] shadow-lg transition-all duration-500 pointer-events-auto",
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
              <PassiveInfoModal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)}
              />

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
                      className="flex items-center gap-2 px-2 py-2 lg:px-4 lg:py-2 rounded-full bg-black/80 border border-white/20 text-xs lg:text-sm font-bold text-white shadow-lg hover:bg-black/90 hover:border-white/30 transition-all pointer-events-auto"
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
                            .toUpperCase()}${mechanic.activeElement?.slice(
                            1
                          )} Field`}
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

              {/* Right Side: Exit & Settings Buttons */}
              {phase !== "game_over" && (
                <div className="absolute top-2 right-2 lg:top-4 lg:right-4 z-[60] pointer-events-none flex flex-row items-center gap-2">
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="p-2 lg:p-3 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:text-purple-300 hover:border-purple-400 transition-all pointer-events-auto shadow-lg backdrop-blur-sm"
                    title={t.settings.title}
                  >
                    <SettingsIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={async () => {
                      setLoadingMessage(t.cleaning);
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                      resetGame();
                      router.push("/");
                    }}
                    className="p-2 lg:p-3 rounded-full border border-red-500/30 bg-red-500/10 text-red-500/70 hover:text-red-400 hover:border-red-400 transition-colors pointer-events-auto shadow-lg backdrop-blur-sm"
                    title={t.exit}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Main Layout Container */}
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
                </div>

                {/* CENTER (Board) */}
                <div className="order-2 w-full h-full flex flex-col items-center justify-center relative min-h-0 min-w-0 gap-2 lg:gap-6">
                  <div className="relative w-full h-full max-h-[50vh] sm:max-h-[55vh] lg:max-h-[75vh] aspect-square flex items-center justify-center">
                    <div className="scale-85 sm:scale-75 lg:scale-95 transition-transform duration-500">
                      <Board 
                        showCardPlaceAnimation={activeSettings.showCardPlaceAnimation} 
                        showBoardEffect={activeSettings.showBoardEffect}
                      />
                    </div>
                  </div>

                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
                    >
                      <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          damping: 25,
                          stiffness: 200,
                        }}
                        className="bg-gray-900 border-2 border-white/10 p-8 lg:p-12 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col items-center max-w-[95vw] w-[450px] text-center relative overflow-hidden"
                      >
                        {/* Background Glow Decoration */}
                        <div
                          className={cn(
                            "absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] opacity-20",
                            winner === "player1"
                              ? "bg-blue-500"
                              : winner === "player2"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          )}
                        />

                        {/* Title Section (Top) */}
                        <div className="mb-8 relative z-10">
                          <h2 className="text-gray-500 text-[10px] lg:text-xs font-black tracking-[0.4em] mb-2 uppercase italic">
                            {isGauntletMode
                              ? t.gauntlet.roundCleared
                              : t.matchFinished}
                          </h2>
                          <h1
                            className={cn(
                              "text-6xl lg:text-7xl font-black tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] italic",
                              winner === "player1"
                                ? "text-blue-400"
                                : winner === "player2"
                                ? "text-red-500"
                                : "text-yellow-500"
                            )}
                          >
                            {winner === "draw"
                              ? t.draw
                              : winner === "player1"
                              ? t.victory
                              : t.defeat}
                          </h1>
                        </div>

                        {/* Stats Section (Middle) */}
                        <div className="flex items-center justify-between w-full gap-4 mb-10 relative z-10">
                          {/* Player Stat */}
                          <div className="flex flex-col items-center flex-1">
                            <div className="relative mb-3">
                              <div className="w-16 h-20 lg:w-20 lg:h-24 rounded-xl border-2 border-blue-500/50 p-1 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)] flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-blue-500/40 rounded-full" />
                                  </div>
                                </div>
                              </div>
                              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md border border-white/20 shadow-lg">
                                {t.you}
                              </div>
                            </div>
                            <div className="text-4xl lg:text-5xl font-black text-white drop-shadow-md">
                              {(() => {
                                const board = useGameStore.getState().board;
                                let count = 0;
                                board.forEach((row) =>
                                  row.forEach((cell) => {
                                    if (cell.owner === "player1") count++;
                                  })
                                );
                                return count;
                              })()}
                            </div>
                          </div>

                          {/* VS Divider */}
                          <div className="flex flex-col items-center">
                            <div className="h-10 w-[2px] bg-gradient-to-b from-transparent via-white/10 to-transparent mb-2" />
                            <div className="text-lg font-black text-gray-700 italic">
                              {t.vs}
                            </div>
                            <div className="h-10 w-[2px] bg-gradient-to-t from-transparent via-white/10 to-transparent mt-2" />
                          </div>

                          {/* Opponent Stat */}
                          <div className="flex flex-col items-center flex-1">
                            <div className="relative mb-3">
                              <div className="w-16 h-20 lg:w-20 lg:h-24 rounded-xl border-2 border-red-500/50 p-1 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)] flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full rounded-lg bg-gradient-to-br from-red-500/20 to-transparent flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full border-2 border-red-500/30 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-red-500/40 rounded-full" />
                                  </div>
                                </div>
                              </div>
                              <div className="absolute -bottom-2 -left-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md border border-white/20 shadow-lg">
                                {isGauntletMode ? t.boss : t.cpu}
                              </div>
                            </div>
                            <div className="text-4xl lg:text-5xl font-black text-white drop-shadow-md">
                              {(() => {
                                const board = useGameStore.getState().board;
                                let count = 0;
                                board.forEach((row) =>
                                  row.forEach((cell) => {
                                    if (cell.owner === "player2") count++;
                                  })
                                );
                                return count;
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Gauntlet Specific Info */}
                        {isGauntletMode && (
                          <div className="w-full bg-black/40 rounded-2xl p-4 border border-white/5 mb-8 relative z-10 flex justify-between items-center">
                            <div className="text-left">
                              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                                {t.gauntlet.rank}
                              </div>
                              <div className="text-yellow-400 font-black text-lg">
                                {gauntletRank}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                                {t.gauntlet.totalScore}
                              </div>
                              <div className="text-white font-black text-2xl">
                                {gauntletScore}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Buttons Section (Bottom) */}
                        <div className="flex flex-col gap-3 w-full relative z-10">
                          {isGauntletMode && winner === "player1" ? (
                            <button
                              onClick={() => {
                                processMatchResult(
                                  "player1",
                                  player1.totalFlips || 0
                                );
                                const config = getOpponentConfig();
                                initGame("gauntlet-room", true, config.mechanic);
                                useGameStore.setState((state) => ({
                                  mechanic: {
                                    type: config.mechanic,
                                    activeElement:
                                      config.activeElement || "none",
                                    jokerModifiers: { player1: 0, player2: 0 },
                                  },
                                  player1: {
                                    ...state.player1,
                                    hand: [...gauntletDeck].map((c) => ({
                                      ...c,
                                      id: c.id + Math.random(),
                                    })),
                                    totalFlips: 0,
                                  },
                                  player2: {
                                    ...state.player2,
                                    hand: config.deck,
                                    name: `Enemy ${gauntletRank}`,
                                    totalFlips: 0,
                                  },
                                }));
                                setShowResult(false);
                                setShowBoardIntro(true);
                              }}
                              className="w-full py-4 bg-blue-500 text-white font-black text-sm tracking-[0.2em] hover:bg-blue-400 transition-all rounded-2xl shadow-[0_4px_0_rgb(30,64,175)] active:translate-y-1 active:shadow-none uppercase italic"
                            >
                              {t.gauntlet.nextBattle}
                            </button>
                          ) : (
                            <button
                              onClick={() => startGame(true)}
                              className="w-full py-4 bg-white text-black font-black text-sm tracking-[0.2em] hover:bg-gray-200 transition-all rounded-2xl shadow-[0_4px_0_rgb(156,163,175)] active:translate-y-1 active:shadow-none uppercase italic"
                            >
                              {t.playAgain}
                            </button>
                          )}

                          <button
                            onClick={async () => {
                              if (isGauntletMode && winner !== "player1") {
                                processMatchResult(
                                  winner || "draw",
                                  player1.totalFlips || 0
                                );
                              }
                              setLoadingMessage("Membersihkan battlefield...");
                              await new Promise((resolve) =>
                                setTimeout(resolve, 1000)
                              );
                              resetGame();
                              router.push("/");
                            }}
                            className="w-full py-4 bg-gray-800 text-gray-400 font-black text-sm tracking-[0.2em] hover:bg-gray-700 hover:text-white transition-all rounded-2xl uppercase italic"
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
                      minimal={isCustomMode ? false : true}
                      isHidden={isCustomMode ? false : true}
                      isCustom={isCustomMode}
                      name={player2.name}
                    />
                  </div>
                  {/* Desktop View (Vertical Compact) */}
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
            </>
          )}
        </>
      )}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
      {activeSettings.showFPS && <FPSCounter />}
    </div>
  );
}
