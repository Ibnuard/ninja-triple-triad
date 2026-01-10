import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Card, BoardMechanicType, ElementType } from "../types/game";

export type GauntletRank = "Genin" | "Chunin" | "Jounin" | "Anbu" | "Kage" | "Rikudo";

interface GauntletState {
    isActive: boolean;
    rank: GauntletRank;
    score: number;
    round: number;
    deck: Card[];
    lastBoss: string;
    isBossBattle: boolean;
    pendingRank: GauntletRank | null;

    // Actions
    startRun: (deck: Card[]) => void;
    endRun: () => void;
    processMatchResult: (winner: "player1" | "player2" | "draw", flips: number, boardCardCount?: number) => { scoreAdded: number; newRank: GauntletRank | null };
    getOpponentConfig: () => { deck: Card[]; mechanic: BoardMechanicType; activeElement?: ElementType; bossKey?: string; bossImage?: string };
}

export const RANK_THRESHOLDS: Record<GauntletRank, number> = {
    Genin: 0,
    Chunin: 200,
    Jounin: 500,
    Anbu: 1000,
    Kage: 2000,
    Rikudo: 5000,
};

const OPPONENT_NAMES: Record<GauntletRank, string[]> = {
    Genin: ["Academy Student", "Genin Rookie", "Bandit"],
    Chunin: ["Chunin Exam Proctor", "Sound Ninja", "Mist Ninja"],
    Jounin: ["Kakashi Copy", "Guy Sensei", "Asuma"],
    Anbu: ["Root Member", "Masked Ninja", "Itachi Clone"],
    Kage: ["Raikage", "Tsuchikage", "Mizukage", "Kazekage"],
    Rikudo: ["Madara", "Kaguya", "Sage of Six Paths"],
};

interface BossConfig {
    name: string;
    bossKey: string;
    image: string;
    mechanic: BoardMechanicType;
    deck: Card[];
}

const BOSS_CONFIGS: Record<GauntletRank, BossConfig> = {
    Genin: {
        name: "Zabuza Momochi",
        bossKey: "zabuza",
        image: "/images/bosses/zabuza.webp",
        mechanic: "foggy",
        deck: [], // Will be populated with dummy cards
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
        bossKey: "kaguya", // Fallback or new key
        image: "/images/bosses/kaguya.webp",
        mechanic: "random_elemental",
        deck: [],
    }
};

// Helper to generate dummy boss cards
const generateBossDeck = (rank: GauntletRank): Card[] => {
    let stat = 5;
    switch (rank) {
        case "Genin": stat = 6; break;
        case "Chunin": stat = 8; break;
        case "Jounin": stat = 10; break;
        case "Anbu": stat = 12; break;
        case "Kage": stat = 15; break;
        case "Rikudo": stat = 20; break;
    }
    return Array.from({ length: 5 }).map((_, i) => ({
        id: `boss-${rank}-${i}`,
        name: `Boss Card ${i + 1}`,
        element: "none",
        image: "",
        stats: { top: stat, bottom: stat, left: stat, right: stat },
        baseStats: { top: stat, bottom: stat, left: stat, right: stat },
    }));
};

// Populate boss decks
Object.keys(BOSS_CONFIGS).forEach((rank) => {
    BOSS_CONFIGS[rank as GauntletRank].deck = generateBossDeck(rank as GauntletRank);
});

import { useDeckStore } from "./useDeckStore";

