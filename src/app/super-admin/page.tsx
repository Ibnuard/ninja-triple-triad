"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Plus,
  Eye,
  Save,
  X,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Settings,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "../../components/Card";
import { useCardStore } from "../../store/useCardStore";
import { ElementType, CardRarity, Card as CardType } from "../../types/game";
import { cn } from "../../lib/utils";
import { ImageUpload } from "./components/ImageUpload";
import { useShopStore, PackRule, ShopPack } from "../../store/useShopStore";

const ELEMENTS: ElementType[] = [
  "fire",
  "water",
  "earth",
  "wind",
  "lightning",
  "none",
];
const RARITIES: CardRarity[] = ["common", "rare", "epic", "legend", "special"];

export default function SuperAdminPage() {
  const router = useRouter();
  const { cards, fetchCards, addCard, updateCard } = useCardStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "New Ninja",
    element: "fire" as ElementType,
    rarity: "common" as CardRarity,
    image: "",
    stats: { top: 5, right: 5, bottom: 5, left: 5 },
    isInit: false,
    cp: 0,
  });
  const [activeTab, setActiveTab] = useState<"cards" | "shop">("cards");

  // Shop Manager State
  const { packs, fetchPacks, addPack, updatePack: updateShopPack, deletePack } = useShopStore();
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [packFormData, setPackFormData] = useState<Omit<ShopPack, "id" | "created_at">>({
    name: "New Pack",
    description: "Pack description",
    price: 100,
    icon: "Zap",
    color: "from-blue-500 to-blue-700",
    config: [],
    is_active: true,
  });

  const [previewData, setPreviewData] = useState(formData);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCards();
      fetchPacks();
    }
  }, [isAuthenticated, fetchCards, fetchPacks]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const secret = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "admin123";
    if (passcode === secret) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect Passcode");
    }
  };

  const handleEdit = (card: CardType) => {
    setEditingId(card.id);
    setFormData({
      name: card.name,
      element: card.element,
      rarity: card.rarity || "common",
      image: card.image,
      stats: { ...card.baseStats },
      isInit: card.isInit || false,
      cp: card.cp || 0,
    });
    setPreviewData({
      name: card.name,
      element: card.element,
      rarity: card.rarity || "common",
      image: card.image,
      stats: { ...card.baseStats },
      isInit: card.isInit || false,
      cp: card.cp || 0,
    });
    setSuccess(false);
    setError("");
    // Scroll to form (optional)
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "New Ninja",
      element: "fire" as ElementType,
      rarity: "common" as CardRarity,
      image: "",
      stats: { top: 5, right: 5, bottom: 5, left: 5 },
      isInit: false,
      cp: 0,
    });
    setPreviewData({
      name: "New Ninja",
      element: "fire" as ElementType,
      rarity: "common" as CardRarity,
      image: "",
      stats: { top: 5, right: 5, bottom: 5, left: 5 },
      isInit: false,
      cp: 0,
    });
    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    let result;

    const cardPayload = {
      name: formData.name,
      element: formData.element,
      rarity: formData.rarity,
      image: formData.image,
      stats: formData.stats,
      isInit: formData.isInit,
      cp: formData.cp,
    };

    if (editingId) {
      result = await updateCard(editingId, cardPayload);
    } else {
      result = await addCard(cardPayload);
    }

    if (result.success) {
      setSuccess(true);
      if (!editingId) {
        // If creating, reset name for next
        setFormData((prev) => ({ ...prev, name: "New Ninja" }));
      }
    } else {
      setError(result.error || "Failed to save card");
    }
    setIsSubmitting(false);
  };

  const handleRefreshPreview = () => {
    setPreviewData(formData);
  };

  const filteredCards = cards.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let result;
    if (editingPackId) {
      result = await updateShopPack(editingPackId, packFormData);
    } else {
      result = await addPack(packFormData);
    }
    if (result.success) {
      setSuccess(true);
      if (!editingPackId) setPackFormData({ ...packFormData, name: "New Pack" });
    } else {
      setError(result.error || "Failed to save pack");
    }
    setIsSubmitting(false);
  };

  const addRule = () => {
    setPackFormData({
      ...packFormData,
      config: [...packFormData.config, { type: "random", value: null, count: 1 }],
    });
  };

  const updateRule = (index: number, rule: Partial<PackRule>) => {
    const newConfig = [...packFormData.config];
    const currentRule = newConfig[index];
    
    // Set defaults when type changes
    if (rule.type && rule.type !== currentRule.type) {
      let defaultValue: any = null;
      switch (rule.type) {
        case "rarity": defaultValue = "common"; break;
        case "element": defaultValue = "fire"; break;
        case "cp_range": defaultValue = [0, 1000]; break;
        case "specific_card": defaultValue = ""; break;
        case "random": defaultValue = null; break;
      }
      newConfig[index] = { ...currentRule, ...rule, value: defaultValue };
    } else {
      newConfig[index] = { ...currentRule, ...rule };
    }
    
    setPackFormData({ ...packFormData, config: newConfig });
  };

  const removeRule = (index: number) => {
    setPackFormData({
      ...packFormData,
      config: packFormData.config.filter((_, i) => i !== index),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 bg-gray-900/50 border border-white/10 rounded-[2rem] backdrop-blur-xl shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-tight">
              Super Admin
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
              Restricted Access
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="ENTER PASSCODE"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-center font-mono focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
            {error && (
              <p className="text-red-500 text-[10px] font-black uppercase italic text-center animate-pulse">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black italic uppercase py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-red-900/20"
            >
              Access Console
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Return Home
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 md:p-8 font-mono">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                Forge Console
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={() => setActiveTab("cards")}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    activeTab === "cards" ? "text-red-500" : "text-gray-500 hover:text-white"
                  )}
                >
                  Card Forge
                </button>
                <div className="w-1 h-1 rounded-full bg-white/10" />
                <button
                  onClick={() => setActiveTab("shop")}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    activeTab === "shop" ? "text-red-500" : "text-gray-500 hover:text-white"
                  )}
                >
                  Shop Manager
                </button>
              </div>
            </div>
          </div>
          <div className="hidden md:block w-32 h-1 bg-white/10 skew-x-[-45deg]" />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "cards" ? (
            <motion.div
              key="cards-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-8 items-start"
            >
          {/* List Sidebar */}
          <div className="space-y-4 h-[80vh] flex flex-col">
            <div className="bg-gray-900/30 border border-white/5 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase text-gray-500">
                  Database
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="p-1.5 bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-lg shadow-red-900/20 group"
                  title="Create New Card"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
              <input
                type="text"
                placeholder="SEARCH CARD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500/50"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleEdit(card)}
                  className={cn(
                    "group p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3",
                    editingId === card.id
                      ? "bg-red-500/10 border-red-500/50"
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                  )}
                >
                  <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-black">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-xs font-black uppercase truncate",
                        editingId === card.id
                          ? "text-red-400"
                          : "text-gray-300 group-hover:text-white"
                      )}
                    >
                      {card.name}
                    </p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">
                      {card.element} • {card.rarity}
                    </p>
                  </div>
                </div>
              ))}
              {filteredCards.length === 0 && (
                <p className="text-center text-xs text-gray-600 py-4 italic">
                  No cards found
                </p>
              )}
            </div>
          </div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 bg-gray-900/30 border border-white/5 p-6 rounded-[2rem]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase italic">
                {editingId ? "Edit Protocol" : "New Entry Protocol"}
              </h2>
              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="text-[10px] font-bold uppercase text-red-500 hover:text-red-400 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    Ninja Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    Element
                  </label>
                  <select
                    value={formData.element}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        element: e.target.value as ElementType,
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 uppercase"
                  >
                    {ELEMENTS.map((el) => (
                      <option key={el} value={el}>
                        {el}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    Rarity
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rarity: e.target.value as CardRarity,
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 uppercase"
                  >
                    {RARITIES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4 pt-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">
                    Direct Image Upload
                  </label>
                  <ImageUpload
                    onUploadSuccess={(url) =>
                      setFormData({ ...formData, image: url })
                    }
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      Image URL (Manual/Auto)
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">
                  Unit Statistics
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(formData.stats).map(([side, value]) => (
                    <div key={side} className="space-y-2">
                      <label className="text-[9px] text-gray-500 font-black uppercase italic text-center block">
                        {side}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stats: {
                              ...formData.stats,
                              [side]: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-center text-sm font-bold focus:outline-none focus:border-red-500/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Config: isInit and CP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      Initial Card
                    </label>
                    <p className="text-[9px] text-gray-600 italic uppercase">
                      Diberikan saat awal game
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isInit: !formData.isInit })
                    }
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors duration-300 border",
                      formData.isInit
                        ? "bg-red-500 border-red-400"
                        : "bg-gray-800 border-gray-700"
                    )}
                  >
                    <motion.div
                      animate={{ x: formData.isInit ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      Card Power (CP)
                    </label>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    value={formData.cp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cp: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              {/* Status Indicator */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase italic bg-green-500/10 p-3 rounded-xl border border-green-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {editingId
                      ? "Changes committed successfully!"
                      : "Card forged successfully!"}
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase italic bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full bg-red-600 hover:bg-red-500 text-white font-black italic uppercase py-4 rounded-2xl transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-2",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {editingId ? "Update Data" : "Commit to Database"}
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Preview Side */}
          <div className="lg:sticky lg:top-8 flex flex-col items-center gap-8">
            <div className="flex items-center justify-between w-full max-w-[200px]">
              <div className="text-center space-y-2 flex-1">
                <h2 className="text-sm font-black italic uppercase tracking-widest text-gray-500">
                  Holographic Preview
                </h2>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto" />
              </div>
              <button
                onClick={handleRefreshPreview}
                className="ml-4 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                title="Refresh Preview"
              >
                <RefreshCw className="w-4 h-4 text-gray-400 group-hover:text-white group-active:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative"
            >
              {/* Ambient Glow */}
              <div
                className={cn(
                  "absolute inset-0 blur-[60px] opacity-30 rounded-full",
                  previewData.element === "fire"
                    ? "bg-red-500"
                    : previewData.element === "water"
                    ? "bg-blue-500"
                    : previewData.element === "earth"
                    ? "bg-amber-700"
                    : previewData.element === "wind"
                    ? "bg-green-500"
                    : previewData.element === "lightning"
                    ? "bg-yellow-400"
                    : "bg-gray-400"
                )}
              />

              <div className="w-48 md:w-56 shrink-0">
                <Card
                  card={{
                    id: "preview",
                    ...previewData,
                    baseStats: previewData.stats,
                  }}
                  isPlaced={false}
                />
              </div>
            </motion.div>

            <div className="w-full max-w-sm bg-white/5 border border-white/5 p-4 rounded-2xl">
              <h3 className="text-[10px] text-gray-400 font-bold uppercase mb-2">
                Ninja Specifications
              </h3>
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-[10px] text-gray-500 uppercase">
                  Card Power:
                </span>
                <span className="text-[10px] text-red-500 uppercase italic font-black text-right">
                  {previewData.cp || 0} CP
                </span>
                <span className="text-[10px] text-gray-500 uppercase">
                  Starter Card:
                </span>
                <span className="text-[10px] text-white uppercase italic font-black text-right">
                  {previewData.isInit ? "YES" : "NO"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        ) : (
          <motion.div
            key="shop-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start"
          >
            {/* Pack List Sidebar */}
            <div className="space-y-4 h-[80vh] flex flex-col">
              <div className="bg-gray-900/30 border border-white/5 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase text-gray-500">
                    Active Packs
                  </h3>
                  <button
                    onClick={() => {
                      setEditingPackId(null);
                      setPackFormData({
                        name: "New Pack",
                        description: "Pack description",
                        price: 100,
                        icon: "Zap",
                        color: "from-blue-500 to-blue-700",
                        config: [],
                        is_active: true,
                      });
                    }}
                    className="p-1.5 bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-lg shadow-red-900/20"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {packs.map((pack) => (
                  <div
                    key={pack.id}
                    onClick={() => {
                      setEditingPackId(pack.id);
                      setPackFormData({
                        name: pack.name,
                        description: pack.description,
                        price: pack.price,
                        icon: pack.icon,
                        color: pack.color,
                        config: pack.config,
                        is_active: pack.is_active,
                      });
                    }}
                    className={cn(
                      "group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                      editingPackId === pack.id
                        ? "bg-red-500/10 border-red-500/50"
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-white">
                          {pack.name}
                        </p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase">
                          {pack.price} Coins • {pack.config.length} Rules
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this pack?")) deletePack(pack.id);
                      }}
                      className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pack Form */}
            <div className="space-y-6 bg-gray-900/30 border border-white/5 p-6 rounded-[2rem]">
              <h2 className="text-lg font-black uppercase italic">
                {editingPackId ? "Edit Pack Configuration" : "New Pack Protocol"}
              </h2>

              <form onSubmit={handlePackSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      Pack Name
                    </label>
                    <input
                      type="text"
                      required
                      value={packFormData.name}
                      onChange={(e) =>
                        setPackFormData({ ...packFormData, name: e.target.value })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      Price (Coins)
                    </label>
                    <input
                      type="number"
                      required
                      value={packFormData.price}
                      onChange={(e) =>
                        setPackFormData({
                          ...packFormData,
                          price: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    Description
                  </label>
                  <textarea
                    value={packFormData.description}
                    onChange={(e) =>
                      setPackFormData({
                        ...packFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 h-20 resize-none"
                  />
                </div>

                {/* Rule Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      Card Generation Rules
                    </label>
                    <button
                      type="button"
                      onClick={addRule}
                      className="flex items-center gap-1 text-[10px] font-black uppercase text-red-500 hover:text-red-400"
                    >
                      <Plus className="w-3 h-3" /> Add Rule
                    </button>
                  </div>

                  <div className="space-y-3">
                    {packFormData.config.map((rule, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <select
                            value={rule.type}
                            onChange={(e) =>
                              updateRule(idx, { type: e.target.value as any })
                            }
                            className="bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black uppercase"
                          >
                            <option value="random">Random</option>
                            <option value="rarity">Rarity</option>
                            <option value="cp_range">CP Range</option>
                            <option value="element">Element</option>
                            <option value="specific_card">Specific Card</option>
                          </select>

                          <div className="flex items-center gap-2">
                            <label className="text-[8px] text-gray-600 font-black uppercase">
                              Count
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={rule.count}
                              onChange={(e) =>
                                updateRule(idx, {
                                  count: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-12 bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            {rule.type === "rarity" && (
                              <select
                                value={rule.value || "common"}
                                onChange={(e) =>
                                  updateRule(idx, { value: e.target.value })
                                }
                                className="w-full bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black uppercase"
                              >
                                {RARITIES.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                            )}
                            {rule.type === "element" && (
                              <select
                                value={rule.value || "fire"}
                                onChange={(e) =>
                                  updateRule(idx, { value: e.target.value })
                                }
                                className="w-full bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black uppercase"
                              >
                                {ELEMENTS.map((el) => (
                                  <option key={el} value={el}>
                                    {el}
                                  </option>
                                ))}
                              </select>
                            )}
                            {rule.type === "cp_range" && (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  placeholder="Min"
                                  value={rule.value?.[0] || 0}
                                  onChange={(e) =>
                                    updateRule(idx, {
                                      value: [
                                        parseInt(e.target.value) || 0,
                                        rule.value?.[1] || 1000,
                                      ],
                                    })
                                  }
                                  className="w-14 bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-[10px]"
                                />
                                <span className="text-gray-600">-</span>
                                <input
                                  type="number"
                                  placeholder="Max"
                                  value={rule.value?.[1] || 1000}
                                  onChange={(e) =>
                                    updateRule(idx, {
                                      value: [
                                        rule.value?.[0] || 0,
                                        parseInt(e.target.value) || 1000,
                                      ],
                                    })
                                  }
                                  className="w-14 bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-[10px]"
                                />
                              </div>
                            )}
                            {rule.type === "specific_card" && (
                              <select
                                value={rule.value || ""}
                                onChange={(e) =>
                                  updateRule(idx, { value: e.target.value })
                                }
                                className="w-full bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black uppercase"
                              >
                                <option value="">Select Card</option>
                                {cards.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRule(idx)}
                          className="p-1.5 text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full bg-red-600 hover:bg-red-500 text-white font-black italic uppercase py-4 rounded-2xl transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-2",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingPackId ? "Update Pack" : "Create Pack"}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
