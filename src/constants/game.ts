import { BoardMechanicType, ElementType } from "../types/game";

export const BOARD_SIZE = 3;

export const GAME_MECHANICS: BoardMechanicType[] = [
    "random_elemental",
    "poison",
    "foggy",
    "joker",
];

export const GAME_ELEMENTS: ElementType[] = [
    "fire",
    "water",
    "earth",
    "wind",
    "lightning",
];

export const PASSIVE_BONUSES = {
    DEFAULT: 1,
    LIGHTNING_MAX: 2,
};

export const JOKER_MODIFIER_RANGE = 2; // -2 to +2

export const STABLE_ROLL_OFFSETS = {
    LIGHTNING_RIGHT: 100,
    LIGHTNING_LEFT: 200,
    LIGHTNING_TOP: 300,
};
