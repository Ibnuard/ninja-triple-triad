import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "./useAuthStore";
import { useDeckStore } from "./useDeckStore";

type MatchStatus = "idle" | "searching" | "matched" | "error";

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
        .on("presence", { event: "sync" }, () => {
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
              console.log("I am Host. Creating match with", opponent.user_id);

              // 1. Create match in DB
              const myDeck = useDeckStore.getState().selectedDeck;
              const opponentDeck = opponent.deck || []; // Should affect game logic if empty

              supabase
                .from("matches")
                .insert({
                  player1_id: myId,
                  player2_id: opponent.user_id,
                  status: "active",
                  config: {
                    mode,
                    decks: {
                      [myId]: myDeck,
                      [opponent.user_id]: opponentDeck,
                    },
                  },
                })
                .select()
                .single()
                .then(async ({ data: match, error }) => {
                  if (error) {
                    console.error("Failed to create match", error);
                    return;
                  }

                  // 2. Broadcast Match Found (Best Effort)
                  await channel.send({
                    type: "broadcast",
                    event: "match_found",
                    payload: {
                      match_id: match.id,
                      player1: myId,
                      player2: opponent.user_id,
                    },
                  });

                  // 3. Transition Self Immediately (Don't wait for broadcast loopback)
                  if (channel) supabase.removeChannel(channel);
                  set({
                    status: "matched",
                    matchId: match.id,
                    opponentId: opponent.user_id,
                  });
                });
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
              deck: useDeckStore.getState().selectedDeck,
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
