import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "./useAuthStore";
import { useDeckStore } from "./useDeckStore";

type MatchStatus = "idle" | "searching" | "creating" | "matched" | "error";

interface MatchmakingState {
  status: MatchStatus;
  matchId: string | null;
  opponentId: string | null;
  startTime: number | null;
  error: string | null;

  startSearch: (mode: "ranked" | "custom") => Promise<void>;
  cancelSearch: () => void;
  reset: () => void;
}

export const useMatchmakingStore = create<MatchmakingState>((set, get) => {
  let channel: any = null;
  let presenceInterval: any = null;

  return {
    status: "idle",
    matchId: null,
    opponentId: null,
    startTime: null,
    error: null,

    startSearch: async (mode) => {
      const user = useAuthStore.getState().user;
      const profile = useAuthStore.getState().profile;

      if (!user) {
        set({ error: "Not authenticated" });
        return;
      }

      // FORCE SYNC DECK TO DB (Reliability Fix)
      const currentDeck = useDeckStore.getState().selectedDeck;
      if (currentDeck.length === 5) {
        console.log("Syncing deck to DB before matchmaking...");
        // We use the store's saveDeck action which handles DB update
        await useDeckStore.getState().saveDeck(currentDeck, user.id);
      } else {
        set({ error: "Invalid Deck - Please select 5 cards" });
        return;
      }

      set({ status: "searching", startTime: Date.now(), error: null });

      // Join the matchmaking channel
      channel = supabase.channel("matchmaking_queue", {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "matches",
            filter: `player2_id=eq.${user.id}`,
          },
          (payload: any) => {
            console.log("Match Invite Received via DB:", payload.new.id);
            if (channel) supabase.removeChannel(channel);
            set({
              status: "matched",
              matchId: payload.new.id,
              opponentId: payload.new.player1_id,
            });
          }
        )
        .on("presence", { event: "sync" }, async () => {
          const state = channel.presenceState();
          const myId = user.id;

          // Flatten state to get all searching users
          const searchingUsers: any[] = [];
          for (const key in state) {
            // state[key] is an array of presence objects
            state[key].forEach((presence: any) => {
              if (presence.mode === mode && presence.status === "searching") {
                searchingUsers.push(presence);
              }
            });
          }

          // Filter out self
          const opponents = searchingUsers.filter((u) => u.user_id !== myId);

          if (opponents.length > 0) {
            // To prevent race conditions (both trying to match each other), determine a "Host".
            // Rule: User with String(ID) < String(OpponentID) is the Host.
            const opponent = opponents[0];
            const amIHost = myId < opponent.user_id;

            if (amIHost) {
              // LOCK: Prevent double submission from multiple presence syncs
              if (get().status === "creating" || get().status === "matched")
                return;

              console.log("I am Host. Locking match creation...");
              set({ status: "creating" });

              // 1. Create match in DB
              const myDeck = useDeckStore
                .getState()
                .selectedDeck.filter((c) => c && c.id);

              // FETCH OPPONENT DECK FROM DB (Primary Source)
              // Retry loop max 5 attempts to handle replication latency
              let opponentDeck: any[] = [];
              let attempts = 0;

              while (attempts < 5 && opponentDeck.length < 5) {
                attempts++;
                console.log(
                  `Fetching opponent deck from DB (Attempt ${attempts})...`
                );

                const { data: oppProfile, error: dbError } = await supabase
                  .from("profiles")
                  .select("selected_deck")
                  .eq("id", opponent.user_id)
                  .single();

                if (dbError) {
                  console.error(
                    "DB Fetch Error (Profile RLS might be issue):",
                    dbError
                  );
                }

                const fetchedDeck = (
                  (oppProfile?.selected_deck as any[]) || []
                ).filter((c: any) => c && c.id);

                if (fetchedDeck.length >= 5) {
                  opponentDeck = fetchedDeck;
                  break;
                }

                // Wait 1s before retry
                if (attempts < 5) await new Promise((r) => setTimeout(r, 1000));
              }

              // Fallback to presence if DB is empty (Legacy or Race Condition)
              if (opponentDeck.length < 5) {
                console.warn(
                  "DB Deck fetch failed after retries. Trying presence deck as last resort..."
                );
                const presenceDeck = (opponent.deck || []).filter(
                  (c: any) => c && c.id
                );
                if (presenceDeck.length >= 5) {
                  opponentDeck = presenceDeck;
                }
              }

              // Validate both decks exist before creating match
              if (myDeck.length < 5) {
                console.warn(
                  "My deck is incomplete ( < 5 cards), cannot create match. Please reseave deck."
                );
                set({ status: "searching", error: "Invalid Deck" }); // Unlock
                return;
              }
              if (opponentDeck.length < 5) {
                console.warn(
                  "Opponent deck is incomplete ( < 5 cards) in both DB and Presence. Aborting match creation."
                );
                set({ status: "searching" }); // Unlock to retry next sync
                return;
              }

              console.log("Creating match with:", {
                p1: user.id,
                p2: opponent.user_id,
              });

              const { data, error } = await supabase
                .from("matches")
                .insert({
                  player1_id: user.id,
                  player2_id: opponent.user_id,
                  status: "playing", // Start directly in playing phase
                  config: {
                    decks: {
                      [user.id]: myDeck,
                      [opponent.user_id]: opponentDeck,
                    },
                  },
                })
                .select()
                .single();

              if (error) {
                console.error("Failed to create match:", error);
                set({ status: "error", error: error.message });
              } else {
                console.log("Match created:", data.id);

                // Cleanup matchmaking channel
                if (channel) supabase.removeChannel(channel);
                channel = null;

                set({
                  status: "matched",
                  matchId: data.id,
                  opponentId: opponent.user_id,
                });
              }
            } else {
              console.log("Waiting for host...", opponent.user_id);
            }
          }
        })
        .on("broadcast", { event: "match_found" }, (payload: any) => {
          const { match_id, player1, player2 } = payload.payload;
          const myId = useAuthStore.getState().user?.id;

          // Guest logic via Broadcast
          if (myId && player2 === myId) {
            console.log("Match Found (Broadcast)! ID:", match_id);
            if (channel) supabase.removeChannel(channel);

            set({
              status: "matched",
              matchId: match_id,
              opponentId: player1,
            });
          }
        })
        .subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            const trackStatus = await channel.track({
              user_id: user.id,
              mode: mode,
              rank: profile?.rank_points || 1000,
              status: "searching",
              online_at: new Date().toISOString(),
              deck: useDeckStore
                .getState()
                .selectedDeck.filter((c) => c && c.id),
            });
          }
        });
    },

    cancelSearch: () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
      set({ status: "idle", startTime: null });
    },

    reset: () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
      set({ status: "idle", matchId: null, opponentId: null });
    },
  };
});
