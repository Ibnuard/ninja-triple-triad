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
    { r: -1, c: 0, myStat: placedCard.stats.top, oppStat: "bottom" as const },
    { r: 0, c: 1, myStat: placedCard.stats.right, oppStat: "left" as const },
    { r: 1, c: 0, myStat: placedCard.stats.bottom, oppStat: "top" as const },
    { r: 0, c: -1, myStat: placedCard.stats.left, oppStat: "right" as const },
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
        // Note: In standard Triple Triad, if stats are equal, no flip unless 'Same' rule is active.
        // We are implementing BASIC rules first: My Stat > Opponent Stat => Flip
        if (dir.myStat > neighborValue) {
          flips.push({ row: adjR, col: adjC, newOwner: ownerId });
        }
      }
    }
  }

  return flips;
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

// Calculate winner based on owned cards on board + cards in hand is not typically counted in board owner sum BUT
// in Triple Triad, total score = (Cards on Board controlled by player) + (Cards remaining in hand).
// Since each player plays 5 cards on a 9-cell board, one player plays 5, other plays 4.
// Actually standard rules: Winner is whoever has majority of the 10 total cards (Played + Hand) turned to their color.
// Simplification: Just count 'blue' vs 'red' on the board + unplayed hand?
// Let's count controlled cards on board + hand count.
export function determineWinner(
  board: BoardState,
  p1: Player,
  p2: Player
): "player1" | "player2" | "draw" {
  let p1Count = 0;
  let p2Count = 0;

  // Count board ownership
  board.flat().forEach((cell) => {
    if (cell.owner === "player1") p1Count++;
    if (cell.owner === "player2") p2Count++;
  });

  // Count hand (unplayed cards) - Assuming they are 'safe' points
  // Wait, in FF8, the score includes the hand.
  // Player 1 starts with 5 cards. Player 2 starts with 5 cards.
  // 9 cells. One player plays 5, one plays 4.
  // Remaining hand cards count towards score.
  if (p1.hand) p1Count += p1.hand.length;
  if (p2.hand) p2Count += p2.hand.length;

  if (p1Count > p2Count) return "player1";
  if (p2Count > p1Count) return "player2";
  return "draw";
}
