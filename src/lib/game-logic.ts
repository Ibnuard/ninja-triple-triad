import { BoardState, Card, Cell, Player } from "../types/game";

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

        // PETIR (Lightning) Logic:
        // Tidak bisa di flip dari atas jika ditaruh di paling bawah
        if (
          dir.dirName === "bottom" &&
          adjR === 2 &&
          neighborCard.element === "lightning"
        ) {
          continue;
        }
        // Tidak bisa di flip dari bawah jika ditaruh paling atas
        if (
          dir.dirName === "top" &&
          adjR === 0 &&
          neighborCard.element === "lightning"
        ) {
          continue;
        }

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

// Elemental Passives Logic
export function applyElementalPassives(board: BoardState): BoardState {
  const newBoard = JSON.parse(JSON.stringify(board)) as BoardState;

  // Count total Wind cards on board for the global aura
  let windCount = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (newBoard[r][c].card?.element === "wind") {
        windCount++;
      }
    }
  }

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = newBoard[r][c];
      if (!cell.card) continue;

      const card = cell.card;

      // Reset to base stats before applying passives to prevent stacking
      card.stats = { ...card.baseStats };
      card.activePassives = [];
      card.isBuffed = false;

      // 1. TANAH (Earth) -> pojok bawah kanan (2,2) atau kiri (2,0) dan diatasnya ada kartu lawan
      // -> menaikan chakra (atas) + 2
      if (card.element === "earth") {
        if (r === 2 && (c === 0 || c === 2) && isValid(r - 1, c)) {
          const aboveChild = newBoard[r - 1][c];
          if (aboveChild.card && aboveChild.owner !== cell.owner) {
            card.stats.top += 2;
            card.activePassives.push("earth");
            card.isBuffed = true;
          }
        }
      }

      // 2. AIR (Water) -> jika tepat taruh ditengah (1,1) -> menaikan semua atribut + 1
      if (card.element === "water" && r === 1 && c === 1) {
        card.stats.top += 1;
        card.stats.right += 1;
        card.stats.bottom += 1;
        card.stats.left += 1;
        card.activePassives.push("water");
        card.isBuffed = true;
      }

      // 3. ANGIN (Wind) Global Aura
      // +1 ATK/JT, -1 CP per Wind card on board
      if (windCount > 0) {
        card.stats.right += windCount;
        card.stats.left += windCount;
        card.stats.top = Math.max(0, card.stats.top - windCount);
        card.isBuffed = true;

        // Only add 'wind' to activePassives if the card itself is Wind OR if we want to show it's affected?
        // Let's show it if affected
        card.activePassives.push("wind");
      }
    }
  }
  return newBoard;
}

// API (Fire) Revenge Logic: call this when a card is flipped
export function handleFireRevenge(
  board: BoardState,
  flippedRow: number,
  flippedCol: number,
  originalOwner: "player1" | "player2"
): BoardState {
  const newBoard = JSON.parse(JSON.stringify(board)) as BoardState;
  const card = newBoard[flippedRow][flippedCol].card;
  if (!card || card.element !== "fire") return newBoard;

  const opponentId = originalOwner === "player1" ? "player2" : "player1";

  // Target adjacent neighbors with specific stat penalties
  const targets = [
    { r: flippedRow - 1, c: flippedCol, stat: "bottom" as const }, // Above: kurangi DEF
    { r: flippedRow + 1, c: flippedCol, stat: "top" as const }, // Below: kurangi Chakra
    { r: flippedRow, c: flippedCol - 1, stat: "left" as const }, // Left: kurangi Jutsu
    { r: flippedRow, c: flippedCol + 1, stat: "right" as const }, // Right: kurangi ATK
  ];

  targets.forEach((target) => {
    if (isValid(target.r, target.c)) {
      const cell = newBoard[target.r][target.c];
      // Only penalize the one who caused the flip (the current opponent of the revenge)
      if (cell.card && cell.owner === opponentId) {
        // Reduksi permanen pada stats dan baseStats
        cell.card.stats[target.stat] = Math.max(
          0,
          cell.card.stats[target.stat] - 1
        );
        cell.card.baseStats[target.stat] = Math.max(
          0,
          cell.card.baseStats[target.stat] - 1
        );
        cell.card.isBuffed = true; // Mark as modified
      }
    }
  });

  return newBoard;
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
