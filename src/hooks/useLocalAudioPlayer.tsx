import { useState, useRef, useCallback, useEffect } from 'react';

export const useLocalAudioPlayer = (
    audioContext: AudioContext | null,
    onAudioNodeReady: (node: AudioNode | null) => void,
    isPlaying: boolean,
    isMuted: boolean,
    isActiveSource: boolean
) => {
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

    // Effect to control playback based on global state
    useEffect(() => {
        const play = async () => {
            if (audioRef.current && audioContext?.state === 'suspended') {
                await audioContext.resume();
            }
            await audioRef.current?.play();
        };

        if (audioRef.current) {
            if (isPlaying && isActiveSource) {
                play().catch(e => console.error("Local playback failed", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, isActiveSource, audioContext]);

    // Effect to control volume based on global mute state
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const cleanupAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            const src = audioRef.current.src;
            if (src.startsWith('blob:')) {
                URL.revokeObjectURL(src);
            }
            audioRef.current.src = '';
        }
        if (sourceNodeRef.current) {
            try {
                sourceNodeRef.current.disconnect();
            } catch (e) { /* Already disconnected */ }
        }
        setFileName('');
        setError('');
        onAudioNodeReady(null);
    }, [onAudioNodeReady]);

    useEffect(() => {
        return () => cleanupAudio();
    }, [cleanupAudio]);

    const handleFileChange = async (file: File) => {
        if (!audioContext) {
            setError('Audio engine not ready. Please click anywhere on the page first.');
            return;
        }

        cleanupAudio();
        setFileName(file.name);

        try {
            const audio = new Audio();
            const url = URL.createObjectURL(file);
            audio.src = url;
            audio.loop = true;
            audio.muted = isMuted; // Apply mute state on creation

            // Don't auto-play, just prepare the node
            const sourceNode = audioContext.createMediaElementSource(audio);
            sourceNode.connect(audioContext.destination);

            audioRef.current = audio;
            sourceNodeRef.current = sourceNode;
            onAudioNodeReady(sourceNode);
        } catch (e) {
            console.error('Error loading audio file:', e);
            setError('Failed to load audio file. Please try a different format.');
            cleanupAudio();
        }
    };

    return {
        fileName,
        error,
        handleFileChange,
        clearAudio: cleanupAudio,
    };
};