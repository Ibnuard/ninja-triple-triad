import { SOUND_PATHS } from "../constants/assets";

export const SOUNDS = {
    CLICK: SOUND_PATHS.CLICK,
    PLACE: SOUND_PATHS.PLACE,
    FLIP: SOUND_PATHS.FLIP,
    WIN: SOUND_PATHS.WIN,
    LOSE: SOUND_PATHS.LOSE,
    DRAW: SOUND_PATHS.DRAW,
    FIRE: SOUND_PATHS.FIRE,
    WATER: SOUND_PATHS.WATER,
    EARTH: SOUND_PATHS.EARTH,
    WIND: SOUND_PATHS.WIND,
    LIGHTNING: SOUND_PATHS.LIGHTNING,
};

export const playSound = (soundPath: string) => {
    if (typeof window !== 'undefined') {
        const audio = new Audio(soundPath);
        audio.volume = 0.4;
        audio.play().catch((err) => {
            // Silently fail if audio can't play (e.g. user hasn't interacted yet)
            // console.warn("Audio play failed:", err);
        });
    }
};
