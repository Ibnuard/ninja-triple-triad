import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { CardRarity, ElementType, Card } from "../types/game";

export interface PackRule {
    type: "rarity" | "cp_range" | "specific_card" | "element" | "random";
    value: any;
    count: number;
}

export interface ShopPack {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    color: string;
    config: PackRule[];
    is_active: boolean;
    created_at: string;
}

interface ShopStore {
    packs: ShopPack[];
    isLoading: boolean;
    fetchPacks: () => Promise<void>;
    addPack: (pack: Omit<ShopPack, "id" | "created_at">) => Promise<{ success: boolean; error?: string }>;
    updatePack: (id: string, pack: Partial<ShopPack>) => Promise<{ success: boolean; error?: string }>;
    deletePack: (id: string) => Promise<{ success: boolean; error?: string }>;
    buyPack: (packId: string, userId: string) => Promise<{
        success: boolean;
        cards?: Card[];
        error?: string;
        coinsGained?: number;
        duplicates?: string[];
    }>;
}

export const useShopStore = create<ShopStore>((set, get) => ({
    packs: [],
    isLoading: false,

    fetchPacks: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase
            .from("shop_packs")
            .select("*")
            .order("price", { ascending: true });

        if (!error && data) {
            set({ packs: data });
        }
        set({ isLoading: false });
    },

    addPack: async (pack) => {
        const { data, error } = await supabase
            .from("shop_packs")
            .insert([pack])
            .select();

        if (error) return { success: false, error: error.message };
        set((state) => ({ packs: [...state.packs, data[0]] }));
        return { success: true };
    },

    updatePack: async (id, pack) => {
        const { data, error } = await supabase
            .from("shop_packs")
            .update(pack)
            .eq("id", id)
            .select();

        if (error) return { success: false, error: error.message };
        set((state) => ({
            packs: state.packs.map((p) => (p.id === id ? data[0] : p)),
        }));
        return { success: true };
    },

    deletePack: async (id) => {
        const { error } = await supabase.from("shop_packs").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
        set((state) => ({ packs: state.packs.filter((p) => p.id !== id) }));
        return { success: true };
    },

    buyPack: async (packId, userId) => {
        const pack = get().packs.find((p) => p.id === packId);
        if (!pack) return { success: false, error: "Pack not found" };

        // 1. Check user coins and current collection
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("coins")
            .eq("id", userId)
            .single();

        if (profileError || !profile) return { success: false, error: "Profile not found" };
        if (profile.coins < pack.price) return { success: false, error: "Insufficient coins" };

        const { data: userCards, error: userCardsError } = await supabase
            .from("user_cards")
            .select("card_id")
            .eq("user_id", userId);

        if (userCardsError) return { success: false, error: "Failed to fetch collection" };
        const collectionIds = new Set(userCards.map(uc => uc.card_id));

        // 2. Generate cards based on rules
        const { data: rawCards, error: cardsError } = await supabase.from("cards").select("*");
        if (cardsError || !rawCards) return { success: false, error: "Failed to fetch cards" };

        const allCards: Card[] = rawCards.map((row: any) => ({
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
        }));

        const generatedCards: Card[] = [];
        const duplicates: string[] = [];
        let coinsGained = 0;

        const rarityCoinMap: Record<string, number> = {
            common: 5,
            rare: 10,
            epic: 15,
            legend: 25,
            special: 25,
        };

        for (const rule of pack.config) {
            for (let i = 0; i < rule.count; i++) {
                let pool = allCards;
                if (rule.type === "rarity") {
                    pool = allCards.filter((c) => c.rarity === rule.value);
                } else if (rule.type === "cp_range") {
                    const [min, max] = Array.isArray(rule.value) ? rule.value : [0, 1000];
                    pool = allCards.filter((c) => (c.cp || 0) >= min && (c.cp || 0) <= max);
                } else if (rule.type === "specific_card") {
                    pool = allCards.filter((c) => c.id === rule.value);
                } else if (rule.type === "element") {
                    pool = allCards.filter((c) => c.element === rule.value);
                }

                if (pool.length > 0) {
                    const randomCard = pool[Math.floor(Math.random() * pool.length)];

                    // Check if duplicate (already in collection OR already picked in this pack)
                    if (collectionIds.has(randomCard.id) || generatedCards.some(c => c.id === randomCard.id)) {
                        duplicates.push(randomCard.id);
                        coinsGained += rarityCoinMap[randomCard.rarity || "common"];
                    }

                    generatedCards.push(randomCard);
                }
            }
        }

        // 3. Deduct coins, add gained coins, and add NEW cards to user_cards
        const finalCoins = profile.coins - pack.price + coinsGained;
        const { error: updateProfileError } = await supabase
            .from("profiles")
            .update({ coins: finalCoins })
            .eq("id", userId);

        if (updateProfileError) return { success: false, error: "Failed to update coins" };

        const newCardsToInsert = generatedCards
            .filter(c => !collectionIds.has(c.id))
            .map(c => ({
                user_id: userId,
                card_id: c.id,
            }));

        if (newCardsToInsert.length > 0) {
            const { error: insertError } = await supabase.from("user_cards").insert(newCardsToInsert);
            if (insertError) return { success: false, error: "Failed to add cards to collection" };
        }

        return {
            success: true,
            cards: generatedCards,
            coinsGained,
            duplicates
        };
    },
}));
