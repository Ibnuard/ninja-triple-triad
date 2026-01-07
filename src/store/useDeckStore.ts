import { create } from "zustand";
import { Card } from "../types/game";

interface DeckStore {
    selectedDeck: Card[];
    loadDeck: () => void;
    saveDeck: (deck: Card[]) => void;
    isDeckComplete: () => boolean;
    lastRunScore: number;
    lastBoss: string;
}

const STORAGE_KEY = "gauntlet_deck";

export const useDeckStore = create<DeckStore>((set, get) => ({
    selectedDeck: [],

    loadDeck: () => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const deck = JSON.parse(stored);
                    set({ selectedDeck: deck });
                } catch (error) {
                    console.error("Failed to load deck:", error);
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

    // Mock stats for now
    lastRunScore: 0,
    lastBoss: "None",
}));
