import { supabase } from "./supabase";
import { calculateNewRankPoints, RANK_POINTS } from "../constants/onlineRanks";

export type MatchResult = "win" | "draw" | "loss";

/**
 * Update player's rank points and match statistics after an online game
 */
export async function updatePlayerRankAfterMatch(
  userId: string,
  result: MatchResult
): Promise<{ success: boolean; newPoints?: number; error?: string }> {
  try {
    // First, get current profile stats
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("rank_points, total_matches, wins, losses, draws")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      console.error("Failed to fetch profile for rank update:", fetchError);
      return { success: false, error: "Failed to fetch profile" };
    }

    const currentPoints = profile.rank_points || 0;
    const newPoints = calculateNewRankPoints(currentPoints, result);

    // Prepare update data
    const updateData: Record<string, number> = {
      rank_points: newPoints,
      total_matches: (profile.total_matches || 0) + 1,
    };

    // Update win/loss/draw counters
    switch (result) {
      case "win":
        updateData.wins = (profile.wins || 0) + 1;
        break;
      case "draw":
        updateData.draws = (profile.draws || 0) + 1;
        break;
      case "loss":
        updateData.losses = (profile.losses || 0) + 1;
        break;
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update rank points:", updateError);
      return { success: false, error: "Failed to update rank" };
    }

    console.log(
      `Rank updated for ${userId}: ${currentPoints} -> ${newPoints} (${result})`
    );

    return { success: true, newPoints };
  } catch (err) {
    console.error("Error updating player rank:", err);
    return { success: false, error: "Unexpected error" };
  }
}

/**
 * Get point change for a match result (for display purposes)
 */
export function getPointChange(result: MatchResult): number {
  switch (result) {
    case "win":
      return RANK_POINTS.WIN;
    case "draw":
      return RANK_POINTS.DRAW;
    case "loss":
      return RANK_POINTS.LOSS;
  }
}
