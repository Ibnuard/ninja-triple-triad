import { useEffect } from "react";
import { supabase } from "./supabase";
import { useGameStore } from "../store/useGameStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSearchParams } from "next/navigation";
import { GameState } from "../types/game";
import { CARD_POOL } from "../data/cardPool";

export const useOnlineGameLogic = () => {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId");
  const mode = searchParams.get("mode");
  const user = useAuthStore((state) => state.user);

  const { board, player1, player2, currentPlayerId, phase, winner, lastMove } =
    useGameStore();

  // 1. Subscribe to Game Channel & Sync State
  useEffect(() => {
    if (mode !== "online" || !matchId || !user) return;

    const channel = supabase.channel(`game:${matchId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: user.id },
      },
    });

    const timeoutDuration = 30000; // 30 seconds timeout
    let connectionTimeout: NodeJS.Timeout;

    channel
      .on("broadcast", { event: "game_state" }, (payload) => {
        // console.log("Received Online State:", payload.payload);
        useGameStore.setState(payload.payload as Partial<GameState>);
      })
      .on("broadcast", { event: "match_cancelled" }, () => {
        alert("Match cancelled by opponent or network issue.");
        window.location.href = "/online"; // Force redirect
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).length;

        if (users >= 2) {
          if (connectionTimeout) clearTimeout(connectionTimeout);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track presence
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });

          // Start Timeout to wait for opponent
          connectionTimeout = setTimeout(async () => {
            const state = channel.presenceState();
            const users = Object.keys(state).length;

            if (users < 2) {
              console.error("Opponent failed to connect. Cancelling match...");
              alert("Opponent failed to connect. Returning to lobby.");

              // 1. Broadcast Cancel (in case they are just entering)
              channel.send({
                type: "broadcast",
                event: "match_cancelled",
                payload: {},
              });

              // 2. Update DB status to cancelled
              await supabase
                .from("matches")
                .update({ status: "cancelled" })
                .eq("id", matchId);

              // 3. Redirect
              window.location.href = "/online";
            }
          }, timeoutDuration);

          // ... Host Init Logic ...
          const { data: match } = await supabase
            .from("matches")
            .select("player1_id, player2_id")
            .eq("id", matchId)
            .single();

          // ... existing init logic ...
          if (match && match.player1_id === user.id) {
            console.log("I am Host (P1). Initializing Online Game...");
            // Only initialize if phase is lobby (not already playing)
            if (useGameStore.getState().phase === "lobby") {
              initializeOnlineGame(match, user.id);
            }
          }
        }
      });

    return () => {
      if (connectionTimeout) clearTimeout(connectionTimeout);
      supabase.removeChannel(channel);
    };
  }, [matchId, mode, user?.id]);

  // 2. Broadcast State Changes (Host and Guest)
  // Whenever local state changes (due to move), broadcast it.
  useEffect(() => {
    if (mode !== "online" || !matchId) return;

    // Throttle or debounce? Realtime is fast.
    // Only broadcast if I made the move?
    // Actually, simply broadcasting the NEW state is safe if we use { self: false }.
    // But we need to be careful about loops.
    // Best practice: Only broadcast when YOU make an action.
    // However, keeping it simple: Broadcast state if it changed.

    // Check if the change was relevant (e.g. board changed, turn changed)
    // To avoid spam, we might rely on the fact that ONLY the active player updates the state
    // locally via interactions.

    const channel = supabase.channel(`game:${matchId}`);
    channel.send({
      type: "broadcast",
      event: "game_state",
      payload: {
        board,
        player1,
        player2,
        currentPlayerId,
        phase,
        winner,
        lastMove,
      },
    });
  }, [
    board,
    player1,
    player2,
    currentPlayerId,
    phase,
    winner,
    lastMove,
    matchId,
    mode,
  ]);
};

function initializeOnlineGame(match: any, myId: string) {
  // Use decks from match config
  const decks = match.config?.decks || {};
  const p1Id = match.player1_id;
  const p2Id = match.player2_id;

  const p1Hand = decks[p1Id] || []; // Should be full Card objects
  const p2Hand = decks[p2Id] || [];

  // If decks are empty (legacy matches), maybe fallback or error?
  // For now, assume new matchmaking logic ensures validity.
  // Add unique IDs to card instances just in case duplication occurs locally (though they come from store)
  const processHand = (hand: any[]) =>
    hand.map((c) => ({ ...c, id: `${c.id}-${Math.random()}` }));

  const initialState: Partial<GameState> = {
    phase: "playing",
    currentPlayerId: "player1",
    player1: {
      id: p1Id,
      name: "Player 1",
      hand: processHand(p1Hand),
      capturedCount: 0,
      color: "blue",
      isComputer: false,
    },
    player2: {
      id: p2Id,
      name: "Player 2",
      hand: processHand(p2Hand),
      capturedCount: 0,
      color: "red",
      isComputer: false,
    },
    board: Array(3)
      .fill(null)
      .map((_, r) =>
        Array(3)
          .fill(null)
          .map((_, c) => ({
            row: r,
            col: c,
            card: null,
            owner: null,
            element: "none",
          }))
      ),
    winner: null,
  };

  useGameStore.setState(initialState);
}