export const useGauntletStore = create<GauntletState>()(
    persist(
        (set, get) => ({
            isActive: false,
            rank: "Genin",
            score: 0,
            round: 1,
            deck: [],
            lastBoss: "-",
            isBossBattle: false,
            pendingRank: null,

            startRun: (deck) => {
                set({
                    isActive: true,
                    rank: "Genin",
                    score: 0,
                    round: 1,
                    deck,
                    lastBoss: "-",
                    isBossBattle: false,
                    pendingRank: null,
                });
            },

            endRun: () => {
                const { score, lastBoss } = get();
                useDeckStore.getState().setLastRunStats(score, lastBoss);
                set({ isActive: false });
            },

            processMatchResult: (winner, flips, boardCardCount = 0) => {
                const { score, rank, round, isBossBattle, pendingRank } = get();

                // 1. Handle Boss Battle Outcome
                if (isBossBattle) {
                    if (winner === "player1") {
                        // Boss Defeated! Finalize Rank Up
                        const newRank = pendingRank || rank;
                        set({
                            rank: newRank,
                            isBossBattle: false,
                            pendingRank: null,
                            round: round + 1,
                        });
                        return { scoreAdded: 0, newRank };
                    } else {
                        // Boss Failed! Punishment and End Run
                        let finalScore = score;
                        if (winner === "draw") {
                            finalScore = Math.floor(score * 0.66); // Draw: 1/3 reduction
                        } else {
                            finalScore = Math.floor(score * 0.5); // Loss: 1/2 reduction
                        }
                        set({ score: finalScore, isActive: false, isBossBattle: false });
                        return { scoreAdded: 0, newRank: null };
                    }
                }

                // 2. Handle Normal Match Outcome
                if (winner !== "player1") {
                    set({ isActive: false }); // End run on loss or draw
                    return { scoreAdded: 0, newRank: null };
                }

                // Scoring Logic
                const baseWin = 20;
                // Bonus: 2 points per card on board
                const boardBonus = boardCardCount * 3;

                const scoreAdded = baseWin + boardBonus;
                const newScore = score + scoreAdded;

                // Rank Progression Check
                let nextRank: GauntletRank = rank;
                if (newScore >= RANK_THRESHOLDS.Rikudo) nextRank = "Rikudo";
                else if (newScore >= RANK_THRESHOLDS.Kage) nextRank = "Kage";
                else if (newScore >= RANK_THRESHOLDS.Anbu) nextRank = "Anbu";
                else if (newScore >= RANK_THRESHOLDS.Jounin) nextRank = "Jounin";
                else if (newScore >= RANK_THRESHOLDS.Chunin) nextRank = "Chunin";

                // Trigger Boss Battle if rank threshold crossed
                if (nextRank !== rank) {
                    set({
                        score: newScore,
                        isBossBattle: true,
                        pendingRank: nextRank,
                        lastBoss: BOSS_CONFIGS[rank].name, // Current rank's boss to advance
                    });
                    return { scoreAdded, newRank: null }; // No rank up yet!
                }

                // Normal progression
                const possibleNames = OPPONENT_NAMES[rank];
                const nextBoss = possibleNames[Math.floor(Math.random() * possibleNames.length)];

                set({
                    score: newScore,
                    round: round + 1,
                    lastBoss: nextBoss,
                });

                return { scoreAdded, newRank: null };
            },

            getOpponentConfig: () => {
                const { rank, isBossBattle } = get();

                if (isBossBattle) {
                    const boss = BOSS_CONFIGS[rank];
                    return {
                        deck: boss.deck,
                        mechanic: boss.mechanic,
                        bossKey: boss.bossKey,
                        bossImage: boss.image,
                        activeElement: boss.mechanic === "random_elemental" ? (["fire", "water", "earth", "wind", "lightning"] as ElementType[])[Math.floor(Math.random() * 5)] : undefined
                    };
                }

                // Normal Opponent Logic...

                // 1. Generate Deck based on Rank Difficulty
                let minStat = 1;
                let maxStat = 4;

                switch (rank) {
                    case "Genin": maxStat = 4; break;
                    case "Chunin": maxStat = 6; break;
                    case "Jounin": maxStat = 7; break;
                    case "Anbu": maxStat = 8; break;
                    case "Kage": maxStat = 10; break;
                    case "Rikudo": maxStat = 15; break; // Boss level
                }

                const deck: Card[] = Array.from({ length: 5 }).map((_, i) => {
                    const stats = {
                        top: Math.floor(Math.random() * (maxStat - minStat + 1)) + minStat,
                        bottom: Math.floor(Math.random() * (maxStat - minStat + 1)) + minStat,
                        left: Math.floor(Math.random() * (maxStat - minStat + 1)) + minStat,
                        right: Math.floor(Math.random() * (maxStat - minStat + 1)) + minStat,
                    };
                    const elements: ElementType[] = ["fire", "water", "earth", "wind", "lightning"];

                    return {
                        id: `gauntlet-opp-${i}-${Math.random()}`,
                        name: `Enemy ${rank}`,
                        element: elements[Math.floor(Math.random() * elements.length)],
                        image: "",
                        stats: { ...stats },
                        baseStats: { ...stats },
                    };
                });

                // 2. Determine Board Mechanic
                let mechanic: BoardMechanicType = "none";
                let activeElement: ElementType | undefined = undefined;

                if (rank === "Genin" || rank === "Chunin" || rank === "Jounin") {
                    mechanic = "none";
                } else if (rank === "Anbu") {
                    mechanic = "random_elemental";
                    const elements: ElementType[] = ["fire", "water", "earth", "wind", "lightning"];
                    activeElement = elements[Math.floor(Math.random() * elements.length)];
                } else {
                    // Kage & Rikudo: Random everything
                    const mechanics: BoardMechanicType[] = ["random_elemental", "poison", "foggy", "joker"];
                    mechanic = mechanics[Math.floor(Math.random() * mechanics.length)];

                    if (mechanic === "random_elemental") {
                        const elements: ElementType[] = ["fire", "water", "earth", "wind", "lightning"];
                        activeElement = elements[Math.floor(Math.random() * elements.length)];
                    }
                }

                return { deck, mechanic, activeElement };
            },
        }),
        {
            name: "gauntlet-storage",
        }
    )
);
