"use client";

import { motion } from "framer-motion";
import {
  Swords,
  BookOpen,
  ChevronLeft,
  Layers,
  Trophy,
  Medal,
  X,
  HelpCircle,
} from "lucide-react";
import { useTranslation } from "../../../store/useSettingsStore";
import { RANK_THRESHOLDS } from "../../../constants/gauntlet";
import { cn } from "../../../lib/utils";
import { Card } from "../../../components/Card";
import { Card as CardType } from "../../../types/game";
import { GauntletTutorialModal } from "../../../components/GauntletTutorialModal";
import { useState, useEffect } from "react";
import { useBossDeckStore } from "../../../store/useBossDeckStore";
import { DeckSelectionView } from "./DeckSelectionView";

interface GauntletModeViewProps {
  t: any;
  selectedDeck: CardType[];
  tempDeck: CardType[];
  showDeckSelection: boolean;
  isDeckComplete: () => boolean;
  lastRunScore: number;
  lastBoss: string;
  cardPool: CardType[];
  onStartGauntlet: () => void;
  onManageDeck: () => void;
  onToggleCard: (card: CardType) => void;
  onSaveDeck: () => void;
  onCancelSelection: () => void;
}

export function GauntletModeView({
  t,
  selectedDeck,
  tempDeck,
  showDeckSelection,
  isDeckComplete,
  lastRunScore,
  lastBoss,
  cardPool,
  onStartGauntlet,
  onManageDeck,
  onToggleCard,
  onSaveDeck,
  onCancelSelection,
}: GauntletModeViewProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const { fetchBossDecks } = useBossDeckStore();

  useEffect(() => {
    fetchBossDecks();
  }, [fetchBossDecks]);

  // Reusable Stats Component
  const StatsCard = ({ className = "" }: { className?: string }) => {
    const gauntletT = useTranslation().game.gauntlet;

    // Calculate rank name based on score
    const getRankName = (score: number) => {
      if (score >= RANK_THRESHOLDS.Rikudo) return "Rikudo";
      if (score >= RANK_THRESHOLDS.Kage) return "Kage";
      if (score >= RANK_THRESHOLDS.Anbu) return "Anbu";
      if (score >= RANK_THRESHOLDS.Jounin) return "Jounin";
      if (score >= RANK_THRESHOLDS.Chunin) return "Chunin";
      return "Genin";
    };

    const rankName = getRankName(lastRunScore);

    return (
      <div
        className={cn(
          "relative w-full bg-black/40 rounded-3xl border border-white/5 p-4 md:p-6 flex flex-col gap-4 md:gap-6",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg md:text-xl font-black italic uppercase text-white/50">
            {gauntletT.lastJourney}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-gray-800/50 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center gap-2 border border-white/5">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
            <div className="text-center">
              <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                {gauntletT.highScore}
              </div>
              <div className="text-xl md:text-2xl font-black text-white">
                {lastRunScore}
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center gap-2 border border-white/5">
            <Medal className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            <div className="text-center">
              <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                {gauntletT.rank}
              </div>
              <div className="text-sm md:text-lg font-black text-white truncate max-w-[80px] md:max-w-[100px]">
                {rankName}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">
            {t.gauntletSub.deckUsed}
          </div>
          <div className="flex justify-center -space-x-3 md:-space-x-4">
            {selectedDeck.length > 0 ? (
              selectedDeck.map((card, i) => (
                <div
                  key={i}
                  className="w-10 h-14 md:w-12 md:h-16 rounded-lg border-2 border-gray-900 relative overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 bg-gray-900"
                  style={{ zIndex: i }}
                >
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600 italic">
                {t.gauntletSub.noDeckData}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      key="gauntlet-submenu"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-5xl bg-gray-900/80 border border-red-500/30 rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 relative overflow-y-auto max-h-[90vh] md:max-h-none md:overflow-visible custom-scrollbar"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/20 blur-[60px]" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/20 blur-[60px]" />

      {!showDeckSelection ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center relative z-10">
          {/* Left Column: Info & Actions */}
          <div className="flex flex-col gap-6 md:gap-8 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start mb-4">
                <div className="inline-flex items-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-l-xl bg-red-500/10 border border-red-500/20 border-r-0 text-red-400 text-[10px] font-black uppercase tracking-widest">
                    <Swords className="w-3 h-3" />{" "}
                    {t.modes.gauntlet.submenu.survivalMode}
                  </div>
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="px-2 py-1.5 rounded-r-xl bg-yellow-500 text-black hover:bg-yellow-400 transition-all group/help shadow-[5px_0_15px_rgba(234,179,8,0.2)] border border-yellow-500/50"
                    title="How to Play"
                  >
                    <HelpCircle className="w-3.5 h-3.5 group-hover/help:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase text-white mb-2 md:mb-4 leading-none">
                {t.modes.gauntlet.title}
              </h2>
              <p className="text-gray-400 text-xs md:text-base leading-relaxed max-w-md mx-auto md:mx-0">
                {t.modes.gauntlet.description}
              </p>
            </div>

            {/* Mobile Stats (Visible only on mobile) */}
            <div className="block md:hidden">
              <StatsCard />
            </div>

            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="bg-black/40 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-white/10 flex items-center gap-2 md:gap-3">
                  <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                  <span className="text-[10px] md:text-sm font-bold text-gray-300">
                    {t.modes.gauntlet.submenu.deckStatus}:
                  </span>
                  <span
                    className={cn(
                      "text-sm md:text-lg font-black",
                      isDeckComplete() ? "text-green-400" : "text-yellow-400"
                    )}
                  >
                    {selectedDeck.length}/5
                  </span>
                </div>
              </div>

              <div className="flex flex-row gap-2 md:gap-4">
                <button
                  onClick={onStartGauntlet}
                  disabled={!isDeckComplete()}
                  className={cn(
                    "flex-1 group relative px-2 md:px-8 py-3 md:py-4 font-black uppercase tracking-tighter md:tracking-widest text-[10px] md:text-sm transition-all overflow-hidden rounded-xl flex items-center justify-center gap-1 md:gap-2",
                    isDeckComplete()
                      ? "bg-white text-black hover:bg-red-500 hover:text-white"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  )}
                >
                  <span className="truncate">
                    {t.modes.gauntlet.submenu.startGauntlet}
                  </span>
                  {isDeckComplete() && (
                    <ChevronLeft className="rotate-180 w-3 h-3 md:w-4 md:h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
                <button
                  onClick={onManageDeck}
                  className="flex-1 px-2 md:px-8 py-3 md:py-4 bg-gray-800 text-white font-black uppercase tracking-tighter md:tracking-widest text-[10px] md:text-sm hover:bg-gray-700 transition-colors rounded-xl flex items-center justify-center gap-1 md:gap-2"
                >
                  <Layers className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                  <span className="truncate">
                    {t.modes.gauntlet.submenu.manageDeck}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Desktop Stats (Hidden on mobile) */}
          <div className="hidden md:flex justify-center">
            <StatsCard className="max-w-sm" />
          </div>
        </div>
      ) : (
        <DeckSelectionView
          t={t}
          tempDeck={tempDeck}
          cardPool={cardPool}
          onToggleCard={onToggleCard}
          onSaveDeck={onSaveDeck}
          onCancelSelection={onCancelSelection}
        />
      )}
      <GauntletTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </motion.div>
  );
}
