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
  const { user, profile, refreshProfile } = useAuthStore();
  const { cards, addStarterPack, fetchCards } = useCardStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimedCards, setClaimedCards] = useState<CardType[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // Ensure we have cards to pick from
  useEffect(() => {
    if (cards.length === 0) fetchCards();
  }, [cards.length, fetchCards]);

  const handleClaim = async () => {
    if (!user) return;

    setIsSubmitting(true);

    // Filter is_init cards
    const initCards = cards.filter((c) => c.isInit);

    // Pick 10 random unique cards
    const shuffled = [...initCards].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    const cardIds = selected.map((c) => c.id);

    const result = await addStarterPack(user.id, cardIds);

    if (result.success) {
      setClaimedCards(selected);
      setShowResult(true);
      setIsOpening(true);
      // Refresh profile in background, but wait to close until user clicks "Continue"
      refreshProfile();
    } else {
      alert("Failed to create starter pack. Please try again.");
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    // Force page reload or close modal if profile updated
    window.location.reload();
  };

  if (!isOpen || !user || !profile || (profile.is_onboarded && !showResult))
    return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
      >
        {showResult && isOpening ? (
          <PackOpeningSequence
            cards={claimedCards}
            duplicates={[]}
            coinsGained={0}
            onComplete={() => {}}
            onClose={handleClose}
          />
        ) : !showResult ? (
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
              {cards.length === 0 && (
                <p className="text-[10px] text-red-500 text-center mt-2">
                  {t.starterPack.loading}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
