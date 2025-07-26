import React, { useEffect, useRef, useState } from 'react';
import { useAudioAnalysis } from '../hooks/useAudioAnalysis';
import { useSpectrumDrawer } from '../hooks/useSpectrumDrawer';
import type { AudioAnalysis } from '../types';

interface FrequencyAnalyzerProps {
    audioNode: AudioNode | null;
    audioContext: AudioContext | null;
    isPlaying: boolean;
    onTogglePlayback: () => void;
    hasSpotifyTrack: boolean;
    isMuted: boolean;
    onToggleMute: () => void;
    activeAudioSource: 'local' | 'spotify';
    onToggleActiveAudioSource: () => void;
}

export const FrequencyAnalyzer: React.FC<FrequencyAnalyzerProps> = ({
                                                                        audioNode,
                                                                        audioContext,
                                                                        isPlaying,
                                                                        onTogglePlayback,
                                                                        hasSpotifyTrack,
                                                                        isMuted,
                                                                        onToggleMute,
                                                                        activeAudioSource,
                                                                        onToggleActiveAudioSource,
                                                                    }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [analyzerNode, setAnalyzerNode] = useState<AnalyserNode | null>(null);

    // Setup analyzer when the audio node changes
    useEffect(() => {
        if (!audioContext) return;

        const createAnalyzer = () => {
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 4096;
            analyzer.smoothingTimeConstant = 0.3;
            analyzer.minDecibels = -90;
            analyzer.maxDecibels = -10;
            return analyzer;
        };

        if (audioNode) {
            const analyzer = createAnalyzer();
            audioNode.connect(analyzer);
            setAnalyzerNode(analyzer);
        } else {
            analyzerNode?.disconnect();
            setAnalyzerNode(null);
        }

        return () => {
            analyzerNode?.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioContext, audioNode]);

    // Use the new hooks for analysis and drawing, driven by the global isPlaying prop
    const analysisData = useAudioAnalysis({ analyzerNode, isAnalyzing: isPlaying, audioContext });
    useSpectrumDrawer({ canvasRef, analyzerNode, isAnalyzing: isPlaying, color: '#1DB954', title: 'Your Track' });

    const hasLocalAudioSource = !!analyzerNode;
    const canPlay = hasLocalAudioSource || hasSpotifyTrack;

    const DebugInfo: React.FC = () => (
        <div className="text-xs text-spotify-light-grey bg-spotify-dark-grey p-3 rounded">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <span className="font-semibold">Audio Context:</span>
                    <div className={`inline-block w-2 h-2 rounded-full ml-2 ${audioContext ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="ml-1">{audioContext?.state || 'None'}</span>
                </div>
                <div>
                    <span className="font-semibold">Local Track:</span>
                    <div className={`inline-block w-2 h-2 rounded-full ml-2 ${analyzerNode ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="ml-1">{analyzerNode ? 'Connected' : 'Not Connected'}</span>
                </div>
                <div>
                    <span className="font-semibold">Analysis:</span>
                    <div className={`inline-block w-2 h-2 rounded-full ml-2 ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                    <span className="ml-1">{isPlaying ? 'Running' : 'Stopped'}</span>
                </div>
            </div>
        </div>
    );

    const AnalysisMetrics: React.FC<{ analysis: AudioAnalysis | null; title: string; color: string }> = ({ analysis, title, color }) => (
        <div className="bg-spotify-grey p-4 rounded-lg">
            <h4 className="font-bold text-spotify-white mb-3" style={{ color }}>{title}</h4>
            {analysis ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span className="text-spotify-light-grey">LUFS:</span>
                        <span className="text-spotify-white ml-2 font-mono">{isFinite(analysis.lufs) ? `${analysis.lufs.toFixed(1)} LUFS` : 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-spotify-light-grey">Peak dBFS:</span>
                        <span className="text-spotify-white ml-2 font-mono">{isFinite(analysis.dbfs) ? `${analysis.dbfs.toFixed(1)} dBFS` : 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-spotify-light-grey">Tempo:</span>
                        <span className="text-spotify-white ml-2 font-mono">{analysis.tempo ? `${analysis.tempo.toFixed(0)} BPM` : '...'}</span>
                    </div>
                    <div>
                        <span className="text-spotify-light-grey">Key:</span>
                        <span className="text-spotify-white ml-2 font-mono">{analysis.key || '...'}</span>
                    </div>
                    <div>
                        <span className="text-spotify-light-grey">Dyn Range:</span>
                        <span className="text-spotify-white ml-2 font-mono">{isFinite(analysis.dynamicRange) ? `${analysis.dynamicRange.toFixed(1)} dB` : 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-spotify-light-grey">RMS:</span>
                        <span className="text-spotify-white ml-2 font-mono">{analysis.rms > 0 ? `${(20 * Math.log10(analysis.rms)).toFixed(1)} dB` : 'N/A'}</span>
                    </div>
                </div>
            ) : <p className="text-spotify-light-grey text-sm">Upload a track to see analysis</p>}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-spotify-white">Global Playback & Analysis</h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onToggleActiveAudioSource}
                        disabled={!hasLocalAudioSource || !hasSpotifyTrack}
                        className="p-2 rounded font-semibold bg-spotify-grey hover:bg-spotify-light-grey text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Switch to ${activeAudioSource === 'local' ? 'Spotify' : 'Local'} track`}
                        title={`Now Playing: ${activeAudioSource === 'local' ? 'Your Track' : 'Reference'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </button>

                    <button
                        onClick={onToggleMute}
                        className="p-2 rounded font-semibold bg-spotify-grey hover:bg-spotify-light-grey text-white transition-colors"
                        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                    >
                        {isMuted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={onTogglePlayback}
                        disabled={!canPlay}
                        className={`px-6 py-2 rounded font-semibold transition-colors ${canPlay ? (isPlaying ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-spotify-green text-spotify-black hover:bg-opacity-80') : 'bg-spotify-grey text-spotify-light-grey cursor-not-allowed'}`}
                    >
                        {isPlaying ? 'Pause All' : 'Play & Analyze'}
                    </button>
                </div>
            </div>

            {hasLocalAudioSource && <DebugInfo />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyzerNode && (
                    <div className="bg-spotify-dark-grey p-4 rounded-lg">
                        <canvas ref={canvasRef} width={400} height={250} className="w-full rounded border border-spotify-grey" />
                    </div>
                )}
                <div className={!analyzerNode ? 'md:col-span-2' : ''}>
                    {isPlaying && analysisData && <AnalysisMetrics analysis={analysisData} title="Your Track Analysis" color="#1DB954" />}
                </div>
            </div>
        </div>
    );
};