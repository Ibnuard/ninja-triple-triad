"use client";

import { useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import { Card, Cell, BoardMechanicState } from "../types/game";
import { GauntletRank } from "../constants/gauntlet";
import { calculateFlips, applyElementalPassives } from "./game-logic";

interface Move {
  cardId: string;
  r: number;
  c: number;
  score: number;
}

interface AIPersonality {
  aggression: number; // 0-1 (weight for flips)
  defensiveness: number; // 0-1 (weight for safe spots/vulnerability)
  riskTolerance: number; // 0-1 (randomness/blunder chance)
  favoriteElements: string[];
}

const RANK_PERSONALITIES: Record<GauntletRank, AIPersonality> = {
  "Genin": { aggression: 0.3, defensiveness: 0.2, riskTolerance: 0.8, favoriteElements: [] },
  "Chunin": { aggression: 0.6, defensiveness: 0.4, riskTolerance: 0.5, favoriteElements: [] },
  "Jounin": { aggression: 0.4, defensiveness: 0.8, riskTolerance: 0.3, favoriteElements: [] },
  "Anbu": { aggression: 0.6, defensiveness: 0.7, riskTolerance: 0.2, favoriteElements: [] },
  "Kage": { aggression: 0.7, defensiveness: 0.6, riskTolerance: 0.2, favoriteElements: [] },
  "Rikudo": { aggression: 0.8, defensiveness: 0.5, riskTolerance: 0.1, favoriteElements: [] },
};

export const useComputerAI = ({
  isPaused = false,
  rank = "Genin"
}: {
  isPaused?: boolean;
  rank?: GauntletRank;
} = {}) => {
  const { currentPlayerId, player1, player2, board, placeCard, phase, selectCard, mechanic } = useGameStore();

  useEffect(() => {
    if (isPaused) return;
    if (phase !== "playing") return;
    if (currentPlayerId !== "player2") return;
    if (!player2.isComputer) return;

    const timer = setTimeout(() => {
      if (player2.hand.length === 0) return;

      const personality = RANK_PERSONALITIES[rank];
      const move = getBestMove(rank, personality, player2.hand, player1.hand, board, mechanic);

      if (move) {
        selectCard(move.cardId);
        placeCard(move.r, move.c);
      }
    }, 1000 + Math.random() * 1000);

    return () => clearTimeout(timer);
  }, [currentPlayerId, phase, player2.isComputer, player2.hand.length, board, isPaused, rank, mechanic]);
};

function getBestMove(
  rank: GauntletRank,
  personality: AIPersonality,
  hand: Card[],
  opponentHand: Card[],
  board: Cell[][],
  mechanic: BoardMechanicState
): Move | null {
  const availableSpots: { r: number; c: number }[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!board[r][c].card) availableSpots.push({ r, c });
    }
  }

  if (availableSpots.length === 0) return null;

  // Blunder check based on risk tolerance
  if (Math.random() < personality.riskTolerance * 0.3) {
    const randomSpot = availableSpots[Math.floor(Math.random() * availableSpots.length)];
    const randomCard = hand[Math.floor(Math.random() * hand.length)];
    return { cardId: randomCard.id, r: randomSpot.r, c: randomSpot.c, score: 0 };
  }

  const depth = (rank === "Anbu" || rank === "Kage" || rank === "Rikudo") ? 2 : 1;
  const moves = evaluateMoves(hand, opponentHand, availableSpots, board, mechanic, personality, depth);

  return moves[0] || null;
}

function evaluateMoves(
  hand: Card[],
  opponentHand: Card[],
  spots: { r: number; c: number }[],
  board: Cell[][],
  mechanic: BoardMechanicState,
  personality: AIPersonality,
  depth: number
): Move[] {
  const moves: Move[] = [];

  for (const card of hand) {
    for (const spot of spots) {
      const score = minimax(
        board,
        depth,
        -Infinity,
        Infinity,
        true,
        card,
        spot.r,
        spot.c,
        hand,
        opponentHand,
        mechanic,
        personality
      );
      moves.push({ cardId: card.id, r: spot.r, c: spot.c, score });
    }
  }

  return moves.sort((a, b) => b.score - a.score || Math.random() - 0.5);
}

