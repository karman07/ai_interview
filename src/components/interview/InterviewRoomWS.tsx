import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import http from '@/api/http';
import { useAuth } from '@/contexts/AuthContext';
import { useInterviewWebSocket, type WSInitData } from '@/hooks/useInterviewWebSocket';
import { useInterviewTimer } from '@/hooks/useInterviewTimer';
import { useInterviewWebcam } from '@/hooks/useInterviewWebcam';
import { useInterviewSTT } from '@/hooks/useInterviewSTT';
import { useInterviewTTS } from '@/hooks/useInterviewTTS';
import { WSVideoPanel } from './ws/VideoPanel';
import { WSTranscriptPanel } from './ws/TranscriptPanel';
import { WSCodeEditor } from './ws/CodeEditor';
import { WSInterviewTimer } from './ws/InterviewTimer';
import { ThreeAvatar } from './ws/ThreeAvatar';
import { Loader2, Mic, MicOff, Video, VideoOff, LogOut, ShieldCheck, Zap } from 'lucide-react';
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

    // TTS buffering refs
    const bufferRef = useRef('');
    const processedTextLengthRef = useRef(0);
    const lastModelMsgIdRef = useRef<number | null>(null);

    // ── Auto-start camera on mount ──
    useEffect(() => {
        startCamera();
    }, [startCamera]);

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
    if (!setupData) {
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
                        <div className="text-center space-y-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin mx-auto" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight animate-pulse">Initializing AI Coach...</h2>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#F8FAFF] dark:bg-slate-950 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Header */}
            <header className="h-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-b border-blue-50 dark:border-slate-800 shrink-0 z-20">
                <div className="max-w-[1920px] mx-auto h-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <motion.div
                            initial={{ rotate: -10, scale: 0.9 }}
                            animate={{ rotate: 0, scale: 1 }}
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
                        >
                            AI
                        </motion.div>
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <span className="text-blue-600 capitalize">{type || 'Technical'}</span>
                                <span className="opacity-40 font-medium">Session</span>
                            </h1>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500/50" />
                                {setupData.role || 'General'} AT {setupData.company || 'Private Cloud'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="px-5 py-2.5 bg-slate-900 dark:bg-white rounded-2xl shadow-xl shadow-slate-200 dark:shadow-none transition-all flex items-center gap-3">
                            <WSInterviewTimer formattedTime={formattedTime} />
                        </div>

                        {/* Connection Badge */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${isConnected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-rose-500 animate-pulse'}`} />
                            {isConnected ? 'Real-time Link Active' : 'Link Interrupted'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 min-h-0 flex flex-col p-6 gap-6">
                <div className="flex-1 min-h-0 flex gap-6 max-w-[1920px] mx-auto w-full">

                    {/* Perspective: Left UI */}
                    <div className="w-[420px] flex flex-col gap-6 shrink-0 min-h-0 overflow-hidden">
                        {/* Avatar / Interviewer Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-blue-50 dark:border-slate-800 shadow-sm overflow-hidden h-[340px] relative group">
                            <ThreeAvatar
                                isSpeaking={isSpeaking}
                                isListening={isListening}
                            />

                            {/* User Webcam PIP */}
                            <div className="absolute top-6 right-6 w-32 h-40 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl backdrop-blur-md bg-slate-900/40 group-hover:scale-105 transition-all duration-500 z-10">
                                {webcamActive ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover scale-x-[-1]"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-800/50">
                                        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                                            <VideoOff className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Feed Off</span>
                                    </div>
                                )}
                            </div>

                            {/* AI Identity Card Overlay */}
                            <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/30 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Interviewer</p>
                                    <h3 className="text-sm font-black text-blue-400 tracking-wide uppercase">Nexus Pro Engine</h3>
                                </div>
                                <div className="flex gap-1.5 h-4 items-center">
                                    {[1, 2, 3, 4].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={isSpeaking ? { height: [4, 16, 4] } : { height: 4 }}
                                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                            className="w-1 bg-blue-500/80 rounded-full"
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
                    </div>

                    {/* Perspective: Center UI (Code/Task) */}
                    <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-blue-50 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <WSCodeEditor onSubmitCode={handleSubmitCode} />
                    </div>
                </div>
            </main>

            {/* Interaction Bar */}
            <footer className="h-24 bg-white/80 dark:bg-black/40 backdrop-blur-2xl border-t border-blue-50 dark:border-slate-900 px-8 flex items-center justify-center relative z-20">
                <div className="max-w-[1920px] w-full flex items-center justify-between">

                    {/* Media Switches */}
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleCamera}
                            className={`p-4 rounded-2xl transition-all border flex items-center gap-3 font-bold text-xs uppercase tracking-widest ${webcamActive
                                ? 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border-slate-100 dark:border-slate-700'
                                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-500 border-rose-100 dark:border-rose-900/30 shadow-inner'}`}
                        >
                            {webcamActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                            <span className="hidden lg:block">{webcamActive ? 'Camera On' : 'Camera Off'}</span>
                        </motion.button>

                        <div className="h-10 w-px bg-slate-100 dark:bg-slate-800 mx-2" />

                        <div className="flex items-center gap-2 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Environment Secure</span>
                        </div>
                    </div>

                    {/* Primary Command */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-12">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleToggleMic}
                            className={`flex flex-col items-center justify-center w-28 h-28 rounded-full transition-all duration-300 shadow-2xl ${isListening
                                ? 'bg-rose-500 text-white shadow-rose-200 dark:shadow-rose-900/40 ring-8 ring-rose-500/20'
                                : 'bg-blue-600 text-white shadow-blue-200 dark:shadow-blue-900/40 hover:bg-blue-700 ring-8 ring-blue-600/10'
                                }`}
                        >
                            {isListening ? (
                                <>
                                    <MicOff className="w-8 h-8 mb-1" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Mute</span>
                                </>
                            ) : (
                                <>
                                    <Mic className="w-8 h-8 mb-1" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Speak</span>
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Session Exit */}
                    <div className="flex items-center gap-4">
                        <div className="hidden xl:flex items-center gap-1.5 px-4 py-2 bg-blue-50/50 dark:bg-blue-500/5 rounded-full text-[10px] font-bold text-blue-600/60 uppercase tracking-widest">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Encrypted Stream
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleEndSession}
                            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 transition-all shadow-sm"
                        >
                            <LogOut className="w-5 h-5" />
                            Finish Interview
                        </motion.button>
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
