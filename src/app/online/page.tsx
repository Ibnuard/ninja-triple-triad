"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation, useSettingsStore } from "../../store/useSettingsStore";
import {
  Trophy,
  Users,
  ChevronLeft,
  Layers,
  Swords,
  Globe,
  HelpCircle,
} from "lucide-react";
import { useMatchmakingStore } from "../../store/useMatchmakingStore";
import { useDeckStore } from "../../store/useDeckStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useCardStore } from "../../store/useCardStore";
import { useGauntletStore } from "../../store/useGauntletStore";
import { Card as CardType } from "../../types/game";
import { CARD_POOL } from "../../data/cardPool";
import { Card } from "../../components/Card";
import { DeckEditor } from "../../components/DeckEditor";
import { cn } from "../../lib/utils";

export default function OnlinePage() {
  const router = useRouter();
  const t = useTranslation().onlineSelection;
  const { language } = useSettingsStore();

  const { startSearch, cancelSearch, status, matchId, startTime, error } =
    useMatchmakingStore();

  const { user } = useAuthStore(); // Profile is inside user? No, useAuthStore has profile?
  const profile = useAuthStore((state) => state.profile);

  const { selectedDeck, loadDeck, saveDeck, isDeckComplete } = useDeckStore();

  const {
    cards: dbCards,
    fetchCards,
    userCardIds,
    fetchUserCards,
  } = useCardStore();

  const setCardPool = useGauntletStore((state) => state.setCardPool);

  const [elapsed, setElapsed] = useState(0);
  const [showDeckSelection, setShowDeckSelection] = useState(false);
  const [tempDeck, setTempDeck] = useState<CardType[]>([]);

  // Init Data
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

  // Matchmaking State Reset on Mount
  useEffect(() => {
    useMatchmakingStore.getState().reset();
  }, []);

  // Timer
  useEffect(() => {
    let interval: any;
    if (status === "searching" && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [status, startTime]);

  // Match Found Redirect
  useEffect(() => {
    if (status === "matched" && matchId) {
      router.push(`/game?mode=online&matchId=${matchId}`);
    }
  }, [status, matchId, router]);

  // Deck Management Logic
  useEffect(() => {
    if (showDeckSelection) {
      setTempDeck(selectedDeck);
    }
  }, [showDeckSelection, selectedDeck]);

  const handleToggleCard = (card: CardType) => {
    const exists = tempDeck.find((c) => c.id === card.id);
    if (exists) {
      setTempDeck(tempDeck.filter((c) => c.id !== card.id));
    } else {
      if (tempDeck.length < 5) {
        setTempDeck([...tempDeck, card]);
      }
    }
  };

  const handleSaveDeck = async () => {
    if (tempDeck.length !== 5) {
      alert("Please select exactly 5 cards.");
      return;
    }
    await saveDeck(tempDeck, user?.id);
    setShowDeckSelection(false);
  };

  const handleModeClick = (modeId: "ranked" | "custom") => {
    if (!isDeckComplete() && selectedDeck.length !== 5) {
      alert("You must have a complete deck (5 cards) to play.");
      return;
    }

    if (modeId === "ranked") {
      startSearch("ranked");
    } else {
      alert("Custom Lobby coming soon!");
    }
  };

  const rawCards = dbCards.length > 0 ? dbCards : CARD_POOL;
  const displayCardPool = user
    ? rawCards.filter((c) => userCardIds.includes(c.id))
    : rawCards;

  // Searching Overlay
  if (status === "searching" || status === "matched") {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 font-mono">
        {status === "matched" ? (
          <div className="text-center animate-pulse">
            <h2 className="text-4xl font-black text-green-500 italic mb-4">
              MATCH FOUND!
            </h2>
            <p className="text-white">Entering Battle Arena...</p>
          </div>
        ) : (
          <div className="text-center max-w-md w-full relative">
            <div className="w-16 h-16 border-4 border-t-red-500 border-red-900/30 rounded-full animate-spin mx-auto mb-8" />
            <h2 className="text-2xl font-bold text-white mb-2">
              SEARCHING FOR OPPONENT...
            </h2>
            <p className="text-gray-400 mb-8 font-mono">{elapsed}s</p>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                Mode: Ranked
              </p>
              <div className="mt-4 flex gap-1 justify-center opacity-50">
                {selectedDeck.map((c: any) => (
                  <div
                    key={c.id}
                    className="w-8 h-10 bg-gray-800 rounded border border-white/10"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={cancelSearch}
              className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Cancel Search
            </button>
          </div>
        )}
      </div>
    );
  }

  // Helper Stats Component
  const StatsCard = () => (
    <div className="relative w-full bg-black/40 rounded-3xl border border-white/5 p-4 md:p-6 flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="text-lg md:text-xl font-black italic uppercase text-white/50">
          YOUR STATS
        </h3>
        <Globe className="w-5 h-5 text-gray-500" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-gray-800/50 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center gap-2 border border-white/5">
          <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
          <div className="text-center">
            <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
              Rank Points
            </div>
            <div className="text-xl md:text-2xl font-black text-white">
              {profile?.rank_points || 0}
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center gap-2 border border-white/5">
          <Swords className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
          <div className="text-center">
            <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
              Matches
            </div>
            <div className="text-sm md:text-lg font-black text-white">-</div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 text-center">
        <p className="text-xs text-gray-500 uppercase">Season 1: Genesis</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden flex flex-col items-center justify-center font-mono">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-black to-black z-0 pointer-events-none" />

      {/* Header - Sticky */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">
            BACK TO MENU
          </span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-gray-900/80 border border-blue-500/30 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 relative overflow-hidden shadow-2xl"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 blur-[60px]" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 blur-[60px]" />

        {!showDeckSelection ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10 transition-all">
            {/* Left Column: Info & Actions */}
            <div className="flex flex-col gap-6 md:gap-8 text-center md:text-left">
              <div>
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <div className="inline-flex items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-l-xl bg-blue-500/10 border border-blue-500/20 border-r-0 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                      <Globe className="w-3 h-3" />
                      ONLINE MULTIPLAYER
                    </div>
                    <div className="px-2 py-1.5 rounded-r-xl bg-blue-500/20 border border-blue-500/20 border-l-0 text-blue-400 font-bold text-[10px]">
                      BETA
                    </div>
                  </div>
                </div>
                <h2 className="text-3xl md:text-5xl font-black italic uppercase text-white mb-2 md:mb-4 leading-none">
                  BATTLE ARENA
                </h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md mx-auto md:mx-0">
                  Challenge players worldwide in tactical card battles. Climb
                  the ranks or spar with friends.
                </p>
              </div>

              {/* Mobile Stats */}
              <div className="block md:hidden">
                <StatsCard />
              </div>

              <div className="flex flex-col gap-6">
                {/* Deck Status Bar */}
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                      DECK STATUS:
                    </span>
                    <span
                      className={cn(
                        "text-lg font-black",
                        isDeckComplete() ? "text-green-400" : "text-yellow-400"
                      )}
                    >
                      {selectedDeck.length}/5
                    </span>
                  </div>
                </div>

                {/* Deck Visual Preview */}
                <div className="flex justify-center md:justify-start -space-x-3 h-16">
                  {selectedDeck.length > 0 ? (
                    selectedDeck.map((c, i) => (
                      <div
                        key={i}
                        className="w-10 h-14 md:w-12 md:h-16 rounded-lg border-2 border-gray-900 relative overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 bg-gray-900"
                        style={{ zIndex: i }}
                      >
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-600 italic self-center">
                      No cards selected
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch">
                  <button
                    onClick={() => handleModeClick("ranked")}
                    disabled={!isDeckComplete()}
                    className={cn(
                      "group relative px-6 py-3 font-black uppercase tracking-widest text-sm transition-all w-full sm:w-auto overflow-hidden rounded-xl flex items-center justify-center gap-2",
                      isDeckComplete()
                        ? "bg-white text-black hover:bg-blue-500 hover:text-white"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    START RANKED
                    {isDeckComplete() && (
                      <ChevronLeft className="rotate-180 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>

                  <button
                    onClick={() => handleModeClick("custom")}
                    disabled={!isDeckComplete()}
                    className={cn(
                      "px-6 py-3 font-black uppercase tracking-widest text-sm transition-all rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto",
                      isDeckComplete()
                        ? "bg-purple-600 text-white hover:bg-purple-500"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    <Users className="w-4 h-4" />
                    CUSTOM
                  </button>

                  <button
                    onClick={() => setShowDeckSelection(true)}
                    className="px-6 py-3 bg-gray-800 text-white font-black uppercase tracking-widest text-sm hover:bg-gray-700 transition-colors rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Layers className="w-4 h-4" />
                    DECK
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Stats */}
            <div className="hidden md:flex justify-center">
              <StatsCard />
            </div>
          </div>
        ) : (
          <DeckEditor
            title="EDIT BATTLE DECK"
            cards={displayCardPool}
            tempDeck={tempDeck}
            maxSelection={5}
            onToggleCard={handleToggleCard}
            onSave={handleSaveDeck}
            onCancel={() => setShowDeckSelection(false)}
          />
        )}
      </motion.div>
    </div>
  );
}
