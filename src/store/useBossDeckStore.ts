import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Card, ElementType, CardRarity } from "../types/game";
import { GauntletRank } from "../constants/gauntlet";

export interface BossDeckConfig {
  id: string;
  rank: GauntletRank;
  card_ids: string[];
  created_at: string;
  updated_at: string;
}

interface BossDeckState {
  bossDecks: Record<GauntletRank, Card[]>;
  isLoading: boolean;
  error: string | null;
  fetchBossDecks: () => Promise<void>;
  saveBossDeck: (
    rank: GauntletRank,
    cardIds: string[]
  ) => Promise<{ success: boolean; error?: string }>;
  getBossDeck: (rank: GauntletRank) => Card[];
}

const RANKS: GauntletRank[] = [
  "Genin",
  "Chunin",
  "Jounin",
  "Anbu",
  "Kage",
  "Rikudo",
];

export const useBossDeckStore = create<BossDeckState>((set, get) => ({
  bossDecks: {
    Genin: [],
    Chunin: [],
    Jounin: [],
    Anbu: [],
    Kage: [],
    Rikudo: [],
  },
  isLoading: false,
  error: null,

  fetchBossDecks: async () => {
    set({ isLoading: true, error: null });

    try {
      // 1. Fetch boss deck configs
      const { data: configs, error: configError } = await supabase
        .from("boss_decks")
        .select("*");

      if (configError) throw configError;

      // 2. Fetch all cards
      const { data: allCards, error: cardsError } = await supabase
        .from("cards")
        .select("*");

      if (cardsError) throw cardsError;

      // 3. Map cards by ID
      const cardMap = new Map<string, Card>();
      allCards.forEach((row: any) => {
        cardMap.set(row.id, {
          id: row.id,
          name: row.name,
          element: row.element as ElementType,
          image: row.image_url || "",
          description: row.description,
          rarity: row.rarity as CardRarity,
          isInit: row.is_init,
          cp: row.cp ?? 0,
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
        });
      });

      // 4. Build boss decks
      const bossDecks: Record<GauntletRank, Card[]> = {
        Genin: [],
        Chunin: [],
        Jounin: [],
        Anbu: [],
        Kage: [],
        Rikudo: [],
      };

      configs?.forEach((config: any) => {
        const rank = config.rank as GauntletRank;
        const cardIds: string[] = config.card_ids || [];
        bossDecks[rank] = cardIds
          .map((id) => cardMap.get(id))
          .filter((c): c is Card => c !== undefined);
      });

      set({ bossDecks, isLoading: false });
    } catch (err: any) {
      console.error("Error fetching boss decks:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  saveBossDeck: async (rank, cardIds) => {
    try {
      // Upsert: update if exists, insert if not
      const { data: existing, error: checkError } = await supabase
        .from("boss_decks")
        .select("id")
        .eq("rank", rank)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existing) {
        // Update
        const { error: updateError } = await supabase
          .from("boss_decks")
          .update({ card_ids: cardIds, updated_at: new Date().toISOString() })
          .eq("rank", rank);

        if (updateError) throw updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from("boss_decks")
          .insert({ rank, card_ids: cardIds });

        if (insertError) throw insertError;
      }

      // Refresh
      await get().fetchBossDecks();
      return { success: true };
    } catch (err: any) {
      console.error("Error saving boss deck:", err);
      return { success: false, error: err.message };
    }
  },

  getBossDeck: (rank) => {
    return get().bossDecks[rank] || [];
  },
}));
