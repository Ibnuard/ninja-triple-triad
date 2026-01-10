import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BoardMechanicType, ElementType } from "../types/game";

export type GameMode = "training" | "gauntlet" | "custom";

interface GameConfigState {
    mode: GameMode | null;
    mechanic: BoardMechanicType;
    element: ElementType | "random" | "none";

    // Actions
    setConfig: (config: {
        mode: GameMode;
        mechanic?: BoardMechanicType;
        element?: ElementType | "random" | "none";
    }) => void;
    clearConfig: () => void;
}

export const useGameConfigStore = create<GameConfigState>()(
    persist(
        (set) => ({
            mode: null,
            mechanic: "random",
            element: "none",

            setConfig: (config) => {
                set({
                    mode: config.mode,
                    mechanic: config.mechanic || "none",
                    element: config.element || "none",
                });
            },

            clearConfig: () => {
                set({
                    mode: null,
                    mechanic: "random",
                    element: "none",
                });
            },
        }),
        {
            name: "game-config-storage",
        }
    )
);
