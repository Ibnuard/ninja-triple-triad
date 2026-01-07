import { create } from "zustand";
import {
  BoardState,
  Card,
  GamePhase,
  GameState,
  Player,
  ElementType,
  BoardMechanicType,
  BoardMechanicState,
} from "../types/game";
import {
  calculateFlips,
  createEmptyBoard,
  determineWinner,
  isBoardFull,
  applyElementalPassives,
  handleFireRevenge,
} from "../lib/game-logic";
import { playSound, SOUNDS } from "../lib/sounds";

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
  mechanic: {
    type: "none",
    activeElement: "none",
    jokerModifiers: { player1: 0, player2: 0 },
  },

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
      currentPlayerId:
        Math.floor(Math.random() * 10) < 5 ? "player1" : "player2",
      phase: "playing",
      winner: null,
      lastMove: null,
      selectedCardId: null,
    });

    // Initialize Mechanics
    const mechanics: BoardMechanicType[] = [
      "random_elemental",
      "poison",
      "foggy",
      "joker",
    ];
    const selectedMechanic =
      mechanics[Math.floor(Math.random() * mechanics.length)];
    // DEBUG: Force specific mechanic if needed
    // const selectedMechanic = "random_elemental";

    let mechanicState: BoardMechanicState = {
      type: selectedMechanic,
      activeElement: "none",
      jokerModifiers: { player1: 0, player2: 0 },
    };

    if (selectedMechanic === "random_elemental") {
      const elements: ElementType[] = [
        "fire",
        "water",
        "earth",
        "wind",
        "lightning",
      ];
      mechanicState.activeElement =
        elements[Math.floor(Math.random() * elements.length)];
    } else if (selectedMechanic === "joker") {
      // +0-2 or -0-2. Simplified: Random integer between -2 and 2?
      // Prompt says: "random antara + 0-2 ... atau - 0-2".
      // Let's interpret as: 50% chance POSITIVE (0,1,2), 50% chance NEGATIVE (0,-1,-2).
      const getMod = () => {
        const isPositive = Math.random() > 0.5;
        const val = Math.floor(Math.random() * 3); // 0, 1, 2
        return isPositive ? val : -val;
      };
      mechanicState.jokerModifiers = {
        player1: getMod(),
        player2: getMod(),
      };
    }

    set({ mechanic: mechanicState });
  },

  selectCard: (cardId) => {
    const { phase, currentPlayerId, player1, player2 } = get();
    if (phase !== "playing") return;

    // Only allow selecting own cards
    const player = currentPlayerId === "player1" ? player1 : player2;
    const card = player.hand.find((c) => c.id === cardId);

    if (card) {
      playSound(SOUNDS.CLICK);
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
    let newBoard = [...board.map((row) => [...row])];
    newBoard[row][col] = {
      ...newBoard[row][col],
      card: { ...card }, // Deep copy for mutation
      owner: currentPlayerId as "player1" | "player2",
    };

    // 1. Initial Passive Application (Get buffs for the placed card)
    newBoard = applyElementalPassives(newBoard, get().mechanic);
    const placedCardUpdated = newBoard[row][col].card!;

    // 2. Calculate flips (Lightning protection is inside)
    const flips = calculateFlips(
      newBoard,
      row,
      col,
      placedCardUpdated,
      currentPlayerId as "player1" | "player2"
    );

    // 3. Apply flips and Fire revenge
    flips.forEach((flip) => {
      const originalOwner = newBoard[flip.row][flip.col].owner!;
      newBoard[flip.row][flip.col].owner = flip.newOwner;

      // Fire Revenge if the flipped card is Fire
      newBoard = handleFireRevenge(newBoard, flip.row, flip.col, originalOwner);
    });

    // 4. Final Passive Application (Update all cards after ownership changes)
    newBoard = applyElementalPassives(newBoard, get().mechanic);

    playSound(SOUNDS.PLACE);
    if (flips.length > 0) {
      setTimeout(() => playSound(SOUNDS.FLIP), 200);
    }

    // Remove card from hand
    const newHand = [...currentPlayer.hand];
    newHand.splice(cardIndex, 1);

    const newPlayer1 =
      currentPlayerId === "player1"
        ? { ...player1, hand: newHand }
        : { ...player1 };

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

    if (nextPhase === "game_over" && nextWinner) {
      if (nextWinner === "draw") {
        playSound(SOUNDS.DRAW);
      } else if (nextWinner === "player1") {
        playSound(SOUNDS.WIN);
      } else {
        playSound(SOUNDS.LOSE);
      }
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
      player1: { ...get().player1, hand: [] },
      player2: { ...get().player2, hand: [] },
      selectedCardId: null,
      lastMove: null,
    });
  },

  setWinner: (winner) => set({ winner, phase: "game_over" }),
}));
