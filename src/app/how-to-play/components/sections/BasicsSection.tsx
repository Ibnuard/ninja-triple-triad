import React from "react";

interface BasicsSectionProps {
  title: string;
  content: string;
}

export function BasicsSection({ title, content }: BasicsSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">
        {title}
      </h2>
      <p className="text-base lg:text-lg text-gray-400 leading-relaxed max-w-2xl">
        {content}
      </p>
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl lg:rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center">
        {/* Grid Illustration */}
        <div className="grid grid-cols-3 gap-1.5 lg:gap-2 p-4 w-32 h-32 lg:w-48 lg:h-48">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="border border-white/10 rounded-md lg:rounded-lg bg-white/5"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
