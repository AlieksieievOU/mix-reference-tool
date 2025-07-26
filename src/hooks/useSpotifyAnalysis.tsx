import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Track } from '../types';

// You can expand these types based on the full API response
export interface AudioFeatures {
    danceability: number;
    energy: number;
    key: number;
    loudness: number;
    mode: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;
    duration_ms: number;
}

export const useSpotifyAnalysis = (track: Track | null, token: string | null) => {
    const [features, setFeatures] = useState<AudioFeatures | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!track || !token) {
            setFeatures(null);
            // Also clear any previous error when the track is deselected
            setError(null);
            return;
        }

        const fetchAudioFeatures = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`https://api.spotify.com/v1/audio-features/${track.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setFeatures(response.data);
            } catch (err) {
                console.error("Failed to fetch Spotify audio features:", err);

                // --- IMPROVED ERROR HANDLING ---
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    setError("Authentication expired. Please log out and back in.");
                } else {
                    setError("Could not load audio analysis for the track.");
                }
                // --- END IMPROVEMENT ---

            } finally {
                setLoading(false);
            }
        };

        fetchAudioFeatures();
    }, [track, token]);

    return { features, loading, error };
};