// src/components/SpotifyAnalysisDisplay.tsx

import React from 'react';
import type { AudioFeatures } from '../hooks/useSpotifyAnalysis';
import { formatKey } from '../utils/formatters';

interface SpotifyAnalysisDisplayProps {
    features: AudioFeatures | null;
    loading: boolean;
    error: string | null;
}

export const SpotifyAnalysisDisplay: React.FC<SpotifyAnalysisDisplayProps> = ({ features, loading, error }) => {
    if (loading) {
        return (
            <div className="bg-spotify-grey p-4 rounded-lg text-center animate-pulse">
                <p className="text-spotify-light-grey">Loading analysis...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg">
                <p className="font-semibold">Analysis Error</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (!features) {
        // Don't render anything if no track is selected
        return null;
    }

    return (
        <div className="bg-spotify-grey p-4 rounded-lg">
            <h4 className="font-bold text-spotify-white mb-3">Spotify Audio Features</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                    <span className="text-spotify-light-grey">Loudness:</span>
                    <span className="text-spotify-white ml-2 font-mono">{features.loudness.toFixed(1)} LUFS</span>
                </div>
                <div>
                    <span className="text-spotify-light-grey">Tempo:</span>
                    <span className="text-spotify-white ml-2 font-mono">{features.tempo.toFixed(0)} BPM</span>
                </div>
                <div>
                    <span className="text-spotify-light-grey">Key:</span>
                    <span className="text-spotify-white ml-2 font-mono">{formatKey(features.key, features.mode)}</span>
                </div>
                <div>
                    <span className="text-spotify-light-grey">Energy:</span>
                    <span className="text-spotify-white ml-2 font-mono">{(features.energy * 100).toFixed(0)}%</span>
                </div>
                <div>
                    <span className="text-spotify-light-grey">Danceability:</span>
                    <span className="text-spotify-white ml-2 font-mono">{(features.danceability * 100).toFixed(0)}%</span>
                </div>
                <div>
                    <span className="text-spotify-light-grey">Acousticness:</span>
                    <span className="text-spotify-white ml-2 font-mono">{(features.acousticness * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
};