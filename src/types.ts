// src/types.ts

/**
 * Represents a single track from the Spotify API.
 */
export interface Track {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
        name: string;
        images: { url: string; height: number; width: number }[];
    };
    preview_url: string | null;
    external_urls: {
        spotify: string;
    };
}

/**
 * Represents the calculated audio analysis metrics for a track.
 */
export interface AudioAnalysis {
    rms: number;
    peak: number;
    lufs: number;
    dbfs: number;
    tempo: number | null;
    key: string | null;
    dynamicRange: number;
}