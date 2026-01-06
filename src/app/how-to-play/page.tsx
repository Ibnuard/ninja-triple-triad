"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Info, Sword, Shield, Zap, Target } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation, useSettingsStore } from "../../store/useSettingsStore";
import { Card } from "../../components/Card";

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
      title: language === "id" ? "Masteri Elemen" : "Elemental Mastery",
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

  const mockTutorialCard = {
    id: "tutorial-card",
    name: "Ninja Basic",
    element: "fire" as const,
    image: "",
    stats: { top: 5, right: 7, bottom: 4, left: 3 },
    baseStats: { top: 5, right: 7, bottom: 4, left: 3 },
    isBuffed: false,
    activePassives: [],
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-red-900/20 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-wider text-xs uppercase">
              {t.back}
            </span>
          </Link>
          <h1 className="text-xl font-black tracking-tighter italic uppercase underline decoration-red-500 decoration-2 underline-offset-4">
            {t.title}
          </h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Navigation Sidebar / Mobile Nav */}
          <nav className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide snap-x">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
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
                  <div className="space-y-6">
                    <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">
                      {t.sections.basics.title}
                    </h2>
                    <p className="text-base lg:text-lg text-gray-400 leading-relaxed max-w-2xl">
                      {t.sections.basics.content}
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
                )}

                {/* ANATOMY SECTION */}
                {activeSection === "anatomy" && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">
                        {t.sections.anatomy.title}
                      </h2>
                      <p className="text-base lg:text-lg text-gray-400 leading-relaxed italic border-l-4 border-red-500 pl-4">
                        {t.sections.anatomy.desc}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-8 lg:pt-10">
                      <div className="flex justify-center flex-1 py-12 lg:py-0">
                        <div className="relative scale-[1.2] lg:scale-150">
                          <Card
                            card={mockTutorialCard as any}
                            owner="player1"
                          />
                          {/* Callouts */}
                          {/* CHAKRA - TOP */}
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
                          >
                            <div className="bg-blue-500 text-black text-[8px] px-1.5 rounded font-black italic whitespace-nowrap">
                              CHAKRA
                            </div>
                            <div className="h-4 lg:h-6 w-0.5 bg-blue-500/50" />
                          </motion.div>

                          {/* ATTACK - RIGHT */}
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 2,
                              delay: 0.5,
                            }}
                            className="absolute top-4 -right-12 lg:-right-16 flex items-center"
                          >
                            <div className="w-4 lg:w-6 h-0.5 bg-red-500/50" />
                            <div className="bg-red-500 text-black text-[8px] px-1.5 rounded font-black italic whitespace-nowrap">
                              ATTACK
                            </div>
                          </motion.div>

                          {/* JUTSU - LEFT */}
                          <motion.div
                            animate={{ x: [0, -5, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 2,
                              delay: 1,
                            }}
                            className="absolute top-4 -left-12 lg:-left-16 flex items-center"
                          >
                            <div className="bg-yellow-500 text-black text-[8px] px-1.5 rounded font-black italic whitespace-nowrap">
                              JUTSU
                            </div>
                            <div className="w-4 lg:w-6 h-0.5 bg-yellow-500/50" />
                          </motion.div>

                          {/* DEFENSE - BOTTOM */}
                          <motion.div
                            animate={{ y: [0, 5, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 2,
                              delay: 1.5,
                            }}
                            className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
                          >
                            <div className="h-4 lg:h-6 w-0.5 bg-green-500/50" />
                            <div className="bg-green-500 text-black text-[8px] px-1.5 rounded font-black italic whitespace-nowrap">
                              DEFENSE
                            </div>
                          </motion.div>
                        </div>
                      </div>
                      <div className="space-y-3 lg:space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                          <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                          <p className="text-xs lg:text-sm font-medium leading-normal text-gray-300">
                            <strong className="text-blue-400 block mb-1">
                              CHAKRA (TOP)
                            </strong>
                            {t.sections.anatomy.cp}
                          </p>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                          <Sword className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                          <p className="text-xs lg:text-sm font-medium leading-normal text-gray-300">
                            <strong className="text-red-500 block mb-1">
                              ATTACK (RIGHT)
                            </strong>
                            {t.sections.anatomy.atk}
                          </p>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                          <Zap className="w-5 h-5 text-yellow-500 shrink-0 mt-1" />
                          <p className="text-xs lg:text-sm font-medium leading-normal text-gray-300">
                            <strong className="text-yellow-500 block mb-1">
                              JUTSU (LEFT)
                            </strong>
                            {t.sections.anatomy.jt}
                          </p>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                          <Shield className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                          <p className="text-xs lg:text-sm font-medium leading-normal text-gray-300">
                            <strong className="text-green-500 block mb-1">
                              DEFENSE (BOTTOM)
                            </strong>
                            {t.sections.anatomy.df}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CAPTURING SECTION */}
                {activeSection === "capturing" && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">
                        {t.sections.capturing.title}
                      </h2>
                      <p className="text-base lg:text-lg text-gray-400 leading-relaxed">
                        {t.sections.capturing.desc}
                      </p>
                    </div>

                    <div className="relative h-48 lg:h-64 bg-white/5 rounded-2xl lg:rounded-3xl border border-white/10 flex items-center justify-center gap-2 lg:gap-4 overflow-hidden">
                      <div className="flex items-center gap-2 lg:gap-4 scale-90 lg:scale-100">
                        <AnimatePresence>
                          {captureStep >= 1 && (
                            <motion.div
                              key="player-card"
                              initial={{ x: -100, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: -100, opacity: 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Card
                                card={
                                  {
                                    ...mockTutorialCard,
                                    stats: {
                                      top: 5,
                                      right: 9,
                                      bottom: 4,
                                      left: 3,
                                    },
                                  } as any
                                }
                                owner="player1"
                              />
                              <div className="mt-2 text-[8px] lg:text-[10px] text-center font-bold text-blue-400">
                                YOUR CARD (RIGHT: 9)
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center">
                          <AnimatePresence>
                            {captureStep === 2 && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [1, 1.5, 1], opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                              >
                                <Sword className="w-4 h-4 lg:w-6 lg:h-6 text-red-500" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <motion.div
                          animate={{
                            scale: captureStep >= 2 ? [1, 1.05, 1] : 1,
                          }}
                        >
                          <Card
                            card={
                              {
                                ...mockTutorialCard,
                                name: "Enemy Genin",
                                element: "water",
                                stats: { top: 5, right: 3, bottom: 4, left: 6 },
                              } as any
                            }
                            owner={captureStep >= 2 ? "player1" : "player2"}
                          />
                          <div
                            className={cn(
                              "mt-2 text-[8px] lg:text-[10px] text-center font-bold transition-colors duration-500",
                              captureStep >= 2
                                ? "text-blue-400"
                                : "text-red-500"
                            )}
                          >
                            {captureStep >= 2
                              ? language === "id"
                                ? "TERTANGKAP!"
                                : "CAPTURED!"
                              : "ENEMY (LEFT: 6)"}
                          </div>
                        </motion.div>
                      </div>
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div
                      className={cn(
                        "p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-500 border",
                        captureStep >= 2
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs lg:text-sm font-bold uppercase tracking-widest text-center transition-colors duration-500",
                          captureStep >= 2 ? "text-blue-400" : "text-red-400"
                        )}
                      >
                        {captureStep >= 2
                          ? "9 VS 6 → CAPTURED!"
                          : language === "id"
                          ? "BERSIAP UNTUK MENANGKAP..."
                          : "GET READY TO CAPTURE..."}
                      </p>
                    </div>
                  </div>
                )}

                {/* ELEMENTS SECTION */}
                {activeSection === "elements" && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">
                        {language === "id"
                          ? "Masteri Elemen"
                          : "Elemental Mastery"}
                      </h2>
                      <p className="text-base lg:text-lg text-gray-400 leading-relaxed">
                        {language === "id"
                          ? "Setiap elemen memiliki pasif unik yang dipicu berdasarkan posisi kartu di papan permainan."
                          : "Each element has a unique passive ability triggered based on the card's position on the game board."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                      {elementalDetails.map((el) => (
                        <motion.div
                          key={el.element}
                          whileHover={{ scale: 1.02 }}
                          className="p-3 lg:p-4 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl flex items-center gap-3 lg:gap-4 group"
                        >
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-black/40 rounded-full flex items-center justify-center shrink-0 border border-white/10 group-hover:border-white/30 transition-colors">
                            <img
                              src={el.icon}
                              alt={el.name}
                              className="w-6 h-6 lg:w-8 lg:h-8 object-contain"
                            />
                          </div>
                          <div>
                            <h3
                              className={cn(
                                "font-black uppercase tracking-widest text-[10px] lg:text-sm mb-0.5 lg:mb-1",
                                el.color
                              )}
                            >
                              {el.name}
                            </h3>
                            <p className="text-[10px] lg:text-xs text-gray-400 leading-tight">
                              {el.desc}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/20 p-4 lg:p-6 rounded-2xl lg:rounded-3xl">
                      <div className="flex gap-3 lg:gap-4 items-start">
                        <Info className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs lg:text-sm text-blue-300 italic leading-relaxed">
                          {language === "id"
                            ? "Tips: Bonus dari elemen sangat krusial! Perhatikan posisi kartu sebelum meletakkannya untuk memaksimalkan atributmu."
                            : "Pro Tip: Elemental bonuses are game-changers! Always check the board position before placing your card to maximize your attributes."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* WINNING SECTION */}
                {activeSection === "winning" && (
                  <div className="space-y-6">
                    <h2 className="text-3xl lg:text-4xl font-black italic tracking-tight">
                      {t.sections.winning.title}
                    </h2>
                    <p className="text-base lg:text-lg text-gray-400 leading-relaxed">
                      {t.sections.winning.desc}
                    </p>
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-blue-500/10 border border-blue-500/20 text-center">
                        <div className="text-3xl lg:text-5xl font-black text-blue-400 mb-2">
                          6
                        </div>
                        <div className="text-[10px] lg:text-xs font-bold tracking-widest uppercase text-blue-500/60">
                          {gameT.player}
                        </div>
                      </div>
                      <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-red-500/10 border border-red-500/20 text-center opacity-50">
                        <div className="text-3xl lg:text-5xl font-black text-red-400 mb-2">
                          4
                        </div>
                        <div className="text-[10px] lg:text-xs font-bold tracking-widest uppercase text-red-500/60">
                          {gameT.opponent}
                        </div>
                      </div>
                    </div>
                    <div className="text-center pt-4 lg:pt-0">
                      <Link href="/single-player">
                        <button className="w-full lg:w-auto px-8 py-4 bg-red-600 hover:bg-red-500 text-black font-black uppercase tracking-tighter transition-all rounded-full lg:hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20">
                          ARE YOU READY? START BATTLE
                        </button>
                      </Link>
                    </div>
                  </div>
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
            Elemental mastery is the key to victory
          </p>
        </div>
      </footer>
    </div>
  );
}
