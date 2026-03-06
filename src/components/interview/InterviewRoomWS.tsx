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
import { Loader2 } from 'lucide-react';

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
            // Store raw feedback directly — InterviewResultsV2 reads the new shape
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
    }, [interviewEnded, feedback, clientId, messages, navigate]);

    // ── Toggle mic ──
    const handleToggleMic = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            cancel(); // Stop TTS before listening
            startListening();
        }
    }, [isListening, stopListening, startListening, cancel]);

    // ── Loading state ──
    if (!setupData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                {error ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
                        <h2 className="text-2xl font-bold text-red-900 mb-4">Error</h2>
                        <p className="text-red-700 mb-6">{error}</p>
                        <button onClick={() => navigate('/interview_round')} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                            Go Back
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <Loader2 className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-spin" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Interview...</h2>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            AI
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 capitalize">
                                {type || 'Technical'} Interview
                            </h1>
                            <p className="text-xs text-gray-500">
                                {setupData.role && setupData.company
                                    ? `${setupData.role} at ${setupData.company}`
                                    : user?.name || 'Interview Session'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <WSInterviewTimer formattedTime={formattedTime} />

                        {/* Connection Status */}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                            {isConnected ? 'Connected' : 'Reconnecting...'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content — 3-column layout */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
                <div className="max-w-[1800px] mx-auto w-full flex gap-4 p-4 min-h-0">
                    {/* Left Column: Video + Transcript */}
                    <div className="w-[380px] flex-shrink-0 flex flex-col gap-4 min-h-0 overflow-hidden">
                        <div className="h-[280px]">
                            <ThreeAvatar
                                isSpeaking={isSpeaking}
                                isListening={isListening}
                            />
                        </div>
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

                    {/* Center Column: Code Editor */}
                    <div className="flex-1 min-w-0">
                        <WSCodeEditor onSubmitCode={handleSubmitCode} />
                    </div>
                </div>
            </div>

            {/* Footer Controls */}
            <div className="bg-white border-t border-gray-200 px-4 py-3">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mic Toggle */}
                        <button
                            onClick={handleToggleMic}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${isListening
                                ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-200'
                                }`}
                        >
                            {isListening ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                    </svg>
                                    Stop Speaking
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                    Start Speaking
                                </>
                            )}
                        </button>

                        {/* Camera Toggle */}
                        <button
                            onClick={toggleCamera}
                            className={`p-2.5 rounded-xl transition-all ${webcamActive ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-200 text-gray-500'}`}
                            title={webcamActive ? 'Turn off camera' : 'Turn on camera'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>

                    {/* End Session */}
                    <button
                        onClick={handleEndSession}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        End Session
                    </button>
                </div>
            </div>
            {/* Loading Overlay when ending session */}
            {isEnding && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse">
                                    <div className="w-6 h-6 rounded-full bg-blue-500" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold text-white tracking-tight">Finishing Interview</h2>
                            <p className="text-blue-200/60 font-medium">Please wait while we analyze your performance and generate your detailed feedback report...</p>
                        </div>
                        <div className="flex gap-2 items-center text-blue-400 text-xs font-bold uppercase tracking-widest mt-4">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></span>
                            Generating Insights
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
