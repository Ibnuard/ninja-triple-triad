"use client";

import { useState, useEffect, memo, useCallback } from "react";
import { Plus, X, Save, Search, CheckCircle2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useCardStore } from "../../../store/useCardStore";
import { useShopStore, ShopPack, PackRule } from "../../../store/useShopStore";
import { CardRarity, Card as CardType } from "../../../types/game";
import { Card } from "../../../components/Card";
import { motion, AnimatePresence } from "framer-motion";

const RARITIES: CardRarity[] = ["common", "rare", "epic", "legend", "special"];

interface ShopPackFormProps {
  initialData?: ShopPack;
  onSubmit: (data: Omit<ShopPack, "id" | "created_at">) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PackCardItem = memo(
  ({
    card,
    isSelected,
    onToggle,
  }: {
    card: CardType;
    isSelected: boolean;
    onToggle: (card: CardType) => void;
  }) => (
    <div
      onClick={() => onToggle(card)}
      className={cn(
        "aspect-[2.5/3.5] cursor-pointer rounded-lg overflow-hidden border-2 transition-all relative group",
        isSelected
          ? "border-red-500 ring-2 ring-red-500/50"
          : "border-transparent border-white/5 hover:border-white/20"
      )}
    >
      <Card
        card={card}
        disableAnimations
        hideStats
        className="w-full h-full lg:w-full lg:h-full max-w-none max-h-none"
      />
      {isSelected && (
        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-red-500" />
        </div>
      )}
    </div>
  ),
  (prev, next) =>
    prev.card.id === next.card.id &&
    prev.isSelected === next.isSelected &&
    prev.onToggle === next.onToggle
);
PackCardItem.displayName = "PackCardItem";

export function ShopPackForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: ShopPackFormProps) {
  const { cards } = useCardStore();

  // Base Form Data
  const [formData, setFormData] = useState({
    name: initialData?.name || "New Pack",
    description: initialData?.description || "",
    price: initialData?.price || 100,
    icon: initialData?.icon || "Zap",
    color: initialData?.color || "from-blue-500 to-blue-700",
    is_active: initialData?.is_active ?? true,
  });

  // Pack Type State
  const [packType, setPackType] = useState<"random" | "specific">("random");

  // Random Mode State
  const [selectedRarities, setSelectedRarities] = useState<CardRarity[]>([]);
  const [cpRange, setCpRange] = useState<[number, number]>([0, 99]);
  const [cardCount, setCardCount] = useState(5);

  // Specific Mode State
  const [specificCards, setSpecificCards] = useState<CardType[]>([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardSearch, setCardSearch] = useState("");

  // Initialize state from existing config if editing
  useEffect(() => {
    if (initialData?.config && initialData.config.length > 0) {
      // Analyze config to determine type
      const firstRule = initialData.config[0];

      if (firstRule.type === "specific_card") {
        setPackType("specific");
        const cardIds = initialData.config.map((r) => r.value);
        const loadedCards = cards.filter((c) => cardIds.includes(c.id));
        setSpecificCards(loadedCards);
      } else if (firstRule.type === "filtered_pool") {
        setPackType("random");
        setCardCount(firstRule.count);
        if (firstRule.value.rarities)
          setSelectedRarities(firstRule.value.rarities);
        if (firstRule.value.cpRange) setCpRange(firstRule.value.cpRange);
      } else {
        // Fallback for legacy configs
        setPackType("random");
        // Try to map legacy rules if simple enough, otherwise defaults
      }
    }
  }, [initialData, cards]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let config: PackRule[] = [];

    if (packType === "random") {
      // Create single filtered_pool rule
      config = [
        {
          type: "filtered_pool",
          count: cardCount,
          value: {
            rarities: selectedRarities,
            cpRange: cpRange,
          },
        },
      ];
    } else {
      // Create multiple specific_card rules
      config = specificCards.map((card) => ({
        type: "specific_card",
        count: 1, // Assume 1 of each specific card for now
        value: card.id,
      }));
    }

    onSubmit({
      ...formData,
      config,
    });
  };

  const toggleRarity = (rarity: CardRarity) => {
    if (selectedRarities.includes(rarity)) {
      setSelectedRarities(selectedRarities.filter((r) => r !== rarity));
    } else {
      setSelectedRarities([...selectedRarities, rarity]);
    }
  };

  const toggleSpecificCard = useCallback((card: CardType) => {
    setSpecificCards((prev) => {
      if (prev.some((c) => c.id === card.id)) {
        return prev.filter((c) => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  }, []);

  const filteredCardList = cards.filter((c) =>
    c.name.toLowerCase().includes(cardSearch.toLowerCase())
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm"
    >
      <h3 className="text-sm font-black uppercase text-white mb-6 flex items-center gap-2">
        {initialData ? "Edit Pack Configuration" : "Create New Pack"}
      </h3>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              Pack Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
              placeholder="e.g. Starter Pack"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              Price (Coins)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseInt(e.target.value) || 0,
                })
              }
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 h-20 resize-none"
            placeholder="Describe what's inside..."
          />
        </div>

        {/* Configuration Mode Toggle */}
        <div className="bg-black/40 p-1 rounded-xl flex gap-1 border border-white/5">
          <button
            type="button"
            onClick={() => setPackType("random")}
            className={cn(
              "flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all",
              packType === "random"
                ? "bg-red-600 text-white shadow-lg"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            )}
          >
            Random Pack
          </button>
          <button
            type="button"
            onClick={() => setPackType("specific")}
            className={cn(
              "flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all",
              packType === "specific"
                ? "bg-red-600 text-white shadow-lg"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            )}
          >
            Specific Cards
          </button>
        </div>

        {/* Random Mode Config */}
        {packType === "random" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 bg-black/20 p-4 rounded-xl border border-white/5"
          >
            {/* Card Count */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                Cards per Pack
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={cardCount}
                onChange={(e) => setCardCount(parseInt(e.target.value) || 5)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
              />
            </div>

            {/* Rarities */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                Possible Rarities
              </label>
              <div className="flex flex-wrap gap-2">
                {RARITIES.map((rarity) => (
                  <button
                    key={rarity}
                    type="button"
                    onClick={() => toggleRarity(rarity)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all",
                      selectedRarities.includes(rarity)
                        ? "bg-red-500/20 border-red-500 text-red-500"
                        : "bg-black/40 border-white/10 text-gray-500 hover:border-white/30"
                    )}
                  >
                    {rarity}
                  </button>
                ))}
              </div>
            </div>

            {/* CP Range */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                CP Range (Min - Max)
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="number"
                  value={cpRange[0]}
                  onChange={(e) =>
                    setCpRange([parseInt(e.target.value) || 0, cpRange[1]])
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
                  placeholder="Min"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  value={cpRange[1]}
                  onChange={(e) =>
                    setCpRange([cpRange[0], parseInt(e.target.value) || 99])
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
                  placeholder="Max"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Specific Mode Config */}
        {packType === "specific" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5"
          >
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                Selected Cards ({specificCards.length})
              </label>
              <button
                type="button"
                onClick={() => setIsCardModalOpen(true)}
                className="text-xs text-red-500 font-black uppercase hover:text-red-400 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Cards
              </button>
            </div>

            {specificCards.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-xs italic">
                No cards selected. Click "Add Cards" to choose content.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                {specificCards.map((card) => (
                  <div key={card.id} className="relative group">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="rounded-lg w-full aspect-[2.5/3.5] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSpecificCard(card)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-400 font-black uppercase text-xs hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting ||
              (packType === "specific" && specificCards.length === 0)
            }
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-black uppercase text-xs hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                {initialData ? "Update Pack" : "Create Pack"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card Selection Modal */}
      <AnimatePresence>
        {isCardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
                <h3 className="text-white font-black uppercase">
                  Select Cards
                </h3>
                <button
                  onClick={() => setIsCardModalOpen(false)}
                  className="text-gray-500 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 border-b border-white/10 bg-black/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={cardSearch}
                    onChange={(e) => setCardSearch(e.target.value)}
                    placeholder="Search cards..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {filteredCardList.map((card) => (
                    <PackCardItem
                      key={card.id}
                      card={card}
                      isSelected={specificCards.some((c) => c.id === card.id)}
                      onToggle={toggleSpecificCard}
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-black/50 flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold uppercase">
                  {specificCards.length} cards selected
                </span>
                <button
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-black uppercase text-xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </form>
  );
}