function minimax(
  board: Cell[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  currentCard: Card,
  r: number,
  c: number,
  myHand: Card[],
  oppHand: Card[],
  mechanic: BoardMechanicState,
  personality: AIPersonality
): number {
  // Simulate the move
  const simulatedBoard = simulateMove(currentCard, r, c, board, isMaximizing ? "player2" : "player1", mechanic);

  if (depth === 0) {
    return calculateStaticScore(simulatedBoard, currentCard, r, c, isMaximizing, personality);
  }

  const availableSpots = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (!simulatedBoard[row][col].card) availableSpots.push({ r: row, c: col });
    }
  }

  if (availableSpots.length === 0) {
    return calculateStaticScore(simulatedBoard, currentCard, r, c, isMaximizing, personality);
  }

  if (isMaximizing) {
    // This was our move, now evaluate opponent's best response (minimizing our score)
    let minEval = Infinity;
    const nextHand = myHand.filter(card => card.id !== currentCard.id);

    for (const oppCard of oppHand) {
      for (const spot of availableSpots) {
        const evalScore = minimax(simulatedBoard, depth - 1, alpha, beta, false, oppCard, spot.r, spot.c, nextHand, oppHand, mechanic, personality);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  } else {
    // This was opponent's move, now evaluate our best response (maximizing our score)
    let maxEval = -Infinity;
    const nextOppHand = oppHand.filter(card => card.id !== currentCard.id);

    for (const myCard of myHand) {
      for (const spot of availableSpots) {
        const evalScore = minimax(simulatedBoard, depth - 1, alpha, beta, true, myCard, spot.r, spot.c, myHand, nextOppHand, mechanic, personality);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  }
}

function calculateStaticScore(
  board: Cell[][],
  card: Card,
  r: number,
  c: number,
  isMaximizing: boolean,
  personality: AIPersonality
): number {
  let score = 0;

  // 1. Board Control (Flips)
  let p1Count = 0;
  let p2Count = 0;
  board.flat().forEach(cell => {
    if (cell.owner === "player1") p1Count++;
    if (cell.owner === "player2") p2Count++;
  });

  // Base score is net board control for AI (player2)
  const netControl = p2Count - p1Count;
  score += netControl * 10 * personality.aggression;

  // 2. Positional Safety
  const isCorner = (r === 0 || r === 2) && (c === 0 || c === 2);
  const isEdge = r === 0 || r === 2 || c === 0 || c === 2;

  if (isCorner) score += 5 * personality.defensiveness;
  else if (isEdge) score += 2 * personality.defensiveness;

  // 3. Vulnerability (How easily can this card be flipped?)
  const vulnerability = calculateVulnerability(card, r, c, board);
  score -= vulnerability * 8 * personality.defensiveness;

  // 4. Personality: Element Preference
  if (personality.favoriteElements.includes(card.element)) {
    score += 3;
  }

  return score;
}

function calculateVulnerability(card: Card, r: number, c: number, board: Cell[][]): number {
  let vulnerability = 0;
  const directions = [
    { dr: -1, dc: 0, side: "top", oppSide: "bottom" },
    { dr: 1, dc: 0, side: "bottom", oppSide: "top" },
    { dr: 0, dc: -1, side: "left", oppSide: "right" },
    { dr: 0, dc: 1, side: "right", oppSide: "left" },
  ];

  for (const { dr, dc, side, oppSide } of directions) {
    const nr = r + dr;
    const nc = c + dc;

    if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
      const targetCell = board[nr][nc];
      if (!targetCell.card) {
        // Exposed side! Vulnerability depends on the stat value.
        // Lower stat = higher vulnerability.
        const statValue = (card.stats as any)[side];
        vulnerability += Math.max(0, 10 - statValue) * 0.5;
      }
    }
  }
  return vulnerability;
}

function simulateMove(
  card: Card,
  r: number,
  c: number,
  board: Cell[][],
  owner: "player1" | "player2",
  mechanic: BoardMechanicState
): Cell[][] {
  // 1. Place card
  let newBoard = board.map(row => row.map(cell => ({ ...cell })));
  newBoard[r][c] = {
    ...newBoard[r][c],
    card: { ...card },
    owner
  };

  // 2. Apply Passives (Rule Awareness)
  newBoard = applyElementalPassives(newBoard, mechanic);
  const updatedCard = newBoard[r][c].card!;

  // 3. Calculate and apply flips
  const flips = calculateFlips(newBoard, r, c, updatedCard, owner);
  flips.forEach(flip => {
    newBoard[flip.row][flip.col].owner = flip.newOwner;
  });

  // 4. Re-apply passives (some passives depend on board state/ownership)
  newBoard = applyElementalPassives(newBoard, mechanic);

  return newBoard;
}
