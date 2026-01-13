"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore, useTranslation } from "../store/useSettingsStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCardStore } from "../store/useCardStore"; // Added this import
import {
  Sword,
  Users,
  BookOpen,
  Globe,
  Zap,
  Shield,
  Github,
  LogOut,
  ShoppingBag,
  Radio,
  Layers,
  FolderOpen,
} from "lucide-react";
import React from "react";
import { CardListModal } from "../components/CardListModal";
import { StarterPackModal } from "../components/StarterPackModal"; // Added this import
import { UserProfile } from "../components/UserProfile";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export default function Home() {
  const { language, setLanguage } = useSettingsStore();
  const t = useTranslation().home;
  const { user, profile, loading, signInWithGithub, signInWithGoogle, signOut } =
    useAuthStore();
  const { fetchUserCards } = useCardStore();
  const [isMounted, setIsMounted] = useState(false);
  const [pInit, setPInit] = useState(false);
  const [showCardList, setShowCardList] = useState(false);
  const [showMyCollection, setShowMyCollection] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setPInit(true);
    });
  }, []);

  // New useEffect to fetch user cards when user logs in
  useEffect(() => {
    if (user) {
      fetchUserCards(user.id);
    }
  }, [user, fetchUserCards]);

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
      href: "/online-battle",
      label: t.onlineBattle,
      icon: Globe,
      color: "from-blue-600 to-blue-900",
      shadow: "shadow-blue-900/40",
    },
    {
      onClick: () => setShowMyCollection(true),
      label: t.myCollection,
      icon: Layers,
      color: "from-emerald-600 to-emerald-900",
      shadow: "shadow-emerald-900/40",
    },
    {
      href: "/shop",
      label: t.shop,
      icon: ShoppingBag,
      color: "from-yellow-500 to-yellow-700",
      shadow: "shadow-yellow-900/40",
    },
    {
      href: "/how-to-play",
      label: t.howToPlay,
      icon: BookOpen,
      color: "from-amber-500 to-amber-700",
      shadow: "shadow-amber-900/40",
    },
  ];

  const loginItems = [
    {
      onClick: signInWithGithub,
      label: t.loginWithGithub,
      icon: Github,
      color: "from-gray-700 to-gray-900",
      shadow: "shadow-black/40",
    },
    {
      onClick: signInWithGoogle,
      label: t.loginWithGoogle,
      icon: Globe,
      color: "from-blue-600 to-blue-800",
      shadow: "shadow-blue-900/40",
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

      {/* Top Header - Consolidated */}
      <div className="absolute top-0 w-full z-50 flex justify-between items-start p-4 md:p-6">
        {/* Left: User Profile + Logout */}
        <div className="flex items-center gap-2">
          <UserProfile />
          {user && (
            <button
              onClick={signOut}
              className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-white/10 transition-colors group relative"
            >
              <LogOut className="w-4 h-4" />
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 border border-white/10 rounded text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {t.logout}
              </span>
            </button>
          )}
        </div>

        {/* Right: Language Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 backdrop-blur-md rounded-full border border-white/10 p-1">
            <button
              onClick={() => setLanguage("id")}
              className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                language === "id"
                  ? "bg-red-600 text-white shadow-lg"
                  : "text-white/40 hover:text-white"
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                language === "en"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-white/40 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-6 md:mb-12 relative group"
        >
          {/* Shuriken Decoration */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -top-12 -left-12 w-20 h-20 opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden md:block"
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
            className="absolute -bottom-8 -right-16 w-16 h-16 opacity-30 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none hidden md:block"
          >
            <img
              src="/images/shuriken.webp"
              alt="Shuriken"
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]"
            />
          </motion.div>

          {/* Subtle Glow Behind Title */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 md:w-64 md:h-32 bg-red-600/20 blur-[40px] md:blur-[60px] rounded-full pointer-events-none" />

          <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter leading-none select-none">
            <span className="block text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              TRIPLE
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-red-600 to-red-950">
              TRIAD
            </span>
          </h1>
          <div className="mt-2 md:mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-6 md:w-8 bg-red-600/50" />
            <p className="text-[10px] md:text-sm font-black tracking-[0.4em] md:tracking-[0.6em] text-red-500 uppercase italic">
              {t.subtitle}
            </p>
            <div className="h-px w-6 md:w-8 bg-red-600/50" />
          </div>
        </motion.div>

        {/* Menu Items Stack */}
        <div className="w-full space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !user ? (
            <div className="space-y-3">
              {loginItems.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                >
                  <div
                    onClick={item.onClick}
                    className="block group cursor-pointer"
                  >
                    <MenuButton item={item} isFullWidth />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            menuItems.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
              >
                {item.href ? (
                  <Link href={item.href} className="block group w-full">
                    <MenuButton item={item} isFullWidth />
                  </Link>
                ) : (
                  <div
                    onClick={item.onClick}
                    className="block group cursor-pointer w-full"
                  >
                    <MenuButton item={item} isFullWidth />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Decorative corner accents - Reduce Padding */}
        <div className="fixed top-0 left-0 p-4 md:p-8 pointer-events-none opacity-20">
          <Shield className="w-8 h-8 md:w-12 md:h-12 text-red-600" />
        </div>
        <div className="fixed bottom-0 right-0 p-4 md:p-8 pointer-events-none opacity-20 rotate-180">
          <Zap className="w-8 h-8 md:w-12 md:h-12 text-red-600" />
        </div>
      </div>

      <CardListModal
        isOpen={showMyCollection}
        onClose={() => setShowMyCollection(false)}
        showOwnedOnly={true}
      />

      {/* Onboarding Modal */}
      <StarterPackModal isOpen={!!user} />

      {/* Footer Decoration - Reduce Bottom Position */}
      <footer className="absolute bottom-4 md:bottom-8 w-full px-6 md:px-12 flex justify-center items-center z-10">
        <div>
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

function MenuButton({
  item,
  isFullWidth,
}: {
  item: any;
  isFullWidth?: boolean;
}) {
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 transition-all duration-300 w-full",
        "bg-gradient-to-br from-white/5 to-transparent hover:to-white/5",
        "group-hover:border-white/20 group-hover:scale-[1.02] active:scale-[0.98]",
        "group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]",
        "h-14 md:h-16 flex items-center justify-between px-6"
      )}
    >
      {/* Hover Background Accent */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500 opacity-0 group-hover:opacity-10 bg-gradient-to-br",
          item.color
        )}
      />

      <div className="flex items-center gap-4 relative z-10">
        <div
          className={cn(
            "p-2 rounded-lg bg-black/40 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-inner shadow-white/5",
            item.shadow
          )}
        >
          <item.icon className="w-5 h-5 text-white" />
        </div>

        <div className="flex flex-col items-start gap-0.5">
          <span className="font-black text-xs md:text-sm tracking-widest uppercase italic text-white transition-colors">
            {item.label}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center group-hover:translate-x-2 transition-transform">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            item.color.split(" ")[0].replace("from-", "bg-"),
            "shadow-[0_0_10px_currentColor]"
          )}
        />
      </div>
    </button>
  );
}

// Helper for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
