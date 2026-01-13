"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Zap, Shield, Sparkles, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useTranslation } from "../../store/useSettingsStore";
import { useShopStore } from "../../store/useShopStore";
import { cn } from "../../lib/utils";
import { Card } from "../../components/Card";
import { Card as CardType } from "../../types/game";
import { PackOpeningSequence } from "./PackOpeningSequence";

export default function ShopPage() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const t = useTranslation();
  const { packs, fetchPacks, buyPack, isLoading } = useShopStore();
  const [isBuying, setIsBuying] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  const handleBuy = async (packId: string) => {
    if (!profile) return;
    setIsBuying(true);
    setPurchaseResult(null);
    setRevealedCount(0);
    
    const result = await buyPack(packId, profile.id);
    
    if (result.success) {
      setIsOpening(true);
      setPurchaseResult(result);
    } else {
      setPurchaseResult(result);
    }
    
    setIsBuying(false);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap": return Zap;
      case "Shield": return Shield;
      case "Sparkles": return Sparkles;
      default: return ShoppingBag;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans">
      {/* Dynamic Background Layers */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/10 via-black to-black" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-yellow-500 text-[8px] md:text-[10px] font-black tracking-[0.4em] mb-0.5 uppercase italic">
              {t.shop.market}
            </h2>
            <h1 className="text-white text-lg md:text-2xl font-black italic uppercase tracking-tight">
              {t.home.shop}
            </h1>
          </div>
        </div>

        {/* Coins Display */}
        <div className="flex items-center gap-2 md:gap-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 px-3 py-1.5 md:px-4 md:py-2 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 flex items-center justify-center shadow-[0_0_10px_rgba(255,215,0,0.5)]">
            <span className="text-[10px] md:text-[12px] font-black text-yellow-900">C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] md:text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">
              {t.home.coins}
            </span>
            <span className="text-sm md:text-base font-black text-yellow-500 tabular-nums leading-none mt-0.5">
              {profile?.coins || 0}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          {/* Shop Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {packs.map((item, idx) => {
              const Icon = getIcon(item.icon);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-white/5 p-3 md:p-6 hover:border-yellow-500/50 transition-all duration-500"
                >
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br",
                    item.color
                  )} />
                  
                  <div className="relative z-10 flex flex-col gap-3 md:gap-0">
                    <div className="flex items-center md:items-start justify-between md:mb-6">
                      <div className="flex items-center gap-3 md:block">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="md:hidden">
                          <h3 className="text-sm font-black italic uppercase group-hover:text-yellow-500 transition-colors leading-tight">
                            {item.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500 flex items-center justify-center">
                          <span className="text-[6px] md:text-[7px] font-black text-yellow-900">C</span>
                        </div>
                        <span className="text-[10px] md:text-xs font-black text-yellow-500">{item.price}</span>
                      </div>
                    </div>
                    
                    <div className="hidden md:block">
                      <h3 className="text-lg md:text-xl font-black italic uppercase mb-1.5 group-hover:text-yellow-500 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-[10px] md:text-xs font-medium mb-6 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => handleBuy(item.id)}
                      disabled={isBuying || (profile?.coins || 0) < item.price}
                      className="w-full py-2 md:py-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBuying ? "Processing..." : t.shop.buy || "Buy Pack"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Purchase Result Modal */}
      <AnimatePresence>
        {purchaseResult && (
          <>
            {purchaseResult.success && isOpening ? (
              <PackOpeningSequence
                cards={purchaseResult.cards || []}
                duplicates={purchaseResult.duplicates || []}
                coinsGained={purchaseResult.coinsGained}
                onComplete={() => {
                  // Optional: Do something when animation completes
                }}
                onClose={() => {
                  setPurchaseResult(null);
                  setIsOpening(false);
                  const { refreshProfile } = useAuthStore.getState();
                  refreshProfile();
                }}
              />
            ) : !purchaseResult.success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
              >
                <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-[2rem] p-8 flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tight mb-2 text-white">
                    Purchase Failed
                  </h2>
                  <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                    {purchaseResult.error}
                  </p>
                  <button
                    onClick={() => setPurchaseResult(null)}
                    className="mt-8 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold uppercase tracking-widest transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
