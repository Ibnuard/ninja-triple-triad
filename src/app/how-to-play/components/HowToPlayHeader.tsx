"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface HowToPlayHeaderProps {
  backText: string;
  title: string;
}

export function HowToPlayHeader({ backText, title }: HowToPlayHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 p-4 md:p-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => router.push("/")}
          className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-blue-500 text-[8px] md:text-[10px] font-black tracking-[0.4em] mb-0.5 uppercase italic">
            GUIDE
          </h2>
          <h1 className="text-white text-lg md:text-2xl font-black italic uppercase tracking-tight">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}
