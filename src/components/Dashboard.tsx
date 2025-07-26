import React, { useState, useEffect } from 'react';
import { AudioUploader } from './AudioUploader';
import { SpotifySearch } from './SpotifyTrackSearch';
import { FrequencyAnalyzer } from './FrequencyAnalyzerComponent';
import { useSpotifyWebPlaybackSDK } from '../hooks/useSpotifyWebPlaybackSDK';
import { useSpotifyAnalysis } from '../hooks/useSpotifyAnalysis';
import { SpotifyAnalysisDisplay } from './SpotifyAnalysisDisplay';
import type { Track } from '../types';

interface DashboardProps {
    token: string;
    onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
    const [localAudioNode, setLocalAudioNode] = useState<AudioNode | null>(null);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const { deviceId, isReady: isPlayerReady, error: playerError, currentState: spotifyPlayerState, player: spotifyPlayer } = useSpotifyWebPlaybackSDK({ token });

    // --- Global State Management ---
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // Audio is muted by default
    const [activeAudioSource, setActiveAudioSource] = useState<'local' | 'spotify'>('local');

    // --- Use the analysis hook ---
    const { features, loading: analysisLoading, error: analysisError } = useSpotifyAnalysis(selectedTrack, token);

    const toggleGlobalPlayback = () => setIsPlaying(prev => !prev);

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    const toggleActiveAudioSource = () => setActiveAudioSource(prev => prev === 'local' ? 'spotify' : 'local');

    // Effect to synchronize mute state with the Spotify Player
    useEffect(() => {
        if (spotifyPlayer) {
            spotifyPlayer.setVolume(isMuted ? 0 : 0.5);
        }
    }, [isMuted, spotifyPlayer]);

    const initializeAudioContext = () => {
        if (!audioContext) {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(context);
            console.log('AudioContext initialized:', context.state);
        }
    };

    const handleTrackSelect = (track: Track) => {
        setSelectedTrack(track);
        if (isPlaying) {
            // This will be handled by the useEffect in SpotifyTrackSearch
        }
    };

    return (
        <div className="flex min-h-screen justify-center bg-spotify-black text-spotify-light-grey">
            {/* Left Ad Column */}
            <aside className="w-64 hidden xl:block p-4 pt-8">
                <div className="h-full bg-spotify-dark-grey rounded-lg flex items-center justify-center text-center p-4">
                    <span className="text-spotify-light-grey">Your Ad Here</span>
                </div>
            </aside>

            {/* Main Application Content */}
            <main className="flex-1 max-w-7xl" onClick={initializeAudioContext}>
                <div className="p-8">
                    <header className="mb-10 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-spotify-white">Mix Reference Tool</h1>
                            <p className="text-spotify-light-grey mt-2">Compare your track's frequency spectrum with professional references</p>
                        </div>
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        )}
                    </header>

                    {/* Status Indicators */}
                    <div className="mb-6 bg-spotify-dark-grey p-3 rounded-lg flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${audioContext ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-sm text-spotify-light-grey">
                                Audio Engine: {audioContext ? `Ready (${audioContext.state})` : 'Click anywhere to initialize'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isPlayerReady ? 'bg-green-500' : playerError ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-sm text-spotify-light-grey">
                                Spotify Player: {playerError ? 'Error' : isPlayerReady ? 'Ready' : 'Initializing...'}
                            </span>
                        </div>
                    </div>

                    {playerError && (
                        <div className="mb-6 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                            <strong className="font-bold">Spotify Player Error: </strong>
                            <span className="block sm:inline">{playerError}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-spotify-dark-grey p-6 rounded-lg">
                            <h3 className="text-xl font-bold text-spotify-white mb-4">Your Track</h3>
                            <AudioUploader
                                audioContext={audioContext}
                                onAudioNodeReady={setLocalAudioNode}
                                isPlaying={isPlaying}
                                isMuted={isMuted}
                                isActiveSource={activeAudioSource === 'local'}
                            />
                        </div>
                        <div className="bg-spotify-dark-grey p-6 rounded-lg space-y-4">
                            <h3 className="text-xl font-bold text-spotify-white">Reference Track</h3>
                            <SpotifySearch
                                token={token}
                                onTrackSelect={handleTrackSelect}
                                deviceId={deviceId}
                                isPlaying={isPlaying}
                                playerState={spotifyPlayerState}
                                isActiveSource={activeAudioSource === 'spotify'}
                            />
                            <SpotifyAnalysisDisplay
                                features={features}
                                loading={analysisLoading}
                                error={analysisError}
                            />
                        </div>
                    </div>

                    <div className="bg-spotify-dark-grey p-6 rounded-lg">
                        <FrequencyAnalyzer
                            audioNode={localAudioNode}
                            audioContext={audioContext}
                            isPlaying={isPlaying}
                            onTogglePlayback={toggleGlobalPlayback}
                            hasSpotifyTrack={!!selectedTrack}
                            isMuted={isMuted}
                            onToggleMute={toggleMute}
                            activeAudioSource={activeAudioSource}
                            onToggleActiveAudioSource={toggleActiveAudioSource}
                        />
                    </div>
                </div>
            </main>

            {/* Right Ad Column */}
            <aside className="w-64 hidden xl:block p-4 pt-8">
                <div className="h-full bg-spotify-dark-grey rounded-lg flex items-center justify-center text-center p-4">
                    <span className="text-spotify-light-grey">Your Ad Here</span>
                </div>
            </aside>
        </div>
    );
};