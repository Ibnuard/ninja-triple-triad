import React from "react";
import { cn } from "../../../lib/utils";

interface Section {
  id: string;
  icon: React.ReactElement;
  title: string;
}

interface HowToPlayNavigationProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function HowToPlayNavigation({
  sections,
  activeSection,
  onSectionChange,
}: HowToPlayNavigationProps) {
  return (
    <nav className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide snap-x">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id)}
          className={cn(
            "flex-shrink-0 lg:w-full flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl border transition-all text-left group snap-start",
            activeSection === section.id
              ? "bg-white/5 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              : "bg-transparent border-transparent text-gray-500 hover:text-white"
          )}
        >
          <div
            className={cn(
              "p-1.5 lg:p-2 rounded-lg lg:rounded-xl transition-colors shrink-0",
              activeSection === section.id
                ? "bg-red-500 text-black"
                : "bg-white/5 group-hover:bg-white/10"
            )}
          >
            {React.cloneElement(
              section.icon as React.ReactElement,
              {
                className: "w-4 h-4 lg:w-5 lg:h-5",
              } as any
            )}
          </div>
          <span className="font-bold tracking-wide text-xs lg:text-base whitespace-nowrap">
            {section.title}
          </span>
        </button>
      ))}
    </nav>
  );
}
