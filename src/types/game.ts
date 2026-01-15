export type ElementType =
  | "fire"
  | "water"
  | "earth"
  | "wind"
  | "lightning"
  | "none";

export type CardRarity = "common" | "rare" | "epic" | "legend" | "special";

export interface CardStats {
  top: number; // Genjutsu
  right: number; // Taijutsu
  bottom: number; // Chakra
  left: number; // Ninjutsu
}

export interface Card {
  id: string;
  name: string;
  stats: CardStats;
  baseStats: CardStats; // Original stats to prevent stacking
  element: ElementType;
  image: string; // URL or local path
  description?: string;
  rarity?: CardRarity;
  activePassives?: string[]; // IDs or names of active passives
  isBuffed?: boolean;
  isInit?: boolean;
  cp?: number;
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
  totalFlips?: number; // Total cards flipped during match
  color: string; // e.g. 'blue' or 'red'
  isComputer: boolean;
  avatar_url?: string;
}

export type GamePhase =
  | "lobby"
  | "waiting"
  | "preparing" // Online: Both players connected, loading data
  | "deciding_turn"
  | "playing"
  | "game_over";

export type BoardMechanicType =
  | "none"
  | "random"
  | "random_elemental"
  | "poison"
  | "foggy"
  | "joker";

export interface BoardMechanicState {
  type: BoardMechanicType;
  activeElement: ElementType; // For random_elemental
  jokerModifiers: {
    player1: number;
    player2: number;
  };
}

export interface GameState {
  roomId: string | null;
  board: BoardState;
  player1: Player;
  player2: Player;
  currentPlayerId: string; // 'player1' or 'player2'
  phase: GamePhase;
  winner: "player1" | "player2" | "draw" | null;
  lastMove: { row: number; col: number; playerId: string } | null;
  mechanic: BoardMechanicState;
}
