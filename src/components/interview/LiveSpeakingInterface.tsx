import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveSpeakingInterfaceProps {
  onSubmit: (audioBlob: Blob, transcript: string) => Promise<void>;
  disabled?: boolean;
}

const LiveSpeakingInterface: React.FC<LiveSpeakingInterfaceProps> = ({ onSubmit, disabled }) => {
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [currentSpeech, setCurrentSpeech] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<number>(0);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const currentSpeechRef = useRef<string>('');
  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => {
            const newTranscript = prev + finalTranscript;
            transcriptRef.current = newTranscript;
            return newTranscript;
          });
          setCurrentSpeech('');
          currentSpeechRef.current = '';
          lastSpeechTimeRef.current = Date.now();
        } else {
          setCurrentSpeech(interimTranscript);
          currentSpeechRef.current = interimTranscript;
          if (interimTranscript) {
            lastSpeechTimeRef.current = Date.now();
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopMicrophone();
    };
  }, []);

  useEffect(() => {
    if (isMicEnabled && !disabled) {
      startMicrophone();
    } else {
      stopMicrophone();
    }
  }, [isMicEnabled, disabled]);

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Start audio recording
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();

      // Start speech recognition with error handling
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e: any) {
          console.log('Speech recognition already started or error:', e.message);
          // If already started, stop and restart
          if (e.message.includes('already started')) {
            recognitionRef.current.stop();
            setTimeout(() => {
              if (recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 100);
          }
        }
      }

      // Start audio level detection
      detectAudioLevel();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
      setIsMicEnabled(false);
    }
  };

  const stopMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    setIsListening(false);
  };

  const detectAudioLevel = () => {
    if (!streamRef.current) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(streamRef.current);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    microphone.connect(analyser);
    analyser.fftSize = 512;
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const checkAudioLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);

      // Update activity when speaking
      if (average >= 15) {
        lastSpeechTimeRef.current = Date.now();
        setSilenceTimer(0);
      }

      // Calculate silence duration in seconds
      const silenceDuration = (Date.now() - lastSpeechTimeRef.current) / 1000;
      setSilenceTimer(Math.floor(silenceDuration));

      // Auto-submit after 3 seconds of silence if we have any text
      const hasContent = transcriptRef.current.trim() || currentSpeechRef.current.trim();
      
      if (silenceDuration >= 3 && hasContent && !isSubmittingRef.current) {
        console.log('🚀 AUTO-SUBMIT TRIGGERED:', {
          silenceDuration,
          transcript: transcriptRef.current,
          currentSpeech: currentSpeechRef.current,
          isSubmitting: isSubmittingRef.current
        });
        handleAutoSubmit();
        return;
      }

      setTimeout(() => checkAudioLevel(), 100);
    };

    checkAudioLevel();
  };

  const handleAutoSubmit = async () => {
    const fullTranscript = (transcriptRef.current + ' ' + currentSpeechRef.current).trim();
    if (isSubmittingRef.current || !fullTranscript) {
      console.log('Auto-submit blocked:', { isSubmitting: isSubmittingRef.current, hasContent: !!fullTranscript });
      return;
    }

    console.log('✅ Auto-submitting answer:', fullTranscript);
    setIsSubmitting(true);
    isSubmittingRef.current = true;
    setIsListening(false);

    try {
      // Stop recording and get audio blob
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();

        // Wait for blob to be ready
        await new Promise<void>((resolve) => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = () => resolve();
          }
        });
      }

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      console.log('📤 Submitting audio blob:', audioBlob.size, 'bytes');
      await onSubmit(audioBlob, fullTranscript);

      // Reset for next answer
      setTranscript('');
      transcriptRef.current = '';
      setCurrentSpeech('');
      currentSpeechRef.current = '';
      audioChunksRef.current = [];
      silenceTimerRef.current = 0;
      setSilenceTimer(0);
      lastSpeechTimeRef.current = Date.now();

      // Restart microphone if still enabled
      console.log('🔄 Restarting microphone for next question...');
      if (isMicEnabled) {
        setTimeout(() => {
          console.log('🎤 Starting microphone...');
          startMicrophone();
        }, 800);
      }
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const toggleMicrophone = () => {
    setIsMicEnabled(!isMicEnabled);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Voice Response
        </h3>
        <button
          onClick={toggleMicrophone}
          disabled={disabled || isSubmitting}
          className={`p-3 rounded-full transition-all ${
            isMicEnabled
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Audio Level Indicator */}
      {isMicEnabled && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                animate={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            {isListening && (
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-3 bg-emerald-500 rounded-full"
                    animate={{ height: [8, 16, 8] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {isListening ? 'Listening...' : 'Microphone ready'}
          </p>
        </div>
      )}

      {/* Live Transcript */}
      <div className="min-h-[200px] max-h-[400px] overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
        {transcript || currentSpeech || isMicEnabled ? (
          <div className="space-y-2">
            {transcript && (
              <p className="text-gray-900 dark:text-white leading-relaxed">
                {transcript}
              </p>
            )}
            {currentSpeech && (
              <p className="text-gray-500 dark:text-gray-400 italic">
                {currentSpeech}
              </p>
            )}
            {!transcript && !currentSpeech && isMicEnabled && (
              <p className="text-gray-400 dark:text-gray-500 text-center italic">
                Start speaking... Your answer will appear here
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <Mic className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm text-center">
              Click the microphone button above to start answering
            </p>
          </div>
        )}
      </div>

      {/* Silence Timer Warning */}
      <AnimatePresence>
        {silenceTimer >= 1 && (transcript.trim() || currentSpeech.trim()) && !isSubmitting && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
          >
            <p className="text-sm text-amber-800 dark:text-amber-300 text-center">
              Silence detected... Submitting in {Math.max(0, 3 - silenceTimer)}s
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      {isSubmitting && (
        <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Submitting your answer...
          </span>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Answer will auto-submit after 3 seconds of silence
        </p>
      </div>
    </div>
  );
};

export default LiveSpeakingInterface;
