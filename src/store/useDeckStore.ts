import { create } from "zustand";
import { Card } from "../types/game";
import { supabase } from "../lib/supabase";

interface DeckStore {
  selectedDeck: Card[];
  isLoading: boolean;
  loadDeck: (userId?: string) => Promise<void>;
  saveDeck: (deck: Card[], userId?: string) => Promise<void>;
  isDeckComplete: () => boolean;
  // Stats
  lastRunScore: number;
  lastBoss: string;
  setLastRunStats: (score: number, boss: string) => void;
  reset: () => void;
}

const STORAGE_KEY = "gauntlet_deck";
const STATS_KEY = "gauntlet_stats";

export const useDeckStore = create<DeckStore>((set, get) => ({
  selectedDeck: [],
  isLoading: false,
  lastRunScore: 0,
  lastBoss: "-",

  loadDeck: async (userId?: string) => {
    // 1. Load from local storage first (fast fallback)
    if (typeof window !== "undefined") {
      const storedDeck = localStorage.getItem(STORAGE_KEY);
      if (storedDeck) {
        try {
          const deck = JSON.parse(storedDeck);
          set({ selectedDeck: deck });
        } catch (error) {
          console.error("Failed to load deck from local storage:", error);
        }
      }

      const storedStats = localStorage.getItem(STATS_KEY);
      if (storedStats) {
        try {
          const stats = JSON.parse(storedStats);
          set({
            lastRunScore: stats.score || 0,
            lastBoss: stats.boss || "-",
          });
        } catch (error) {
          console.error("Failed to load stats:", error);
        }
      }
    }

    // 2. If userId is provided, sync from Supabase
    if (userId) {
      set({ isLoading: true });
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("selected_deck")
          .eq("id", userId)
          .single();

        if (error) throw error;

        if (
          data?.selected_deck &&
          Array.isArray(data.selected_deck) &&
          data.selected_deck.length > 0
        ) {
          const deck = data.selected_deck as Card[];
          set({ selectedDeck: deck });
          // Update local storage to match DB
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
          }
        } else {
          // Empty deck in DB -> Clear local state
          set({ selectedDeck: [] });
          if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Failed to load deck from database:", error);
      } finally {
        set({ isLoading: false });
      }
    }
  },

  saveDeck: async (deck: Card[], userId?: string) => {
    if (deck.length === 5) {
      set({ selectedDeck: deck });

      // 1. Save to local storage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
      }

      // 2. If userId is provided, save to Supabase
      if (userId) {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({ selected_deck: deck })
            .eq("id", userId);

          if (error) throw error;
        } catch (error) {
          console.error("Failed to save deck to database:", error);
        }
      }
    }
  },

  isDeckComplete: () => {
    return get().selectedDeck.length === 5;
  },

  setLastRunStats: (score: number, boss: string) => {
    set({ lastRunScore: score, lastBoss: boss });
    if (typeof window !== "undefined") {
      localStorage.setItem(STATS_KEY, JSON.stringify({ score, boss }));
    }
  },

  reset: () => {
    set({ selectedDeck: [], lastRunScore: 0, lastBoss: "-" });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STATS_KEY);
    }
  },
}));
