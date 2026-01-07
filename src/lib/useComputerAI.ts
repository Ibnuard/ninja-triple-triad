import { useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

export const useComputerAI = ({ isPaused = false }: { isPaused?: boolean } = {}) => {
  const { currentPlayerId, player2, board, placeCard, phase } = useGameStore();

  useEffect(() => {
    if (isPaused) return;
    if (phase !== "playing") return;
    if (currentPlayerId !== "player2") return;
    if (!player2.isComputer) return;

    // Simple Delay for "Thinking"
    const timer = setTimeout(() => {
      // AI Logic:
      // 1. Pick a random card from hand
      if (player2.hand.length === 0) return;
      const randomCardIndex = Math.floor(Math.random() * player2.hand.length);
      const cardToPlay = player2.hand[randomCardIndex];

      // 2. Select the card (store action needs to support this or we just bypass selection for AI)
      // Actually our placeCard needs a selectedCardId.
      // We should probably add a specific "aiMove" action or just use selectCard -> placeCard

      useGameStore.getState().selectCard(cardToPlay.id);

      // 3. Find available spots
      const availableSpots: { r: number; c: number }[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (!board[r][c].card) {
            availableSpots.push({ r, c });
          }
        }
      }

      if (availableSpots.length > 0) {
        // 4. Pick random spot
        const randomSpot =
          availableSpots[Math.floor(Math.random() * availableSpots.length)];
        placeCard(randomSpot.r, randomSpot.c);
      }
    }, 1000 + Math.random() * 1000); // 1-2s delay

    return () => clearTimeout(timer);
  }, [currentPlayerId, phase, player2.isComputer, player2.hand.length, board, isPaused]); // Re-run when turn changes
};
