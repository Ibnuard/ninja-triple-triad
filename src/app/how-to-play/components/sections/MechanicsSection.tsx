import React from "react";
import { Zap, Skull, CloudFog, Dices } from "lucide-react";

interface MechanicDetail {
  title: string;
  desc: string;
}

interface MechanicsSectionProps {
  title: string;
  random: MechanicDetail;
  poison: MechanicDetail;
  foggy: MechanicDetail;
  joker: MechanicDetail;
}

export function MechanicsSection({
  title,
  random,
  poison,
  foggy,
  joker,
}: MechanicsSectionProps) {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Random Elemental */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col gap-4 group hover:bg-white/[0.07] transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap className="w-24 h-24 text-white" />
          </div>
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center shrink-0 border border-purple-500/30">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-purple-400">
              {random.title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {random.desc}
            </p>
          </div>
        </div>

        {/* Poison */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col gap-4 group hover:bg-white/[0.07] transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Skull className="w-24 h-24 text-white" />
          </div>
          <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center shrink-0 border border-green-500/30">
            <Skull className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-green-400">
              {poison.title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {poison.desc}
            </p>
          </div>
        </div>

        {/* Foggy */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col gap-4 group hover:bg-white/[0.07] transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <CloudFog className="w-24 h-24 text-white" />
          </div>
          <div className="w-12 h-12 bg-gray-500/20 text-gray-400 rounded-2xl flex items-center justify-center shrink-0 border border-gray-500/30">
            <CloudFog className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-gray-300">
              {foggy.title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {foggy.desc}
            </p>
          </div>
        </div>

        {/* Joker */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col gap-4 group hover:bg-white/[0.07] transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Dices className="w-24 h-24 text-white" />
          </div>
          <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center shrink-0 border border-red-500/30">
            <Dices className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-red-400">
              {joker.title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {joker.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
