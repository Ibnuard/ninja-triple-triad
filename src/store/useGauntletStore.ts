import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Card, BoardMechanicType, ElementType } from "../types/game";
import {
    GauntletRank,
    RANK_THRESHOLDS,
    OPPONENT_NAMES,
    BOSS_CONFIGS,
    GAUNTLET_SCORING
} from "../constants/gauntlet";
import { GAME_ELEMENTS } from "../constants/game";

interface GauntletState {
    isActive: boolean;
    rank: GauntletRank;
    score: number;
    round: number;
    wins: number;
    deck: Card[];
    lastBoss: string;
    isBossBattle: boolean;
    pendingRank: GauntletRank | null;
    pendingReward: boolean;

    // Actions
    startRun: (deck: Card[]) => void;
    endRun: () => void;
    processMatchResult: (winner: "player1" | "player2" | "draw", flips: number, boardCardCount?: number) => { scoreAdded: number; newRank: GauntletRank | null };
    getOpponentConfig: () => { deck: Card[]; mechanic: BoardMechanicType; activeElement?: ElementType; bossKey?: string; bossImage?: string };
    consumeReward: () => void;
}

// BOSS_CONFIGS is now imported from constants/gauntlet

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
            wins: 0,
            deck: [],
            lastBoss: "-",
            isBossBattle: false,
            pendingRank: null,
            pendingReward: false,

            startRun: (deck) => {
                set({
                    isActive: true,
                    rank: "Genin",
                    score: 0,
                    round: 1,
                    wins: 0,
                    deck,
                    lastBoss: "-",
                    isBossBattle: false,
                    pendingRank: null,
                    pendingReward: false,
                });
            },

            endRun: () => {
                const { score, lastBoss } = get();
                useDeckStore.getState().setLastRunStats(score, lastBoss);
                set({ isActive: false });
            },

            processMatchResult: (winner, flips, boardCardCount = 0) => {
                const { score, rank, round, wins, isBossBattle, pendingRank } = get();

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
                            wins: wins + 1,
                            pendingReward: (wins + 1) % 3 === 0,
                        });
                        return { scoreAdded: 0, newRank };
                    } else {
                        // Boss Failed! Punishment and End Run
                        let finalScore = score;
                        if (winner === "draw") {
                            finalScore = Math.floor(score * GAUNTLET_SCORING.DRAW_PENALTY_MULTIPLIER);
                        } else {
                            finalScore = Math.floor(score * GAUNTLET_SCORING.LOSS_PENALTY_MULTIPLIER);
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
                const baseWin = GAUNTLET_SCORING.BASE_WIN;
                // Bonus: points per card on board
                const boardBonus = boardCardCount * GAUNTLET_SCORING.BOARD_BONUS_PER_CARD;

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
                    wins: wins + 1,
                    lastBoss: nextBoss,
                    pendingReward: (wins + 1) % 3 === 0,
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
                        activeElement: boss.mechanic === "random_elemental" ? GAME_ELEMENTS[Math.floor(Math.random() * GAME_ELEMENTS.length)] : undefined
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

            consumeReward: () => {
                set({ pendingReward: false });
            },
        }),
        {
            name: "gauntlet-storage",
        }
    )
);
