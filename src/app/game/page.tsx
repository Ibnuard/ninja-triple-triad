"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Info, LogOut } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOnlineGameLogic } from "../../lib/useOnlineGameLogic";
import { useEffect, useMemo, useState, Suspense } from "react";
import { Board } from "../../components/Board";
import { BoardIntroAnimation } from "../../components/BoardIntroAnimation";
import { BossIntroAnimation } from "../../components/BossIntroAnimation";
import { BoardMechanicModal } from "../../components/BoardMechanicModal";
import { Hand } from "../../components/Hand";
import { PassiveInfoModal } from "../../components/PassiveInfoModal";
import { SettingsModal } from "../../components/SettingsModal";
import { GauntletRewardModal } from "../../components/GauntletRewardModal";
import { RewardSelectionOverlay } from "../../components/RewardSelectionOverlay";
import { SwapAnimationOverlay } from "../../components/SwapAnimationOverlay";
import { useComputerAI } from "../../lib/useComputerAI";
import { cn } from "../../lib/utils";
import { useGameStore } from "../../store/useGameStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useGauntletStore } from "../../store/useGauntletStore";
import { useCardStore } from "../../store/useCardStore";
import { useDeckStore } from "../../store/useDeckStore";
import { useMatchmakingStore } from "../../store/useMatchmakingStore";
import { RANK_THRESHOLDS, GauntletRank } from "../../constants/gauntlet";
import { animate } from "framer-motion";
import { CARD_POOL } from "../../data/cardPool";

import { FullScreenEffects } from "@/components/effects/FullScreenEffects";
import { FPSCounter } from "../../components/FPSCounter";
import { useSettingsStore, useTranslation } from "../../store/useSettingsStore";
import { Card } from "../../types/game";
import gameConfig from "../../gameConfig.json";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { useGameConfigStore } from "../../store/useGameConfigStore";
import { Settings as SettingsIcon } from "lucide-react";
import { GAME_ELEMENTS } from "../../constants/game";
import { GAUNTLET_SCORING } from "../../constants/gauntlet";
import { ANIMATION_DURATIONS, DELAYS, UI_COLORS } from "../../constants/ui";
import { IMAGE_PATHS } from "../../constants/assets";
import { GameHeader } from "./components/GameHeader";
import { GameResultModal } from "./components/GameResultModal";

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
    element: GAME_ELEMENTS[
      Math.floor(Math.random() * GAME_ELEMENTS.length)
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
    element: GAME_ELEMENTS[
      Math.floor(Math.random() * GAME_ELEMENTS.length)
    ] as any,
    image: "",
    stats: { ...stats },
    baseStats: { ...stats },
  };
});

// Main exported component with Suspense wrapper for useSearchParams
export default function GamePage() {
  return (
    <Suspense fallback={<LoadingOverlay message="Loading..." />}>
      <GamePageContent />
    </Suspense>
  );
}

function GamePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOnline = searchParams.get("mode") === "online";
  const user = useAuthStore((state) => state.user);

  // State for opponent disconnection modal
  const [showOpponentLeftModal, setShowOpponentLeftModal] = useState(false);

  // Use online game logic hook - includes preparation phase tracking
  const {
    opponentDisconnected,
    isConnected,
    opponentReady,
    myReady,
    initError,
  } = useOnlineGameLogic();

  // Cleanup matchmaking state when leaving online game
  useEffect(() => {
    return () => {
      if (isOnline) {
        useMatchmakingStore.getState().reset();
        // Force cleanup Game Store state to prevent "Ghost State" in next match
        useGameStore.getState().resetGame();
      }
    };
  }, [isOnline]);

  const {
    player1,
    player2,
    currentPlayerId,
    phase,
    winner,
    initGame,
    resetGame,
    mechanic,
    draggingCardId,
    board,
  } = useGameStore();

  const profile = useAuthStore((state) => state.profile);

  // Handle opponent disconnect (Placed here to access 'phase')
  useEffect(() => {
    // Only show modal if opponent disconnects WHILE playing or preparing
    // If game is over, disconnection is expected/allowed.
    if (opponentDisconnected && phase !== "game_over" && phase !== "lobby") {
      setShowOpponentLeftModal(true);
    }
  }, [opponentDisconnected, phase]);

  const [showInfo, setShowInfo] = useState(false);

  // Helper: Format name to first name only
  const formatName = (fullName: string | null) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  const isPOVPlayer2 = !!(isOnline && player2.id && user?.id === player2.id);
  const amIPlayer1 = !isOnline || player1?.id === user?.id;
  const iWon =
    (winner === "player1" && amIPlayer1) ||
    (winner === "player2" && !amIPlayer1);

  // "Bottom/Left" Player (Me)
  const bottomPlayer = isPOVPlayer2 ? player2 : player1;
  const bottomOwnerId = isPOVPlayer2 ? "player2" : "player1";
  const bottomVisualId = "player1"; // Always Blue

  // "Top/Right" Player (Enemy)
  const topPlayer = isPOVPlayer2 ? player1 : player2;
  const topOwnerId = isPOVPlayer2 ? "player1" : "player2";
  const topVisualId = "player2"; // Always Red
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showMechanicModal, setShowMechanicModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBoardIntro, setShowBoardIntro] = useState(true);
  const [showBossIntro, setShowBossIntro] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [gauntletResult, setGauntletResult] = useState<{
    scoreAdded: number;
    newRank: GauntletRank | null;
    coinsEarned?: number;
    isWinStreakBonus?: boolean;
  } | null>(null);

  const { showFPS: userShowFPS, showBoardAnimation: userShowBoardAnimation } =
    useSettingsStore();

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
    if (!activeSettings.showBoardAnimation) {
      if (showBossIntro) setShowBossIntro(false);
      if (showBoardIntro) setShowBoardIntro(false);
    }
  }, [activeSettings.showBoardAnimation, showBossIntro, showBoardIntro]);

  // Use selective subscriptions to prevent re-renders on drag state changes
  // Use selective subscriptions to prevent re-renders on drag state changes
  // Moved to top for POV logic

  const t = useTranslation().game;
  const { language } = useSettingsStore();

  // router is declared at the top of the component

  const generateDiverseHand = (prefix: string): Card[] => {
    const elements = GAME_ELEMENTS;
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
  const isBossBattle = useGauntletStore((state) => state.isBossBattle);
  const pendingRank = useGauntletStore((state) => state.pendingRank);
  const pendingReward = useGauntletStore((state) => state.pendingReward);
  const consumeReward = useGauntletStore((state) => state.consumeReward);
  const wins = useGauntletStore((state) => state.wins);

  const {
    mode: configMode,
    mechanic: configMechanic,
    element: configElement,
  } = useGameConfigStore();

  const isGauntletMode = !isOnline && configMode === "gauntlet";
  const isCustomMode = !isOnline && configMode === "custom";

  const [showRewardModal, setShowRewardModal] = useState(false);
  const { cards: allCards, userCardIds, fetchCards } = useCardStore();

  useEffect(() => {
    if (allCards.length === 0) {
      fetchCards();
    }
  }, [allCards.length, fetchCards]);
  const [activeReward, setActiveReward] = useState<number | null>(null);
  const [selectionPhase, setSelectionPhase] = useState<
    | "none"
    | "pick_from_hand_sabotage"
    | "pick_from_hand_reinforce"
    | "pick_from_collection"
    | "pick_from_opponent"
  >("none");
  const [selectedHandCards, setSelectedHandCards] = useState<Card[]>([]);
  const [showSwapAnimation, setShowSwapAnimation] = useState(false);
  const [swapData, setSwapData] = useState<{
    oldCards: Card[];
    newCards: Card[];
  } | null>(null);
  const [nextOpponentDeck, setNextOpponentDeck] = useState<Card[]>([]);
  const [swapCount, setSwapCount] = useState(0);

  const startGame = async (
    isRestart = false,
    overrideP1Hand?: Card[],
    overrideP2Hand?: Card[]
  ) => {
    setLoadingMessage(isRestart ? t.cleaning : t.preparing);

    // Artificial delay for cleanup/prep
    await new Promise((resolve) => setTimeout(resolve, DELAYS.GAME_PREP));

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
          name: profile?.username || profile?.full_name || state.player1.name,
          avatar_url: profile?.avatar_url || undefined,
          hand: overrideP1Hand
            ? overrideP1Hand.map((c) => ({ ...c, id: c.id + Math.random() }))
            : [...gauntletDeck].map((c) => ({
                ...c,
                id: c.id + Math.random(),
              })), // Refresh IDs
          totalFlips: 0,
        },
        player2: {
          ...state.player2,
          hand: overrideP2Hand ? overrideP2Hand : config.deck,
          name:
            isBossBattle && config.bossKey
              ? (t.gauntlet.bosses as any)[config.bossKey]
              : t.gauntlet.enemy,
          avatar_url: isBossBattle ? config.bossImage : undefined,
          totalFlips: 0,
        },
        // Apply Swift Strike (Option 2)
        currentPlayerId:
          activeReward === 2
            ? "player1"
            : Math.random() > 0.5
            ? "player1"
            : "player2",
      }));

      // Reward logic is now handled by the selection flow before calling startGame
      setActiveReward(null); // Reset reward after applying
    } else {
      // Standard / Custom Initialization
      initGame("test-room", !isCustom, initialMechanic, activeElement);

      useGameStore.setState((state) => ({
        player1: {
          ...state.player1,
          name: profile?.username || profile?.full_name || state.player1.name,
          avatar_url: profile?.avatar_url || undefined,
          hand: isCustom
            ? generateDiverseHand("p1")
            : configMode === "training" &&
              useDeckStore.getState().selectedDeck.length === 5
            ? [...useDeckStore.getState().selectedDeck].map((c) => ({
                ...c,
                id: `${c.id}-${Math.random()}`,
              }))
            : [...MOCK_CARDS].sort(() => Math.random() - 0.5),
          totalFlips: 0,
        },
        player2: {
          ...state.player2,
          hand: isCustom
            ? generateDiverseHand("p2")
            : configMode === "training"
            ? (useCardStore.getState().cards.length > 0
                ? useCardStore.getState().cards
                : CARD_POOL
              )
                .sort((a, b) => (a.cp || 0) - (b.cp || 0))
                .slice(0, 5)
                .map((c) => ({ ...c, id: `${c.id}-${Math.random()}` }))
            : [...OPPONENT_CARDS].sort(() => Math.random() - 0.5),
          name: isCustom
            ? "Player 2"
            : configMode === "training"
            ? "Dummy (Easy)"
            : "Computer",
          avatar_url: undefined,
          totalFlips: 0,
        },
      }));
    }

    setLoadingMessage(null);
    if (isGauntlet && isBossBattle) {
      setShowBossIntro(true);
      setShowBoardIntro(false);
    } else {
      setShowBossIntro(false);
      setShowBoardIntro(true);
    }
  };

  // Auto-skip intro if animation disabled
  useEffect(() => {
    if (!activeSettings.showBoardAnimation) {
      if (showBossIntro) setShowBossIntro(false);
      if (showBoardIntro) setShowBoardIntro(false);
    }
  }, [showBossIntro, showBoardIntro, activeSettings.showBoardAnimation]);

  // Use AI Hook with Pause
  useComputerAI({
    isPaused: showBoardIntro || showBossIntro || isOnline,
    rank: isGauntletMode
      ? gauntletRank
      : configMode === "training"
      ? "Genin"
      : "Chunin",
  });

  const [showResult, setShowResult] = useState(false);
  const [justFinishedBoss, setJustFinishedBoss] = useState(false);
  const [oldGauntletScore, setOldGauntletScore] = useState(0);

  useEffect(() => {
    if (phase === "game_over") {
      if (isGauntletMode) {
        const board = useGameStore.getState().board;
        let boardCardCount = 0;
        board.forEach((row) =>
          row.forEach((cell) => {
            if (cell.owner === "player1") boardCardCount++;
          })
        );
        setOldGauntletScore(gauntletScore);
        setJustFinishedBoss(isBossBattle);
        const result = processMatchResult(
          winner || "draw",
          player1.totalFlips || 0,
          boardCardCount
        );
        setGauntletResult(result);
      }
      const timer = setTimeout(() => {
        setShowResult(true);
      }, DELAYS.RESULT_MODAL_SHOW);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
      setJustFinishedBoss(false);
    }
  }, [phase, isGauntletMode]);

  useEffect(() => {
    // Always start game if in Gauntlet mode to ensure correct opponent name/config
    // Or if hand is empty (standard flow)
    if ((isGauntletMode || player1.hand.length === 0) && !isOnline) {
      startGame();
    }
  }, []);

  const canInteract =
    !isOnline ||
    (currentPlayerId === "player1" && player1.id === user?.id) ||
    (currentPlayerId === "player2" && player2.id === user?.id);

  const isMyTurn = isOnline
    ? (currentPlayerId === "player1" && player1.id === user?.id) ||
      (currentPlayerId === "player2" && player2.id === user?.id)
    : currentPlayerId === "player1";

  const handleEndRun = async () => {
    if (isGauntletMode) {
      useGauntletStore.getState().endRun();
    }
    setLoadingMessage(t.cleaning);
    await new Promise((resolve) => setTimeout(resolve, DELAYS.GAME_CLEANUP));
    resetGame();
    router.push("/");
  };

  const handleOnlineMenu = async () => {
    setLoadingMessage(t.online.returningLobby);
    await new Promise((resolve) => setTimeout(resolve, 500));
    resetGame();
    useMatchmakingStore.getState().reset();
    router.push("/online");
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white overflow-hidden flex flex-col relative select-none">
      {isOnline &&
        !canInteract &&
        phase !== "waiting" &&
        phase !== "game_over" && (
          <div className="absolute inset-0 z-40 bg-transparent cursor-not-allowed" />
        )}
      {loadingMessage && <LoadingOverlay message={loadingMessage} />}

      {/* Initialization Error Overlay */}
      {initError && (
        <div className="fixed inset-0 z-[101] bg-black/90 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-xl max-w-md w-full backdrop-blur-md">
            <h2 className="text-2xl font-black text-red-500 mb-4 tracking-tighter uppercase">
              Game Error
            </h2>
            <p className="text-white/80 font-mono mb-8">{initError}</p>
            <button
              onClick={() => router.push("/online")}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors w-full uppercase tracking-wider"
            >
              Return to Menu
            </button>
          </div>
        </div>
      )}

      {/* Opponent Left Modal */}
      {/* State Validation - Show syncing if state is incomplete */}
      {isOnline &&
        phase === "playing" &&
        (!player1?.id ||
          !player2?.id ||
          !player1?.hand?.length ||
          !player2?.hand?.length) && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 font-mono">
            <div className="w-16 h-16 border-4 border-t-yellow-500 border-yellow-900/30 rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-black text-yellow-500 italic tracking-wider mb-2 uppercase text-center">
              Syncing Game State...
            </h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Please wait while we sync with the server
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-lg font-bold text-sm hover:bg-yellow-500/30 transition-all"
            >
              ⟳ Reload if stuck
            </button>
          </div>
        )}

      {/* Preparation Phase / Waiting UI */}
      {isOnline && (phase === "waiting" || phase === "preparing") && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 font-mono">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center max-w-md w-full"
          >
            <div className="w-24 h-24 border-4 border-t-blue-500 border-blue-900/30 rounded-full animate-spin mb-8" />

            <h2 className="text-2xl font-black text-white italic tracking-wider mb-8 uppercase text-center">
              {t.online.waitBothReady}
            </h2>

            <div className="flex flex-col gap-4 w-full bg-gray-900/50 p-6 rounded-2xl border border-white/10">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm font-bold">
                  {t.online.statusConnection}
                </span>
                {isConnected ? (
                  <span className="text-green-500 font-black text-xs uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {t.online.statusSecure}
                  </span>
                ) : (
                  <span className="text-yellow-500 font-black text-xs uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" />
                    {t.online.statusConnecting}
                  </span>
                )}
              </div>

              {/* My Data Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm font-bold">
                  {t.online.statusLocalAssets}
                </span>
                {myReady ? (
                  <span className="text-green-500 font-black text-xs uppercase flex items-center gap-2">
                    <div className="text-green-500">✓</div>
                    {t.online.statusLoaded}
                  </span>
                ) : (
                  <span className="text-blue-500 font-black text-xs uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    {t.online.statusLoading}
                  </span>
                )}
              </div>

              {/* Opponent Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm font-bold">
                  {t.online.statusOpponentStatus}
                </span>
                {opponentReady ? (
                  <span className="text-green-500 font-black text-xs uppercase flex items-center gap-2">
                    <div className="text-green-500">✓</div>
                    {t.online.statusReady}
                  </span>
                ) : (
                  <span className="text-yellow-500 font-black text-xs uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    {t.online.statusWaiting}
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-500 text-xs mt-6 animate-pulse text-center">
              {t.online.waitBothReady}
            </p>
          </motion.div>
        </div>
      )}

      {/* Opponent Disconnected Modal */}
      {showOpponentLeftModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border-2 border-red-500/30 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm text-center"
          >
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-black text-white mb-2">
              {t.online.opponentLeftTitle}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {t.online.opponentLeftDesc}
            </p>
            <button
              onClick={() => {
                setShowOpponentLeftModal(false);
                resetGame();
                router.push("/");
              }}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
            >
              {t.exit || "Exit"}
            </button>
          </motion.div>
        </motion.div>
      )}

      <GauntletRewardModal
        isOpen={showRewardModal}
        onSelect={(id) => {
          setActiveReward(id);
          setShowRewardModal(false);
          if (id === 1) {
            const config = getOpponentConfig();
            setNextOpponentDeck(config.deck);
            setSelectionPhase("pick_from_hand_sabotage");
          } else if (id === 3) {
            setSwapCount(0);
            setSelectionPhase("pick_from_hand_reinforce");
          } else {
            consumeReward();
            startGame();
          }
        }}
      />

      <RewardSelectionOverlay
        isOpen={
          selectionPhase === "pick_from_hand_sabotage" ||
          selectionPhase === "pick_from_hand_reinforce"
        }
        title={
          selectionPhase === "pick_from_hand_sabotage"
            ? t.gauntlet.rewards.option1.title
            : t.gauntlet.rewards.option3.title
        }
        subtitle={t.gauntlet.rewards.pickHand}
        cards={gauntletDeck}
        onCancel={() => {
          if (swapCount > 0) {
            // If we already swapped once, we can't just cancel back to modal (exploit)
            // Instead, we treat it as finishing early
            consumeReward();
            startGame();
          } else {
            setSelectionPhase("none");
            setActiveReward(null);
            setShowRewardModal(true);
          }
        }}
        onSelect={(cards) => {
          setSelectedHandCards(cards);
          if (selectionPhase === "pick_from_hand_sabotage") {
            setSelectionPhase("pick_from_opponent");
          } else {
            setSelectionPhase("pick_from_collection");
          }
        }}
        maxSelect={selectionPhase === "pick_from_hand_reinforce" ? 2 : 1}
      />

      <RewardSelectionOverlay
        isOpen={selectionPhase === "pick_from_collection"}
        title={t.gauntlet.rewards.option3.title}
        subtitle={t.gauntlet.rewards.pickCollection}
        cards={allCards
          .filter((c) => userCardIds.includes(c.id)) // Owned cards
          .filter((c) => !gauntletDeck.some((dc) => dc.id === c.id))} // Not in deck
        onCancel={() => {
          setSelectionPhase("pick_from_hand_reinforce");
        }}
        onSelect={(cards) => {
          // Perform Swap for multiple cards
          let newHand = [...gauntletDeck];

          // We assume cards.length matches selectedHandCards.length (2)
          cards.forEach((newCard, index) => {
            const oldCard = selectedHandCards[index];
            newHand = newHand.map((c) => (c.id === oldCard.id ? newCard : c));
          });

          // Update Gauntlet Deck in Store
          useGauntletStore.setState({ deck: newHand });

          // Show animation for both swaps
          setSwapData({ oldCards: selectedHandCards, newCards: cards });
          setSelectionPhase("none");
          setShowSwapAnimation(true);

          setTimeout(() => {
            setShowSwapAnimation(false);
            consumeReward();
            startGame(false, newHand);
          }, 2500);
        }}
        maxSelect={2}
      />

      <RewardSelectionOverlay
        isOpen={selectionPhase === "pick_from_opponent"}
        title={t.gauntlet.rewards.option1.title}
        subtitle={t.gauntlet.rewards.pickOpponent}
        cards={nextOpponentDeck}
        isHidden={true}
        onCancel={() => {
          setSelectionPhase("pick_from_hand_sabotage");
        }}
        onSelect={(cards) => {
          const oppCard = cards[0];
          const oldCard = selectedHandCards[0];
          const newP1Hand = gauntletDeck.map((c) =>
            c.id === oldCard.id ? oppCard : c
          );
          const newP2Hand = nextOpponentDeck.map((c) =>
            c.id === oppCard.id ? oldCard : c
          );

          setSwapData({ oldCards: [oldCard], newCards: [oppCard] });
          setSelectionPhase("none");
          setShowSwapAnimation(true);

          setTimeout(() => {
            setShowSwapAnimation(false);
            consumeReward();
            startGame(false, newP1Hand, newP2Hand);
          }, 2500);
        }}
      />

      <SwapAnimationOverlay
        isOpen={showSwapAnimation}
        oldCards={swapData?.oldCards || []}
        newCards={swapData?.newCards || []}
      />

      {!loadingMessage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black z-0 pointer-events-none overflow-hidden" />

          {/* Boss Intro Animation */}
          {showBossIntro && activeSettings.showBoardAnimation && (
            <BossIntroAnimation
              bossKey={getOpponentConfig().bossKey || ""}
              bossImage={getOpponentConfig().bossImage || ""}
              onComplete={() => {
                setShowBossIntro(false);
                setShowBoardIntro(true);
              }}
            />
          )}

          {/* Board Intro Animation */}
          {showBoardIntro &&
            activeSettings.showBoardAnimation &&
            !showBossIntro && (
              <BoardIntroAnimation
                mechanicType={mechanic.type}
                activeElement={mechanic.activeElement}
                onComplete={() => setShowBoardIntro(false)}
              />
            )}

          {/* Main Game UI - Only render after Intro OR if animation is disabled/skipped */}
          {((!showBoardIntro && !showBossIntro) ||
            !activeSettings.showBoardAnimation) && (
            <>
              {/* Full-Screen Effects */}
              {activeSettings.showFullScreenEffect && (
                <FullScreenEffects
                  mechanicType={mechanic.type}
                  activeElement={mechanic.activeElement}
                />
              )}

              {/* Header / Status Bar - REFACTORED */}
              <GameHeader
                t={t}
                isOnline={isOnline}
                isGauntletMode={isGauntletMode}
                isBossBattle={isBossBattle}
                isCustomMode={isCustomMode}
                phase={phase}
                isMyTurn={isMyTurn}
                player1={player1}
                player2={player2}
                isPOVPlayer2={isPOVPlayer2}
                mechanic={mechanic}
                onShowInfo={() => setShowInfo(true)}
                onShowSettings={() => setShowSettingsModal(true)}
                onShowExitConfirm={() => setShowExitConfirm(true)}
                onShowMechanicModal={() => setShowMechanicModal(true)}
              />

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

              {/* Main Layout Container */}
              <div className="relative z-10 w-full h-full p-1 lg:p-8 grid grid-rows-[auto_1fr_auto] lg:grid-rows-1 lg:grid-cols-[minmax(200px,280px)_1fr_minmax(200px,280px)] gap-1 lg:gap-8 justify-items-center items-center max-w-[1400px] mx-auto">
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
                      cards={bottomPlayer.hand}
                      ownerId={bottomOwnerId}
                      visualOwnerId={bottomVisualId}
                      isInteractive={true}
                      isCurrentPlayer={currentPlayerId === bottomOwnerId}
                      orientation="horizontal"
                      isCustom={isCustomMode}
                      gauntletRank={isGauntletMode ? gauntletRank : undefined}
                      name={
                        isOnline
                          ? undefined
                          : profile?.username || profile?.full_name || t.player
                      }
                    />
                  </div>
                  {/* Desktop View (Vertical) */}
                  <div className="hidden lg:flex w-full h-full items-center justify-center">
                    <Hand
                      cards={bottomPlayer.hand}
                      ownerId={bottomOwnerId}
                      visualOwnerId={bottomVisualId}
                      isInteractive={true}
                      isCurrentPlayer={currentPlayerId === bottomOwnerId}
                      orientation="vertical"
                      isCustom={isCustomMode}
                      gauntletRank={isGauntletMode ? gauntletRank : undefined}
                      name={
                        isOnline
                          ? undefined
                          : profile?.username || profile?.full_name || t.player
                      }
                    />
                  </div>
                </div>

                {/* CENTER (Board) */}
                <div className="order-2 w-full h-full flex flex-col items-center justify-center relative min-h-0 min-w-0 gap-2 lg:gap-6">
                  <div className="relative w-full h-full max-h-[50vh] sm:max-h-[55vh] lg:max-h-[75vh] aspect-square flex items-center justify-center">
                    <div className="scale-85 sm:scale-75 lg:scale-90 transition-transform duration-500">
                      <Board
                        showCardPlaceAnimation={
                          activeSettings.showCardPlaceAnimation
                        }
                        showBoardEffect={activeSettings.showBoardEffect}
                        isFlipped={false}
                        swapOwners={isPOVPlayer2}
                      />
                    </div>
                  </div>

                  {/* Result Modal - Moved to root level for correct stacking context */}
                </div>

                {/* PLAYER 2 / OPPONENT HAND */}
                <div className="order-1 lg:order-3 w-full h-full flex flex-col items-center justify-center relative p-1 lg:p-2">
                  {/* Mobile View (Horizontal Compact) */}
                  <div className={cn("lg:hidden w-full flex justify-center")}>
                    <Hand
                      cards={topPlayer.hand}
                      ownerId={topOwnerId}
                      visualOwnerId={topVisualId}
                      isInteractive={false}
                      isCurrentPlayer={currentPlayerId === topOwnerId}
                      orientation="horizontal"
                      compact
                      minimal={isCustomMode ? false : true}
                      isHidden={isCustomMode ? false : true}
                      isCustom={isCustomMode}
                      name={isOnline ? undefined : topPlayer.name}
                    />
                  </div>
                  {/* Desktop View (Vertical Compact) */}
                  <div className="hidden lg:flex w-full h-full items-center justify-center">
                    <Hand
                      cards={topPlayer.hand}
                      ownerId={topOwnerId}
                      visualOwnerId={topVisualId}
                      isInteractive={false}
                      isCurrentPlayer={currentPlayerId === topOwnerId}
                      orientation="vertical"
                      compact
                      isHidden={isCustomMode ? false : true}
                      isCustom={isCustomMode}
                      name={isOnline ? undefined : topPlayer.name}
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

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0"
              onClick={() => setShowExitConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center relative z-20"
            >
              <h3 className="text-xl font-black text-white mb-2 uppercase italic tracking-wider">
                {t.exitConfirmation.title}
              </h3>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                {t.exitConfirmation.desc}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition-colors uppercase tracking-widest text-xs"
                >
                  {t.exitConfirmation.cancel}
                </button>
                <button
                  onClick={async () => {
                    setShowExitConfirm(false);
                    await handleEndRun();
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors uppercase tracking-widest text-xs shadow-lg shadow-red-900/20"
                >
                  {t.exitConfirmation.confirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showResult && (
          <GameResultModal
            t={t}
            winner={winner}
            isGauntletMode={isGauntletMode}
            justFinishedBoss={justFinishedBoss}
            isBossBattle={isBossBattle}
            iWon={iWon}
            player1={player1}
            player2={player2}
            isPOVPlayer2={isPOVPlayer2}
            board={board}
            isOnline={isOnline}
            gauntletRank={gauntletRank}
            gauntletScore={gauntletScore}
            oldGauntletScore={oldGauntletScore}
            gauntletResult={gauntletResult}
            pendingReward={pendingReward}
            pendingRank={pendingRank}
            onStartGame={startGame}
            onOnlineMenu={handleOnlineMenu}
            onShowRewardModal={() => {
              setShowRewardModal(true);
              setShowResult(false);
            }}
            onEndRun={handleEndRun}
          />
        )}
      </AnimatePresence>

      {activeSettings.showFPS && <FPSCounter />}
    </div>
  );
}
