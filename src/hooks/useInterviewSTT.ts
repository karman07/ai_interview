import { useState, useRef, useCallback } from 'react';

const STT_WS_BASE = "ws://localhost:9000/ws/stt";

function float32ToInt16(float32Array: Float32Array): ArrayBuffer {
    const int16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16.buffer;
}

export const useInterviewSTT = (sessionId: string, onFinalTranscript: (text: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);

    const streamRef = useRef<MediaStream | null>(null);
    const sttSocketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isStoppedRef = useRef(false);
    const finalTranscriptRef = useRef('');

    const onFinalTranscriptRef = useRef(onFinalTranscript);
    onFinalTranscriptRef.current = onFinalTranscript;

    const SILENCE_THRESHOLD = 0.015;
    const SILENCE_DURATION_MS = 2500;

    const cleanup = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setTimeout(() => {
            if (sttSocketRef.current) {
                sttSocketRef.current.close();
                sttSocketRef.current = null;
            }
        }, 2000);

        setIsListening(false);
        setIsTranscribing(false);
    }, []);

    const finalizeAndStop = useCallback(() => {
        if (isStoppedRef.current) return;
        isStoppedRef.current = true;

        const ws = sttSocketRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "end" }));
        }

        cleanup();
    }, [cleanup]);

    const monitorSilence = useCallback((analyser: AnalyserNode) => {
        const dataArray = new Float32Array(analyser.fftSize);
        let isSilent = false;

        const checkVolume = () => {
            if (isStoppedRef.current) return;

            analyser.getFloatTimeDomainData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i] * dataArray[i];
            const rms = Math.sqrt(sum / dataArray.length);

            if (rms < SILENCE_THRESHOLD) {
                if (!isSilent) {
                    isSilent = true;
                    silenceTimerRef.current = setTimeout(() => {
                        const text = finalTranscriptRef.current?.trim();
                        if (text) {
                            console.log("[STT] Silence detected, sending:", text.substring(0, 60));
                            onFinalTranscriptRef.current(text);
                        }
                        finalizeAndStop();
                    }, SILENCE_DURATION_MS);
                }
            } else {
                isSilent = false;
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = null;
                }
            }

            animFrameRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();
    }, [finalizeAndStop]);

    const startListening = useCallback(() => {
        isStoppedRef.current = false;
        finalTranscriptRef.current = '';

        navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
            }
        }).then(stream => {
            streamRef.current = stream;

            const sttWs = new WebSocket(`${STT_WS_BASE}/${sessionId}`);
            sttSocketRef.current = sttWs;

            sttWs.onopen = () => {
                console.log("[STT WS] Connected");
                setIsTranscribing(true);
            };

            sttWs.onmessage = (event) => {
                if (isStoppedRef.current) return;

                const data = JSON.parse(event.data);
                if (data.type === 'partial') {
                    setTranscript(data.text);
                } else if (data.type === 'final') {
                    finalTranscriptRef.current = data.text;
                    setTranscript(data.text);
                }
            };

            sttWs.onerror = (err) => console.error("[STT WS] Error:", err);
            sttWs.onclose = () => console.log("[STT WS] Disconnected");

            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);

            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (isStoppedRef.current) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmData = float32ToInt16(inputData);
                if (sttWs.readyState === WebSocket.OPEN) {
                    sttWs.send(pcmData);
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);

            setIsListening(true);
            setTranscript('');

            monitorSilence(analyser);
        }).catch(err => {
            console.error("Microphone access denied:", err);
        });
    }, [sessionId, monitorSilence]);

    const stopListening = useCallback(() => {
        const text = finalTranscriptRef.current?.trim();
        if (text && !isStoppedRef.current) {
            onFinalTranscriptRef.current(text);
        }
        finalizeAndStop();
    }, [finalizeAndStop]);

    return { isListening, transcript, startListening, stopListening, isTranscribing };
};
