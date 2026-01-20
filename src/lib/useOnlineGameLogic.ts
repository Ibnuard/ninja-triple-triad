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
  const lastPushedMoveSeq = useRef<number>(0);
  const matchDataRef = useRef<any>(null);
  const hydratedProfilesRef = useRef<Set<string>>(new Set());

  const phase = useGameStore((state) => state.phase);
  const localMoveSequence = useGameStore((state) => state.moveSequence || 0);

  // Load state from DB (Moved before applyStateFromDb to fix dependency)
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

  // Apply state from DB (Improved with moveSequence + validation + retry)
  const applyStateFromDb = useCallback(
    async (dbState: any) => {
      if (!dbState || !dbState.phase) return false;

      // Use moveSequence for more reliable comparison
      const dbMoveSeq = dbState.moveSequence || 0;
      const localSeq = useGameStore.getState().moveSequence || 0;

      // Only apply if DB state is newer OR if phases differ (important state changes)
      if (
        dbMoveSeq > localSeq ||
        dbState.phase !== useGameStore.getState().phase
      ) {
        // Validate critical data before applying (prevent bugs)
        const hasValidHands =
          dbState.player1?.hand?.length > 0 &&
          dbState.player2?.hand?.length > 0;

        // Validate player IDs exist (prevent "both YOUR TURN" bug)
        const hasValidPlayerIds = dbState.player1?.id && dbState.player2?.id;

        if (!hasValidHands && dbState.phase === "playing") {
          console.warn("⚠️ Incomplete state detected - missing hand cards!");
          console.log(
            "Triggering immediate DB reload to fetch complete state...",
          );

          // Active retry: Reload from DB immediately
          setTimeout(async () => {
            const match = await loadStateFromDb();
            if (match?.state) {
              const retryHasHands =
                match.state.player1?.hand?.length > 0 &&
                match.state.player2?.hand?.length > 0;

              if (retryHasHands) {
                console.log("✅ Retry successful - complete state loaded");
                useGameStore.setState(match.state);
              } else {
                console.error("❌ Retry failed - state still incomplete");
              }
            }
          }, 500);

          return false;
        }

        if (!hasValidPlayerIds && dbState.phase === "playing") {
          console.warn("⚠️ Incomplete state - missing player IDs! Skipping...");
          return false;
        }

        console.log(
          `Applying state from DB (moveSeq: ${dbMoveSeq} > ${localSeq})`,
        );
        useGameStore.setState(dbState);
        return true;
      }
      return false;
    },
    [loadStateFromDb],
  );

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

    // Fallback: If Match Config failed to save decks, Fetch direct from DB with retry
    // This solves the issue where Host fails to populate config correctly
    const fetchDeckWithRetry = async (
      playerId: string,
      maxRetries = 3,
    ): Promise<any[]> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(
          `Fetching deck for ${playerId} (attempt ${attempt}/${maxRetries})...`,
        );
        const { data, error } = await supabase
          .from("profiles")
          .select("selected_deck")
          .eq("id", playerId)
          .single();

        if (data?.selected_deck && data.selected_deck.length >= 5) {
          return data.selected_deck;
        }

        if (error) {
          console.warn(`Deck fetch attempt ${attempt} failed:`, error);
        }

        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 500 * attempt)); // Exponential backoff
        }
      }
      return [];
    };

    try {
      if (p1DeckSource.length < 5) {
        console.warn("P1 Deck Missing in Config. Fetching from DB Fallback...");
        p1DeckSource = await fetchDeckWithRetry(p1Id);
      }
      if (p2DeckSource.length < 5) {
        console.warn("P2 Deck Missing in Config. Fetching from DB Fallback...");
        p2DeckSource = await fetchDeckWithRetry(p2Id);
      }
    } catch (err) {
      console.error("Critical Error during Deck Fallback Fetch:", err);
      // Don't crash, proceed to validation check so we show the proper Error UI
    }

    let p1Hand = p1DeckSource.filter((c: any) => c && c.id);
    let p2Hand = p2DeckSource.filter((c: any) => c && c.id);

    console.log("Deck check:", { p1: p1Hand.length, p2: p2Hand.length });

    // Final retry if still incomplete
    if (p1Hand.length < 5 || p2Hand.length < 5) {
      console.warn("Hands still incomplete. Final retry after 1s delay...");
      await new Promise((r) => setTimeout(r, 1000));

      if (p1Hand.length < 5) {
        const retryP1 = await fetchDeckWithRetry(p1Id, 2);
        if (retryP1.length >= 5) p1Hand = retryP1.filter((c: any) => c && c.id);
      }
      if (p2Hand.length < 5) {
        const retryP2 = await fetchDeckWithRetry(p2Id, 2);
        if (retryP2.length >= 5) p2Hand = retryP2.filter((c: any) => c && c.id);
      }

      console.log("After final retry:", {
        p1: p1Hand.length,
        p2: p2Hand.length,
      });
    }

    if (p1Hand.length < 5 || p2Hand.length < 5) {
      console.error("Incomplete hands after all retries! Cannot initialize.");
      setInitError("Incomplete Decks - Match Cancelled");
      hasInitializedRef.current = false;
      return false;
    }

    // Fetch Profiles for Avatar, Names & Rank Points
    const { data: profiles, error: pError } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, rank_points")
      .in("id", [p1Id, p2Id]);

    const p1Profile = profiles?.find((p) => p.id === p1Id);
    const p2Profile = profiles?.find((p) => p.id === p2Id);

    const processHand = (hand: any[]) =>
      hand.map((c, idx) => ({
        ...c,
        id: `${c.id || c.name || "card"}-${Date.now()}-${idx}-${Math.random()
          .toString(36)
          .substr(2, 5)}`,
      }));

    const starterPlayerId = Math.random() > 0.5 ? "player1" : "player2";

    const localProfile = useAuthStore.getState().profile;
    const localUser = useAuthStore.getState().user;

    const initialState = {
      phase: "playing" as const,
      currentPlayerId: starterPlayerId as "player1" | "player2",
      moveSequence: 0,
      player1: {
        id: p1Id,
        name:
          p1Profile?.username ||
          p1Profile?.full_name ||
          (p1Id === localUser?.id
            ? localProfile?.username || localProfile?.full_name
            : null) ||
          "...",
        avatar_url: p1Profile?.avatar_url || undefined,
        rank_points:
          p1Profile?.rank_points || match.config?.rankPoints?.[p1Id] || 0,
        hand: processHand(p1Hand),
        capturedCount: 0,
        color: "blue" as const,
        isComputer: false,
      },
      player2: {
        id: p2Id,
        name:
          p2Profile?.username ||
          p2Profile?.full_name ||
          (p2Id === localUser?.id
            ? localProfile?.username || localProfile?.full_name
            : null) ||
          "...",
        avatar_url: p2Profile?.avatar_url || undefined,
        rank_points:
          p2Profile?.rank_points || match.config?.rankPoints?.[p2Id] || 0,
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
            })),
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
    lastPushedMoveSeq.current = 0;
    useGameStore.setState(initialState);
    return true;
  }, [matchId]);

  // Push state to DB (Optimistic - Non-blocking)
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

    // Skip if already pushed this sequence
    if (store.moveSequence === lastPushedMoveSeq.current) return;

    console.log("Pushing state, moveSeq:", store.moveSequence);
    lastPushedMoveSeq.current = store.moveSequence;

    // Non-blocking DB update
    supabase
      .from("matches")
      .update({ state: stateToSave })
      .eq("id", matchId)
      .then(({ error }) => {
        if (error) {
          console.error("State push failed:", error);
          // Optionally: trigger a reload from DB on error
        }
      });
  }, [matchId, mode]);

  const hasArchivedRef = useRef(false);

  // Archive match to history (Host Only)
  const archiveMatch = useCallback(
    async (finalState: any) => {
      if (!matchId || !user) return;

      console.log("Archiving match...");
      const { player1, player2, winner, board } = finalState;
      console.log("Final State Winner:", winner);

      // Calculate scores
      let p1Score = 0;
      let p2Score = 0;
      board.forEach((row: any[]) =>
        row.forEach((c: any) => {
          if (c.owner === "player1") p1Score++;
          if (c.owner === "player2") p2Score++;
        }),
      );

      console.log("Final Scores:", { p1: p1Score, p2: p2Score });

      const winnerId =
        winner === "player1"
          ? player1.id
          : winner === "player2"
            ? player2.id
            : null;

      console.log("Determined Winner ID:", winnerId);

      // 1. Update Match status in live table (Redundancy & Safety)
      console.log("Setting match status to completed...");
      await supabase
        .from("matches")
        .update({
          status: "completed",
          winner_id: winnerId,
        })
        .eq("id", matchId);

      // 2. Insert to History
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
    [matchId, mode, user],
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
        async (payload) => {
          const newMatch = payload.new;
          console.log("DB Update received:", {
            player1_ready: newMatch.player1_ready,
            player2_ready: newMatch.player2_ready,
            hasState: !!newMatch.state,
            phase: newMatch.state?.phase,
          });

          if (newMatch.status === "cancelled") {
            setOpponentDisconnected(true);
            return;
          }

          // Update ready states from DB
          const isPlayer1 = newMatch.player1_id === user?.id;
          setMyReady(
            isPlayer1 ? newMatch.player1_ready : newMatch.player2_ready,
          );
          setOpponentReady(
            isPlayer1 ? newMatch.player2_ready : newMatch.player1_ready,
          );

          // CRITICAL: Check if both ready and initialize
          // Use isPlayer1 directly instead of isHostRef which may not be set yet
          const amIHost = isPlayer1;
          if (
            newMatch.player1_ready &&
            newMatch.player2_ready &&
            !hasInitializedRef.current &&
            amIHost
          ) {
            console.log("Both players ready! Host initiating game...");
            // Ensure refs are set before init
            matchDataRef.current = newMatch;
            isHostRef.current = true;
            initializeGame();
          }

          // Apply game state if exists
          if (newMatch.state) {
            if (!matchDataRef.current) {
              matchDataRef.current = newMatch;
              isHostRef.current = isPlayer1;
            }
            applyStateFromDb(newMatch.state);
          }
        },
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

          // Load match data - CRITICAL: Must succeed before proceeding
          const match = await loadStateFromDb();
          if (!match) {
            console.error("Initial load failed - cannot proceed");
            setInitError("Failed to load match data");
            return;
          }

          // IMPORTANT: Set refs FIRST before any other logic
          matchDataRef.current = match;
          isHostRef.current = match.player1_id === user.id;
          console.log("Match loaded. Am I host?", isHostRef.current);

          if (match.status === "cancelled") {
            setOpponentDisconnected(true);
            return;
          }

          // Check existing state
          if (match.state && match.state.phase === "playing") {
            console.log("Loading existing game state");
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
            console.log("Loading finished game state");
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
            console.log("Entering preparation phase...");
            useGameStore.setState({ phase: "preparing" });

            // SET READY FLAG IN DB (New DB-based approach)
            const isPlayer1 = match.player1_id === user.id;
            console.log(
              `Setting ${
                isPlayer1 ? "player1_ready" : "player2_ready"
              } = true in DB...`,
            );

            const readyUpdate = isPlayer1
              ? { player1_ready: true }
              : { player2_ready: true };

            const { error: readyError } = await supabase
              .from("matches")
              .update(readyUpdate)
              .eq("id", matchId);

            if (readyError) {
              console.error("Failed to set ready flag:", readyError);
            } else {
              console.log("Ready flag set successfully!");
              // Update local state
              setMyReady(true);
            }

            // Check if already both ready (host might have joined first)
            if (
              match.player1_ready &&
              match.player2_ready &&
              isHostRef.current &&
              !hasInitializedRef.current
            ) {
              console.log(
                "Both already ready on initial load! Host initiating game...",
              );
              initializeGame();
            }

            // If I'm host and other player already ready, initialize
            if (isHostRef.current && !hasInitializedRef.current) {
              const otherReady = isPlayer1
                ? match.player2_ready
                : match.player1_ready;
              if (otherReady) {
                console.log("Opponent already ready! Host initiating game...");
                initializeGame();
              }
            }

            // Keep presence tracking for UI indicators (optional)
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

    // Dynamic Watchdog - faster in early phase, slower later
    let watchdogTimer: NodeJS.Timeout;

    const runWatchdog = async () => {
      if (!channel || channel.state !== "joined") {
        watchdogTimer = setTimeout(runWatchdog, 3000);
        return;
      }

      const currentPhase = useGameStore.getState().phase;
      const moveSeq = useGameStore.getState().moveSequence || 0;

      // Dynamic interval: 1.5s for preparing/early game, 3s for mid-late game
      const interval =
        currentPhase === "preparing" || moveSeq < 3 ? 1500 : 3000;

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

      // 3. Host Init Check via DB (Redundant safety net for stuck preparing)
      // This now uses DB-based ready tracking instead of presence
      if (
        isHostRef.current &&
        currentPhase === "preparing" &&
        !hasInitializedRef.current
      ) {
        console.log("Watchdog: Checking DB for both players ready...");
        const match = await loadStateFromDb();
        if (match && match.player1_ready && match.player2_ready) {
          matchDataRef.current = match;
          console.log("Watchdog: Both players ready in DB! Initiating game...");
          initializeGame();
        }
      }

      // 4. Empty Hand Detection & Fix
      if (currentPhase === "playing") {
        const state = useGameStore.getState();
        const hasEmptyHands =
          !state.player1?.hand?.length || !state.player2?.hand?.length;

        if (hasEmptyHands) {
          console.error("🚨 CRITICAL: Empty hands detected in playing phase!");
          console.log("Attempting emergency state reload from DB...");

          loadStateFromDb().then((match) => {
            if (match?.state) {
              const dbHasHands =
                match.state.player1?.hand?.length > 0 &&
                match.state.player2?.hand?.length > 0;

              if (dbHasHands) {
                console.log("✅ Emergency reload successful - hands restored");
                useGameStore.setState(match.state);
              } else {
                console.error(
                  "❌ DB state also has empty hands - critical error",
                );
              }
            }
          });
        }
      }

      // Schedule next run
      watchdogTimer = setTimeout(runWatchdog, interval);
    };

    // Start watchdog
    watchdogTimer = setTimeout(runWatchdog, 1500);

    return () => {
      clearTimeout(watchdogTimer);
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

  const p1Name = useGameStore((state) => state.player1.name);
  const p2Name = useGameStore((state) => state.player2.name);

  // Effect: Hydrate Profiles if names are generic
  useEffect(() => {
    if (mode !== "online" || !isConnected || !matchId) return;

    const p1Lower = (p1Name || "").toLowerCase();
    const p2Lower = (p2Name || "").toLowerCase();

    const needsP1 =
      p1Lower === "player 1" ||
      p1Lower === "kamu" ||
      p1Lower === "..." ||
      p1Lower === "you" ||
      !p1Lower;
    const needsP2 =
      p2Lower === "player 2" ||
      p2Lower === "opponent" ||
      p2Lower === "lawan" ||
      p2Lower === "..." ||
      !p2Lower;

    if (!needsP1 && !needsP2) return;

    const hydrate = async () => {
      const state = useGameStore.getState();
      const match = matchDataRef.current;
      if (!match) return;

      const profilesToFetch = [];
      if (
        needsP1 &&
        match.player1_id &&
        !hydratedProfilesRef.current.has(match.player1_id)
      ) {
        profilesToFetch.push(match.player1_id);
      }
      if (
        needsP2 &&
        match.player2_id &&
        !hydratedProfilesRef.current.has(match.player2_id)
      ) {
        profilesToFetch.push(match.player2_id);
      }

      if (profilesToFetch.length === 0) return;

      // Mark as "attempted" to avoid spamming while pending
      profilesToFetch.forEach((id) => hydratedProfilesRef.current.add(id));

      console.log("Hydrating profiles background...", profilesToFetch);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", profilesToFetch);

      if (!profiles) return;

      const p1Profile = profiles.find((p) => p.id === match.player1_id);
      const p2Profile = profiles.find((p) => p.id === match.player2_id);

      const updates: any = {};
      if (needsP1 && p1Profile) {
        updates.player1 = {
          ...state.player1,
          name: p1Profile.username || p1Profile.full_name || "Player 1",
          avatar_url: p1Profile.avatar_url || state.player1.avatar_url,
        };
      }
      if (needsP2 && p2Profile) {
        updates.player2 = {
          ...state.player2,
          name: p2Profile.username || p2Profile.full_name || "Player 2",
          avatar_url: p2Profile.avatar_url || state.player2.avatar_url,
        };
      }

      if (Object.keys(updates).length > 0) {
        console.log("Profiles hydrated, updating state locally...");
        useGameStore.setState(updates);

        if (isHostRef.current) {
          console.log("Host syncing names to DB...");
          const newState = { ...useGameStore.getState(), ...updates };
          await supabase
            .from("matches")
            .update({ state: newState })
            .eq("id", matchId);
        }
      }
    };

    const timeout = setTimeout(hydrate, 500); // Faster check
    return () => clearTimeout(timeout);
  }, [mode, isConnected, matchId, p1Name, p2Name]);

  return {
    isConnected,
    opponentDisconnected,
    opponentReady,
    myReady,
    initError,
  };
};
