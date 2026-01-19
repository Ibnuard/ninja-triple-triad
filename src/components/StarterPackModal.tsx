"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useCardStore } from "../store/useCardStore";
import { Card } from "./Card";
import { Card as CardType } from "../types/game";
import { Loader2, Sparkles, X } from "lucide-react";
import { useTranslation } from "../store/useSettingsStore";

import { PackOpeningSequence } from "../app/shop/PackOpeningSequence";

interface StarterPackModalProps {
  isOpen: boolean;
}

export function StarterPackModal({ isOpen }: StarterPackModalProps) {
  const t = useTranslation();
  const {
    user,
    profile,
    refreshProfile,
    checkUsernameAvailability,
    updateUsername,
  } = useAuthStore();
  const {
    cards,
    fetchCards,
    isLoading,
    error: storeError,
    addStarterPack,
  } = useCardStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimedCards, setClaimedCards] = useState<CardType[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // Nickname Phase State
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Determine current phase
  // Phase logic:
  // 1. If profile exists but no username -> 'nickname'
  // 2. If username exists but not onboarded -> 'pack'
  // 3. If showResult is true -> 'result'
  const phase = useMemo(() => {
    if (showResult && isOpening) return "result";
    if (profile && !profile.username) return "nickname";
    if (profile && !profile.is_onboarded) return "pack";
    return null;
  }, [profile, showResult, isOpening]);

  // Ensure we have cards to pick from, but avoid infinite loop if DB is empty
  useEffect(() => {
    if (cards.length === 0 && !isLoading && !storeError) {
      fetchCards();
    }
  }, [cards.length, fetchCards, isLoading, storeError]);

  const validateNickname = (val: string) => {
    if (!val) return t.onboarding.validation.required;
    if (val.length > 12) return t.onboarding.validation.tooLong;
    if (!/^[a-zA-Z0-9]+$/.test(val)) return t.onboarding.validation.invalid;
    return "";
  };

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateNickname(nickname);
    if (error) {
      setNicknameError(error);
      return;
    }

    setIsSubmitting(true);
    setNicknameError("");

    try {
      const isAvailable = await checkUsernameAvailability(nickname);
      if (!isAvailable) {
        setNicknameError(t.onboarding.validation.taken);
        setIsSubmitting(false);
        return;
      }

      const result = await updateUsername(nickname);
      if (!result.success) {
        setNicknameError(result.error || "Failed to update nickname");
      }
      // Success will trigger re-render and move to 'pack' phase due to profile update in store
    } catch (err) {
      setNicknameError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaim = async () => {
    if (!user) return;

    setIsSubmitting(true);

    // Filter is_init cards
    let initCards = cards.filter((c) => c.isInit);

    // Fallback: If no cards are marked as isInit, use all available cards
    // This prevents the "empty pack" hang if the database wasn't seeded correctly
    if (initCards.length === 0) {
      console.warn(
        "No cards with is_init=true found. Falling back to all cards."
      );
      initCards = cards;
    }

    if (initCards.length === 0) {
      alert("No cards found in database. Please contact admin.");
      setIsSubmitting(false);
      return;
    }

    // Pick 10 random unique cards
    const shuffled = [...initCards].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    const cardIds = selected.map((c) => c.id);

    const result = await addStarterPack(user.id, cardIds);

    if (result.success) {
      setClaimedCards(selected);
      setShowResult(true);
      setIsOpening(true);
      refreshProfile();
    } else {
      alert("Failed to create starter pack. Please try again.");
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    window.location.reload();
  };

  if (!isOpen || !user || !profile || !phase) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
      >
        {phase === "result" ? (
          <PackOpeningSequence
            cards={claimedCards}
            duplicates={[]}
            coinsGained={0}
            onComplete={() => {}}
            onClose={handleClose}
          />
        ) : phase === "nickname" ? (
          <div className="w-full max-w-md flex flex-col items-center gap-8 relative p-8">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="text-center space-y-2 relative z-10">
              <h1 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">
                {t.onboarding.nicknameTitle}
              </h1>
              <p className="text-sm text-gray-400 font-medium tracking-wide max-w-xs mx-auto">
                {t.onboarding.nicknameDesc}
              </p>
            </div>

            <form
              onSubmit={handleNicknameSubmit}
              className="w-full space-y-6 relative z-10"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-red-500/80">
                  {t.onboarding.nicknameLabel}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value.replace(/\s+/g, ""));
                      setNicknameError("");
                    }}
                    placeholder={t.onboarding.nicknamePlaceholder}
                    disabled={isSubmitting}
                    className={`
                      w-full h-14 bg-white/5 border-2 rounded-xl px-4 text-lg font-bold text-white transition-all
                      outline-none focus:bg-white/10
                      ${
                        nicknameError
                          ? "border-red-500/50"
                          : "border-white/10 focus:border-red-600/50"
                      }
                    `}
                  />
                  {nicknameError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-red-500 font-bold uppercase mt-1.5 ml-1"
                    >
                      {nicknameError}
                    </motion.p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !nickname}
                className={`
                  w-full h-14 rounded-xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2
                  ${
                    isSubmitting || !nickname
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                  }
                `}
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  t.onboarding.submit
                )}
              </button>
            </form>

            {/* Decorative Shuriken */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4 w-12 h-12 opacity-10"
            >
              <img
                src="/images/shuriken.webp"
                alt=""
                className="w-full h-full object-contain"
              />
            </motion.div>
          </div>
        ) : phase === "pack" ? (
          <div className="w-full max-w-md flex flex-col items-center gap-6 relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="text-center space-y-1 relative z-10">
              <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                {t.starterPack.welcomeTitle}
              </h1>
              <p className="text-sm text-gray-400 font-medium tracking-wide">
                {t.starterPack.welcomeDesc}
              </p>
            </div>

            {/* Card Pack Visual */}
            <div className="relative group w-full max-w-[280px] aspect-[3/4] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl opacity-50 blur-xl group-hover:opacity-75 transition-opacity duration-500" />

              <div className="relative h-full bg-black/80 border border-white/10 rounded-2xl overflow-hidden flex flex-col items-center shadow-2xl">
                {/* Image */}
                <div className="w-full h-full relative">
                  <img
                    src="/images/dummy-ninja.webp"
                    alt="Starter Pack"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 w-full p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-black text-white uppercase italic tracking-widest mb-2">
                    {t.starterPack.packTitle}
                  </h3>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[280px] relative z-10">
              <button
                onClick={handleClaim}
                disabled={isSubmitting || cards.length === 0}
                className={`
                                w-full h-12 rounded-xl font-black text-sm md:text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                ${
                                  isSubmitting || cards.length === 0
                                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                    : "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
                                }
                            `}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>{t.starterPack.claimDeck}</>
                )}
              </button>
              {cards.length === 0 && !isLoading && !storeError && (
                <p className="text-[10px] text-red-500 text-center mt-2 group-hover:scale-105 transition-transform">
                  {t.starterPack.loading} (Empty Database)
                </p>
              )}
              {isLoading && (
                <p className="text-[10px] text-gray-500 text-center mt-2 animate-pulse">
                  {t.starterPack.loading}
                </p>
              )}
              {storeError && (
                <div className="mt-2 text-center">
                  <p className="text-[10px] text-red-500 font-bold uppercase mb-1">
                    Error: {storeError}
                  </p>
                  <button
                    onClick={() => fetchCards()}
                    className="text-[10px] text-white hover:text-red-500 font-black uppercase underline tracking-tighter"
                  >
                    Retry Loading
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
