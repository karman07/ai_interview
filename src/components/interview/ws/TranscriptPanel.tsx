import React, { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/hooks/useInterviewWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, MessageSquare, Sparkles, ChevronUp } from 'lucide-react';

interface TranscriptPanelProps {
    messages: ChatMessage[];
    transcript: string;
    isListening: boolean;
    isSpeaking: boolean;
    isThinking: boolean;
    isTranscribing: boolean;
}

export const WSTranscriptPanel: React.FC<TranscriptPanelProps> = ({ messages, transcript, isListening, isSpeaking, isThinking, isTranscribing: _isTranscribing }) => {
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll only when panel is open
    useEffect(() => {
        if (isOpen && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages, transcript, isOpen]);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const text = messages
            .map(m => `[${m.role === 'model' ? 'Ai for jobER' : 'YOU'}]\n${m.content}\n`)
            .join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-transcript-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const unreadCount = messages.length;

    return (
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-blue-50/30 dark:border-slate-800/20 shadow-md">
            {/* Clickable header — always visible */}
            <button
                onClick={() => setIsOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3 bg-white/50 dark:bg-slate-900/50 hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                        Session Transcript
                    </span>
                    {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[9px] font-black">
                            {unreadCount}
                        </span>
                    )}
                    {/* Live indicator when speaking/listening/thinking */}
                    {(isSpeaking || isListening || isThinking) && (
                        <div className="flex gap-0.5 items-center ml-1">
                            {[1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [2, 7, 2] }}
                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                    className={`w-0.5 rounded-full ${isSpeaking ? 'bg-blue-400' : isThinking ? 'bg-orange-400' : 'bg-emerald-400'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        disabled={messages.length === 0}
                        className="p-1.5 text-slate-300 hover:text-blue-500 transition-all rounded-lg disabled:opacity-20"
                        title="Download transcript"
                    >
                        <Download className="w-3.5 h-3.5" />
                    </button>
                    <motion.div animate={{ rotate: isOpen ? 0 : 180 }} transition={{ duration: 0.2 }}>
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                    </motion.div>
                </div>
            </button>

            {/* Collapsible body */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="transcript-body"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 min-h-0 flex flex-col"
                    >
                        <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto pl-5 pr-3 py-4 space-y-4 scroll-smooth thin-scrollbar">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
                                    <Sparkles className="w-5 h-5 mb-2" />
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
                                        <div className={`relative px-4 py-3 rounded-2xl max-w-[85%] text-[13px] leading-relaxed font-medium ${msg.role === 'model'
                                            ? 'bg-blue-600 text-white rounded-tl-none shadow-sm'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700/50 rounded-tr-none shadow-sm'
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
                                    <div className="px-4 py-2.5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/30 dark:border-blue-900/20 text-blue-800 dark:text-blue-300 text-xs italic rounded-tr-none">
                                        {transcript}
                                    </div>
                                </motion.div>
                            )}

                            <div ref={scrollRef} className="h-1" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
