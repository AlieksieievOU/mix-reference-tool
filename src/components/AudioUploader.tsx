import React, {type ChangeEvent, useState } from 'react';

interface AudioUploaderProps {
    audioContext: AudioContext | null;
    onAudioNodeReady: (node: AudioBufferSourceNode) => void;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ audioContext, onAudioNodeReady }) => {
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        if (!audioContext) {
            setError('Audio engine not ready. Please click anywhere on the page first.');
            return;
        }

        const file = files[0];
        setFileName(file.name);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const sourceNode = audioContext.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(audioContext.destination); // Connect to output to hear it
            // Do not start playing here, let the user control it.

            onAudioNodeReady(sourceNode);
        } catch (e) {
            console.error('Error decoding audio file:', e);
            setError('Failed to decode audio file. Please try a different format (e.g., WAV, MP3).');
        }
    };

    return (
        <div className="audio-uploader">
            <label htmlFor="audio-upload" className="upload-button">
                {fileName || 'Select File'}
            </label>
            <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                data-testid="audio-uploader-input"
            />
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};