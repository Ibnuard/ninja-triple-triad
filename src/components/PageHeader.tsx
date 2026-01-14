"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  /** Small subtitle text displayed above the title */
  subtitle?: string;
  /** Main title text */
  title: string;
  /** URL to navigate back to, defaults to "/" */
  backTo?: string;
  /** Optional right-side content */
  rightContent?: React.ReactNode;
  /** Color variant for the subtitle */
  subtitleColor?: "yellow" | "red" | "blue" | "purple" | "gray";
}

const subtitleColors = {
  yellow: "text-yellow-500",
  red: "text-red-500",
  blue: "text-blue-500",
  purple: "text-purple-500",
  gray: "text-gray-500",
};

export function PageHeader({
  subtitle,
  title,
  backTo = "/",
  rightContent,
  subtitleColor = "yellow",
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="relative z-10 p-4 md:p-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => router.push(backTo)}
          className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          {subtitle && (
            <h2
              className={`${subtitleColors[subtitleColor]} text-[8px] md:text-[10px] font-black tracking-[0.4em] mb-0.5 uppercase italic`}
            >
              {subtitle}
            </h2>
          )}
          <h1 className="text-white text-lg md:text-2xl font-black italic uppercase tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {rightContent && <div>{rightContent}</div>}
    </header>
  );
}
