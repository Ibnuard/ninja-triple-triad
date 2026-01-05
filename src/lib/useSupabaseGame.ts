import { useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import { supabase } from "./supabase";
import { GameState } from "../types/game";

export const useSupabaseGame = (roomId: string | null) => {
  const { board, player1, player2, currentPlayerId, phase, winner, lastMove } =
    useGameStore();

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: false }, // Don't receive own messages
      },
    });

    channel
      .on("broadcast", { event: "game_state_update" }, (payload) => {
        // Receive state from opponent
        console.log("Received state update", payload);
        useGameStore.setState(payload.payload as Partial<GameState>);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Broadcast state changes
  // Note: This is a naiive implementation that broadcasts the WHOLE state on every change.
  // In production, you'd send specific moves.
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase.channel(`room:${roomId}`);
    channel.send({
      type: "broadcast",
      event: "game_state_update",
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
    roomId,
  ]);
};
