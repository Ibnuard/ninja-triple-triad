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
import {
  GAME_MECHANICS,
  GAME_ELEMENTS,
  JOKER_MODIFIER_RANGE,
} from "../constants/game";
import { UI_COLORS, DELAYS } from "../constants/ui";

interface GameStore extends GameState {
  // Actions
  initGame: (
    roomId: string | null,
    vsComputer: boolean,
    initialMechanic?: BoardMechanicType,
    activeElement?: ElementType | "random"
  ) => void;
  selectCard: (cardId: string) => void;
  placeCard: (row: number, col: number) => void;
  resetGame: () => void;
  selectedCardId: string | null;
  draggingCardId: string | null;
  draggingCard: Card | null;
  hoveredCell: { row: number; col: number } | null;
  setDraggingCardId: (cardId: string | null) => void;
  setHoveredCell: (cell: { row: number; col: number } | null) => void;
  setWinner: (winner: "player1" | "player2" | "draw") => void;

  // Online Multiplayer Actions
  moveSequence: number;
  applyRemoteMove: (moveData: {
    playerId: "player1" | "player2";
    row: number;
    col: number;
    card: Card;
    moveSequence: number;
  }) => void;
  setFullState: (state: Partial<GameState> & { moveSequence?: number }) => void;
  getMoveData: () => {
    board: BoardState;
    player1: Player;
    player2: Player;
    currentPlayerId: string;
    phase: GamePhase;
    winner: string | null;
    lastMove: any;
    moveSequence: number;
  };
}

