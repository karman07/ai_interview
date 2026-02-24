import { useState, useRef, useCallback } from 'react';

const TTS_API_URL = "http://localhost:9000/api/tts";

interface AudioWithBlob extends HTMLAudioElement {
    _blobUrl?: string;
}

async function fetchAudio(text: string): Promise<AudioWithBlob | null> {
    try {
        const response = await fetch(TTS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        if (!response.ok) return null;

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url) as AudioWithBlob;
        audio._blobUrl = url;
        return audio;
    } catch {
        return null;
    }
}

export const useInterviewTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const queueRef = useRef<{ text: string; audioPromise: Promise<AudioWithBlob | null> }[]>([]);
    const isProcessingRef = useRef(false);
    const currentAudioRef = useRef<AudioWithBlob | null>(null);
    const cancelledRef = useRef(false);

    const processQueue = useCallback(async () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        cancelledRef.current = false;
        setIsSpeaking(true);

        while (queueRef.current.length > 0 && !cancelledRef.current) {
            const item = queueRef.current.shift()!;

            const audio = await item.audioPromise;
            if (!audio || cancelledRef.current) continue;

            currentAudioRef.current = audio;

            await new Promise<void>((resolve) => {
                audio.onended = () => {
                    if (audio._blobUrl) URL.revokeObjectURL(audio._blobUrl);
                    currentAudioRef.current = null;
                    resolve();
                };
                audio.onerror = () => {
                    if (audio._blobUrl) URL.revokeObjectURL(audio._blobUrl);
                    currentAudioRef.current = null;
                    resolve();
                };
                audio.play().catch(() => resolve());
            });
        }

        isProcessingRef.current = false;
        if (!cancelledRef.current) {
            setIsSpeaking(false);
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!text.trim()) return;
        const audioPromise = fetchAudio(text);
        queueRef.current.push({ text, audioPromise });
        processQueue();
    }, [processQueue]);

    const cancel = useCallback(() => {
        cancelledRef.current = true;

        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
            if (currentAudioRef.current._blobUrl) {
                URL.revokeObjectURL(currentAudioRef.current._blobUrl);
            }
            currentAudioRef.current = null;
        }

        queueRef.current = [];
        isProcessingRef.current = false;
        setIsSpeaking(false);
    }, []);

    return { isSpeaking, speak, cancel };
};
