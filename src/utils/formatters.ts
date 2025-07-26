// src/utils/formatters.ts

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Converts Spotify's numerical key and mode into a readable string.
 * @param key The key of the track (0=C, 1=C#, etc.).
 * @param mode The mode of the track (0=Minor, 1=Major).
 * @returns A formatted string like "C# Minor".
 */
export const formatKey = (key: number, mode: number): string => {
    if (key < 0 || key > 11) {
        return 'N/A';
    }
    const keyName = PITCH_CLASSES[key];
    const modeName = mode === 1 ? 'Major' : 'Minor';
    return `${keyName} ${modeName}`;
};