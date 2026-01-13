"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Zap, Shield, Sparkles } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useTranslation } from "../../store/useSettingsStore";
import { cn } from "../../lib/utils";

export default function ShopPage() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const t = useTranslation();

  const shopItems = [
    {
      name: t.shop.packGenin,
      price: 100,
      desc: t.shop.packGeninDesc,
      icon: Zap,
      color: "from-blue-500 to-blue-700",
    },
    {
      name: t.shop.packChunin,
      price: 250,
      desc: t.shop.packChuninDesc,
      icon: Shield,
      color: "from-purple-500 to-purple-700",
    },
    {
      name: t.shop.packJounin,
      price: 500,
      desc: t.shop.packJouninDesc,
      icon: Sparkles,
      color: "from-yellow-500 to-yellow-700",
    },
  ];

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
            {shopItems.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 hover:border-yellow-500/50 transition-all duration-500"
              >
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br",
                  item.color
                )} />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <item.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 flex items-center justify-center">
                        <span className="text-[7px] font-black text-yellow-900">C</span>
                      </div>
                      <span className="text-xs font-black text-yellow-500">{item.price}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-black italic uppercase mb-1.5 group-hover:text-yellow-500 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-[10px] md:text-xs font-medium mb-6 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                  
                  <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    {t.shop.comingSoon}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

    </div>
  );
}
