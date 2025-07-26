import React, { useState } from 'react';
import { AudioUploader } from './AudioUploader';
// We will create these components next
// import { SpotifySearch } from './SpotifySearch';
// import { FrequencyAnalyzer } from './FrequencyAnalyzer';

interface DashboardProps {
    token: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ token }) => {
    // State to hold the audio sources for the analyzer
    const [localAudioNode, setLocalAudioNode] = useState<AudioNode | null>(null);
    const [spotifyAudioNode, setSpotifyAudioNode] = useState<AudioNode | null>(null);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

    // Function to initialize AudioContext on first user interaction
    const initializeAudioContext = () => {
        if (!audioContext) {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(context);
        }
    };

    return (
        <div className="dashboard" onClick={initializeAudioContext}>
            <div className="source-controls">
                <div className="control-panel">
                    <h3>Your Track</h3>
                    <AudioUploader
                        audioContext={audioContext}
                        onAudioNodeReady={setLocalAudioNode}
                    />
                </div>
                <div className="control-panel">
                    <h3>Reference Track</h3>
                    {/* SpotifySearch will go here */}
                    <p>Spotify Search (Coming Soon)</p>
                </div>
            </div>
            <div className="analyzer-section">
                <h3>Frequency Analysis</h3>
                {/* FrequencyAnalyzer will go here */}
                <p>Frequency Analyzer (Coming Soon)</p>
            </div>
        </div>
    );
};