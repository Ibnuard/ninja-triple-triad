"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../store/useSettingsStore";
import { Trophy, Users, ChevronLeft } from "lucide-react";
import { ModeSelectionGrid } from "../../components/ModeSelectionGrid";

export default function OnlinePage() {
  const router = useRouter();
  const t = useTranslation().onlineSelection;
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleModeClick = (modeId: string) => {
    // For now, just navigate or log. User asked for menu structure.
    // In future steps we'll implement the actual logic/supabase realtime.
    if (modeId === "ranked") {
      // router.push("/online/ranked");
      alert("Ranked Matchmaking coming soon!");
    } else if (modeId === "custom") {
      // router.push("/online/custom");
      alert("Custom Lobby coming soon!");
    }
  };

  const modes = [
    {
      id: "ranked",
      title: t.modes.ranked.title,
      description: t.modes.ranked.description,
      icon: Trophy,
      color: "from-amber-500 to-yellow-700",
      borderColor: "border-amber-500/30",
      shadowColor: "shadow-amber-900/40",
      glowColor: "group-hover:bg-amber-500/10",
      accent: "bg-amber-500",
    },
    {
      id: "custom",
      title: t.modes.custom.title,
      description: t.modes.custom.description,
      icon: Users,
      color: "from-blue-500 to-cyan-700",
      borderColor: "border-blue-500/30",
      shadowColor: "shadow-blue-900/40",
      glowColor: "group-hover:bg-blue-500/10",
      accent: "bg-blue-500",
    },
  ];

  return (
    <div className="h-[100dvh] md:min-h-screen bg-black text-white flex flex-col relative overflow-hidden md:overflow-auto font-mono">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-black to-black z-0" />
      <div className="fixed inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header - Sticky */}
      <header className="shrink-0 z-50 p-4 md:p-6 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-blue-500 text-[8px] md:text-[10px] font-black tracking-[0.4em] mb-0.5 uppercase italic">
              {t.mainMenu}
            </h2>
            <h1 className="text-white text-lg md:text-2xl font-black italic uppercase tracking-tight">
              {t.title}
            </h1>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-7xl mx-auto flex flex-col flex-1 p-4 overflow-hidden md:overflow-auto"
      >
        {/* Content Area */}
        <div className="flex flex-col items-center justify-center flex-1 overflow-hidden md:overflow-auto">
          <ModeSelectionGrid
            t={t}
            modes={modes}
            onModeClick={handleModeClick}
            selectText={t.selectMode}
          />
        </div>
      </motion.div>
    </div>
  );
}
