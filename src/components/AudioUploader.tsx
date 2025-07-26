import React, { type ChangeEvent } from 'react';
import { useLocalAudioPlayer } from '../hooks/useLocalAudioPlayer';

interface AudioUploaderProps {
    audioContext: AudioContext | null;
    onAudioNodeReady: (node: AudioNode | null) => void;
    isPlaying: boolean;
    isMuted: boolean;
    isActiveSource: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ audioContext, onAudioNodeReady, isPlaying, isMuted, isActiveSource }) => {
    const {
        fileName,
        error,
        handleFileChange,
        clearAudio,
    } = useLocalAudioPlayer(audioContext, onAudioNodeReady, isPlaying, isMuted, isActiveSource);

    const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileChange(file);
        }
        event.target.value = '';
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-2">
                <label
                    htmlFor="audio-upload"
                    className="bg-spotify-green text-spotify-black px-4 py-2 rounded cursor-pointer font-semibold text-center hover:bg-opacity-80 transition-colors"
                >
                    {fileName || 'Choose Audio File'}
                </label>
                <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={onFileSelected}
                    className="hidden"
                    data-testid="audio-uploader-input"
                />
            </div>

            {fileName && (
                <div className="bg-spotify-grey p-3 rounded flex justify-between items-center">
                    <p className="text-spotify-white text-sm font-medium truncate" title={fileName}>
                        {fileName}
                    </p>
                    <button
                        onClick={clearAudio}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-700"
                    >
                        Remove
                    </button>
                </div>
            )}

            {error && (
                <div className="bg-red-600 text-white p-3 rounded">
                    <p className="text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};