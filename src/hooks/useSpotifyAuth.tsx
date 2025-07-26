import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

export const useSpotifyAuth = () => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // On initial load, check for a valid stored token
        const storedToken = localStorage.getItem('spotify_access_token');
        const expiryTime = localStorage.getItem('spotify_token_expiry_time');

        if (storedToken && expiryTime && new Date().getTime() < Number(expiryTime)) {
            setToken(storedToken);
        }
    }, []);

    const exchangeCodeForToken = useCallback(async (code: string, verifier: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('client_id', clientId);
            params.append('grant_type', 'authorization_code');
            params.append('code', code);
            params.append('redirect_uri', redirectUri);
            params.append('code_verifier', verifier);

            const result = await axios.post('https://accounts.spotify.com/api/token', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            setAuthToken(result.data.access_token, result.data.expires_in);
            window.history.pushState({}, '', '/'); // Clean up URL
            localStorage.removeItem('pkce_code_verifier');
        } catch (err) {
            console.error("Error fetching Spotify token:", err);
            let message = "Failed to authenticate with Spotify. Please try again.";
            if (axios.isAxiosError(err) && err.response?.data) {
                const errorData = err.response.data;
                message = `Authentication failed: ${errorData.error_description || errorData.error}`;
            }
            setError(message);
            // Clean up on error to allow retry
            localStorage.removeItem('pkce_code_verifier');
            window.history.pushState({}, '', '/');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = () => {
        setToken(null);
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry_time');
        localStorage.removeItem('pkce_code_verifier');
        // Force a reload to ensure a clean state
        window.location.href = '/';
    };

    const setAuthToken = (accessToken: string, expiresIn: number) => { // Keep this public if needed elsewhere
        const expiryTimeValue = new Date().getTime() + expiresIn * 1000;
        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_token_expiry_time', String(expiryTimeValue));
        setToken(accessToken);
    };

    return { token, isLoading, error, logout, exchangeCodeForToken, clearError: () => setError(null) };
};