import { BoardMechanicType, Card } from "../types/game";

export type GauntletRank =
  | "Genin"
  | "Chunin"
  | "Jounin"
  | "Anbu"
  | "Kage"
  | "Rikudo";

export const RANK_THRESHOLDS: Record<GauntletRank, number> = {
  Genin: 0,
  Chunin: 200,
  Jounin: 500,
  Anbu: 1000,
  Kage: 2000,
  Rikudo: 5000,
};

export const OPPONENT_NAMES: Record<GauntletRank, string[]> = {
  Genin: ["Academy Student", "Genin Rookie", "Bandit"],
  Chunin: ["Chunin Exam Proctor", "Sound Ninja", "Mist Ninja"],
  Jounin: ["Kakashi Copy", "Guy Sensei", "Asuma"],
  Anbu: ["Root Member", "Masked Ninja", "Itachi Clone"],
  Kage: ["Raikage", "Tsuchikage", "Mizukage", "Kazekage"],
  Rikudo: ["Madara", "Kaguya", "Sage of Six Paths"],
};

export interface BossConfig {
  name: string;
  bossKey: string;
  image: string;
  mechanic: BoardMechanicType;
  deck: Card[];
}

export const BOSS_CONFIGS: Record<GauntletRank, BossConfig> = {
  Genin: {
    name: "Zabuza Momochi",
    bossKey: "zabuza",
    image: "/images/bosses/zabuza.png",
    mechanic: "foggy",
    deck: [],
  },
  Chunin: {
    name: "Orochimaru",
    bossKey: "orochimaru",
    image: "/images/bosses/orochimaru.png",
    mechanic: "poison",
    deck: [],
  },
  Jounin: {
    name: "Pain",
    bossKey: "pain",
    image: "/images/bosses/pain.webp",
    mechanic: "joker",
    deck: [],
  },
  Anbu: {
    name: "Madara Uchiha",
    bossKey: "madara",
    image: "/images/bosses/madara.webp",
    mechanic: "random_elemental",
    deck: [],
  },
  Kage: {
    name: "Kaguya Otsutsuki",
    bossKey: "kaguya",
    image: "/images/bosses/kaguya.webp",
    mechanic: "random_elemental",
    deck: [],
  },
  Rikudo: {
    name: "The Final Sage",
    bossKey: "kaguya",
    image: "/images/bosses/kaguya.webp",
    mechanic: "random_elemental",
    deck: [],
  },
};

export const GAUNTLET_SCORING = {
  BASE_WIN: 20,
  BOARD_BONUS_PER_CARD: 3,
  DRAW_PENALTY_MULTIPLIER: 0.66,
  LOSS_PENALTY_MULTIPLIER: 0.5,
  LOSS_PENALTY: {
    Genin: 10,
    Chunin: 15,
    Jounin: 20,
    Anbu: 25,
    Kage: 30,
    Rikudo: 40,
  } as Record<GauntletRank, number>,
};
