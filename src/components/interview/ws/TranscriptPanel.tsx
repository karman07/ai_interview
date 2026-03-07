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
        <div className="flex flex-col h-full rounded-[2.5rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-blue-50/50 dark:border-slate-800/50 shadow-2xl shadow-blue-500/5">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-blue-50/50 dark:border-slate-800/50 bg-gradient-to-r from-blue-50/30 to-transparent dark:from-blue-900/10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase tracking-[0.1em]">Transcript</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Live Feed</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={messages.length === 0}
                    className="p-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all rounded-xl disabled:opacity-20"
                    title="Download Transcript"
                >
                    <Download className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scroll-smooth no-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 italic max-w-[180px]">
                            Awaiting transmission from Nexus Engine...
                        </p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`flex items-center gap-2 mb-2 px-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${msg.role === 'model' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                    {msg.role === 'model' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                </div>
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
                                    {msg.role === 'model' ? 'AI Coach' : 'You'}
                                </span>
                            </div>
                            <div className={`relative px-5 py-4 rounded-2xl max-w-[90%] text-sm leading-relaxed shadow-sm transition-all ${msg.role === 'model'
                                    ? 'bg-blue-600 text-white rounded-tl-none font-medium'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tr-none'
                                }`}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isListening && transcript && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-end"
                    >
                        <div className="flex items-center gap-2 mb-2 px-2.5 flex-row-reverse">
                            <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center animate-pulse">
                                <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.15em]">Speaking...</span>
                        </div>
                        <div className="px-5 py-4 rounded-2xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 text-orange-800 dark:text-orange-200 text-sm italic rounded-tr-none shadow-sm">
                            {transcript}
                        </div>
                    </motion.div>
                )}

                <div ref={scrollRef} className="h-4" />
            </div>

            {/* Footer Status */}
            {(isSpeaking || isListening) && (
                <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-blue-50/50 dark:border-slate-800/50 flex items-center gap-3 shrink-0 transition-all">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                animate={{ height: [4, 10, 4] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                                className={`w-0.5 rounded-full ${isSpeaking ? 'bg-blue-500' : 'bg-orange-500'}`}
                            />
                        ))}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isSpeaking ? 'text-blue-500' : 'text-orange-500'}`}>
                        {isSpeaking ? 'AI Synthesizing Audio' : 'Capturing Response'}
                    </span>
                </div>
            )}
        </div>
    );
};
