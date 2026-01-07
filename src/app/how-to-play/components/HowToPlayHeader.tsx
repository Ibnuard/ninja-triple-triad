import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface HowToPlayHeaderProps {
  backText: string;
  title: string;
}

export function HowToPlayHeader({ backText, title }: HowToPlayHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold tracking-wider text-xs uppercase">
            {backText}
          </span>
        </Link>
        <h1 className="text-xl font-black tracking-tighter italic uppercase underline decoration-red-500 decoration-2 underline-offset-4">
          {title}
        </h1>
        <div className="w-16" /> {/* Spacer */}
      </div>
    </header>
  );
}
