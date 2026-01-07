export const SOUNDS = {
    CLICK: '/sounds/card-click.mp3',
    PLACE: '/sounds/card-place.mp3',
    FLIP: '/sounds/card-flip.mp3',
    WIN: '/sounds/game-win.mp3',
    LOSE: '/sounds/game-lose.mp3',
    DRAW: '/sounds/game-draw.mp3',
    FIRE: '/sounds/flame-effect.mp3',
    WATER: '/sounds/water-effect.mp3',
    EARTH: '/sounds/earth-effect.mp3',
    WIND: '/sounds/wind-effect.mp3',
    LIGHTNING: '/sounds/lightning-effect.mp3',
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
