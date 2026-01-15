import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { useGameStore } from "../store/useGameStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSearchParams } from "next/navigation";

interface UseOnlineGameLogicReturn {
  isConnected: boolean;
  opponentDisconnected: boolean;
  opponentReady: boolean;
  myReady: boolean;
  initError: string | null;
}

export const useOnlineGameLogic = (): UseOnlineGameLogicReturn => {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId");
  const mode = searchParams.get("mode");
  const user = useAuthStore((state) => state.user);

  const [isConnected, setIsConnected] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [myReady, setMyReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const channelRef = useRef<any>(null);
  const isHostRef = useRef<boolean>(false);
  const hasInitializedRef = useRef<boolean>(false);
  const lastStateStringRef = useRef<string>("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const matchDataRef = useRef<any>(null);

  // Get current phase
  const phase = useGameStore((state) => state.phase);

  // Hash state for comparison
  const hashState = (state: any): string => {
    if (!state) return "";
    return JSON.stringify({
      board: state.board,
      player1: state.player1,
      player2: state.player2,
      currentPlayerId: state.currentPlayerId,
      phase: state.phase,
      winner: state.winner,
      moveSequence: state.moveSequence,
    });
  };

  // Apply state from DB
  const applyStateFromDb = useCallback((dbState: any) => {
    if (!dbState || !dbState.phase) return false;
    const dbHash = hashState(dbState);
    if (dbHash !== lastStateStringRef.current) {
      console.log("Applying state from DB, phase:", dbState.phase);
      lastStateStringRef.current = dbHash;
      useGameStore.setState(dbState);
      return true;
    }
    return false;
  }, []);

  // Load state from DB
  const loadStateFromDb = useCallback(async (): Promise<any> => {
    if (!matchId) return null;

    let attempts = 0;
    while (attempts < 5) {
      attempts++;
      const { data: match, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (!error && match) return match;

      console.warn(`Load Match Attempt ${attempts} failed. Retrying...`, error);
      await new Promise((r) => setTimeout(r, 1000));
    }
    return null;
  }, [matchId]);

  // Initialize game - called when both players ready
  const initializeGame = useCallback(async () => {
    if (hasInitializedRef.current || !matchDataRef.current) return;
    hasInitializedRef.current = true;

    const match = matchDataRef.current;
    console.log("=== INITIALIZING GAME ===");

    const decks = match.config?.decks || {};
    const p1Id = match.player1_id;
    const p2Id = match.player2_id;

    let p1DeckSource = decks[p1Id] || [];
    let p2DeckSource = decks[p2Id] || [];

    // Fallback: If Match Config failed to save decks, Fetch direct from DB
    // This solves the issue where Host fails to populate config correctly
    try {
      if (p1DeckSource.length < 5) {
        console.warn("P1 Deck Missing in Config. Fetching from DB Fallback...");
        const { data, error } = await supabase
          .from("profiles")
          .select("selected_deck")
          .eq("id", p1Id)
          .single();
        if (data?.selected_deck) {
          p1DeckSource = data.selected_deck;
        } else if (error) {
          console.error("P1 DB Fetch Error:", error);
        }
      }
      if (p2DeckSource.length < 5) {
        console.warn("P2 Deck Missing in Config. Fetching from DB Fallback...");
        const { data, error } = await supabase
          .from("profiles")
          .select("selected_deck")
          .eq("id", p2Id)
          .single();
        if (data?.selected_deck) {
          p2DeckSource = data.selected_deck;
        } else if (error) {
          console.error("P2 DB Fetch Error:", error);
        }
      }
    } catch (err) {
      console.error("Critical Error during Deck Fallback Fetch:", err);
      // Don't crash, proceed to validation check so we show the proper Error UI
    }

    const p1Hand = p1DeckSource.filter((c: any) => c && c.id);
    const p2Hand = p2DeckSource.filter((c: any) => c && c.id);

    console.log("Deck check:", { p1: p1Hand.length, p2: p2Hand.length });

    if (p1Hand.length < 5 || p2Hand.length < 5) {
      console.error("Incomplete hands! Cannot initialize.");
      setInitError("Incomplete Decks - Match Cancelled");
      hasInitializedRef.current = false;
      return false;
    }

    const processHand = (hand: any[]) =>
      hand.map((c, idx) => ({
        ...c,
        id: `${c.id || c.name || "card"}-${Date.now()}-${idx}-${Math.random()
          .toString(36)
          .substr(2, 5)}`,
      }));

    const starterPlayerId = Math.random() > 0.5 ? "player1" : "player2";

    const initialState = {
      phase: "playing" as const,
      currentPlayerId: starterPlayerId as "player1" | "player2",
      moveSequence: 0,
      player1: {
        id: p1Id,
        name: "Player 1",
        hand: processHand(p1Hand),
        capturedCount: 0,
        color: "blue" as const,
        isComputer: false,
      },
      player2: {
        id: p2Id,
        name: "Player 2",
        hand: processHand(p2Hand),
        capturedCount: 0,
        color: "red" as const,
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
              element: "none" as const,
            }))
        ),
      winner: null,
      lastMove: null,
      mechanic: {
        type: "none" as const,
        activeElement: "none" as const,
        jokerModifiers: { player1: 0, player2: 0 },
      },
    };

    console.log("Saving game state...");
    const { error } = await supabase
      .from("matches")
      .update({ state: initialState })
      .eq("id", matchId);

    if (error) {
      console.error("Failed to save:", error);
      hasInitializedRef.current = false;
      return false;
    }

    console.log("Game initialized!");
    lastStateStringRef.current = hashState(initialState);
    useGameStore.setState(initialState);
    return true;
  }, [matchId]);

  // Push state to DB
  const pushStateToDb = useCallback(async () => {
    if (!matchId || mode !== "online") return;
    const store = useGameStore.getState();
    if (
      store.phase === "lobby" ||
      store.phase === "waiting" ||
      store.phase === "preparing"
    )
      return;

    const stateToSave = {
      board: store.board,
      player1: store.player1,
      player2: store.player2,
      currentPlayerId: store.currentPlayerId,
      phase: store.phase,
      winner: store.winner,
      lastMove: store.lastMove,
      moveSequence: store.moveSequence,
    };

    const newHash = hashState(stateToSave);
    if (newHash === lastStateStringRef.current) return;

    console.log("Pushing state, moveSeq:", store.moveSequence);
    lastStateStringRef.current = newHash;

    await supabase
      .from("matches")
      .update({ state: stateToSave })
      .eq("id", matchId);
  }, [matchId, mode]);

  const hasArchivedRef = useRef(false);

  // Archive match to history (Host Only)
  const archiveMatch = useCallback(
    async (finalState: any) => {
      if (!matchId || !user) return;

      console.log("Archiving match...");
      const { player1, player2, winner, board } = finalState;

      // Calculate scores
      let p1Score = 0;
      let p2Score = 0;
      board.forEach((row: any[]) =>
        row.forEach((c: any) => {
          if (c.owner === "player1") p1Score++;
          if (c.owner === "player2") p2Score++;
        })
      );

      const winnerId =
        winner === "player1"
          ? player1.id
          : winner === "player2"
          ? player2.id
          : null;

      // 1. Insert to History
      const { error } = await supabase.from("match_history").insert({
        match_id: matchId,
        player1_id: player1.id,
        player2_id: player2.id,
        winner_id: winnerId,
        player1_score: p1Score,
        player2_score: p2Score,
        mode: mode || "ranked",
        recorded_by: user.id,
      });

      if (error) {
        console.error("Archive failed:", error);
      } else {
        console.log("Match archived. Deleting match room...");
        // 2. Delete Match Room (Cleanup)
        // Wait a bit to ensure clients got the update?
        // Since this runs on Host, we can delete.
        // Joiner might get "Match not found" on next poll -> Need to handle that gracefully
        // (Joiner should not show error but just stop polling if game_over)
        setTimeout(async () => {
          await supabase.from("matches").delete().eq("id", matchId);
        }, 2000);
      }
    },
    [matchId, mode, user]
  );

  // Subscribe to store changes
  useEffect(() => {
    if (mode !== "online" || !matchId) return;
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      // Archive Trigger
      if (
        state.phase === "game_over" &&
        isHostRef.current &&
        !hasArchivedRef.current
      ) {
        hasArchivedRef.current = true;
        archiveMatch(state);
      }

      // Push Trigger
      if (
        state.moveSequence !== prevState.moveSequence ||
        state.phase !== prevState.phase ||
        state.winner !== prevState.winner
      ) {
        pushStateToDb();
      }
    });
    return () => unsubscribe();
  }, [mode, matchId, pushStateToDb, archiveMatch]);

  // Polling for updates
  useEffect(() => {
    if (mode !== "online" || !matchId) return;

    const poll = async () => {
      const match = await loadStateFromDb();
      if (!match) return;

      if (match.status === "cancelled") {
        setOpponentDisconnected(true);
        return;
      }

      if (match.state && match.state.phase) {
        applyStateFromDb(match.state);
      }
    };

    pollingRef.current = setInterval(poll, 500);
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [mode, matchId, loadStateFromDb, applyStateFromDb]);

  // Main effect
  useEffect(() => {
    if (mode !== "online" || !matchId || !user) return;

    console.log("=== ONLINE SETUP ===", matchId);

    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          const newMatch = payload.new;
          if (newMatch.status === "cancelled") {
            setOpponentDisconnected(true);
            return;
          }
          if (newMatch.state) {
            applyStateFromDb(newMatch.state);
          }
        }
      )
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        const users = Object.keys(presenceState);
        console.log("Presence sync:", users.length, "users");

        // Check if both players are ready
        let foundOpponentReady = false;
        let foundMyReady = false;

        for (const key of users) {
          const presences = presenceState[key] as any[];
          for (const p of presences) {
            if (p.user_id === user.id) {
              foundMyReady = p.ready === true;
            } else {
              foundOpponentReady = p.ready === true;
            }
          }
        }

        setOpponentReady(foundOpponentReady);
        setMyReady(foundMyReady);

        // If both ready and I'm host and in preparing phase, initialize game
        // If I'm host and in preparing phase, initialize game (Redundant check but keeps event-driven logic)
        const currentPhase = useGameStore.getState().phase;
        if (
          isHostRef.current &&
          currentPhase === "preparing" &&
          !hasInitializedRef.current
        ) {
          console.log("Presence update received. Ensuring game init...");
          initializeGame();
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        if (leftPresences?.length > 0) {
          const leftId = leftPresences[0]?.user_id;
          if (leftId && leftId !== user.id) {
            console.log("Opponent left");
            setOpponentDisconnected(true);
            supabase
              .from("matches")
              .update({ status: "cancelled" })
              .eq("id", matchId);
          }
        }
      })
      .subscribe(async (status) => {
        console.log("Channel:", status);

        if (status === "SUBSCRIBED") {
          setIsConnected(true);

          // Load match data
          const match = await loadStateFromDb();
          if (!match) {
            console.error("Match not found!");
            return;
          }

          matchDataRef.current = match;

          if (match.status === "cancelled") {
            setOpponentDisconnected(true);
            return;
          }

          isHostRef.current = match.player1_id === user.id;
          console.log("Am I host?", isHostRef.current);

          // Check existing state
          if (match.state && match.state.phase === "playing") {
            console.log("Loading existing game");
            applyStateFromDb(match.state);
            // Track with ready=true since game already started
            if (channel.state === "joined") {
              try {
                await channel.track({ user_id: user.id, ready: true });
              } catch (e) {
                console.warn("Track error:", e);
              }
            }
          } else if (match.state && match.state.phase === "game_over") {
            applyStateFromDb(match.state);
            if (channel.state === "joined") {
              try {
                await channel.track({ user_id: user.id, ready: true });
              } catch (e) {
                console.warn("Track error:", e);
              }
            }
          } else {
            // Go to preparing phase
            // Go to preparing phase
            console.log("Entering preparation phase...");
            useGameStore.setState({ phase: "preparing" });

            // AUTO-START if Host (Architecture Rework)
            // We do NOT wait for opponent presence anymore. Database is the source of truth.
            if (isHostRef.current && !hasInitializedRef.current) {
              console.log(
                "Host connected. Auto-initializing game (Skip Preparation)..."
              );
              // Small delay to ensure state is set
              setTimeout(() => {
                initializeGame();
              }, 500);
            }

            // Initial track
            if (channel.state === "joined") {
              try {
                await channel.track({ user_id: user.id, ready: true });
              } catch (e) {
                console.warn("Track error:", e);
              }
            }
          }
        }
      });

    channelRef.current = channel;

    // Periodic Check & Retry (Watchdog for Deadlocks)
    const watchdogInterval = setInterval(async () => {
      if (!channel || channel.state !== "joined") return;

      const currentPhase = useGameStore.getState().phase;

      // 1. Re-evaluate presence (in case sync missed)
      const presenceState = channel.presenceState();
      const users = Object.keys(presenceState);
      let foundOpponentReady = false;
      let foundMyReady = false;

      for (const key of users) {
        const presences = presenceState[key] as any[];
        for (const p of presences) {
          if (p.user_id === user.id) {
            foundMyReady = p.ready === true;
          } else {
            foundOpponentReady = p.ready === true;
          }
        }
      }

      // Update states if changed
      setOpponentReady(foundOpponentReady);
      setMyReady(foundMyReady);

      // 2. Retry Tracking if I'm not ready in my own view
      if (
        !foundMyReady &&
        (currentPhase === "preparing" || currentPhase === "playing")
      ) {
        if (channel.state === "joined") {
          console.log("Watchdog: Retracking ready status...");
          try {
            await channel.track({ user_id: user.id, ready: true });
          } catch (e) {
            console.warn("Watchdog track error:", e);
          }
        }
      }

      // 3. Host Init Check (Redundant safety net)
      // 3. Host Init Check (Redundant safety net)
      if (
        isHostRef.current &&
        currentPhase === "preparing" &&
        !hasInitializedRef.current
      ) {
        console.log("Watchdog: Host check, initializing game...");
        initializeGame();
      }
    }, 2000);

    return () => {
      clearInterval(watchdogInterval);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      supabase.removeChannel(channel);
      channelRef.current = null;

      // Aggressive DB Cleanup: If Host leaves, destroy the match
      if (isHostRef.current && matchId) {
        console.log("Host leaving. destroying match record...");
        supabase
          .from("matches")
          .delete()
          .eq("id", matchId)
          .then(({ error }) => {
            if (error) console.error("Cleanup error:", error);
          });
      }
    };
  }, [
    matchId,
    mode,
    user?.id,
    initializeGame,
    loadStateFromDb,
    applyStateFromDb,
  ]);

  return {
    isConnected,
    opponentDisconnected,
    opponentReady,
    myReady,
    initError,
  };
};
