import { useState, useRef, useCallback } from 'react';
import { synthesizeSpeech } from '@/services/googleTTS';

interface AudioWithBlob extends HTMLAudioElement {
    _blobUrl?: string;
}

async function fetchAudio(text: string): Promise<AudioWithBlob | null> {
    try {
        const base64Audio = await synthesizeSpeech(text);

        // Convert base64 to blob
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url) as AudioWithBlob;
        audio._blobUrl = url;
        return audio;
    } catch (err) {
        console.error('[TTS] Failed to fetch audio:', err);
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
