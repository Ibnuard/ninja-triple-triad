import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import { useCardStore } from "./useCardStore";
import { useDeckStore } from "./useDeckStore";

interface UserProfile {
  id: string;
  is_onboarded: boolean;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  coins: number;
  rank_points?: number;
  wins?: number;
  losses?: number;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  signInWithGithub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
  refreshProfile: () => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  verifyOnboarding: (userId: string) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  updateUsername: (
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user, loading: false }),

  signInWithGithub: async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    useDeckStore.getState().reset();
    set({ user: null, profile: null });
  },

  verifyOnboarding: async (userId: string) => {
    // Check if cards are loaded
    let allCards = useCardStore.getState().cards;
    if (allCards.length === 0) {
      await useCardStore.getState().fetchCards();
      allCards = useCardStore.getState().cards;
    }

    if (allCards.length === 0) {
      console.error("Cannot onboard: Card pool is empty.");
      return;
    }

    // Pick 5 random cards (preferably common)
    const commons = allCards.filter((c) => c.rarity === "common" || !c.rarity);
    const pool = commons.length >= 5 ? commons : allCards;

    // Deterministic or Random? Random for starter.
    const starterPack: string[] = [];
    const poolCopy = [...pool];
    for (let i = 0; i < 5; i++) {
      if (poolCopy.length === 0) break;
      const idx = Math.floor(Math.random() * poolCopy.length);
      starterPack.push(poolCopy[idx].id);
      poolCopy.splice(idx, 1);
    }

    console.log("Granting Starter Pack:", starterPack);
    const { success, error } = await useCardStore
      .getState()
      .addStarterPack(userId, starterPack);

    if (success) {
      // Update local profile
      set((state) => ({
        profile: state.profile
          ? { ...state.profile, is_onboarded: true }
          : null,
      }));
    } else {
      console.error("Failed to add starter pack:", error);
    }
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      let finalProfile: UserProfile | null = null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (!data) {
        console.log("Profile missing, creating one...");
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
          is_onboarded: false,
          coins: 0,
        });

        if (insertError && insertError.code !== "23505") {
          console.error("Error creating profile:", insertError);
        }

        const { data: retryData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        finalProfile = retryData;
      } else {
        finalProfile = data;
      }

      if (finalProfile) {
        set({ profile: finalProfile });
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  },

  addCoins: async (amount: number) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    const newCoins = (profile.coins || 0) + amount;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ coins: newCoins })
        .eq("id", user.id);

      if (error) throw error;

      set({ profile: { ...profile, coins: newCoins } });
    } catch (error) {
      console.error("Error adding coins:", error);
    }
  },

  checkUsernameAvailability: async (username: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .limit(1);

      if (error) {
        console.error("Detailed error checking username:", error);
        throw error;
      }
      return data.length === 0; // Available if no profile found
    } catch (error) {
      console.error("Error checking username (catch block):", error);
      return false;
    }
  },

  updateUsername: async (username: string) => {
    const { user, profile } = get();
    if (!user || !profile)
      return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

      if (error) throw error;

      set({ profile: { ...profile, username } });
      return { success: true };
    } catch (error: any) {
      console.error("Detailed error updating username:", error);
      return { success: false, error: error.message };
    }
  },

  initialize: () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      // Only set initial state
      set({ user, loading: !!user, initialized: true });

      if (user) {
        // Silently refresh, butensure loading is cleared
        get()
          .refreshProfile()
          .catch((err) => console.error(err))
          .finally(() => set({ loading: false }));
      } else {
        set({ loading: false });
      }
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      const currentUser = get().user;

      console.log("Auth State Change:", event, user?.id);

      if (event === "SIGNED_OUT") {
        set({ user: null, profile: null, loading: false });
        return;
      }

      // If user changed (login/switch account)
      if (user?.id !== currentUser?.id) {
        set({ user, loading: !!user });
        if (user) {
          get()
            .refreshProfile()
            .finally(() => set({ loading: false }));
        } else {
          set({ profile: null, loading: false });
        }
      }
      // If same user, just refresh profile silently (don't toggle loading)
      else if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        if (user) get().refreshProfile();
      }
    });

    // Timeout Guard: Force logout if loading is stuck for more than 8 seconds
    // This handles the "infinite loading" issue on concurrent logins or network hangs
    setTimeout(async () => {
      if (get().loading) {
        console.warn("Auth stuck on loading. Forcing logout safety protocol.");
        await supabase.auth.signOut();
        set({ user: null, profile: null, loading: false });
        if (typeof window !== "undefined") {
          // Clean corrupted Supabase tokens explicitly
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
              console.log("Removing stale auth token:", key);
              localStorage.removeItem(key);
            }
          });
          window.location.reload();
        }
      }
    }, 8000);
  },
}));
