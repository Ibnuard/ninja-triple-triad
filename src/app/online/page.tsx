"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
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

  // Matchmaking State Reset on Mount & Unmount with Ready Check
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Reset immediately on mount to clear stale state
    console.log("OnlinePage mounted. Initializing state reset...");
    useMatchmakingStore.getState().reset();
    setIsReady(true); // Only start listening to redirect after reset

    // Also reset on unmount to prevent state leakage
    return () => {
      console.log("OnlinePage unmounting. Cleaning up matchmaking state...");
      useMatchmakingStore.getState().reset();
      setIsReady(false);
    };
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

  // Safety Check: If searching for > 10s, check DB for missed match
  useEffect(() => {
    if (status !== "searching" || elapsed < 10 || !user) return;

    const checkMissedMatch = async () => {
      console.log("Searching for too long, checking DB for missed matches...");
      // Buffer: Use 30s before the actual start time to account for DB/Client clock drift
      const startTimeWithBuffer = (startTime || Date.now()) - 30000;
      const startTimeIso = new Date(startTimeWithBuffer).toISOString();

      const { data, error } = await supabase
        .from("matches")
        .select("id, player1_id, player2_id")
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .eq("status", "playing")
        .gt("created_at", startTimeIso)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const match = data[0];
        console.log("Found missed match in DB:", match.id);
        const opponentId =
          match.player1_id === user.id ? match.player2_id : match.player1_id;

        useMatchmakingStore.setState({
          status: "matched",
          matchId: match.id,
          opponentId: opponentId,
        });
      }
    };

    // Check once every 5 seconds after the initial 15s threshold
    const interval = setInterval(checkMissedMatch, 5000);
    return () => clearInterval(interval);
  }, [status, elapsed, user]);

  // Match Found Redirect (Immediate - No Guard Needed)
  useEffect(() => {
    if (status === "matched" && matchId) {
      console.log("Match found! Redirecting to game...");
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
      alert(t.alerts.selectFiveCards);
      return;
    }
    await saveDeck(tempDeck, user?.id);
    setShowDeckSelection(false);
  };

  const handleModeClick = (modeId: "ranked" | "custom") => {
    if (!isDeckComplete() && selectedDeck.length !== 5) {
      alert(t.alerts.deckIncomplete);
      return;
    }

    if (modeId === "ranked") {
      startSearch("ranked");
    } else {
      alert(t.alerts.customComingSoon);
    }
  };

  const rawCards = dbCards.length > 0 ? dbCards : CARD_POOL;
  const displayCardPool = user
    ? rawCards.filter((c) => userCardIds.includes(c.id))
    : rawCards;

  // Hydrate card data (ensure images exist)
  const getHydratedCard = (partialCard: any) => {
    const fullCard = rawCards.find((c) => c.id === partialCard.id);
    return fullCard || partialCard;
  };

  // Searching Overlay
  if (status === "searching" || status === "matched") {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 font-mono">
        {status === "matched" ? (
          <div className="text-center animate-pulse">
            <h2 className="text-4xl font-black text-green-500 italic mb-4">
              {t.matchFound}
            </h2>
            <p className="text-white">{t.enteringArena}</p>
          </div>
        ) : (
          <div className="text-center max-w-md w-full relative">
            <div className="w-16 h-16 border-4 border-t-red-500 border-red-900/30 rounded-full animate-spin mx-auto mb-8" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {t.searchingOpponent}
            </h2>
            <p className="text-gray-400 mb-8 font-mono">{elapsed}s</p>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                {t.modeLabel} {t.modeRanked}
              </p>
              <div className="mt-4 flex gap-1 justify-center">
                {selectedDeck.length > 0 ? (
                  selectedDeck.map((c: any) => {
                    const hydrated = getHydratedCard(c);
                    return (
                      <div
                        key={c.id}
                        className="w-10 h-14 bg-gray-800 rounded border border-white/10 overflow-hidden"
                      >
                        <img
                          src={hydrated.image}
                          alt={hydrated.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })
                ) : (
                  <span className="text-xs text-gray-600 italic">
                    {t.noCardsSelected}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={cancelSearch}
              className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
            >
              {t.cancelSearch}
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
          {t.yourStats}
        </h3>
        <Globe className="w-5 h-5 text-gray-500" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-gray-800/50 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center gap-2 border border-white/5">
          <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
          <div className="text-center">
            <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t.rankPoints}
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
              {t.matchesPlayed}
            </div>
            <div className="text-sm md:text-lg font-black text-white">-</div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 text-center">
        <p className="text-xs text-gray-500 uppercase">{t.seasonLabel}</p>
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] bg-black text-white relative overflow-hidden flex flex-col font-mono">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-black to-black z-0 pointer-events-none" />

      {/* Header - Standardized */}
      <header className="shrink-0 z-50 p-4 md:p-6 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-md w-full relative">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-blue-500 text-[8px] md:text-[10px] font-black tracking-[0.4em] mb-0.5 uppercase italic">
              {t.onlineMultiplayer}
            </h2>
            <h1 className="text-white text-lg md:text-2xl font-black italic uppercase tracking-tight">
              {t.battleArenaTitle}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-start md:justify-center p-4 relative z-10 overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl mx-auto bg-gray-900/80 border border-blue-500/30 rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 relative shadow-2xl my-4 overflow-y-auto max-h-[85vh] md:max-h-none md:overflow-visible custom-scrollbar"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 blur-[60px]" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 blur-[60px]" />

          {!showDeckSelection ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center relative z-10 transition-all">
              {/* Left Column: Info & Actions */}
              <div className="flex flex-col gap-6 md:gap-8 text-center md:text-left">
                <div className="hidden md:block">
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md mx-auto md:mx-0">
                    {t.battleArenaDesc}
                  </p>
                </div>

                {/* Mobile Stats */}
                <div className="block md:hidden">
                  <StatsCard />
                </div>

                <div className="flex flex-col gap-4 md:gap-6">
                  {/* Deck Status Bar */}
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <div className="bg-black/40 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-white/10 flex items-center gap-2 md:gap-3">
                      <Layers className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      <span className="text-[10px] md:text-sm font-bold text-gray-300 uppercase tracking-wider">
                        {t.deckStatus}
                      </span>
                      <span
                        className={cn(
                          "text-sm md:text-lg font-black",
                          isDeckComplete()
                            ? "text-green-400"
                            : "text-yellow-400"
                        )}
                      >
                        {selectedDeck.length}/5
                      </span>
                    </div>
                  </div>

                  {/* Deck Visual Preview */}
                  <div className="flex justify-center md:justify-start -space-x-2 md:-space-x-3 h-12 md:h-16">
                    {selectedDeck.length > 0 ? (
                      selectedDeck.map((c, i) => {
                        const hydrated = getHydratedCard(c);
                        return (
                          <div
                            key={i}
                            className="w-8 h-11 md:w-12 md:h-16 rounded-lg border-2 border-gray-900 relative overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 bg-gray-900"
                            style={{ zIndex: i }}
                          >
                            <img
                              src={hydrated.image}
                              alt={hydrated.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[10px] md:text-xs text-gray-600 italic self-center">
                        {t.noCardsSelected}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row gap-2 items-stretch">
                    <button
                      onClick={() => handleModeClick("ranked")}
                      disabled={!isDeckComplete()}
                      className={cn(
                        "flex-1 group relative px-2 md:px-6 py-3 md:py-4 font-black uppercase tracking-tighter md:tracking-widest text-[10px] md:text-sm transition-all overflow-hidden rounded-xl flex items-center justify-center gap-1 md:gap-2",
                        isDeckComplete()
                          ? "bg-white text-black hover:bg-blue-500 hover:text-white"
                          : "bg-gray-800 text-gray-500 cursor-not-allowed"
                      )}
                    >
                      <span className="truncate">{t.startRanked}</span>
                      {isDeckComplete() && (
                        <ChevronLeft className="rotate-180 w-3 h-3 md:w-4 md:h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                      )}
                    </button>

                    <button
                      onClick={() => handleModeClick("custom")}
                      disabled={!isDeckComplete()}
                      className={cn(
                        "flex-1 px-2 md:px-6 py-3 md:py-4 font-black uppercase tracking-tighter md:tracking-widest text-[10px] md:text-sm transition-all rounded-xl flex items-center justify-center gap-1 md:gap-2",
                        isDeckComplete()
                          ? "bg-purple-600 text-white hover:bg-purple-500"
                          : "bg-gray-800 text-gray-500 cursor-not-allowed"
                      )}
                    >
                      <Users className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                      <span className="truncate">{t.customLobby}</span>
                    </button>

                    <button
                      onClick={() => setShowDeckSelection(true)}
                      className="flex-1 px-2 md:px-6 py-3 md:py-4 bg-gray-800 text-white font-black uppercase tracking-tighter md:tracking-widest text-[10px] md:text-sm hover:bg-gray-700 transition-colors rounded-xl flex items-center justify-center gap-1 md:gap-2"
                    >
                      <Layers className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                      <span className="truncate">{t.editDeck}</span>
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
      </main>
    </div>
  );
}
