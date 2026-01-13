import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Card, CardStats, ElementType, CardRarity } from "../types/game";

interface CardState {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
  userCardIds: string[];
  fetchCards: () => Promise<void>;
  fetchUserCards: (userId: string) => Promise<void>;
  addCard: (
    card: Omit<Card, "id" | "baseStats">
  ) => Promise<{ success: boolean; error?: string }>;
  addStarterPack: (
    userId: string,
    cardIds: string[]
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  userCardIds: [],
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
  fetchUserCards: async (userId: string) => {
    // Don't set global isLoading to avoid full screen spinners for just card updates if possible,
    // but for now it's safer.
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("user_cards")
        .select("card_id")
        .eq("user_id", userId);

      if (error) throw error;

      const ids = data.map((row: any) => row.card_id);
      set({ userCardIds: ids, isLoading: false });
    } catch (err: any) {
      console.error("Error fetching user cards:", err);
      set({ error: err.message, isLoading: false });
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
  addStarterPack: async (userId: string, cardIds: string[]) => {
    try {
      // 1. Insert cards into user_cards
      const records = cardIds.map((cardId) => ({
        user_id: userId,
        card_id: cardId,
      }));

      const { error: insertError } = await supabase
        .from("user_cards")
        .insert(records);

      if (insertError) throw insertError;

      // 2. Update profile is_onboarded = true
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_onboarded: true })
        .eq("id", userId);

      if (updateError) throw updateError;

      // 3. Refresh user cards locally
      await get().fetchUserCards(userId);

      return { success: true };
    } catch (err: any) {
      console.error("Error adding starter pack:", err);
      return { success: false, error: err.message };
    }
  },
}));
