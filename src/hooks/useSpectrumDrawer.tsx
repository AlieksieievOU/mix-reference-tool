import React, { useRef, useEffect, useCallback } from 'react';

interface UseSpectrumDrawerProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    analyzerNode: AnalyserNode | null;
    isAnalyzing: boolean;
    color?: string;
    title?: string;
}

// Helper function to map a frequency to a logarithmic position on the canvas
const freqToX = (freq: number, maxFreq: number, width: number): number => {
    const logMin = Math.log10(20); // Start at 20Hz, the bottom of human hearing
    const logMax = Math.log10(maxFreq);
    const logFreq = Math.log10(freq);
    const pos = (logFreq - logMin) / (logMax - logMin);
    return pos * width;
};

/**
 * A custom hook to draw a real-time, high-fidelity frequency spectrum on a canvas.
 * It uses a logarithmic scale for frequency and includes modern visual effects.
 */
export const useSpectrumDrawer = ({
                                      canvasRef,
                                      analyzerNode,
                                      isAnalyzing,
                                      color = '#1DB954',
                                      title = 'Spectrum'
                                  }: UseSpectrumDrawerProps) => {
    const animationFrameRef = useRef<number | null>(null);

    const draw = useCallback(() => {
        if (!analyzerNode || !canvasRef.current || !analyzerNode.context) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyzerNode.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        analyzerNode.getFloatFrequencyData(dataArray);

        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, width, height);

        // --- Draw the spectrum line ---
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.beginPath();

        const maxFreq = analyzerNode.context.sampleRate / 2;
        const dbRange = analyzerNode.maxDecibels - analyzerNode.minDecibels;

        let firstX: number | null = null;
        let firstY: number | null = null;

        for (let i = 1; i < bufferLength; i++) {
            const freq = (i * maxFreq) / bufferLength;
            if (freq < 20) continue; // Don't draw below 20Hz

            const x = freqToX(freq, maxFreq, width);
            const value = (dataArray[i] - analyzerNode.minDecibels) / dbRange;
            const y = (1 - value) * height;

            if (firstX === null) {
                firstX = x;
                firstY = y;
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // --- Fill area under the curve ---
        ctx.shadowBlur = 0; // Turn off glow for the fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color + '90'); // 90% alpha at top
        gradient.addColorStop(1, color + '00'); // 0% alpha at bottom

        ctx.fillStyle = gradient;
        if (firstX !== null && firstY !== null) {
            ctx.lineTo(width, height); // bottom-right
            ctx.lineTo(firstX, height); // bottom-left
            ctx.closePath();
            ctx.fill();
        }

        // --- Draw Frequency Labels ---
        ctx.font = '12px Arial';
        ctx.fillStyle = '#A0A0A0';
        ctx.textAlign = 'center';
        const labels = [60, 100, 250, 500, 1000, 2000, 5000, 10000, 16000];
        labels.forEach(freq => {
            if (freq < maxFreq) {
                const x = freqToX(freq, maxFreq, width);
                const label = freq < 1000 ? `${freq}` : `${freq / 1000}k`;
                ctx.fillText(label, x, height - 10);
            }
        });

        // --- Draw dB Labels ---
        ctx.textAlign = 'left';
        const dbLabels = [-10, -30, -50, -70, -90];
        dbLabels.forEach(db => {
            if (db >= analyzerNode.minDecibels && db <= analyzerNode.maxDecibels) {
                const value = (db - analyzerNode.minDecibels) / dbRange;
                const y = (1 - value) * height;
                ctx.fillText(`${db}`, 5, y + 4);
            }
        });

        // Draw title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(title, 10, 25);

    }, [analyzerNode, canvasRef, color, title]);

    useEffect(() => {
        const animate = () => {
            if (!isAnalyzing) return;
            draw();
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (isAnalyzing) {
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            // Draw one last time when stopping to clear the canvas or show a final state
            draw();
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isAnalyzing, draw]);
};