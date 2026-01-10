import { create } from "zustand";
import { Card } from "../types/game";

interface DeckStore {
    selectedDeck: Card[];
    loadDeck: () => void;
    saveDeck: (deck: Card[]) => void;
    isDeckComplete: () => boolean;
    // Stats
    lastRunScore: number;
    lastBoss: string;
    setLastRunStats: (score: number, boss: string) => void;
}

const STORAGE_KEY = "gauntlet_deck";
const STATS_KEY = "gauntlet_stats";

export const useDeckStore = create<DeckStore>((set, get) => ({
    selectedDeck: [],
    lastRunScore: 0,
    lastBoss: "-",

    loadDeck: () => {
        if (typeof window !== "undefined") {
            const storedDeck = localStorage.getItem(STORAGE_KEY);
            if (storedDeck) {
                try {
                    const deck = JSON.parse(storedDeck);
                    set({ selectedDeck: deck });
                } catch (error) {
                    console.error("Failed to load deck:", error);
                }
            }

            const storedStats = localStorage.getItem(STATS_KEY);
            if (storedStats) {
                try {
                    const stats = JSON.parse(storedStats);
                    set({
                        lastRunScore: stats.score || 0,
                        lastBoss: stats.boss || "-"
                    });
                } catch (error) {
                    console.error("Failed to load stats:", error);
                }
            }
        }
    },

    saveDeck: (deck: Card[]) => {
        if (deck.length === 5) {
            set({ selectedDeck: deck });
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
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
}));
