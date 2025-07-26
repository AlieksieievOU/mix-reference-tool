import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpotifyWebPlaybackSDKProps {
    token: string | null;
}

/**
 * A custom hook to manage the Spotify Web Playback SDK.
 * It initializes the player, handles its state, and provides the device ID.
 * Requires a Spotify Premium account.
 */
export const useSpotifyWebPlaybackSDK = ({ token }: UseSpotifyWebPlaybackSDKProps) => {
    const [isReady, setIsReady] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [player, setPlayer] = useState<Spotify.Player | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [currentState, setCurrentState] = useState<Spotify.PlaybackState | null>(null);
    const [error, setError] = useState<string | null>(null);

    const playerRef = useRef<Spotify.Player | null>(null);

    const initializePlayer = useCallback(() => {
        if (!token || playerRef.current) {
            return;
        }

        const spotifyPlayer = new window.Spotify.Player({
            name: 'Mix Reference Tool',
            getOAuthToken: (cb) => {
                cb(token);
            },
            volume: 0.5,
        });

        playerRef.current = spotifyPlayer;
        setPlayer(spotifyPlayer);

        spotifyPlayer.addListener('ready', ({ device_id }) => {
            console.log('Spotify Player Ready with Device ID', device_id);
            setDeviceId(device_id);
            setIsReady(true);
            setError(null);
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }) => {
            console.warn('Device ID has gone offline', device_id);
            setDeviceId(null);
            setIsReady(false);
        });

        spotifyPlayer.addListener('player_state_changed', (state) => {
            if (!state) {
                setIsActive(false);
                setCurrentState(null);
                return;
            }
            setCurrentState(state);
            setIsActive(true);
        });

        // Specific error listeners for better debugging
        spotifyPlayer.addListener('initialization_error', ({ message }) => {
            console.error('Initialization Error:', message);
            setError(`Failed to initialize: ${message}`);
        });
        spotifyPlayer.addListener('authentication_error', ({ message }) => {
            console.error('Authentication Error:', message);
            setError(`Authentication failed: ${message}. Please try logging out and back in.`);
        });
        spotifyPlayer.addListener('account_error', ({ message }) => {
            console.error('Account Error:', message);
            setError(`Account error: ${message}. A Premium account is required.`);
        });
        spotifyPlayer.addListener('playback_error', ({ message }) => {
            console.error('Playback Error:', message);
            setError(`Playback error: ${message}`);
        });

        spotifyPlayer.connect();
    }, [token]);

    useEffect(() => {
        if (!token) {
            return;
        }

        // If the SDK is already loaded, it won't call the callback, so we must initialize manually.
        if (window.Spotify) {
            initializePlayer();
        } else {
            // Otherwise, we set the callback for when the script loads.
            window.onSpotifyWebPlaybackSDKReady = initializePlayer;
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.disconnect();
                playerRef.current = null;
            }
            // Clean up the global function to avoid memory leaks on re-renders
            window.onSpotifyWebPlaybackSDKReady = () => {};
        };
    }, [token, initializePlayer]);

    return { player, deviceId, isReady, isActive, currentState, error };
};