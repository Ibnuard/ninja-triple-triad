"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../store/useSettingsStore";
import { Swords, School, Zap, ChevronLeft } from "lucide-react";
import { useDeckStore } from "../../store/useDeckStore";
import { useGauntletStore } from "../../store/useGauntletStore";
import { CARD_POOL } from "../../data/cardPool";
import { Card as CardType } from "../../types/game";
import { ModeSelectionGrid } from "./components/ModeSelectionGrid";
import { TrainingSubMenu } from "./components/TrainingSubMenu";
import { GauntletModeView } from "./components/GauntletModeView";
import { CustomModeView } from "./components/CustomModeView";

export default function SinglePlayerModes() {
  const router = useRouter();
  const t = useTranslation().spSelection;
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [customMechanic, setCustomMechanic] = useState<string>("none");
  
  // Gauntlet Mode State
  const startGauntletRun = useGauntletStore((state) => state.startRun);
  const { selectedDeck, loadDeck, saveDeck, isDeckComplete, lastRunScore, lastBoss } = useDeckStore();
  const [showDeckSelection, setShowDeckSelection] = useState(false);
  const [tempDeck, setTempDeck] = useState<CardType[]>([]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  useEffect(() => {
    if (showDeckSelection) {
      setTempDeck(selectedDeck);
    }
  }, [showDeckSelection, selectedDeck]);

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

  const handleModeClick = (modeId: string) => {
    if (modeId === "training" || modeId === "gauntlet") {
      setSelectedMode(modeId);
      if (modeId === "gauntlet") setShowDeckSelection(false);
    } else if (modeId === "custom") {
      setSelectedMode("custom");
    } else {
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
      saveDeck(tempDeck);
      setShowDeckSelection(false);
    }
  };

  const handleStartGauntlet = () => {
    if (isDeckComplete()) {
      startGauntletRun(selectedDeck);
      router.push("/game?mode=gauntlet");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black z-0" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-7xl flex flex-col gap-8"
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mx-4 lg:mx-0">
          <button
            onClick={() =>
              selectedMode ? setSelectedMode(null) : router.push("/")
            }
            className="group flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-widest text-xs uppercase">
              {selectedMode ? "BACK" : "MAIN MENU"}
            </span>
          </button>

          <h1 className="text-3xl lg:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 uppercase">
            {t.title}
          </h1>

          <div className="hidden lg:block w-32 h-1 bg-white/10 skew-x-[-45deg]" />
        </div>

        {/* Content Area */}
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!selectedMode ? (
              <ModeSelectionGrid modes={modes} onModeClick={handleModeClick} />
            ) : selectedMode === "training" ? (
              <TrainingSubMenu t={t} onNavigate={() => router.push("/game")} />
            ) : selectedMode === "gauntlet" ? (
              <GauntletModeView
                t={t}
                selectedDeck={selectedDeck}
                tempDeck={tempDeck}
                showDeckSelection={showDeckSelection}
                isDeckComplete={isDeckComplete}
                lastRunScore={lastRunScore}
                lastBoss={lastBoss}
                cardPool={CARD_POOL}
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
                onMechanicChange={setCustomMechanic}
                onStartBattle={() => router.push(`/game?mode=custom&mechanic=${customMechanic}`)}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
