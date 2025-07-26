import { useState, useCallback, useEffect } from 'react';
import type {AudioAnalysis} from '../types';

const musicalKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface UseAudioAnalysisProps {
    analyzerNode: AnalyserNode | null;
    isAnalyzing: boolean;
    audioContext: AudioContext | null;
}

/**
 * A custom hook to perform real-time audio analysis on an AnalyserNode.
 * It calculates metrics like LUFS, peak dBFS, tempo, and key.
 */
export const useAudioAnalysis = ({ analyzerNode, isAnalyzing, audioContext }: UseAudioAnalysisProps) => {
    const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);

    const calculateRMS = useCallback((timeData: Float32Array): number => {
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
            sum += timeData[i] * timeData[i];
        }
        return Math.sqrt(sum / timeData.length);
    }, []);

    const calculatePeak = useCallback((timeData: Float32Array): number => {
        let peak = 0;
        for (let i = 0; i < timeData.length; i++) {
            const abs = Math.abs(timeData[i]);
            if (abs > peak) peak = abs;
        }
        return peak;
    }, []);

    const calculateLUFS = useCallback((rms: number): number => {
        if (rms === 0) return -Infinity;
        // Simplified LUFS approximation
        return 20 * Math.log10(rms) - 0.691;
    }, []);

    const calculateDBFS = useCallback((peak: number): number => {
        if (peak === 0) return -Infinity;
        return 20 * Math.log10(peak);
    }, []);

    const detectTempo = useCallback((timeData: Float32Array, sampleRate: number): number | null => {
        const bufferSize = timeData.length;
        const minBPM = 60;
        const maxBPM = 200;
        const minPeriod = Math.floor(sampleRate * 60 / maxBPM);
        const maxPeriod = Math.floor(sampleRate * 60 / minBPM);

        let bestCorrelation = 0;
        let bestPeriod = 0;

        for (let period = minPeriod; period < maxPeriod && period < bufferSize / 2; period++) {
            let correlation = 0;
            for (let i = 0; i < bufferSize - period; i++) {
                correlation += timeData[i] * timeData[i + period];
            }
            if (correlation > bestCorrelation) {
                bestCorrelation = correlation;
                bestPeriod = period;
            }
        }

        return bestPeriod > 0 ? (sampleRate * 60) / bestPeriod : null;
    }, []);

    const detectKey = useCallback((frequencyData: Float32Array, sampleRate: number): string | null => {
        const chromagram = new Array(12).fill(0);
        const binSize = sampleRate / (2 * frequencyData.length);

        for (let i = 1; i < frequencyData.length; i++) {
            const frequency = i * binSize;
            if (frequency < 80 || frequency > 5000) continue;

            const noteIndex = Math.round(12 * Math.log2(frequency / 440)) % 12;
            const normalizedIndex = (noteIndex + 9) % 12;

            if (normalizedIndex >= 0 && normalizedIndex < 12) {
                chromagram[normalizedIndex] += Math.pow(10, frequencyData[i] / 20);
            }
        }

        let maxEnergy = 0;
        let keyIndex = 0;
        for (let i = 0; i < 12; i++) {
            if (chromagram[i] > maxEnergy) {
                maxEnergy = chromagram[i];
                keyIndex = i;
            }
        }

        return maxEnergy > 0 ? musicalKeys[keyIndex] : null;
    }, []);

    useEffect(() => {
        if (!isAnalyzing || !analyzerNode || !audioContext) {
            setAnalysis(null);
            return;
        }

        const bufferLength = analyzerNode.frequencyBinCount;
        const timeData = new Float32Array(bufferLength);
        const frequencyData = new Float32Array(bufferLength);

        const analyze = () => {
            analyzerNode.getFloatTimeDomainData(timeData);
            analyzerNode.getFloatFrequencyData(frequencyData);

            const rms = calculateRMS(timeData);
            const peak = calculatePeak(timeData);
            const lufs = calculateLUFS(rms);
            const dbfs = calculateDBFS(peak);
            const dynamicRange = dbfs - (20 * Math.log10(rms));
            const tempo = detectTempo(timeData, audioContext.sampleRate);
            const key = detectKey(frequencyData, audioContext.sampleRate);

            setAnalysis({
                rms,
                peak,
                lufs,
                dbfs,
                tempo,
                key,
                dynamicRange: isFinite(dynamicRange) ? dynamicRange : 0,
            });
        };

        // Update analysis at a lower frequency than rendering to save CPU
        const intervalId = setInterval(analyze, 250); // 4 times per second

        return () => clearInterval(intervalId);

    }, [isAnalyzing, analyzerNode, audioContext, calculateRMS, calculatePeak, calculateLUFS, calculateDBFS, detectTempo, detectKey]);

    return analysis;
};