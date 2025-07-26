import { useState, useEffect } from 'react';

export const useSpotifyAuth = () => {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Check for an existing token in local storage
        const storedToken = localStorage.getItem('spotify_access_token');
        const expiryTime = localStorage.getItem('spotify_token_expiry_time');

        if (storedToken && expiryTime && new Date().getTime() < Number(expiryTime)) {
            setToken(storedToken);
            return;
        }

        // Check for new token in URL params from Spotify redirect
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const expiresIn = urlParams.get('expires_in');

        if (accessToken && expiresIn) {
            const expiryTimeValue = new Date().getTime() + Number(expiresIn) * 1000;
            localStorage.setItem('spotify_access_token', accessToken);
            localStorage.setItem('spotify_token_expiry_time', String(expiryTimeValue));
            setToken(accessToken);

            // Clean the URL for a better user experience
            window.history.pushState({}, document.title, "/");
        }
    }, []);

    const logout = () => {
        setToken(null);
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry_time');
    };

    return { token, logout };
};