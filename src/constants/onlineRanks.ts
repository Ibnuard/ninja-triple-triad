// Online Ranking System Constants and Helpers

export type OnlineRank =
  | "genin"
  | "chunin"
  | "jounin"
  | "anbu"
  | "kage"
  | "rikudo";

export const RANK_THRESHOLDS: Record<OnlineRank, { min: number; max: number }> =
  {
    genin: { min: 0, max: 50 },
    chunin: { min: 51, max: 100 },
    jounin: { min: 101, max: 200 },
    anbu: { min: 201, max: 300 },
    kage: { min: 301, max: 500 },
    rikudo: { min: 501, max: Infinity },
  };

export const RANK_DISPLAY: Record<
  OnlineRank,
  { name: string; nameId: string; color: string; icon: string }
> = {
  genin: { name: "Genin", nameId: "Genin", color: "text-gray-400", icon: "🥷" },
  chunin: {
    name: "Chunin",
    nameId: "Chunin",
    color: "text-green-400",
    icon: "⚔️",
  },
  jounin: {
    name: "Jounin",
    nameId: "Jounin",
    color: "text-blue-400",
    icon: "🎯",
  },
  anbu: { name: "Anbu", nameId: "Anbu", color: "text-purple-400", icon: "🦊" },
  kage: { name: "Kage", nameId: "Kage", color: "text-orange-400", icon: "👑" },
  rikudo: {
    name: "Rikudo",
    nameId: "Rikudo",
    color: "text-yellow-400",
    icon: "✨",
  },
};

export const RANK_POINTS = {
  WIN: 3,
  DRAW: 1,
  LOSS: -3,
  MIN_POINTS: 0,
};

/**
 * Get rank from points
 */
export function getRankFromPoints(points: number): OnlineRank {
  if (points >= RANK_THRESHOLDS.rikudo.min) return "rikudo";
  if (points >= RANK_THRESHOLDS.kage.min) return "kage";
  if (points >= RANK_THRESHOLDS.anbu.min) return "anbu";
  if (points >= RANK_THRESHOLDS.jounin.min) return "jounin";
  if (points >= RANK_THRESHOLDS.chunin.min) return "chunin";
  return "genin";
}

/**
 * Calculate new rank points after a match
 */
export function calculateNewRankPoints(
  currentPoints: number,
  result: "win" | "draw" | "loss"
): number {
  let delta = 0;
  switch (result) {
    case "win":
      delta = RANK_POINTS.WIN;
      break;
    case "draw":
      delta = RANK_POINTS.DRAW;
      break;
    case "loss":
      delta = RANK_POINTS.LOSS;
      break;
  }

  const newPoints = currentPoints + delta;
  return Math.max(RANK_POINTS.MIN_POINTS, newPoints);
}

/**
 * Get progress percentage within current rank
 */
export function getRankProgress(points: number): number {
  const rank = getRankFromPoints(points);
  const { min, max } = RANK_THRESHOLDS[rank];

  if (max === Infinity) {
    // For rikudo, show how far above min
    return Math.min(100, ((points - min) / 100) * 100);
  }

  const range = max - min + 1;
  const progress = ((points - min) / range) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Get points needed for next rank
 */
export function getPointsToNextRank(points: number): number | null {
  const rank = getRankFromPoints(points);
  if (rank === "rikudo") return null; // Already max rank

  const { max } = RANK_THRESHOLDS[rank];
  return max + 1 - points;
}
