import { supabase } from "../lib/supabase";
import { CARD_POOL } from "../data/cardPool";

async function migrateCards() {
  console.log("Starting migration...");

  const formattedCards = CARD_POOL.map((card) => ({
    id: card.id,
    name: card.name,
    element: card.element,
    image_url: card.image,
    description: card.description || "",
    rarity: card.rarity || "common",
    stat_top: card.stats.top,
    stat_right: card.stats.right,
    stat_bottom: card.stats.bottom,
    stat_left: card.stats.left,
  }));

  const { data, error } = await supabase
    .from("cards")
    .upsert(formattedCards, { onConflict: "id" });

  if (error) {
    console.error("Error migrating cards:", error);
  } else {
    console.log("Successfully migrated cards:", data);
  }
}

migrateCards();
