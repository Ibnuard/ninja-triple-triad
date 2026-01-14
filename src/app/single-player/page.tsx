"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../store/useSettingsStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useCardStore } from "../../store/useCardStore";
import { useDeckStore } from "../../store/useDeckStore";
import { useGameConfigStore } from "../../store/useGameConfigStore";
import { useGauntletStore } from "../../store/useGauntletStore";
import { Card as CardType } from "../../types/game";
import { CARD_POOL } from "../../data/cardPool";
import { Swords, School, Zap, ChevronLeft } from "lucide-react";
import { ModeSelectionGrid } from "../../components/ModeSelectionGrid";
import { TrainingSubMenu } from "./components/TrainingSubMenu";
import { GauntletModeView } from "./components/GauntletModeView";
import { CustomModeView } from "./components/CustomModeView";

export default function SinglePlayerModes() {
  const router = useRouter();
  const t = useTranslation().spSelection;
  const { user } = useAuthStore();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [customMechanic, setCustomMechanic] = useState<string>("none");
  const [activeElement, setActiveElement] = useState<string>("random");

  // Dynamic Card Pool
  const {
    cards: dbCards,
    fetchCards,
    isLoading: isCardsLoading,
    userCardIds,
    fetchUserCards,
  } = useCardStore();

  const setCardPool = useGauntletStore((state) => state.setCardPool);

  // Gauntlet Mode State
  const startGauntletRun = useGauntletStore((state) => state.startRun);
  const {
    selectedDeck,
    loadDeck,
    saveDeck,
    isDeckComplete,
    lastRunScore,
    lastBoss,
  } = useDeckStore();

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    if (dbCards.length > 0) {
      setCardPool(dbCards);
    }
  }, [dbCards, setCardPool]);

  useEffect(() => {
    if (user) {
      fetchUserCards(user.id);
      loadDeck(user.id);
    } else {
      loadDeck();
    }
  }, [user, fetchUserCards, loadDeck]);

  const rawCards = dbCards.length > 0 ? dbCards : CARD_POOL;
  const displayCardPool = user
    ? rawCards.filter((c) => userCardIds.includes(c.id))
    : rawCards;

  const [showDeckSelection, setShowDeckSelection] = useState(false);
  const [tempDeck, setTempDeck] = useState<CardType[]>([]);

  useEffect(() => {
    if (showDeckSelection) {
      setTempDeck(selectedDeck);
    }
  }, [showDeckSelection, selectedDeck]);

  const handleTrainingNavigate = (type: "own" | "random") => {
    if (type === "random") {
      // 1. Get owned cards
      const rawCards = dbCards.length > 0 ? dbCards : CARD_POOL;
      const ownedCards = user
        ? rawCards.filter((c) => userCardIds.includes(c.id))
        : rawCards;

      // 2. Select 5 random distinct cards
      const randomDeck: CardType[] = [];
      // Clone array to pick from
      const pool = [...ownedCards];

      // If pool is too small, we might need to allow duplicates or fill with rawCards
      const sourcePool = pool.length >= 5 ? pool : [...rawCards];

      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * sourcePool.length);
        const card = sourcePool[randomIndex];
        // Create unique instance
        randomDeck.push({ ...card, id: `${card.id}-${Math.random()}` });
        // Remove from pool if we want distinct cards (if pool large enough)
        if (sourcePool.length > 5) {
          sourcePool.splice(randomIndex, 1);
        }
      }

      // 3. Set deck to store (Transient, don't save to DB)
      useDeckStore.setState({ selectedDeck: randomDeck });
    } else {
      // "own" deck -> ensure we use the loaded deck
      if (selectedDeck.length !== 5) {
        alert(
          t.trainingSub?.ownDeckError ||
            "Please create a deck with 5 cards first!"
        );
        return;
      }
    }

    useGameConfigStore.setState({ mode: "training" });
    router.push("/game");
  };

  const modes = [
    {
      id: "gauntlet",
      title: t.modes.gauntlet.title,
      description: t.modes.gauntlet.description,
      icon: Swords,
      color: "from-red-600 to-orange-800",
      borderColor: "border-red-500/30",
      shadowColor: "shadow-red-900/40",
      glowColor: "group-hover:bg-red-500/10",
      accent: "bg-red-500",
    },
    {
      id: "training",
      title: t.modes.training.title,
      description: t.modes.training.description,
      icon: School,
      color: "from-blue-600 to-indigo-800",
      borderColor: "border-blue-500/30",
      shadowColor: "shadow-blue-900/40",
      glowColor: "group-hover:bg-blue-500/10",
      accent: "bg-blue-500",
      hasSubMenu: true,
    },
    {
      id: "custom",
      title: t.modes.custom.title,
      description: t.modes.custom.description,
      icon: Zap,
      color: "from-purple-600 to-pink-800",
      borderColor: "border-purple-500/30",
      shadowColor: "shadow-purple-900/40",
      glowColor: "group-hover:bg-purple-500/10",
      accent: "bg-purple-500",
    },
  ];

  const setConfig = useGameConfigStore((state) => state.setConfig);

  const handleModeClick = (modeId: string) => {
    if (modeId === "training" || modeId === "gauntlet") {
      setSelectedMode(modeId);
      if (modeId === "gauntlet") setShowDeckSelection(false);
    } else if (modeId === "custom") {
      setSelectedMode("custom");
    } else {
      setConfig({ mode: "training" });
      router.push("/game");
    }
  };

  const toggleCardSelection = (card: CardType) => {
    const isSelected = tempDeck.some((c) => c.id === card.id);
    if (isSelected) {
      setTempDeck(tempDeck.filter((c) => c.id !== card.id));
    } else {
      if (tempDeck.length < 5) {
        setTempDeck([...tempDeck, card]);
      }
    }
  };

  const saveGauntletDeck = () => {
    if (tempDeck.length === 5) {
      saveDeck(tempDeck, user?.id);
      setShowDeckSelection(false);
    }
  };

  const handleStartGauntlet = () => {
    if (isDeckComplete()) {
      startGauntletRun(selectedDeck);
      setConfig({ mode: "gauntlet" });
      router.push("/game");
    }
  };

  return (
    <div className="h-[100dvh] md:min-h-screen bg-black text-white flex flex-col relative overflow-hidden md:overflow-auto font-mono">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black z-0" />
      <div className="fixed inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header - Sticky */}
      <header className="shrink-0 z-50 p-4 md:p-6 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() =>
              selectedMode ? setSelectedMode(null) : router.push("/")
            }
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-red-500 text-[8px] md:text-[10px] font-black tracking-[0.4em] mb-0.5 uppercase italic">
              {selectedMode ? t.back : t.mainMenu}
            </h2>
            <h1 className="text-white text-lg md:text-2xl font-black italic uppercase tracking-tight">
              {t.title}
            </h1>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-7xl mx-auto flex flex-col flex-1 p-4 overflow-hidden md:overflow-auto"
      >
        {/* Content Area */}
        <div className="flex flex-col items-center justify-center flex-1 overflow-hidden md:overflow-auto">
          <AnimatePresence mode="wait">
            {!selectedMode ? (
              <ModeSelectionGrid
                t={t}
                modes={modes}
                onModeClick={handleModeClick}
              />
            ) : selectedMode === "training" ? (
              <TrainingSubMenu t={t} onNavigate={handleTrainingNavigate} />
            ) : selectedMode === "gauntlet" ? (
              <GauntletModeView
                t={t}
                selectedDeck={selectedDeck}
                tempDeck={tempDeck}
                showDeckSelection={showDeckSelection}
                isDeckComplete={isDeckComplete}
                lastRunScore={lastRunScore}
                lastBoss={lastBoss}
                cardPool={displayCardPool}
                onStartGauntlet={handleStartGauntlet}
                onManageDeck={() => setShowDeckSelection(true)}
                onToggleCard={toggleCardSelection}
                onSaveDeck={saveGauntletDeck}
                onCancelSelection={() => setShowDeckSelection(false)}
              />
            ) : (
              <CustomModeView
                t={t}
                customMechanic={customMechanic}
                activeElement={activeElement}
                onMechanicChange={setCustomMechanic}
                onActiveElementChange={setActiveElement}
                onStartBattle={() => {
                  setConfig({
                    mode: "custom",
                    mechanic: customMechanic as any,
                    element: activeElement as any,
                  });
                  router.push("/game");
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
