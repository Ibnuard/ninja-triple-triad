import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  is_onboarded: boolean;
  full_name?: string;
  avatar_url?: string;
  coins: number;
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
    set({ user: null, profile: null });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        // PGRST116: JSON object requested, multiple (or no) rows returned
        if (error.code === "PGRST116") {
          console.log("Profile missing (legacy user), creating one...");
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name,
              avatar_url: user.user_metadata?.avatar_url,
              is_onboarded: false,
              coins: 0,
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating profile:", createError);
            return;
          }

          set({ profile: newProfile });
          return;
        }

        console.error("Error fetching profile:", error);
        return;
      }

      set({ profile: data });
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

  initialize: () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      set({ user, loading: !!user, initialized: true }); // Keep loading true if user exists to wait for profile

      if (user) {
        get()
          .refreshProfile()
          .finally(() => set({ loading: false }));
      } else {
        set({ loading: false });
      }
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      // Only trigger state updates if user ID changes to avoid loops
      const currentUser = get().user;
      if (user?.id !== currentUser?.id) {
        set({ user, loading: !!user });
        if (user) {
          get()
            .refreshProfile()
            .finally(() => set({ loading: false }));
        } else {
          set({ profile: null, loading: false });
        }
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Refresh profile on explicit sign in just in case
        if (user) get().refreshProfile();
      }
    });
  },
}));
