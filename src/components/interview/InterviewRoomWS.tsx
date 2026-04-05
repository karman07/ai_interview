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
import { Loader2, Mic, MicOff, Video, VideoOff, LogOut, ShieldCheck, Zap, Code, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@/components/ui/Dialog';

/**
 * InterviewRoomWS — Replaces InterviewRoomV2 at the route level.
 * Uses the Python WebSocket backend for real-time Ai for job execution.
 */
export default function InterviewRoomWS() {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // ── Setup data from localStorage ──
    const [setupData, setSetupData] = useState<WSInitData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // ── Clear any stale report from a prior session immediately ──
        localStorage.removeItem('v2_interview_report');
        console.log('[InterviewRoomWS] Cleared stale v2_interview_report from localStorage');

        const raw = localStorage.getItem('ws_interview_setup');
        if (!raw) {
            setError('No interview setup data found. Please start from the setup page.');
            return;
        }

        try {
            const parsed = JSON.parse(raw);
            console.log('[InterviewRoomWS] Loaded setup data. resumeText length:', parsed.resumeText?.length || 0, '| resumeUrl:', parsed.resumeUrl || 'none', '| resumePath:', parsed.resumePath || 'none');
            setSetupData({
                resumeText: parsed.resumeText || '',
                resumeUrl: parsed.resumeUrl || '',
                resumePath: parsed.resumePath || '',
                jdText: parsed.jdText || '',
                interviewType: parsed.roundType || type || 'technical',
                role: parsed.role || '',
                company: parsed.company || '',
                duration: parsed.duration || 0,
                candidateName: parsed.candidateName || '',
            });
        } catch {
            setError('Failed to parse interview setup data.');
        }
    }, [type]);

    // ── Generate a unique client ID for each interview session ──
    // Do NOT persist to localStorage — each mount is a fresh interview session,
    // ensuring the backend creates a new AI-usage record rather than overwriting
    // the previous session's token counts.
    const clientId = useMemo(() => {
        return `ws_${user?._id || 'anon'}_${Date.now()}`;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Hooks ──
    const { isConnected, messages, sendMessage, sendEndSession, isStreamingResponse, feedback, interviewEnded, isEnding, error: wsError, isCodingQuestion, isWaitingForResponse, endReason } =
        useInterviewWebSocket(clientId, setupData);
    const { formattedTime, isTimeUp } = useInterviewTimer(setupData?.duration || 0);
    const { videoRef, isActive: webcamActive, startCamera, toggleCamera } = useInterviewWebcam();
    const { isSpeaking, speak, cancel } = useInterviewTTS();

    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [isQuestionBoxOpen, setIsQuestionBoxOpen] = useState(false);
    const [isTypingInEditor, setIsTypingInEditor] = useState(false);
    const editorTypingTimerRef = useRef<any>(null);
    const [initProgress, setInitProgress] = useState(0);
    const [initStatus, setInitStatus] = useState('Establishing secure connection...');
    const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
    const [showTimeUpBanner, setShowTimeUpBanner] = useState(false);
    const timeUpHandledRef = useRef(false);

    // ── Time-up handling: when frontend timer crosses the duration limit ──
    useEffect(() => {
        if (isTimeUp && !timeUpHandledRef.current && !interviewEnded && !isEnding && messages.length > 0) {
            timeUpHandledRef.current = true;
            setShowTimeUpBanner(true);
            // Wait 3 seconds to show the banner, then auto-end the session
            const timer = setTimeout(() => {
                cancel();
                bufferRef.current = '';
                processedTextLengthRef.current = 0;
                lastModelMsgIdRef.current = null;
                sendEndSession('time_expired');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isTimeUp, interviewEnded, isEnding, messages.length, sendEndSession, cancel]);

    // ── Browser/tab close handler ──
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // If session is active and user has answered at least 1 question, warn them
            if (!interviewEnded && messages.filter(m => m.role === 'user').length > 0) {
                // Best-effort send of browser_closed reason
                if (isConnected) {
                    const token = localStorage.getItem('access_token');
                    const wsUrl = (import.meta.env.VITE_INTERVIEW_WS_URL || 'ws://localhost:9000/ws/stream') + `/${clientId}?token=${encodeURIComponent(token || '')}`;
                    // Use sendBeacon is not available for WebSocket; just mark in localStorage
                    localStorage.setItem('ws_interview_terminated_reason', JSON.stringify({
                        clientId,
                        reason: 'browser_closed',
                        timestamp: Date.now(),
                    }));
                }
                e.preventDefault();
                e.returnValue = 'Your interview is still in progress. Are you sure you want to leave?';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [interviewEnded, isConnected, messages, clientId]);

    // Code explanation workflow: after user submits code, listen for voice explanation
    const [awaitingCodeExplanation, setAwaitingCodeExplanation] = useState(false);
    const [pendingCodeSubmission, setPendingCodeSubmission] = useState<{ code: string; language: { id: string; name: string } } | null>(null);

    // Simulate progress while waiting for connection and first question
    useEffect(() => {
        if (error) return;

        if (!isConnected) {
            const timer = setInterval(() => {
                setInitProgress(prev => {
                    if (prev < 30) {
                        setInitStatus('Connecting to Ryntra AI...');
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

    // ── Update showCodeEditor based on AI signal ──
    useEffect(() => {
        setShowCodeEditor(isCodingQuestion);
    }, [isCodingQuestion]);

    // ── Keyword-based fallback: open editor if question text contains code-trigger words ──
    useEffect(() => {
        if (messages.length === 0) return;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role !== 'model' || isStreamingResponse) return;
        const CODE_TRIGGERS = /\b(write|implement|code|program|function|algorithm|script|solution|snippet|define a|create a function|build a|develop a)\b/i;
        if (CODE_TRIGGERS.test(lastMsg.content)) {
            setShowCodeEditor(true);
        }
    }, [messages, isStreamingResponse]);
    // ── Auto-open/close question box ──
    useEffect(() => {
        if (messages.length === 0) return;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'model') {
            setIsQuestionBoxOpen(true);
        } else if (lastMsg.role === 'user') {
            setIsQuestionBoxOpen(false);
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

        // Lookbehind keeps the . ! ? attached to the sentence before splitting
        const sentenceBreak = /(?<=[.!?])\s+/;
        const parts = bufferRef.current.split(sentenceBreak);
        if (parts.length > 1) {
            const completeSentences = parts.slice(0, -1).join(' ');
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

    // STT handler
    const handleFinalTranscript = useCallback((text: string) => {
        // If we're waiting for code explanation, combine with code and send
        if (awaitingCodeExplanation && pendingCodeSubmission) {
            const codeMessage = `Here is my ${pendingCodeSubmission.language.name} solution:\n\n\`\`\`${pendingCodeSubmission.language.id}\n${pendingCodeSubmission.code}\n\`\`\`\n\nExplanation: ${text}`;
            sendMessage(codeMessage);
            setAwaitingCodeExplanation(false);
            setPendingCodeSubmission(null);
            setShowCodeEditor(false);
        } else {
            // Normal flow: just send the transcribed text
            sendMessage(text);
        }
    }, [sendMessage, awaitingCodeExplanation, pendingCodeSubmission]);

    const { isListening, transcript, startListening, stopListening, isTranscribing } =
        useInterviewSTT(clientId, handleFinalTranscript);

    // Close question box when user starts speaking/transcribing
    useEffect(() => {
        if (isListening || isTranscribing) {
            setIsQuestionBoxOpen(false);
        }
    }, [isListening, isTranscribing, setIsQuestionBoxOpen]);

    // ── Code submission ──
    const handleSubmitCode = useCallback((code: string, language: { id: string; name: string }) => {
        if (!code.trim()) return;
        
        // Store the code submission and mark that we're waiting for explanation
        setPendingCodeSubmission({ code, language });
        setAwaitingCodeExplanation(true);
        
        // Cancel any ongoing AI voice playback
        cancel();
        
        // Auto-start listening for the user's code explanation after a brief delay
        setTimeout(() => {
            startListening();
        }, 200);
    }, [cancel, startListening]);

    // ── Track typing in code editor to suppress idle dialog ──
    const handleEditorTyping = useCallback(() => {
        setIsTypingInEditor(true);
        clearTimeout(editorTypingTimerRef.current);
        // Reset "typing" state after 10s of no key presses
        editorTypingTimerRef.current = setTimeout(() => {
            setIsTypingInEditor(false);
        }, 10000);
    }, []);

    // ── End Session ──
    const userMessageCount = useMemo(() => messages.filter(m => m.role === 'user').length, [messages]);

    const handleEndSession = useCallback((forceConfirm: any = false) => {
        const isForce = typeof forceConfirm === 'boolean' && forceConfirm;
        if (isForce) {
            cancel();
            bufferRef.current = '';
            processedTextLengthRef.current = 0;
            lastModelMsgIdRef.current = null;
            sendEndSession('user_terminated');
            return;
        }
        setIsEndDialogOpen(true);
    }, [cancel, sendEndSession]);

    const confirmEndSession = () => {
        setIsEndDialogOpen(false);
        cancel();
        bufferRef.current = '';
        processedTextLengthRef.current = 0;
        lastModelMsgIdRef.current = null;
        // Always signal backend so session is cleaned up and no fake report is generated.
        sendEndSession();
        if (userMessageCount === 0) {
            // For early exits with no answers, move user out immediately.
            navigate('/interview_round', { replace: true });
        }
    };

    // ── Idle Timer Logic ──
    const [showIdlePrompt, setShowIdlePrompt] = useState(false);
    const idleTimerRef = useRef<any>(null);
    const endingTimerRef = useRef<any>(null);

    useEffect(() => {
        // ── Idle Timer Logic (Disabled as per user request) ──
        /*
        const isUserTurn = messages.length > 0 &&
            messages[messages.length - 1].role === 'model' &&
            !isStreamingResponse &&
            !isSpeaking;

        // When code editor is open (but user is NOT typing), use a longer timeout (5 min)
        const idleTimeout = showCodeEditor ? 300000 : 30000;

        if (isUserTurn && !isListening) {
            idleTimerRef.current = setTimeout(() => {
                // Still don't show dialog if code editor is open
                if (showCodeEditor) {
                    // Just silently extend — don't interrupt
                    return;
                }
                setShowIdlePrompt(true);
                // After idle timeout + 5s: end interview automatically
                endingTimerRef.current = setTimeout(() => {
                    handleEndSession(true);
                }, 5000);
            }, idleTimeout);
        } else {
            clearTimeout(idleTimerRef.current);
            clearTimeout(endingTimerRef.current);
            setShowIdlePrompt(false);
        }
        */

        return () => {
            clearTimeout(idleTimerRef.current);
            clearTimeout(endingTimerRef.current);
        };
    }, [messages, isStreamingResponse, isSpeaking, isListening, isConnected, interviewEnded, showCodeEditor, isTypingInEditor, handleEndSession]);


    // ── Increment interview count when first AI message arrives (interview truly started) ──
    const countIncrementedRef = useRef(false);
    useEffect(() => {
        if (messages.length === 1 && messages[0].role === 'model' && !countIncrementedRef.current) {
            countIncrementedRef.current = true;
            http.post('/users/me/track-interview').catch(err =>
                console.warn('[InterviewRoomWS] Failed to track interview start:', err)
            );
        }
    }, [messages]);

    // ── Handle interview ended — save results and navigate ──
    const hasEndedRef = useRef(false);
    useEffect(() => {
        if (interviewEnded && feedback && !hasEndedRef.current) {
            hasEndedRef.current = true;
            
            // Count user messages (actual answers)
            const userMessageCount = messages.filter(m => m.role === 'user').length;

            // Save feedback for local fallback
            const report = {
                ...feedback,
                session_id: clientId,
                conversation: messages.map(m => ({
                    role: m.role === 'model' ? 'interviewer' : 'candidate',
                    content: m.content,
                })),
            };

            localStorage.setItem('v2_interview_report', JSON.stringify(report));

            localStorage.removeItem('ws_interview_setup');
            localStorage.removeItem('ws_interview_client_id');

            // Only save full analytics to backend if user actually answered questions
            if (userMessageCount > 0) {
                // Post external analytics to backend, including context metadata
                const externalPayload = {
                    ...feedback,
                    role: setupData?.role || 'Software Engineer',
                    company: setupData?.company || '',
                    round: setupData?.interviewType || 'technical',
                    session_id: clientId,
                    end_reason: endReason || 'user_terminated',
                };

                http.post('/enhanced-interview/external-analytics', externalPayload).then(res => {
                    // Get the real MongoDB ID
                    const dbId = res.data?._id || res.data?.id || clientId;
                    navigate(`/interview/results/${dbId}`, { replace: true });
                }).catch(err => {
                    console.error('Failed to save external analytics to backend:', err);
                    navigate(`/interview/results/${clientId}`, { replace: true });
                });
            } else {
                // No answers given — count was already incremented at interview start
                console.log('[InterviewRoomWS] No answers given — navigating back');
                navigate('/interview_round', { replace: true });
            }
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


    // ── Repeat last AI question ──
    const handleRepeatQuestion = useCallback(() => {
        const lastModelMsg = [...messages].reverse().find(m => m.role === 'model');
        if (lastModelMsg) {
            cancel();
            speak(lastModelMsg.content);
        }
    }, [messages, cancel, speak]);

    // ── Derived states ──
    const isThinking = isWaitingForResponse || (
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user'
    );

    // ── Loading/Error states ──
    const isActuallyLoading = (messages.length === 0 || !isConnected) && !interviewEnded;
    const displayError = error || wsError;
    const isNoAnswersError = displayError?.includes('No answers were recorded');

    // ── Special screen: no answers given ──
    if (isNoAnswersError) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 max-w-md text-center shadow-2xl"
                >
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-amber-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Session Ended</h2>
                    <p className="text-slate-400 font-medium leading-relaxed mb-2">
                        No responses were recorded during this interview session.
                    </p>
                    <p className="text-slate-500 text-sm mb-8">
                        A report can only be generated after you answer at least one question. Please start a new interview and participate to receive a score.
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('ws_interview_setup');
                            localStorage.removeItem('ws_interview_client_id');
                            navigate('/interview_round', { replace: true });
                        }}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Back to Interview Setup
                    </button>
                </motion.div>
            </div>
        );
    }

    if (isActuallyLoading || displayError) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <AnimatePresence>
                    {displayError ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 rounded-[2.5rem] p-12 max-w-md text-center shadow-2xl shadow-rose-500/5"
                        >
                            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-10 h-10 text-rose-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">System Notice</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">{displayError}</p>
                            <div className="flex flex-col gap-3">
                                {wsError && (
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Reconnect Session
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate('/interview_round', { replace: true })}
                                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] opacity-80"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
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
            <main className="flex-1 min-h-0 flex flex-col p-4 md:p-6 gap-4 pb-16">
                <div className="flex-1 min-h-0 flex gap-4 max-w-[1600px] mx-auto w-full">

                    {/* Left UI: Always visible */}
                    <motion.div
                        animate={{ width: showCodeEditor ? 360 : "100%", maxWidth: showCodeEditor ? 360 : 780 }}
                        className="flex flex-col gap-3 shrink-0 h-full min-h-0 overflow-hidden mx-auto"
                    >
                        {/* Avatar / Interviewer Card */}
                        <div className={`shrink-0 bg-white dark:bg-slate-900 rounded-[2rem] border border-blue-50 dark:border-slate-800 shadow-sm overflow-hidden relative group transition-all duration-500 ${showCodeEditor ? 'h-[260px]' : 'h-[360px]'}`}>
                            <ThreeAvatar
                                isSpeaking={isSpeaking}
                                isListening={isListening || isTranscribing}
                                isThinking={isThinking}
                            />

                            {/* User Webcam PIP */}
                            <div className={`absolute right-3 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 z-20 transition-all duration-500 ${showCodeEditor ? 'bottom-3 w-24 h-[88px] border border-white/20' : 'bottom-14 w-28 h-36 border-2 border-white/25'}`}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${webcamActive ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                                />
                                {!webcamActive && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                        <VideoOff className="w-4 h-4 text-slate-500" />
                                    </div>
                                )}
                            </div>

                            {/* Identity Overlay: Compact */}
                            <div className={`absolute left-3 right-3 p-2.5 bg-black/25 backdrop-blur-md rounded-xl border border-white/5 flex items-center justify-between transition-all duration-500 ${showCodeEditor ? 'bottom-3' : 'bottom-3'}`}>
                                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                                    {isThinking ? 'Ryntra Bot (Thinking...)' : 'Ryntra Bot'}
                                </span>
                                <div className="flex gap-1 h-3 items-center">
                                    {[1, 2, 3].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={(isSpeaking || isThinking) ? { height: [3, 12, 3] } : { height: 3 }}
                                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                            className={`w-0.5 rounded-full ${isThinking ? 'bg-orange-400' : 'bg-blue-400'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Auto Question Box: opens when AI speaks, closes when user responds */}
                        <AnimatePresence>
                            {isQuestionBoxOpen && messages.length > 0 && messages[messages.length - 1].role === 'model' && (
                                <motion.div
                                    key="question-box"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    className="shrink-0"
                                >
                                    <div className="bg-blue-600/10 dark:bg-blue-900/20 border border-blue-500/20 rounded-2xl p-3.5 backdrop-blur-sm">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                Current Question
                                            </p>
                                            <button
                                                onClick={() => setIsQuestionBoxOpen(false)}
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold leading-none"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-4">
                                            {messages[messages.length - 1].content}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Thinking indicator — shown while AI evaluates the user's answer */}
                        <AnimatePresence>
                            {isThinking && (
                                <motion.div
                                    key="thinking-indicator"
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    className="shrink-0"
                                >
                                    <div className="bg-orange-500/10 dark:bg-orange-900/20 border border-orange-400/25 rounded-2xl px-4 py-3 flex items-center gap-3">
                                        <div className="flex gap-1 items-center shrink-0">
                                            {[0, 1, 2].map(i => (
                                                <motion.span
                                                    key={i}
                                                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                                                    transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.2 }}
                                                    className="block w-1.5 h-1.5 rounded-full bg-orange-400"
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                                            Evaluating your response…
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <WSTranscriptPanel
                                messages={messages}
                                transcript={transcript}
                                isListening={isListening || isTranscribing}
                                isSpeaking={isSpeaking}
                                isThinking={isThinking}
                                isTranscribing={isTranscribing}
                            />
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
                                <WSCodeEditor
                                    onSubmitCode={handleSubmitCode}
                                    onKeyPress={handleEditorTyping}
                                />
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
                    <div className="absolute left-1/2 -translate-x-1/2 -top-14 flex flex-col items-center gap-2">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-blue-100 dark:border-slate-800 shadow-sm">
                            <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter whitespace-nowrap">
                                {isListening ? "Close mic to submit answer" : "Click to speak"}
                            </p>
                        </div>
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
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight animate-pulse">
                            Audio sync may take a few seconds...
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRepeatQuestion}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${isSpeaking ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'}`}
                            disabled={isSpeaking || messages.length === 0}
                        >
                            <Zap className="w-3.5 h-3.5" />
                            Repeat Question
                        </motion.button>
                        <button
                            onClick={handleEndSession}
                            className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 dark:bg-rose-900/20 text-white dark:text-rose-400 transition-all hover:bg-slate-800"
                        >
                            Finish
                        </button>
                    </div>
                </div>
            </footer>

            {/* Time-Up Banner */}
            <AnimatePresence>
                {showTimeUpBanner && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-amber-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm"
                    >
                        <Clock className="w-5 h-5 flex-shrink-0" />
                        <span>⏰ Time is up! Your interview is ending and generating your report…</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Narrative State: Transitioning */}
            <AnimatePresence>
                {/* Idle Prompt Removed as per user request */}

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

            {/* End Interview Dialog */}
            <Dialog
                isOpen={isEndDialogOpen}
                onClose={() => setIsEndDialogOpen(false)}
                onConfirm={confirmEndSession}
                variant={userMessageCount > 0 ? 'warning' : 'danger'}
                title={userMessageCount > 0 ? "End Interview Session?" : "End Session Early?"}
                description={
                    userMessageCount > 0
                        ? "Are you sure you want to conclude this interview? Our AI will analyze your performance and generate a detailed report."
                        : "You haven't answered any questions yet. Ending now will NOT generate an interview report. Do you want to exit anyway?"
                }
                confirmLabel={userMessageCount > 0 ? "Yes, End Interview" : "Yes, Exit Anyway"}
                cancelLabel="Keep Practicing"
            />
        </div>
    );
}
