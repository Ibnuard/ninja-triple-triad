import {
  BoardMechanicState,
  BoardState,
  Card,
  Cell,
  Player,
} from "../types/game";

// Initialize a 3x3 empty board
export function createEmptyBoard(): BoardState {
  const board: BoardState = [];
  for (let r = 0; r < 3; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < 3; c++) {
      row.push({
        row: r,
        col: c,
        card: null,
        owner: null,
        element: "none",
      });
    }
    board.push(row);
  }
  return board;
}

// Check boundaries
function isValid(r: number, c: number): boolean {
  return r >= 0 && r < 3 && c >= 0 && c < 3;
}

// stableRoll: Returns a deterministic random number [0..max] based on string seed (card.id)
function stableRoll(id: string, max: number, offset: number = 0): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash + offset) % (max + 1);
}

// Logic to calculate flipped cards after placing a card
// Returns an array of coordinate updates: { row, col, newOwner }
export function calculateFlips(
  board: BoardState,
  row: number,
  col: number,
  placedCard: Card,
  ownerId: "player1" | "player2"
): { row: number; col: number; newOwner: "player1" | "player2" }[] {
  const flips: { row: number; col: number; newOwner: "player1" | "player2" }[] =
    [];
  const opponentId = ownerId === "player1" ? "player2" : "player1";

  // Directions: Top (-1, 0), Right (0, 1), Bottom (1, 0), Left (0, -1)
  const directions = [
    {
      r: -1,
      c: 0,
      myStat: placedCard.stats.top,
      oppStat: "bottom" as const,
      dirName: "top",
    },
    {
      r: 0,
      c: 1,
      myStat: placedCard.stats.right,
      oppStat: "left" as const,
      dirName: "right",
    },
    {
      r: 1,
      c: 0,
      myStat: placedCard.stats.bottom,
      oppStat: "top" as const,
      dirName: "bottom",
    },
    {
      r: 0,
      c: -1,
      myStat: placedCard.stats.left,
      oppStat: "right" as const,
      dirName: "left",
    },
  ];

  for (const dir of directions) {
    const adjR = row + dir.r;
    const adjC = col + dir.c;

    if (isValid(adjR, adjC)) {
      const neighborCell = board[adjR][adjC];

      // Check if neighbor has a card AND it belongs to opponent
      if (neighborCell.card && neighborCell.owner === opponentId) {
        const neighborCard = neighborCell.card;

        // @ts-ignore - dynamic key access based on oppStat which is strictly typed
        const neighborValue = neighborCard.stats[dir.oppStat];

        // Compare stats
        if (dir.myStat > neighborValue) {
          flips.push({ row: adjR, col: adjC, newOwner: ownerId });
        }
      }
    }
  }

  return flips;
}

