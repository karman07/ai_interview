import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/hooks/useInterviewWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, MessageSquare, Bot, User, Sparkles } from 'lucide-react';

interface TranscriptPanelProps {
    messages: ChatMessage[];
    transcript: string;
    isListening: boolean;
    isSpeaking: boolean;
    isTranscribing: boolean;
}

export const WSTranscriptPanel: React.FC<TranscriptPanelProps> = ({ messages, transcript, isListening, isSpeaking, isTranscribing: _isTranscribing }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
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
        <div className="flex flex-col h-full rounded-[2rem] overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-blue-50/30 dark:border-slate-800/20 shadow-xl shadow-blue-500/5">
            {/* Header: More compact */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-50/20 dark:border-slate-800/10 bg-white/40 dark:bg-slate-900/40 shrink-0">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <div>
                        <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Session Transcript</h3>
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={messages.length === 0}
                    className="p-2 text-slate-300 hover:text-blue-500 transition-all rounded-lg disabled:opacity-10"
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>

            {/* Messages: Reduced spacing */}
            <div ref={containerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scroll-smooth no-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
                        <Sparkles className="w-6 h-6 mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            Interviewer Online<br />Awaiting Input
                        </p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`relative px-4 py-3 rounded-2xl max-w-[85%] text-xs leading-relaxed transition-all ${msg.role === 'model'
                                ? 'bg-blue-600/90 text-white rounded-tl-none ring-1 ring-blue-500/20'
                                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-200 border border-slate-100 dark:border-slate-700/50 rounded-tr-none'
                                }`}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isListening && transcript && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-end"
                    >
                        <div className="px-4 py-3 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/30 dark:border-blue-900/20 text-blue-800 dark:text-blue-300 text-xs italic rounded-tr-none">
                            {transcript}
                        </div>
                    </motion.div>
                )}

                <div ref={scrollRef} className="h-2" />
            </div>

            {/* Footer Status: Minimalist line */}
            {(isSpeaking || isListening) && (
                <div className="px-6 py-2.5 bg-white/20 dark:bg-slate-900/20 flex items-center gap-2 shrink-0 border-t border-blue-50/10">
                    <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                animate={{ height: [2, 8, 2] }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                className={`w-0.5 rounded-full ${isSpeaking ? 'bg-blue-400' : 'bg-orange-400'}`}
                            />
                        ))}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isSpeaking ? 'text-blue-500' : 'text-orange-500'}`}>
                        {isSpeaking ? 'Nexus Speaking' : 'Listening'}
                    </span>
                </div>
            )}
        </div>
    );
};
