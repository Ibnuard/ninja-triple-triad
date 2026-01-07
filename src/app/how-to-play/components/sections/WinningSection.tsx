import React from "react";

interface WinningSectionProps {
  title: string;
  desc: string;
  playerLabel: string;
  opponentLabel: string;
}

export function WinningSection({
  title,
  desc,
  playerLabel,
  opponentLabel,
}: WinningSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">
        {title}
      </h2>
      <p className="text-base lg:text-lg text-gray-400 leading-relaxed">
        {desc}
      </p>
      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-blue-500/10 border border-blue-500/20 text-center">
          <div className="text-3xl lg:text-5xl font-black text-blue-400 mb-2">
            6
          </div>
          <div className="text-[10px] lg:text-xs font-bold tracking-widest uppercase text-blue-500/60">
            {playerLabel}
          </div>
        </div>
        <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-red-500/10 border border-red-500/20 text-center opacity-50">
          <div className="text-3xl lg:text-5xl font-black text-red-400 mb-2">
            4
          </div>
          <div className="text-[10px] lg:text-xs font-bold tracking-widest uppercase text-red-500/60">
            {opponentLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
