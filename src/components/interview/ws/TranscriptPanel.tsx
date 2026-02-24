import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/hooks/useInterviewWebSocket';

interface TranscriptPanelProps {
    messages: ChatMessage[];
    transcript: string;
    isListening: boolean;
    isSpeaking: boolean;
    isTranscribing: boolean;
}

export const WSTranscriptPanel: React.FC<TranscriptPanelProps> = ({ messages, transcript, isListening, isSpeaking, isTranscribing: _isTranscribing }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, transcript]);

    const handleDownload = () => {
        const text = messages
            .map(m => `[${m.role === 'model' ? 'AI INTERVIEWER' : 'YOU'}]\n${m.content}\n`)
            .join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-transcript-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-800">Live Transcript</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-sm text-gray-500 italic">Waiting for the interview to begin...</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <div className={`flex items-center gap-2 mb-1.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">AI Interviewer</span>
                            )}
                            {msg.role === 'user' && (
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">You</span>
                            )}
                        </div>
                        <div className={`px-4 py-3 rounded-lg ${msg.role === 'model' ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-100 ml-4'}`}>
                            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {isListening && transcript && (
                    <div>
                        <div className="flex items-center gap-1.5 mb-1.5 justify-end">
                            <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">You (speaking)</span>
                        </div>
                        <div className="ml-4 px-4 py-3 rounded-lg bg-yellow-50 border border-yellow-200">
                            <p className="text-sm text-yellow-800 italic">{transcript}</p>
                        </div>
                    </div>
                )}

                {isSpeaking && (
                    <div className="flex items-center gap-2 px-4 py-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-xs text-blue-500 italic">AI is analyzing...</span>
                    </div>
                )}

                <div ref={scrollRef} />
            </div>

            {/* Download */}
            <div className="px-4 py-3 border-t border-gray-200">
                <button
                    onClick={handleDownload}
                    disabled={messages.length === 0}
                    className="w-full py-2.5 text-xs font-semibold tracking-wider uppercase text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    Download Transcript
                </button>
            </div>
        </div>
    );
};
