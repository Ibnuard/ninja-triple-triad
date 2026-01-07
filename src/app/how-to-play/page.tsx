"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Sword, Shield, Zap, Target, Layers } from "lucide-react";
import { useTranslation, useSettingsStore } from "../../store/useSettingsStore";
import { HowToPlayHeader } from "./components/HowToPlayHeader";
import { HowToPlayNavigation } from "./components/HowToPlayNavigation";
import { BasicsSection } from "./components/sections/BasicsSection";
import { AnatomySection } from "./components/sections/AnatomySection";
import { CapturingSection } from "./components/sections/CapturingSection";
import { ElementsSection } from "./components/sections/ElementsSection";
import { MechanicsSection } from "./components/sections/MechanicsSection";
import { WinningSection } from "./components/sections/WinningSection";

export default function HowToPlayPage() {
  const t = useTranslation().tutorial;
  const gameT = useTranslation().game;
  const passiveT = useTranslation().passives;
  const { language } = useSettingsStore();
  const [activeSection, setActiveSection] = useState("basics");
  const [captureStep, setCaptureStep] = useState(0);

  React.useEffect(() => {
    if (activeSection !== "capturing") {
      setCaptureStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCaptureStep((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, [activeSection]);

  const sections = [
    {
      id: "basics",
      icon: <Info className="w-5 h-5" />,
      title: t.sections.basics.title,
    },
    {
      id: "anatomy",
      icon: <Target className="w-5 h-5" />,
      title: t.sections.anatomy.title,
    },
    {
      id: "capturing",
      icon: <Sword className="w-5 h-5" />,
      title: t.sections.capturing.title,
    },
    {
      id: "elements",
      icon: <Zap className="w-5 h-5" />,
      title: t.sections.elements.title,
    },
    {
      id: "mechanics",
      icon: <Layers className="w-5 h-5" />,
      title: t.sections.mechanics.title,
    },
    {
      id: "winning",
      icon: <Shield className="w-5 h-5" />,
      title: t.sections.winning.title,
    },
  ];

  const elementalDetails = [
    {
      element: "fire",
      name: "Fire",
      icon: "/images/fire.webp",
      desc: passiveT.fire,
      color: "text-red-500",
    },
    {
      element: "water",
      name: "Water",
      icon: "/images/water.webp",
      desc: passiveT.water,
      color: "text-blue-400",
    },
    {
      element: "earth",
      name: "Earth",
      icon: "/images/earth.webp",
      desc: passiveT.earth,
      color: "text-yellow-600",
    },
    {
      element: "wind",
      name: "Wind",
      icon: "/images/wind.webp",
      desc: passiveT.wind,
      color: "text-emerald-400",
    },
    {
      element: "lightning",
      name: "Lightning",
      icon: "/images/lightning.webp",
      desc: passiveT.lightning,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-red-900/20 pointer-events-none" />

      {/* Header */}
      <HowToPlayHeader backText={t.back} title={t.title} />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Navigation Sidebar / Mobile Nav */}
          <HowToPlayNavigation
            sections={sections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          {/* Content Area */}
          <div className="lg:col-span-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* BASICS SECTION */}
                {activeSection === "basics" && (
                  <BasicsSection
                    title={t.sections.basics.title}
                    content={t.sections.basics.content}
                  />
                )}

                {/* ANATOMY SECTION */}
                {activeSection === "anatomy" && (
                  <AnatomySection
                    title={t.sections.anatomy.title}
                    desc={t.sections.anatomy.desc}
                    cp={t.sections.anatomy.cp}
                    atk={t.sections.anatomy.atk}
                    jt={t.sections.anatomy.jt}
                    df={t.sections.anatomy.df}
                  />
                )}

                {/* CAPTURING SECTION */}
                {activeSection === "capturing" && (
                  <CapturingSection
                    title={t.sections.capturing.title}
                    desc={t.sections.capturing.desc}
                    captureStep={captureStep}
                    captured={t.sections.capturing.captured}
                    ready={t.sections.capturing.ready}
                    comparison={t.sections.capturing.comparison}
                  />
                )}

                {/* ELEMENTS SECTION */}
                {activeSection === "elements" && (
                  <ElementsSection
                    title={t.sections.elements.title}
                    desc={t.sections.elements.desc}
                    elementalDetails={elementalDetails}
                    buffIndicator={t.sections.anatomy.buffIndicator}
                    debuffIndicator={t.sections.anatomy.debuffIndicator}
                    buff={t.sections.anatomy.buff}
                    debuff={t.sections.anatomy.debuff}
                    note={t.sections.elements.note}
                  />
                )}

                {/* WINNING SECTION */}
                {activeSection === "winning" && (
                  <WinningSection
                    title={t.sections.winning.title}
                    desc={t.sections.winning.desc}
                    playerLabel={gameT.player}
                    opponentLabel={gameT.opponent}
                  />
                )}

                {/* BOARD MECHANICS SECTION */}
                {activeSection === "mechanics" && (
                  <MechanicsSection
                    title={t.sections.mechanics.title}
                    random={t.sections.mechanics.random}
                    poison={t.sections.mechanics.poison}
                    foggy={t.sections.mechanics.foggy}
                    joker={t.sections.mechanics.joker}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="py-12 border-t border-white/5 mt-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[1em]">
            {t.footer}
          </p>
        </div>
      </footer>
    </div>
  );
}
