import { create } from "zustand";
import { BoardState, Card, GamePhase, GameState, Player } from "../types/game";
import {
  calculateFlips,
  createEmptyBoard,
  determineWinner,
  isBoardFull,
} from "../lib/game-logic";

interface GameStore extends GameState {
  // Actions
  initGame: (roomId: string | null, vsComputer: boolean) => void;
  selectCard: (cardId: string) => void;
  placeCard: (row: number, col: number) => void;
  resetGame: () => void;
  selectedCardId: string | null;
  setWinner: (winner: "player1" | "player2" | "draw") => void;
}

const INITIAL_PLAYER_STATE: Player = {
  id: "",
  name: "",
  hand: [],
  capturedCount: 0,
  color: "blue",
  isComputer: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  roomId: null,
  board: createEmptyBoard(),
  player1: {
    ...INITIAL_PLAYER_STATE,
    id: "p1",
    name: "Player 1",
    color: "blue",
  },
  player2: {
    ...INITIAL_PLAYER_STATE,
    id: "p2",
    name: "Player 2",
    color: "red",
  }, // Will be overwritten on init
  currentPlayerId: "p1",
  phase: "lobby",
  winner: null,
  lastMove: null,
  selectedCardId: null,

  initGame: (roomId, vsComputer) => {
    set({
      roomId,
      board: createEmptyBoard(),
      player1: {
        ...INITIAL_PLAYER_STATE,
        id: "p1",
        name: "Player 1",
        color: "blue",
        hand: [], // Should be populated with selected cards
      },
      player2: {
        ...INITIAL_PLAYER_STATE,
        id: "p2",
        name: vsComputer ? "Computer" : "Player 2",
        color: "red",
        isComputer: vsComputer,
        hand: [],
      },
      currentPlayerId: "player1", // Force Player 1 start for debugging
      phase: "playing", // Skip deck selection for MVP
      winner: null,
      lastMove: null,
      selectedCardId: null,
    });
  },

  selectCard: (cardId) => {
    const { phase, currentPlayerId, player1, player2 } = get();
    if (phase !== "playing") return;

    // Only allow selecting own cards
    const player = currentPlayerId === "player1" ? player1 : player2;
    const card = player.hand.find((c) => c.id === cardId);

    if (card) {
      set({ selectedCardId: cardId });
    }
  },

  placeCard: (row, col) => {
    const { board, selectedCardId, currentPlayerId, player1, player2, phase } =
      get();
    if (phase !== "playing" || !selectedCardId) return;

    const cell = board[row][col];
    if (cell.card) return; // Occupied

    const currentPlayer = currentPlayerId === "player1" ? player1 : player2;
    const cardIndex = currentPlayer.hand.findIndex(
      (c) => c.id === selectedCardId
    );
    if (cardIndex === -1) return;

    const card = currentPlayer.hand[cardIndex];

    // Create new board state
    const newBoard = [...board.map((row) => [...row])];
    newBoard[row][col] = {
      ...newBoard[row][col],
      card,
      owner: currentPlayerId as "player1" | "player2",
    };

    // Calculate flips
    const flips = calculateFlips(
      newBoard,
      row,
      col,
      card,
      currentPlayerId as "player1" | "player2"
    );
    flips.forEach((flip) => {
      newBoard[flip.row][flip.col].owner = flip.newOwner;
    });

    // Remove card from hand
    const newHand = [...currentPlayer.hand];
    newHand.splice(cardIndex, 1);

    const newPlayer1 =
      currentPlayerId === "player1"
        ? { ...player1, hand: newHand }
        : { ...player1 }; // No change

    const newPlayer2 =
      currentPlayerId === "player2"
        ? { ...player2, hand: newHand }
        : { ...player2 };

    // Determine next state
    let nextPhase: GamePhase = phase;
    let nextWinner: "player1" | "player2" | "draw" | null = null;

    if (isBoardFull(newBoard)) {
      nextPhase = "game_over";
      nextWinner = determineWinner(newBoard, newPlayer1, newPlayer2);
    }

    set({
      board: newBoard,
      player1: newPlayer1,
      player2: newPlayer2,
      currentPlayerId: currentPlayerId === "player1" ? "player2" : "player1",
      selectedCardId: null,
      lastMove: { row, col, playerId: currentPlayerId },
      phase: nextPhase,
      winner: nextWinner,
    });
  },

  resetGame: () => {
    set({
      phase: "lobby",
      winner: null,
      board: createEmptyBoard(),
    });
  },

  setWinner: (winner) => set({ winner, phase: "game_over" }),
}));
