"use client";

import { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, CheckCircle2, AlertCircle, Trash2, Crown } from "lucide-react";
import { Card } from "../../../components/Card";
import { Card as CardType } from "../../../types/game";
import { useCardStore } from "../../../store/useCardStore";
import { useBossDeckStore } from "../../../store/useBossDeckStore";
import { GauntletRank, BOSS_CONFIGS } from "../../../constants/gauntlet";
import { cn } from "../../../lib/utils";

const RANKS: GauntletRank[] = [
  "Genin",
  "Chunin",
  "Jounin",
  "Anbu",
  "Kage",
  "Rikudo",
];

const RANK_COLORS: Record<GauntletRank, string> = {
  Genin: "from-green-600 to-green-800",
  Chunin: "from-blue-600 to-blue-800",
  Jounin: "from-purple-600 to-purple-800",
  Anbu: "from-red-600 to-red-800",
  Kage: "from-yellow-600 to-yellow-800",
  Rikudo: "from-pink-600 to-pink-800",
};

const SelectableCard = memo(
  ({
    card,
    isSelected,
    onToggle,
  }: {
    card: CardType;
    isSelected: boolean;
    onToggle: (card: CardType) => void;
  }) => {
    return (
      <div
        onClick={() => onToggle(card)}
        className={cn(
          "aspect-[2.5/3.5] cursor-pointer rounded-xl overflow-hidden border-2 transition-all relative group",
          isSelected
            ? "border-red-500 ring-2 ring-red-500/50"
            : "border-transparent border-white/5 hover:border-white/20"
        )}
      >
        <Card
          card={card}
          disableAnimations
          hideStats={false}
          className="w-full h-full lg:w-full lg:h-full max-w-none max-h-none"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10">
            <CheckCircle2 className="w-8 h-8 text-red-500 drop-shadow-md" />
          </div>
        )}
      </div>
    );
  },
  (prev, next) =>
    prev.card.id === next.card.id &&
    prev.isSelected === next.isSelected &&
    prev.onToggle === next.onToggle
);
SelectableCard.displayName = "SelectableCard";

export function BossDeckManager() {
  const { cards, fetchCards } = useCardStore();
  const { bossDecks, fetchBossDecks, saveBossDeck, isLoading } =
    useBossDeckStore();

  const [selectedRank, setSelectedRank] = useState<GauntletRank>("Genin");
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCards();
    fetchBossDecks();
  }, [fetchCards, fetchBossDecks]);

  // Load current deck when rank changes
  useEffect(() => {
    const currentDeck = bossDecks[selectedRank] || [];
    setSelectedCards(currentDeck);
    setSuccess(false);
    setError("");
  }, [selectedRank, bossDecks]);

  const toggleCardSelection = useCallback((card: CardType) => {
    setSelectedCards((prev) => {
      const isSelected = prev.some((c) => c.id === card.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== card.id);
      } else {
        if (prev.length < 5) {
          return [...prev, card];
        }
        return prev;
      }
    });
  }, []);

  const handleSave = async () => {
    if (selectedCards.length !== 5) {
      setError("Boss deck must have exactly 5 cards");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess(false);

    const cardIds = selectedCards.map((c) => c.id);
    const result = await saveBossDeck(selectedRank, cardIds);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Failed to save deck");
    }

    setIsSaving(false);
  };

  const clearDeck = () => {
    setSelectedCards([]);
  };

  const filteredCards = cards.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bossInfo = BOSS_CONFIGS[selectedRank];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
      {/* Left: Rank Selection & Current Deck */}
      <div className="space-y-6">
        {/* Rank Selector */}
        <div className="bg-gray-900/30 border border-white/5 p-4 rounded-xl">
          <h3 className="text-xs font-black uppercase text-gray-500 mb-3">
            Select Boss Rank
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {RANKS.map((rank) => (
              <button
                key={rank}
                onClick={() => setSelectedRank(rank)}
                className={cn(
                  "p-3 rounded-xl border text-xs font-black uppercase transition-all",
                  selectedRank === rank
                    ? `bg-gradient-to-br ${RANK_COLORS[rank]} border-white/20 text-white`
                    : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-2 justify-center">
                  <Crown className="w-3 h-3" />
                  {rank}
                </div>
                <div className="text-[9px] font-normal mt-1 opacity-70">
                  {bossDecks[rank]?.length || 0}/5 cards
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Boss Info */}
        <div className="bg-gray-900/30 border border-white/5 p-4 rounded-xl">
          <h3 className="text-xs font-black uppercase text-gray-500 mb-3">
            Boss Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name:</span>
              <span className="text-white font-bold">{bossInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mechanic:</span>
              <span className="text-yellow-500 font-bold uppercase">
                {bossInfo.mechanic}
              </span>
            </div>
          </div>
        </div>

        {/* Current Deck Preview */}
        <div className="bg-gray-900/30 border border-white/5 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase text-gray-500">
              Boss Deck ({selectedCards.length}/5)
            </h3>
            <button
              onClick={clearDeck}
              className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((index) => {
              const card = selectedCards[index];
              return (
                <div
                  key={index}
                  className={cn(
                    "aspect-[2.5/3.5] rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden",
                    card
                      ? "border-transparent bg-gray-800"
                      : "border-white/10 bg-black/20"
                  )}
                >
                  {card ? (
                    <div
                      className="w-full h-full cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => toggleCardSelection(card)}
                    >
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-600 text-xs">{index + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-center gap-2 text-green-500 text-[10px] font-black uppercase italic bg-green-500/10 p-3 rounded-xl border border-green-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Boss deck saved!
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-start gap-2 text-red-500 text-[10px] font-black uppercase italic bg-red-500/10 p-3 rounded-xl border border-red-500/20"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p>{error}</p>
                  {error.includes('relation "boss_decks" does not exist') && (
                    <p className="mt-1 text-xs normal-case opacity-70">
                      Please run the SQL script in{" "}
                      <code>supabase/boss_decks.sql</code> to create the table.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || selectedCards.length !== 5}
            className={cn(
              "w-full mt-4 py-3 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all",
              selectedCards.length === 5
                ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Boss Deck
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right: Card Pool */}
      <div className="space-y-4">
        <div className="bg-gray-900/30 border border-white/5 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase text-gray-500">
              Card Pool
            </h3>
            <span className="text-[10px] text-gray-600">
              {filteredCards.length} cards available
            </span>
          </div>

          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:border-red-500/50"
          />

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCards.map((card) => (
              <SelectableCard
                key={card.id}
                card={card}
                isSelected={selectedCards.some((c) => c.id === card.id)}
                onToggle={toggleCardSelection}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
