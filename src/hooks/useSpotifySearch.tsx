import { useState, useCallback } from 'react';
import axios from 'axios';
import type { Track } from '../types';

/**
 * A custom hook to manage Spotify track search and selection.
 * @param token - The Spotify API authentication token.
 */
export const useSpotifySearch = (token: string) => {
    const [query, setQuery] = useState('');
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Search for tracks on Spotify
    const searchTracks = useCallback(async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setTracks([]); // Clear previous results for better UX
        try {
            const response = await axios.get('https://api.spotify.com/v1/search', {
                headers: { Authorization: `Bearer ${token}` },
                params: { q: query, type: 'track', limit: 20, market: 'US' },
            });
            setTracks(response.data.tracks.items);
        } catch (err) {
            console.error('Error searching tracks:', err);
            // More specific error handling
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError('Authentication expired. Please log out and log in again.');
            } else {
                setError('Failed to search for tracks.');
            }
        } finally {
            setLoading(false);
        }
    }, [query, token]);

    // Handle track selection
    const selectTrack = useCallback((track: Track) => {
        setSelectedTrack(track);
        setError(null);
    }, []);

    // Return all the necessary values for the component
    return {
        query,
        setQuery,
        tracks,
        loading,
        error,
        selectedTrack,
        searchTracks,
        selectTrack,
    };
};