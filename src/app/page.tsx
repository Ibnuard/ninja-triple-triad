"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore, useTranslation } from "../store/useSettingsStore";
import { Sword, Users, BookOpen, Globe, Zap, Shield } from "lucide-react";
import React from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export default function Home() {
  const { language, setLanguage } = useSettingsStore();
  const t = useTranslation().home;
  const [isMounted, setIsMounted] = useState(false);
  const [pInit, setPInit] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setPInit(true);
    });
  }, []);

  const particlesOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 120,
      particles: {
        number: {
          value: 60,
          density: {
            enable: true,
            area: 800,
          },
        },
        color: {
          value: ["#ff3b00", "#ff7a00", "#ffd000", "#ff0000"],
        },
        shape: {
          type: "circle",
        },
        opacity: {
          value: { min: 0.1, max: 0.6 },
          animation: {
            enable: true,
            speed: 1,
            minimumValue: 0.1,
            sync: false,
          },
        },
        size: {
          value: { min: 1, max: 4 },
          animation: {
            enable: true,
            speed: 2,
            minimumValue: 1,
            sync: false,
          },
        },
        move: {
          enable: true,
          speed: { min: 1, max: 3 },
          direction: "top",
          random: true,
          straight: false,
          outModes: {
            default: "out",
          },
        },
        shadow: {
          enable: true,
          color: "#ff4500",
          blur: 15,
        },
      },
      detectRetina: true,
    }),
    []
  );

  const menuItems = [
    {
      href: "/single-player",
      label: t.singlePlayer,
      icon: Sword,
      color: "from-red-600 to-red-900",
      shadow: "shadow-red-900/40",
    },
    {
      href: "/how-to-play",
      label: t.howToPlay,
      icon: BookOpen,
      color: "from-amber-500 to-amber-700",
      shadow: "shadow-amber-900/40",
    },
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Layers */}
      <div className="absolute inset-0 z-0 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

        {/* Animated Particles */}
        {pInit && (
          <Particles
            id="tsparticles"
            options={particlesOptions as any}
            className="absolute inset-0 pointer-events-none"
          />
        )}
      </div>

      {/* Title Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-900 to-transparent opacity-50" />

      {/* Language Toggle - Refined */}
      <div className="absolute top-6 right-6 z-50 flex bg-white/5 backdrop-blur-md rounded-full border border-white/10 p-1">
        <button
          onClick={() => setLanguage("id")}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${
            language === "id"
              ? "bg-red-600 text-white shadow-lg"
              : "text-white/40 hover:text-white"
          }`}
        >
          ID
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${
            language === "en"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-white/40 hover:text-white"
          }`}
        >
          EN
        </button>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16 relative group"
        >
          {/* Shuriken Decoration */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -top-12 -left-12 w-24 h-24 opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden md:block"
          >
            <img
              src="/images/shuriken.webp"
              alt="Shuriken"
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]"
            />
          </motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-8 -right-16 w-20 h-20 opacity-30 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none hidden md:block"
          >
            <img
              src="/images/shuriken.webp"
              alt="Shuriken"
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]"
            />
          </motion.div>

          {/* Subtle Glow Behind Title */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-red-600/20 blur-[60px] rounded-full pointer-events-none" />

          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none select-none">
            <span className="block text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              TRIPLE
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-red-600 to-red-950">
              TRIAD
            </span>
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-red-600/50" />
            <p className="text-xs md:text-sm font-black tracking-[0.6em] text-red-500 uppercase italic">
              {t.subtitle}
            </p>
            <div className="h-px w-8 bg-red-600/50" />
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 gap-4 w-full">
          {menuItems.map((item, idx) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
            >
              <Link href={item.href} className="block group">
                <button
                  className={cn(
                    "w-full h-16 relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300",
                    "bg-gradient-to-r from-white/5 to-transparent hover:to-white/5",
                    "flex items-center justify-between px-6 px-8",
                    "group-hover:border-white/20 group-hover:scale-[1.02] active:scale-[0.98]",
                    "group-hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                  )}
                >
                  {/* Hover Background Accent */}
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 w-1 transition-all duration-300 bg-gradient-to-b",
                      item.color,
                      "group-hover:w-full group-hover:opacity-10"
                    )}
                  />

                  <div className="flex items-center gap-4 relative z-10">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform duration-500",
                        "shadow-inner shadow-white/5"
                      )}
                    >
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-sm tracking-widest uppercase italic group-hover:translate-x-2 transition-transform duration-300">
                      {item.label}
                    </span>
                  </div>

                  <div className="relative z-10 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        item.color,
                        "shadow-[0_0_10px_currentColor]"
                      )}
                    />
                  </div>
                </button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Decorative corner accents */}
        <div className="fixed top-0 left-0 p-8 pointer-events-none opacity-20">
          <Shield className="w-12 h-12 text-red-600" />
        </div>
        <div className="fixed bottom-0 right-0 p-8 pointer-events-none opacity-20 rotate-180">
          <Zap className="w-12 h-12 text-red-600" />
        </div>
      </div>

      {/* Footer Decoration */}
      <footer className="absolute bottom-8 w-full px-12 flex justify-between items-center z-10">
        <div className="hidden md:flex flex-col gap-1 items-start">
          <span className="text-[10px] font-black text-white/20 tracking-widest uppercase">
            Protocol: Uchiha-TRIAD
          </span>
          <div className="w-24 h-0.5 bg-red-950/40" />
        </div>

        <div className="ml-auto">
          <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase flex items-center gap-1.5">
            Develop with <span className="text-red-500 animate-pulse">❤️</span>{" "}
            by{" "}
            <a
              href="https://github.com/ibnuard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/10 hover:decoration-white/30"
            >
              Ibnuard
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Helper for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
