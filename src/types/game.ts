export type ElementType =
  | "fire"
  | "water"
  | "earth"
  | "wind"
  | "lightning"
  | "none";

export interface CardStats {
  top: number; // Chakra
  right: number; // ATK
  bottom: number; // DEF
  left: number; // Jutsu
}

export interface Card {
  id: string;
  name: string;
  stats: CardStats;
  baseStats: CardStats; // Original stats to prevent stacking
  element: ElementType;
  image: string; // URL or local path
  description?: string;
  rarity?: number;
  activePassives?: string[]; // IDs or names of active passives
  isBuffed?: boolean;
}

export interface Cell {
  row: number;
  col: number;
  card: Card | null;
  owner: "player1" | "player2" | null;
  element: ElementType; // For Elemental rule
}

export type BoardState = Cell[][];

export interface Player {
  id: string;
  name: string;
  hand: Card[]; // Cards currently available to play
  capturedCount: number; // Score
  color: string; // e.g. 'blue' or 'red'
  isComputer: boolean;
}

export type GamePhase = "lobby" | "deciding_turn" | "playing" | "game_over";

export interface GameState {
  roomId: string | null;
  board: BoardState;
  player1: Player;
  player2: Player;
  currentPlayerId: string; // 'player1' or 'player2'
  phase: GamePhase;
  winner: "player1" | "player2" | "draw" | null;
  lastMove: { row: number; col: number; playerId: string } | null;
}
