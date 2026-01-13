import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Card, CardStats, ElementType, CardRarity } from "../types/game";

interface CardState {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
  fetchCards: () => Promise<void>;
  addCard: (
    card: Omit<Card, "id" | "baseStats">
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useCardStore = create<CardState>((set) => ({
  cards: [],
  isLoading: false,
  error: null,
  fetchCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      const formattedCards: Card[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        element: row.element as ElementType,
        image: row.image_url || "",
        description: row.description,
        rarity: row.rarity as CardRarity,
        isInit: row.is_init,
        cp: row.cp,
        stats: {
          top: row.stat_top,
          right: row.stat_right,
          bottom: row.stat_bottom,
          left: row.stat_left,
        },
        baseStats: {
          top: row.stat_top,
          right: row.stat_right,
          bottom: row.stat_bottom,
          left: row.stat_left,
        },
      }));

      set({ cards: formattedCards, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      console.error("Error fetching cards:", err);
    }
  },
  addCard: async (card: Omit<Card, "id" | "baseStats">) => {
    try {
      // Generate a unique ID based on name and element
      const id = `${card.element}-${card.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-${Date.now()}`;

      const { data, error } = await supabase.from("cards").insert([
        {
          id,
          name: card.name,
          element: card.element,
          image_url: card.image,
          description: card.description || "",
          rarity: card.rarity || "common",
          is_init: card.isInit || false,
          cp: card.cp || 0,
          stat_top: card.stats.top,
          stat_right: card.stats.right,
          stat_bottom: card.stats.bottom,
          stat_left: card.stats.left,
        },
      ]);

      if (error) throw error;

      // Refresh the card pool after successful addition
      const { fetchCards } = useCardStore.getState();
      await fetchCards();

      return { success: true };
    } catch (err: any) {
      console.error("Error adding card:", err);
      return { success: false, error: err.message };
    }
  },
}));
