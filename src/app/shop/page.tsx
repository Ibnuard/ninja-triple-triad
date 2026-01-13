"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Zap, Shield, Sparkles } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useTranslation } from "../../store/useSettingsStore";
import { cn } from "../../lib/utils";

export default function ShopPage() {
  const router = useRouter();
  const { profile, user } = useAuthStore();
  const t = useTranslation().home;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans">
      {/* Dynamic Background Layers */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/10 via-black to-black" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-yellow-500 text-[10px] font-black tracking-[0.4em] mb-0.5 uppercase italic">
              NINJA MARKET
            </h2>
            <h1 className="text-white text-xl md:text-2xl font-black italic uppercase tracking-tight">
              {t.shop}
            </h1>
          </div>
        </div>

        {/* Coins Display */}
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 px-4 py-2 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
          <div className="w-6 h-6 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 flex items-center justify-center shadow-[0_0_10px_rgba(255,215,0,0.5)]">
            <span className="text-[12px] font-black text-yellow-900">C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">
              {t.coins}
            </span>
            <span className="text-base font-black text-yellow-500 tabular-nums leading-none mt-0.5">
              {profile?.coins || 0}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" />
              Limited Time Offers
            </div>
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
              Enhance Your <span className="text-yellow-500">Arsenal</span>
            </h2>
            <p className="text-gray-500 text-xs md:text-sm max-w-md mx-auto font-medium leading-relaxed">
              Spend your hard-earned coins on powerful ninja packs and exclusive items to dominate the Triple Triad arena.
            </p>
          </motion.div>

          {/* Shop Items Grid (Placeholder) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Genin Pack",
                price: 100,
                desc: "A basic pack containing 5 common ninja cards.",
                icon: Zap,
                color: "from-blue-500 to-blue-700",
              },
              {
                name: "Chunin Pack",
                price: 250,
                desc: "A balanced pack with a chance for rare cards.",
                icon: Shield,
                color: "from-purple-500 to-purple-700",
              },
              {
                name: "Jounin Pack",
                price: 500,
                desc: "Premium pack with guaranteed rare and epic cards.",
                icon: Sparkles,
                color: "from-yellow-500 to-yellow-700",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 hover:border-yellow-500/50 transition-all duration-500"
              >
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br",
                  item.color
                )} />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-black italic uppercase mb-2 group-hover:text-yellow-500 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-xs font-medium mb-6 leading-relaxed">
                    {item.desc}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                        <span className="text-[8px] font-black text-yellow-900">C</span>
                      </div>
                      <span className="text-lg font-black text-white">{item.price}</span>
                    </div>
                    
                    <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                      Coming Soon
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Decorative corner accents */}
      <div className="fixed top-0 left-0 p-8 pointer-events-none opacity-10">
        <ShoppingBag className="w-12 h-12 text-yellow-600" />
      </div>
      <div className="fixed bottom-0 right-0 p-8 pointer-events-none opacity-10 rotate-180">
        <Sparkles className="w-12 h-12 text-yellow-600" />
      </div>
    </div>
  );
}