// Elemental Passives Logic - Includes Board Mechanics
export function applyElementalPassives(
  board: BoardState,
  mechanic: BoardMechanicState
): BoardState {
  const newBoard = JSON.parse(JSON.stringify(board)) as BoardState;

  // Count occupied cells to determine "first 2 turns" (approx <= 4 cards placed)
  let occupiedCount = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (newBoard[r][c].card) occupiedCount++;
    }
  }
  const isFirstTwoTurns = occupiedCount <= 4;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = newBoard[r][c];
      if (!cell.card) continue;

      const card = cell.card;

      // Reset to base stats before applying passives
      card.stats = { ...card.baseStats };
      card.activePassives = [];
      card.isBuffed = false;

      // --- BOARD MECHANICS ---

      // 1. Random Elemental Board: Matches element -> +1 all stats
      if (
        mechanic.type === "random_elemental" &&
        card.element === mechanic.activeElement
      ) {
        card.stats.top += 1;
        card.stats.bottom += 1;
        card.stats.left += 1;
        card.stats.right += 1;
        card.activePassives.push("mechanic-elemental");
        card.isBuffed = true;
      }

      // 2. Poison Board: All cards -1 all stats
      if (mechanic.type === "poison") {
        card.stats.top -= 1;
        card.stats.bottom -= 1;
        card.stats.left -= 1;
        card.stats.right -= 1;
        card.activePassives.push("mechanic-poison");
        card.isBuffed = true; // technically debuffed, but stats changed
      }

      // 3. Joker Board: First 2 turns -> random modifier
      if (mechanic.type === "joker" && isFirstTwoTurns) {
        const modifier =
          cell.owner === "player1"
            ? mechanic.jokerModifiers.player1
            : mechanic.jokerModifiers.player2; // If null owner (shouldn't happen for card), ignore or default to 0
        if (modifier !== 0) {
          card.stats.top += modifier;
          card.stats.bottom += modifier;
          card.stats.left += modifier;
          card.stats.right += modifier;
          card.activePassives.push("mechanic-joker");
          card.isBuffed = true;
        }
      }

      // --- ORIGINAL ELEMENTAL PASSIVES ---

      // 1. TANAH (Earth) -> 3 row paling bawah (row 2) -> +1 genjutsu (top)
      if (card.element === "earth" && r === 2) {
        card.stats.top += 1;
        card.activePassives.push("earth");
        card.isBuffed = true;
      }

      // 2. ANGIN (Wind) -> 3 row paling atas (row 0) -> +1 chakra (bottom)
      if (card.element === "wind" && r === 0) {
        card.stats.bottom += 1;
        card.activePassives.push("wind");
        card.isBuffed = true;
      }

      // 3. AIR (Water)
      if (card.element === "water") {
        if (r === 1 && c === 1) {
          // Tengah (1,1) -> +1 semua
          card.stats.top += 1;
          card.stats.right += 1;
          card.stats.bottom += 1;
          card.stats.left += 1;
          card.activePassives.push("water");
          card.isBuffed = true;
        } else if (r === 1 && c === 0) {
          // Tengah kiri -> +1 taijutsu (right)
          card.stats.right += 1;
          card.activePassives.push("water");
          card.isBuffed = true;
        } else if (r === 1 && c === 2) {
          // Tengah kanan -> +1 ninjutsu (left)
          card.stats.left += 1;
          card.activePassives.push("water");
          card.isBuffed = true;
        }
      }

      // 4. API (Fire) -> corner -> +1 semua atribut
      if (card.element === "fire") {
        const isCorner = (r === 0 || r === 2) && (c === 0 || c === 2);
        if (isCorner) {
          card.stats.top += 1;
          card.stats.right += 1;
          card.stats.bottom += 1;
          card.stats.left += 1;
          card.activePassives.push("fire");
          card.isBuffed = true;
        }
      }

      // 5. PETIR (Lightning)
      if (card.element === "lightning") {
        if (r === 0) {
          // Row atas -> random +chakra (0-2)
          card.stats.bottom += stableRoll(card.id, 2, 0);
          card.activePassives.push("lightning");
          card.isBuffed = true;
        } else if (r === 1) {
          // Row tengah -> random +taijutsu (0-1) dan random +ninjutsu (0-1)
          card.stats.right += stableRoll(card.id, 1, 100); // use offset to avoid same roll
          card.stats.left += stableRoll(card.id, 1, 200);
          card.activePassives.push("lightning");
          card.isBuffed = true;
        } else if (r === 2) {
          // Row bawah -> random +genjutsu (0-2)
          card.stats.top += stableRoll(card.id, 2, 300);
          card.activePassives.push("lightning");
          card.isBuffed = true;
        }
      }
    }
  }
  return newBoard;
}

// Keep handleFireRevenge for now but it's largely superseded by the new simplified logic
export function handleFireRevenge(
  board: BoardState,
  flippedRow: number,
  flippedCol: number,
  originalOwner: "player1" | "player2"
): BoardState {
  return board; // NO-OP as per user's "simplified" request replacing old ones
}

// Helper to check if board is full
export function isBoardFull(board: BoardState): boolean {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!board[r][c].card) return false;
    }
  }
  return true;
}

// Calculate winner...
export function determineWinner(
  board: BoardState,
  p1: Player,
  p2: Player
): "player1" | "player2" | "draw" {
  let p1Count = 0;
  let p2Count = 0;

  board.flat().forEach((cell) => {
    if (cell.owner === "player1") p1Count++;
    if (cell.owner === "player2") p2Count++;
  });

  if (p1.hand) p1Count += p1.hand.length;
  if (p2.hand) p2Count += p2.hand.length;

  if (p1Count > p2Count) return "player1";
  if (p2Count > p1Count) return "player2";
  return "draw";
}