const INITIAL_PLAYER_STATE: Player = {
  id: "",
  name: "",
  hand: [],
  capturedCount: 0,
  color: UI_COLORS.PLAYER1 as any,
  isComputer: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  roomId: null,
  board: createEmptyBoard(),
  player1: {
    ...INITIAL_PLAYER_STATE,
    id: "p1",
    name: "Player 1",
    color: UI_COLORS.PLAYER1 as any,
  },
  player2: {
    ...INITIAL_PLAYER_STATE,
    id: "p2",
    name: "Player 2",
    color: UI_COLORS.PLAYER2 as any,
  },
  currentPlayerId: "player1",
  phase: "lobby",
  winner: null,
  lastMove: null,
  selectedCardId: null,
  draggingCardId: null,
  draggingCard: null,
  hoveredCell: null,
  moveSequence: 0,
  mechanic: {
    type: "none",
    activeElement: "none",
    jokerModifiers: { player1: 0, player2: 0 },
  },

  initGame: (roomId, vsComputer, initialMechanic, activeElement) => {
    // 1. Determine Mechanic & Element
    let selectedMechanic = initialMechanic;
    if (!selectedMechanic || selectedMechanic === "random") {
      selectedMechanic =
        GAME_MECHANICS[Math.floor(Math.random() * GAME_MECHANICS.length)];
    }

    let mechanicState: BoardMechanicState = {
      type: selectedMechanic,
      activeElement: "none",
      jokerModifiers: { player1: 0, player2: 0 },
    };

    if (selectedMechanic === "random_elemental") {
      if (
        activeElement &&
        activeElement !== "random" &&
        activeElement !== "none"
      ) {
        mechanicState.activeElement = activeElement as ElementType;
      } else {
        mechanicState.activeElement =
          GAME_ELEMENTS[Math.floor(Math.random() * GAME_ELEMENTS.length)];
      }
    } else if (selectedMechanic === "joker") {
      const getMod = () => {
        const isPositive = Math.random() > 0.5;
        const val = Math.floor(Math.random() * (JOKER_MODIFIER_RANGE + 1));
        return isPositive ? val : -val;
      };
      mechanicState.jokerModifiers = {
        player1: getMod(),
        player2: getMod(),
      };
    }

    // 2. Set Initial State
    set({
      roomId,
      board: createEmptyBoard(),
      player1: {
        ...INITIAL_PLAYER_STATE,
        id: "p1",
        name: "Player 1",
        color: UI_COLORS.PLAYER1 as any,
        hand: [],
      },
      player2: {
        ...INITIAL_PLAYER_STATE,
        id: "p2",
        name: vsComputer ? "Computer" : "Player 2",
        color: UI_COLORS.PLAYER2 as any,
        isComputer: vsComputer,
        hand: [],
      },
      currentPlayerId:
        Math.floor(Math.random() * 10) < 5 ? "player1" : "player2",
      phase: "playing",
      winner: null,
      lastMove: null,
      selectedCardId: null,
      draggingCardId: null,
      draggingCard: null,
      hoveredCell: null,
      mechanic: mechanicState,
    });
  },

  selectCard: (cardId) => {
    const { phase, currentPlayerId, player1, player2, selectedCardId } = get();
    if (phase !== "playing") return;

    // If card is already selected, don't play sound again
    if (selectedCardId === cardId) return;

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

    // Play element-specific sound effect
    const elementSoundMap: Record<string, string> = {
      fire: SOUNDS.FIRE,
      water: SOUNDS.WATER,
      earth: SOUNDS.EARTH,
      wind: SOUNDS.WIND,
      lightning: SOUNDS.LIGHTNING,
    };

    const elementSound = elementSoundMap[card.element];
    if (elementSound) {
      playSound(elementSound);
    } else {
      playSound(SOUNDS.PLACE);
    }

    if (flips.length > 0) {
      setTimeout(() => playSound(SOUNDS.FLIP), DELAYS.FLIP_SOUND);
    }

    // Remove card from hand
    const newHand = [...currentPlayer.hand];
    newHand.splice(cardIndex, 1);

    // Update Player State (Hand & Flips)
    const newPlayer1 =
      currentPlayerId === "player1"
        ? {
            ...player1,
            hand: newHand,
            totalFlips: (player1.totalFlips || 0) + flips.length,
          }
        : { ...player1 };

    const newPlayer2 =
      currentPlayerId === "player2"
        ? {
            ...player2,
            hand: newHand,
            totalFlips: (player2.totalFlips || 0) + flips.length,
          }
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
      draggingCardId: null,
      draggingCard: null,
      hoveredCell: null,
      moveSequence: get().moveSequence + 1,
    });
  },

  // Apply move from remote player (no sounds, for receiving broadcast)
  applyRemoteMove: (moveData) => {
    const { board, player1, player2, moveSequence: currentSeq } = get();

    // Ignore if we already processed this or a newer move
    if (moveData.moveSequence <= currentSeq) {
      console.log(
        "Ignoring old/duplicate move",
        moveData.moveSequence,
        "current:",
        currentSeq
      );
      return;
    }

    const { playerId, row, col, card } = moveData;
    const cell = board[row][col];
    if (cell.card) return; // Already occupied

    // Create new board state
    let newBoard = [...board.map((r) => [...r])];
    newBoard[row][col] = {
      ...newBoard[row][col],
      card: { ...card },
      owner: playerId,
    };

    // Apply passives
    newBoard = applyElementalPassives(newBoard, get().mechanic);
    const placedCardUpdated = newBoard[row][col].card!;

    // Calculate flips
    const flips = calculateFlips(
      newBoard,
      row,
      col,
      placedCardUpdated,
      playerId
    );

    // Apply flips
    flips.forEach((flip) => {
      const originalOwner = newBoard[flip.row][flip.col].owner!;
      newBoard[flip.row][flip.col].owner = flip.newOwner;
      newBoard = handleFireRevenge(newBoard, flip.row, flip.col, originalOwner);
    });

    // Final passives
    newBoard = applyElementalPassives(newBoard, get().mechanic);

    // Update hands
    const currentPlayer = playerId === "player1" ? player1 : player2;
    const cardIndex = currentPlayer.hand.findIndex((c) => c.id === card.id);
    const newHand = [...currentPlayer.hand];
    if (cardIndex !== -1) {
      newHand.splice(cardIndex, 1);
    }

    const newPlayer1 =
      playerId === "player1"
        ? {
            ...player1,
            hand: newHand,
            totalFlips: (player1.totalFlips || 0) + flips.length,
          }
        : { ...player1 };

    const newPlayer2 =
      playerId === "player2"
        ? {
            ...player2,
            hand: newHand,
            totalFlips: (player2.totalFlips || 0) + flips.length,
          }
        : { ...player2 };

    // Check game over
    let nextPhase: GamePhase = "playing";
    let nextWinner: "player1" | "player2" | "draw" | null = null;

    if (isBoardFull(newBoard)) {
      nextPhase = "game_over";
      nextWinner = determineWinner(newBoard, newPlayer1, newPlayer2);
    }

    set({
      board: newBoard,
      player1: newPlayer1,
      player2: newPlayer2,
      currentPlayerId: playerId === "player1" ? "player2" : "player1",
      lastMove: { row, col, playerId },
      phase: nextPhase,
      winner: nextWinner,
      moveSequence: moveData.moveSequence,
      selectedCardId: null,
      draggingCardId: null,
      draggingCard: null,
      hoveredCell: null,
    });
  },

  // Set full state from initialization or reconnection
  setFullState: (state) => {
    set({
      ...state,
      moveSequence: state.moveSequence ?? 0,
      selectedCardId: null,
      draggingCardId: null,
      draggingCard: null,
      hoveredCell: null,
    });
  },

  // Get current state for persistence
  getMoveData: () => {
    const {
      board,
      player1,
      player2,
      currentPlayerId,
      phase,
      winner,
      lastMove,
      moveSequence,
    } = get();
    return {
      board,
      player1,
      player2,
      currentPlayerId,
      phase,
      winner,
      lastMove,
      moveSequence,
    };
  },

  setDraggingCardId: (cardId) => {
    if (get().draggingCardId === cardId) return;

    let card: Card | null = null;
    if (cardId) {
      const player =
        get().currentPlayerId === "player1" ? get().player1 : get().player2;
      card = player.hand.find((c) => c.id === cardId) || null;
    }

    set({ draggingCardId: cardId, draggingCard: card });
  },

  setHoveredCell: (cell) => {
    const current = get().hoveredCell;
    if (current?.row === cell?.row && current?.col === cell?.col) return;
    set({ hoveredCell: cell });
  },

  resetGame: () => {
    set({
      phase: "lobby",
      winner: null,
      board: createEmptyBoard(),
      player1: { ...get().player1, hand: [] },
      player2: { ...get().player2, hand: [] },
      selectedCardId: null,
      draggingCardId: null,
      draggingCard: null,
      hoveredCell: null,
      lastMove: null,
    });
  },

  setWinner: (winner) => set({ winner, phase: "game_over" }),
}));
