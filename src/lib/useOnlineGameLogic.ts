import { useEffect, useRef } from "react";
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

  // Ref to track last received state to prevent loops
  const lastSyncedState = useRef<string>("");

  useEffect(() => {
    if (mode !== "online" || !matchId || !user) return;

    // A. Subscribe to DB Changes (Reliable Sync)
    const channel = supabase
      .channel(`game:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          const newState = payload.new.state;
          if (newState && Object.keys(newState).length > 0) {
            const newStateStr = JSON.stringify(newState);
            // Update ref BEFORE setting state to prevent loop
            if (lastSyncedState.current !== newStateStr) {
              // console.log("Received DB State Update");
              lastSyncedState.current = newStateStr;
              useGameStore.setState(newState);
            }
          }
        }
      )
      .on("presence", { event: "sync" }, () => {
        // Presence logic mainly for connection status
        const state = channel.presenceState();
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });

          // B. Initial Fetch
          const { data: match } = await supabase
            .from("matches")
            .select("player1_id, state, config") // Fetch state!
            .eq("id", matchId)
            .single();

          if (match) {
            // Priority 1: Load existing state from DB
            if (match.state && Object.keys(match.state).length > 0) {
              console.log("Loading existing game state from DB...");
              const stateStr = JSON.stringify(match.state);
              lastSyncedState.current = stateStr;
              useGameStore.setState(match.state);
            }
            // Priority 2: Host Initializes New Game
            else if (match.player1_id === user.id) {
              console.log("Initializing New Online Game...");
              initializeOnlineGame(match, matchId);
            }
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, mode, user?.id]);

  // 2. Push State Changes to DB (Authoritative Sync)
  useEffect(() => {
    if (mode !== "online" || !matchId) return;

    const currentState = {
      board,
      player1,
      player2,
      currentPlayerId,
      phase,
      winner,
      lastMove,
    };

    // Only push if State CHANGED LOCALLY (not matching lastSyncedState)
    // And don't push empty/init state unless needed.
    const currentStateStr = JSON.stringify(currentState);

    if (currentStateStr !== lastSyncedState.current && phase !== "lobby") {
      const push = async () => {
        // console.log("Pushing Local State Change to DB...");
        // We update ref to current state so we don't re-process it if DB echoes it back (which it will)
        // But actually DB echo logic handled in subscription.
        await supabase
          .from("matches")
          .update({ state: currentState })
          .eq("id", matchId);
        lastSyncedState.current = currentStateStr;
      };
      push();
    }
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

async function initializeOnlineGame(match: any, matchId: string) {
  // Use decks from match config
  const decks = match.config?.decks || {};
  const p1Id = match.player1_id;
  const p2Id = match.player2_id;

  const p1Hand = decks[p1Id] || []; // Should be full Card objects
  const p2Hand = decks[p2Id] || [];

  const processHand = (hand: any[]) =>
    hand.map((c) => ({ ...c, id: `${c.id}-${Math.random()}` }));

  const initialState: Partial<GameState> = {
    phase: "playing",
    currentPlayerId: p1Id, // Host starts? Or Random? For simplicity Host/P1 starts.
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

  // Push to DB (Authoritative)
  await supabase
    .from("matches")
    .update({ state: initialState })
    .eq("id", matchId);
  // Also set local state (Wait for postgres_changes? No, set immediate for responsiveness)
  useGameStore.setState(initialState);
}
