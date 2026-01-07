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

    // Actions
    startRun: (deck: Card[]) => void;
    endRun: () => void;
    processMatchResult: (winner: "player1" | "player2" | "draw", flips: number) => { scoreAdded: number; newRank: GauntletRank | null };
    getOpponentConfig: () => { deck: Card[]; mechanic: BoardMechanicType; activeElement?: ElementType };
}

const RANK_THRESHOLDS: Record<GauntletRank, number> = {
    Genin: 0,
    Chunin: 200,
    Jounin: 500,
    Anbu: 1000,
    Kage: 2000,
    Rikudo: 5000,
};

export const RANK_MULTIPLIERS: Record<GauntletRank, number> = {
    Genin: 1,
    Chunin: 1.2,
    Jounin: 1.5,
    Anbu: 2,
    Kage: 3,
    Rikudo: 5,
};

const OPPONENT_NAMES: Record<GauntletRank, string[]> = {
    Genin: ["Academy Student", "Genin Rookie", "Bandit"],
    Chunin: ["Chunin Exam Proctor", "Sound Ninja", "Mist Ninja"],
    Jounin: ["Kakashi Copy", "Guy Sensei", "Asuma"],
    Anbu: ["Root Member", "Masked Ninja", "Itachi Clone"],
    Kage: ["Raikage", "Tsuchikage", "Mizukage", "Kazekage"],
    Rikudo: ["Madara", "Kaguya", "Sage of Six Paths"],
};

export const useGauntletStore = create<GauntletState>()(
    persist(
        (set, get) => ({
            isActive: false,
            rank: "Genin",
            score: 0,
            round: 1,
            deck: [],
            lastBoss: "-",

            startRun: (deck) => {
                set({
                    isActive: true,
                    rank: "Genin",
                    score: 0,
                    round: 1,
                    deck,
                    lastBoss: "-",
                });
            },

            endRun: () => {
                set({ isActive: false });
            },

            processMatchResult: (winner, flips) => {
                const { score, rank, round } = get();

                if (winner !== "player1") {
                    set({ isActive: false }); // End run on loss or draw
                    return { scoreAdded: 0, newRank: null };
                }

                // Scoring Logic
                const baseWin = 20;
                const flipBonus = flips * 5;
                const multiplier = RANK_MULTIPLIERS[rank];

                const rawScore = baseWin + flipBonus;
                const scoreAdded = Math.floor(rawScore * multiplier);
                const newScore = score + scoreAdded;

                // Rank Progression
                let newRank: GauntletRank = rank;
                if (newScore >= RANK_THRESHOLDS.Rikudo) newRank = "Rikudo";
                else if (newScore >= RANK_THRESHOLDS.Kage) newRank = "Kage";
                else if (newScore >= RANK_THRESHOLDS.Anbu) newRank = "Anbu";
                else if (newScore >= RANK_THRESHOLDS.Jounin) newRank = "Jounin";
                else if (newScore >= RANK_THRESHOLDS.Chunin) newRank = "Chunin";

                // Determine Boss Name for next round (just for display/history)
                const possibleNames = OPPONENT_NAMES[newRank];
                const nextBoss = possibleNames[Math.floor(Math.random() * possibleNames.length)];

                set({
                    score: newScore,
                    rank: newRank,
                    round: round + 1,
                    lastBoss: nextBoss,
                });

                return { scoreAdded, newRank: newRank !== rank ? newRank : null };
            },

            getOpponentConfig: () => {
                const { rank } = get();

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
