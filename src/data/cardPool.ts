import { Card } from "../types/game";

// Dummy card pool for deck selection
export const CARD_POOL: Card[] = [
    // Fire Cards
    {
        id: "fire-1",
        name: "Flame Ninja",
        element: "fire",
        image: "",
        stats: { top: 7, bottom: 3, left: 5, right: 6 },
        baseStats: { top: 7, bottom: 3, left: 5, right: 6 },
        rarity: "common",
    },
    {
        id: "fire-2",
        name: "Inferno Master",
        element: "fire",
        image: "",
        stats: { top: 8, bottom: 2, left: 4, right: 7 },
        baseStats: { top: 8, bottom: 2, left: 4, right: 7 },
        rarity: "rare",
    },
    {
        id: "fire-3",
        name: "Ember Warrior",
        element: "fire",
        image: "",
        stats: { top: 6, bottom: 5, left: 6, right: 4 },
        baseStats: { top: 6, bottom: 5, left: 6, right: 4 },
        rarity: "common",
    },

    // Water Cards
    {
        id: "water-1",
        name: "Aqua Shinobi",
        element: "water",
        image: "",
        stats: { top: 5, bottom: 7, left: 6, right: 3 },
        baseStats: { top: 5, bottom: 7, left: 6, right: 3 },
        rarity: "common",
    },
    {
        id: "water-2",
        name: "Tidal Sage",
        element: "water",
        image: "",
        stats: { top: 4, bottom: 8, left: 7, right: 2 },
        baseStats: { top: 4, bottom: 8, left: 7, right: 2 },
        rarity: "epic",
    },
    {
        id: "water-3",
        name: "Wave Dancer",
        element: "water",
        image: "",
        stats: { top: 6, bottom: 6, left: 5, right: 4 },
        baseStats: { top: 6, bottom: 6, left: 5, right: 4 },
        rarity: "common",
    },

    // Earth Cards
    {
        id: "earth-1",
        name: "Stone Guardian",
        element: "earth",
        image: "",
        stats: { top: 3, bottom: 6, left: 7, right: 5 },
        baseStats: { top: 3, bottom: 6, left: 7, right: 5 },
    },
    {
        id: "earth-2",
        name: "Mountain Monk",
        element: "earth",
        image: "",
        stats: { top: 2, bottom: 7, left: 8, right: 4 },
        baseStats: { top: 2, bottom: 7, left: 8, right: 4 },
    },
    {
        id: "earth-3",
        name: "Crystal Keeper",
        element: "earth",
        image: "",
        stats: { top: 4, bottom: 5, left: 6, right: 6 },
        baseStats: { top: 4, bottom: 5, left: 6, right: 6 },
    },

    // Wind Cards
    {
        id: "wind-1",
        name: "Gale Assassin",
        element: "wind",
        image: "",
        stats: { top: 6, bottom: 4, left: 3, right: 8 },
        baseStats: { top: 6, bottom: 4, left: 3, right: 8 },
    },
    {
        id: "wind-2",
        name: "Storm Blade",
        element: "wind",
        image: "",
        stats: { top: 7, bottom: 3, left: 2, right: 9 },
        baseStats: { top: 7, bottom: 3, left: 2, right: 9 },
    },
    {
        id: "wind-3",
        name: "Breeze Scout",
        element: "wind",
        image: "",
        stats: { top: 5, bottom: 5, left: 4, right: 7 },
        baseStats: { top: 5, bottom: 5, left: 4, right: 7 },
    },

    // Lightning Cards
    {
        id: "lightning-1",
        name: "Thunder Strike",
        element: "lightning",
        image: "",
        stats: { top: 8, bottom: 4, left: 6, right: 3 },
        baseStats: { top: 8, bottom: 4, left: 6, right: 3 },
    },
    {
        id: "lightning-2",
        name: "Volt Samurai",
        element: "lightning",
        image: "",
        stats: { top: 9, bottom: 2, left: 7, right: 3 },
        baseStats: { top: 9, bottom: 2, left: 7, right: 3 },
        rarity: "legend",
    },
    {
        id: "lightning-3",
        name: "Spark Ronin",
        element: "lightning",
        image: "",
        stats: { top: 7, bottom: 5, left: 5, right: 4 },
        baseStats: { top: 7, bottom: 5, left: 5, right: 4 },
        rarity: "special",
    },

    // Balanced Cards
    {
        id: "balanced-1",
        name: "Shadow Ninja",
        element: "wind",
        image: "",
        stats: { top: 5, bottom: 5, left: 5, right: 6 },
        baseStats: { top: 5, bottom: 5, left: 5, right: 6 },
    },
    {
        id: "balanced-2",
        name: "Mystic Warrior",
        element: "water",
        image: "",
        stats: { top: 6, bottom: 5, left: 5, right: 5 },
        baseStats: { top: 6, bottom: 5, left: 5, right: 5 },
    },
    {
        id: "balanced-3",
        name: "Elite Guard",
        element: "earth",
        image: "",
        stats: { top: 5, bottom: 6, left: 6, right: 4 },
        baseStats: { top: 5, bottom: 6, left: 6, right: 4 },
    },
];
