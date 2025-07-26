import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSpotifySearch } from '../hooks/useSpotifySearch';
import type { Track } from '../types';

interface SpotifySearchProps {
    token: string;
    onTrackSelect: (track: Track) => void;
    deviceId: string | null;
    isPlaying: boolean;
    playerState: Spotify.PlaybackState | null;
    isActiveSource: boolean;
}

export const SpotifySearch: React.FC<SpotifySearchProps> = ({
                                                                token,
                                                                onTrackSelect,
                                                                deviceId,
                                                                isPlaying,
                                                                playerState,
                                                                isActiveSource,
                                                            }) => {
    const {
        query,
        setQuery,
        tracks,
        loading,
        error: searchError,
        selectedTrack,
        searchTracks,
        selectTrack,
    } = useSpotifySearch(token);

    const [playbackError, setPlaybackError] = useState<string | null>(null);
    const lastPlayedUri = useRef<string | null>(null);

    useEffect(() => {
        if (!deviceId || !selectedTrack) {
            return;
        }

        const play = async () => {
            const isNewTrack = lastPlayedUri.current !== selectedTrack.id;
            // Only include the track URI in the request body if it's a new track.
            // Otherwise, just send a play command to resume.
            const data = isNewTrack ? { uris: [`spotify:track:${selectedTrack.id}`] } : undefined;

            try {
                await axios({
                    method: 'put',
                    url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
                    data,
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                lastPlayedUri.current = selectedTrack.id;
            } catch (e) {
                console.error("Spotify play failed", e);
                setPlaybackError("Playback failed. Is Spotify active on another device?");
            }
        };

        const pause = async () => {
            // Only send a pause command if the player is not already paused.
            if (playerState && !playerState.paused) {
                try {
                    await axios({
                        method: 'put',
                        url: `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (e) {
                    console.error("Spotify pause failed", e);
                }
            }
        };

        if (isPlaying && isActiveSource) {
            play();
        } else {
            pause();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, isActiveSource, selectedTrack, deviceId, token]);


    const handleTrackSelect = (track: Track) => {
        selectTrack(track);
        onTrackSelect(track);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            searchTracks();
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search for tracks..."
                    className="flex-1 bg-spotify-grey text-spotify-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-spotify-green"
                />
                <button
                    onClick={searchTracks}
                    disabled={loading || !query.trim()}
                    className="bg-spotify-green text-spotify-black px-6 py-2 rounded font-semibold hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Error Display */}
            {(searchError || playbackError) && (
                <div className="bg-red-600 text-white p-3 rounded">
                    <p className="text-sm">{searchError || playbackError}</p>
                </div>
            )}

            {/* Selected Track Display */}
            {selectedTrack && (
                <div className="bg-spotify-grey p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                        {selectedTrack.album.images[2] && (
                            <img
                                src={selectedTrack.album.images[2].url}
                                alt={selectedTrack.album.name}
                                className="w-16 h-16 rounded"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-spotify-white font-semibold truncate">{selectedTrack.name}</h4>
                            <p className="text-spotify-light-grey truncate">
                                {selectedTrack.artists.map(artist => artist.name).join(', ')}
                            </p>
                        </div>
                        {!deviceId && (
                            <span className="text-yellow-400 text-sm">Player not ready</span>
                        )}
                    </div>
                </div>
            )}

            {/* Search Results */}
            {tracks.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tracks.map((track) => (
                        <div
                            key={track.id}
                            onClick={() => handleTrackSelect(track)}
                            className="flex items-center space-x-3 p-3 rounded transition-colors bg-spotify-grey hover:bg-opacity-80 cursor-pointer"
                        >
                            {track.album.images[2] && (
                                <img
                                    src={track.album.images[2].url}
                                    alt={track.album.name}
                                    className="w-12 h-12 rounded"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-spotify-white font-medium truncate">{track.name}</p>
                                <p className="text-spotify-light-grey text-sm truncate">
                                    {track.artists.map(artist => artist.name).join(', ')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};