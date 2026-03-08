import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import http from '@/api/http';
import { useAuth } from '@/contexts/AuthContext';
import { useInterviewWebSocket, type WSInitData } from '@/hooks/useInterviewWebSocket';
import { useInterviewTimer } from '@/hooks/useInterviewTimer';
import { useInterviewWebcam } from '@/hooks/useInterviewWebcam';
import { useInterviewSTT } from '@/hooks/useInterviewSTT';
import { useInterviewTTS } from '@/hooks/useInterviewTTS';
import { WSTranscriptPanel } from './ws/TranscriptPanel';
import { WSCodeEditor } from './ws/CodeEditor';
import { WSInterviewTimer } from './ws/InterviewTimer';
import { ThreeAvatar } from './ws/ThreeAvatar';
import { Loader2, Mic, MicOff, Video, VideoOff, LogOut, ShieldCheck, Zap, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * InterviewRoomWS — Replaces InterviewRoomV2 at the route level.
 * Uses the Python WebSocket backend for real-time AI interview execution.
 */
export default function InterviewRoomWS() {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // ── Setup data from localStorage ──
    const [setupData, setSetupData] = useState<WSInitData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem('ws_interview_setup');
        if (!raw) {
            setError('No interview setup data found. Please start from the setup page.');
            return;
        }

        try {
            const parsed = JSON.parse(raw);
            setSetupData({
                resumeText: parsed.resumeText || '',
                jdText: parsed.jdText || '',
                interviewType: parsed.roundType || type || 'technical',
                role: parsed.role || '',
                company: parsed.company || '',
                duration: parsed.duration || 0,
            });
        } catch {
            setError('Failed to parse interview setup data.');
        }
    }, [type]);

    // ── Generate a stable client ID that survives page refresh ──
    const clientId = useMemo(() => {
        const key = 'ws_interview_client_id';
        let id = localStorage.getItem(key);
        if (!id) {
            id = `ws_${user?._id || 'anon'}_${Date.now()}`;
            localStorage.setItem(key, id);
        }
        return id;
    }, [user]);

    // ── Hooks ──
    const { isConnected, messages, sendMessage, sendEndSession, isStreamingResponse, feedback, interviewEnded, isEnding } =
        useInterviewWebSocket(clientId, setupData);
    const { formattedTime } = useInterviewTimer();
    const { videoRef, isActive: webcamActive, startCamera, toggleCamera } = useInterviewWebcam();
    const { isSpeaking, speak, cancel } = useInterviewTTS();

    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [initProgress, setInitProgress] = useState(0);
    const [initStatus, setInitStatus] = useState('Establishing secure connection...');

    // Simulate progress while waiting for connection and first question
    useEffect(() => {
        if (error) return;

        if (!isConnected) {
            const timer = setInterval(() => {
                setInitProgress(prev => {
                    if (prev < 30) {
                        setInitStatus('Connecting to AI Nexus...');
                        return prev + 2;
                    }
                    if (prev < 60) {
                        setInitStatus('Analyzing Resume & Context...');
                        return prev + 1;
                    }
                    if (prev < 85) {
                        setInitStatus('Generating Interview Strategy...');
                        return prev + 0.5;
                    }
                    return prev;
                });
            }, 100);
            return () => clearInterval(timer);
        } else if (isConnected && messages.length === 0) {
            // We are connected but waiting for the first AI message
            setInitStatus('Interviewer is entering the room...');
            const timer = setInterval(() => {
                setInitProgress(prev => {
                    if (prev < 98) return prev + 0.2;
                    return prev;
                });
            }, 200);
            return () => clearInterval(timer);
        } else if (messages.length > 0) {
            setInitProgress(100);
            setInitStatus('Session Established. Good luck!');
        }
    }, [isConnected, error, messages.length]);

    // TTS buffering refs
    const bufferRef = useRef('');
    const processedTextLengthRef = useRef(0);
    const lastModelMsgIdRef = useRef<number | null>(null);

    // ── Auto-start camera on mount ──
    useEffect(() => {
        startCamera();
    }, [startCamera]);

    // ── Auto-detect if AI requires code ──
    useEffect(() => {
        if (messages.length === 0) return;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'model') {
            // Check if AI sent a code block or explicitly mentioned coding
            const codingKeywords = ['code', 'implement', 'function', 'algorithm', 'editor', 'programming', 'write a', 'snippet'];
            const content = lastMsg.content.toLowerCase();
            const hasCodeBlock = lastMsg.content.includes('```');
            const mentionsCoding = codingKeywords.some(keyword => content.includes(keyword));

            if (hasCodeBlock || mentionsCoding) {
                setShowCodeEditor(true);
            }
        }
    }, [messages]);

    // ── TTS Buffering Logic (same as original App.jsx) ──
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role !== 'model') return;

        const msgIdx = messages.length - 1;
        if (lastModelMsgIdRef.current !== msgIdx) {
            lastModelMsgIdRef.current = msgIdx;
            processedTextLengthRef.current = 0;
            bufferRef.current = '';
        }

        const fullText = lastMsg.content;
        const newText = fullText.slice(processedTextLengthRef.current);
        if (!newText) return;

        bufferRef.current += newText;
        processedTextLengthRef.current = fullText.length;

        const sentenceBreak = /[.!?]\s+/;
        const parts = bufferRef.current.split(sentenceBreak);
        if (parts.length > 1) {
            const completeSentences = parts.slice(0, -1).join('. ');
            bufferRef.current = parts[parts.length - 1];
            if (completeSentences.trim()) {
                speak(completeSentences.trim());
            }
        }
    }, [messages, speak]);

    // Flush remaining buffer when streaming ends
    useEffect(() => {
        if (!isStreamingResponse && bufferRef.current.trim()) {
            speak(bufferRef.current.trim());
            bufferRef.current = '';
        }
    }, [isStreamingResponse, speak]);

    // ── STT handler ──
    const handleFinalTranscript = useCallback((text: string) => {
        sendMessage(text);
    }, [sendMessage]);

    const { isListening, transcript, startListening, stopListening, isTranscribing } =
        useInterviewSTT(clientId, handleFinalTranscript);

    // ── Code submission ──
    const handleSubmitCode = useCallback((code: string, language: { id: string; name: string }) => {
        if (sendMessage && code.trim()) {
            const codeMessage = `Here is my ${language.name} solution:\n\n\`\`\`${language.id}\n${code}\n\`\`\`\n\nI'd like you to review this code.`;
            sendMessage(codeMessage);
        }
    }, [sendMessage]);

    // ── End Session ──
    const handleEndSession = useCallback(() => {
        if (!window.confirm('Are you sure you want to end this interview session?')) return;
        cancel();
        bufferRef.current = '';
        processedTextLengthRef.current = 0;
        lastModelMsgIdRef.current = null;
        sendEndSession();
    }, [cancel, sendEndSession]);

    // ── Handle interview ended — save results and navigate ──
    useEffect(() => {
        if (interviewEnded && feedback) {
            // Save feedback for the results page
            const report = {
                ...feedback,
                session_id: clientId,
                conversation: messages.map(m => ({
                    role: m.role === 'model' ? 'interviewer' : 'candidate',
                    content: m.content,
                })),
            };

            localStorage.setItem('v2_interview_report', JSON.stringify(report));

            // Post external analytics to backend, including context metadata
            const externalPayload = {
                ...feedback,
                role: setupData?.role || 'Software Engineer',
                company: setupData?.company || '',
                round: setupData?.interviewType || 'technical',
                session_id: clientId
            };
            http.post('/enhanced-interview/external-analytics', externalPayload).catch(err => {
                console.error('Failed to save external analytics to backend:', err);
            });

            localStorage.removeItem('ws_interview_setup');
            localStorage.removeItem('ws_interview_client_id');

            // Navigate to results page
            navigate(`/interview/results/${clientId}`);
        }
    }, [interviewEnded, feedback, clientId, messages, navigate, setupData]);

    // ── Toggle mic ──
    const handleToggleMic = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            cancel(); // Stop TTS before listening
            startListening();
        }
    }, [isListening, stopListening, startListening, cancel]);

    // ── Loading/Error states ──
    const isActuallyLoading = (messages.length === 0 || !isConnected) && !interviewEnded;

    if (isActuallyLoading || error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <AnimatePresence>
                    {error ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 rounded-[2.5rem] p-12 max-w-md text-center shadow-2xl shadow-rose-500/5"
                        >
                            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-10 h-10 text-rose-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Access Denied</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">{error}</p>
                            <button
                                onClick={() => navigate('/interview_round')}
                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Return to Dashboard
                            </button>
                        </motion.div>
                    ) : (
                        <div className="text-center space-y-8 w-full max-w-md">
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-24 h-24 rounded-full border-4 border-blue-600/10 border-t-blue-600 animate-spin mx-auto"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                    <span>{initStatus}</span>
                                    <span>{Math.round(initProgress)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${initProgress}%` }}
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                                    />
                                </div>
                                <p className="text-sm font-bold text-slate-500 animate-pulse">Please wait while we prepare your personalized interview session.</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#F8FAFF] dark:bg-slate-950 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Header: Minimal & Immersive */}
            <header className="h-16 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b border-blue-50/50 dark:border-slate-800/50 shrink-0 z-20">
                <div className="max-w-[1920px] mx-auto h-full px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-sm font-black tracking-tight flex items-center gap-2">
                                <span className="text-blue-600 capitalize">{type || 'Technical'}</span>
                                <span className="opacity-30">/</span>
                                <span className="text-slate-400 font-bold">{setupData.company || 'Private Session'}</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCodeEditor(!showCodeEditor)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${showCodeEditor ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                        >
                            <Code className="w-3.5 h-3.5" />
                            {showCodeEditor ? 'Close Editor' : 'Open Editor'}
                        </motion.button>

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                        <div className="flex items-center gap-2">
                            <WSInterviewTimer formattedTime={formattedTime} />
                            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-rose-500 animate-pulse'}`} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 min-h-0 flex flex-col p-4 md:p-6 gap-4">
                <div className="flex-1 min-h-0 flex gap-4 max-w-[1600px] mx-auto w-full">

                    {/* Left UI: Always visible */}
                    <motion.div
                        animate={{ width: showCodeEditor ? 380 : "100%", maxWidth: showCodeEditor ? 380 : 800 }}
                        className="flex flex-col gap-4 shrink-0 min-h-0 overflow-hidden mx-auto"
                    >
                        {/* Avatar / Interviewer Card */}
                        <div className={`bg-white dark:bg-slate-900 rounded-[2rem] border border-blue-50 dark:border-slate-800 shadow-sm overflow-hidden relative group transition-all duration-500 ${showCodeEditor ? 'h-[300px]' : 'h-[380px]'}`}>
                            <ThreeAvatar
                                isSpeaking={isSpeaking}
                                isListening={isListening}
                            />

                            {/* User Webcam PIP: More minimal */}
                            <div className="absolute top-4 right-4 w-24 h-32 rounded-2xl overflow-hidden border border-white/10 shadow-xl backdrop-blur-md bg-slate-900/40 z-10">
                                {webcamActive ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover scale-x-[-1]"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800/40">
                                        <VideoOff className="w-4 h-4 text-slate-600" />
                                    </div>
                                )}
                            </div>

                            {/* Identity Overlay: Compact */}
                            <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/20 backdrop-blur-md rounded-xl border border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                                    {(messages.length > 0 && messages[messages.length - 1].role === 'user' && !isStreamingResponse && !isSpeaking) ? 'Nexus Pro Engine (Thinking...)' : 'Nexus Pro Engine'}
                                </span>
                                <div className="flex gap-1 h-3 items-center">
                                    {[1, 2, 3].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={(isSpeaking || (messages.length > 0 && messages[messages.length - 1].role === 'user' && !isStreamingResponse && !isSpeaking)) ? { height: [3, 12, 3] } : { height: 3 }}
                                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                            className={`w-0.5 rounded-full ${(messages.length > 0 && messages[messages.length - 1].role === 'user' && !isStreamingResponse && !isSpeaking) ? 'bg-orange-400' : 'bg-blue-400'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Dialogue / Transcript Panel */}
                        <div className="flex-1 min-h-0">
                            <WSTranscriptPanel
                                messages={messages}
                                transcript={transcript}
                                isListening={isListening}
                                isSpeaking={isSpeaking}
                                isTranscribing={isTranscribing}
                            />
                        </div>
                    </motion.div>

                    {/* Perspective: Center/Right UI (Code/Task) */}
                    <AnimatePresence>
                        {showCodeEditor && (
                            <motion.div
                                initial={{ x: 40, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 40, opacity: 0 }}
                                className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-[2rem] border border-blue-50 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
                            >
                                <WSCodeEditor onSubmitCode={handleSubmitCode} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Interaction Bar: Compact footer */}
            <footer className="h-20 bg-white/40 dark:bg-black/20 backdrop-blur-xl border-t border-blue-50/50 dark:border-slate-900/50 px-8 flex items-center justify-center relative z-20">
                <div className="max-w-[1600px] w-full flex items-center justify-between">

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleCamera}
                            className={`p-3 rounded-xl transition-all border ${webcamActive ? 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700' : 'bg-rose-50 text-rose-500 border-rose-100'}`}
                        >
                            {webcamActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        </button>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 hidden sm:block">Encrypted Link</span>
                    </div>

                    {/* Primary Command: Smaller & Scaled */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-10">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleToggleMic}
                            className={`flex flex-col items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl ${isListening
                                ? 'bg-rose-500 text-white shadow-rose-200 dark:shadow-rose-900/20'
                                : 'bg-blue-600 text-white shadow-blue-200 dark:shadow-blue-900/20'
                                }`}
                        >
                            {isListening ? <MicOff className="w-6 h-6 mb-1" /> : <Mic className="w-6 h-6 mb-1" />}
                            <span className="text-[9px] font-black uppercase tracking-widest">{isListening ? 'Stop' : 'Speak'}</span>
                        </motion.button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleEndSession}
                            className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 dark:bg-rose-900/20 text-white dark:text-rose-400 transition-all hover:bg-slate-800"
                        >
                            Finish
                        </button>
                    </div>
                </div>
            </footer>

            {/* Narrative State: Transitioning */}
            <AnimatePresence>
                {isEnding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ y: 20, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            className="bg-white/5 dark:bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-16 max-w-xl w-full text-center shadow-2xl flex flex-col items-center gap-10"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="w-32 h-32 rounded-full border-4 border-blue-500/10 border-t-blue-500"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-blue-500" />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-white tracking-tight">Compiling Verdict</h2>
                                <p className="text-blue-200/60 font-medium text-lg max-w-sm mx-auto leading-relaxed">
                                    Our AI agents are analyzing your responses to generate a detailed performance breakdown.
                                </p>
                            </div>

                            <div className="flex gap-4 items-center px-8 py-3 bg-white/5 rounded-full border border-white/10">
                                <motion.span
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-blue-400 text-xs font-black uppercase tracking-[0.2em]"
                                >
                                    Synthesizing behavioral patterns...
                                </motion.span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
