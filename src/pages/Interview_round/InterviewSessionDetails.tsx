import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Clock, CheckCircle, TrendingUp, TrendingDown, Target, Award,
    MessageSquare, Mic, BarChart3, ChevronLeft, ChevronRight,
    Zap, Brain, Star, Layout, ShieldCheck, Activity
} from 'lucide-react';
import { EnhancedInterviewApi, type SessionDetail } from '@/api/enhancedInterviewAnalytics';
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Premium Inline Progress Component
const CustomProgress = ({ value, className, indicatorClassName }: { value: number, className?: string, indicatorClassName?: string }) => (
    <div className={`w-full bg-white/5 rounded-full h-1.5 overflow-hidden ${className}`}>
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${indicatorClassName}`}
        />
    </div>
);

// Premium Inline Badge Component
const CustomBadge = ({ children, className, variant = "outline" }: { children: React.ReactNode, className?: string, variant?: "outline" | "solid" }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${variant === "outline" ? "bg-white/5 border-white/10 text-slate-300" : "bg-blue-600 border-blue-500 text-white"
        } ${className}`}>
        {children}
    </span>
);

export default function InterviewSessionDetails() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [session, setSession] = useState<SessionDetail | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) loadSession();
    }, [sessionId]);

    const loadSession = async () => {
        try {
            const data = await EnhancedInterviewApi.getSessionDetail(sessionId!);
            setSession(data);
        } catch (error) {
            console.error('Failed to load session:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center p-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-t-2 border-l-2 border-blue-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="w-8 h-8 text-blue-500 animate-pulse" />
                    </div>
                </div>
                <p className="mt-8 text-slate-400 font-medium tracking-widest uppercase text-xs">Analyzing Session Data</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center text-center p-6">
                <CustomBadge className="mb-6 border-red-500 text-red-500 bg-red-500/10">Session Not Found</CustomBadge>
                <h2 className="text-3xl font-bold text-white mb-4">Oops! Data Missing</h2>
                <p className="text-slate-400 max-w-md mb-8">We couldn't retrieve the details for this session. It might have been removed or the link is invalid.</p>
                <Button onClick={() => navigate('/interview/history')} variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Return to History
                </Button>
            </div>
        );
    }

    const currentQ = session.questions[selectedQuestion];

    return (
        <div className="min-h-screen bg-[#050810] text-slate-200 selection:bg-blue-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full" />
            </div>

            {/* Header Section */}
            <header className="sticky top-0 z-50 bg-slate-910/40 backdrop-blur-xl border-b border-white/5 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/interview/history')}
                            className="text-slate-400 hover:text-white px-3 py-2"
                        >
                            <ArrowLeft className="w-5 h-5 mr-1" /> Back
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <CustomBadge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                                    {session.roundType} Round
                                </CustomBadge>
                                <span className="text-slate-500 text-[10px] uppercase tracking-widest">• {new Date(session.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                {session.jobContext.roleTitle}
                                <span className="text-slate-500 font-normal text-base ml-2">@ {session.jobContext.companyName}</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-1">Performance Score</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold text-white leading-none">{(session.scores.overall * 9.09).toFixed(1)}</span>
                                <span className="text-slate-500 text-sm">/ 100</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* LEFT COLUMN: Overview & Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Dimension Breakdown */}
                        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-400">
                                    <BarChart3 className="w-4 h-4 text-blue-500" /> Dimension Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                {[
                                    { label: 'Technical Accuracy', score: session.scores.technical, color: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]', icon: Activity },
                                    { label: 'Communication Clarity', score: session.scores.communication, color: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]', icon: MessageSquare },
                                    { label: 'Behavioral Fit', score: session.scores.behavioral, color: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]', icon: ShieldCheck }
                                ].map(({ label, score, color, icon: Icon }) => (
                                    <div key={label} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="flex items-center gap-2 text-slate-300 font-medium tracking-wide">
                                                <Icon className="w-3.5 h-3.5 opacity-60" /> {label}
                                            </span>
                                            <span className="text-white font-bold">{(score * 9.09).toFixed(1)}%</span>
                                        </div>
                                        <CustomProgress value={score * 9.09} indicatorClassName={color} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Quick Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
                                <Clock className="w-5 h-5 text-blue-400 mb-3" />
                                <div className="text-2xl font-bold text-white mb-0.5">{Math.floor(session.metrics.totalDuration / 60)}m {session.metrics.totalDuration % 60}s</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Session Duration</div>
                            </div>
                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
                                <Target className="w-5 h-5 text-emerald-400 mb-3" />
                                <div className="text-2xl font-bold text-white mb-0.5">{session.metrics.answeredQuestions}/{session.metrics.totalQuestions}</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Questions Completed</div>
                            </div>
                        </div>

                        {/* Overall Insights */}
                        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-400">
                                    <Star className="w-4 h-4 text-yellow-500" /> Key Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {session.strengths.slice(0, 3).map((s, idx) => (
                                    <div key={idx} className="flex gap-3 text-sm text-slate-300 leading-relaxed group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                                        {s}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-400">
                                    <TrendingUp className="w-4 h-4 text-orange-500" /> Areas to Improve
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {session.areasForImprovement.slice(0, 3).map((a, idx) => (
                                    <div key={idx} className="flex gap-3 text-sm text-slate-300 leading-relaxed group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <div className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                                        {a}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Question Detailed Review */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Mic className="w-5 h-5 text-blue-500" /> Detailed Transcript Review
                            </h2>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    disabled={selectedQuestion === 0}
                                    onClick={() => setSelectedQuestion(Math.max(0, selectedQuestion - 1))}
                                    className="h-8 text-slate-400 px-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center text-xs font-bold text-slate-500 px-2">
                                    {selectedQuestion + 1} / {session.questions.length}
                                </div>
                                <Button
                                    variant="ghost"
                                    disabled={selectedQuestion === session.questions.length - 1}
                                    onClick={() => setSelectedQuestion(Math.min(session.questions.length - 1, selectedQuestion + 1))}
                                    className="h-8 text-slate-400 px-2"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Question Selector Strip */}
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {session.questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedQuestion(idx)}
                                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all border ${selectedQuestion === idx
                                        ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                                        : 'bg-slate-900/40 text-slate-500 border-white/5 hover:border-blue-500/50 hover:text-slate-300'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedQuestion}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                {/* Primary Card */}
                                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md">
                                    <CardHeader className="flex flex-row items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl text-white">Question {selectedQuestion + 1}</CardTitle>
                                            <CardDescription className="text-slate-500 text-xs uppercase tracking-widest font-bold">
                                                Response Time: {currentQ.responseTime}s
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-2xl font-bold text-white">{(currentQ.scores.overall * 9.09).toFixed(1)}%</div>
                                            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Question Score</div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        {/* Question Text */}
                                        <div className="bg-blue-500/5 border-l-4 border-blue-500 p-6 rounded-r-xl">
                                            <p className="text-sm font-medium text-blue-200/90 italic">"{currentQ.questionText}"</p>
                                        </div>

                                        {/* Audio Insights Section */}
                                        {currentQ.audioAnalysis && (
                                            <div className="grid grid-cols-3 gap-6">
                                                {[
                                                    { label: 'Speech Clarity', val: currentQ.audioAnalysis.speechClarity, icon: Zap, color: 'text-blue-400' },
                                                    { label: 'Confidence Level', val: currentQ.audioAnalysis.confidenceLevel, icon: ShieldCheck, color: 'text-emerald-400' },
                                                    { label: 'Pacing Score', val: currentQ.audioAnalysis.paceScore, icon: Activity, color: 'text-purple-400' }
                                                ].map(({ label, val, icon: Icon, color }) => (
                                                    <div key={label} className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                                                        <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
                                                        <div className="text-xl font-bold text-white">{(val * 100).toFixed(0)}%</div>
                                                        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold truncate">{label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Transcription */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                                                <MessageSquare className="w-3.5 h-3.5" /> Full Response Transcription
                                            </div>
                                            <div className="p-6 bg-slate-950/60 rounded-2xl border border-white/5 relative group">
                                                <p className="text-sm text-slate-300 leading-relaxed">
                                                    {currentQ.audioAnalysis?.transcription || currentQ.answerText}
                                                </p>
                                                <div className="absolute top-4 right-4 text-[10px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                                                    End of Content
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Feedback */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                            <div className="space-y-4">
                                                <div className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold flex items-center gap-2">
                                                    <TrendingUp className="w-3 h-3" /> Strengths
                                                </div>
                                                <div className="space-y-2">
                                                    {currentQ.strengths.map((s, idx) => (
                                                        <div key={idx} className="flex gap-3 text-sm text-slate-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl transition-all hover:bg-emerald-500/10 hover:translate-x-1">
                                                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                            <span>{s}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="text-[10px] uppercase tracking-widest text-orange-400 font-bold flex items-center gap-2">
                                                    <TrendingDown className="w-3 h-3" /> Improvements
                                                </div>
                                                <div className="space-y-2">
                                                    {currentQ.improvements.map((i, idx) => (
                                                        <div key={idx} className="flex gap-3 text-sm text-slate-400 bg-orange-500/5 border border-orange-500/10 p-3 rounded-xl transition-all hover:bg-orange-500/10 hover:translate-x-1">
                                                            <Zap className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                                            <span>{i}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* AI Feedback Summary */}
                                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Brain className="w-32 h-32" />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                                            <Zap className="w-4 h-4" /> AI Personalized Feedback
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-blue-500/30 pl-6">
                                            "{currentQ.feedback}"
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Footer Meta */}
            <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 mt-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-slate-500 text-xs uppercase tracking-widest font-bold">
                        <Layout className="w-4 h-4" /> Session {session.sessionId}
                    </div>
                    <div className="flex gap-8">
                        <div className="text-center">
                            <div className="text-white font-bold text-sm">{(session.scores.technical * 9.09).toFixed(1)}%</div>
                            <div className="text-[10px] uppercase tracking-widest text-slate-600">Technical</div>
                        </div>
                        <div className="text-center">
                            <div className="text-white font-bold text-sm">{(session.scores.communication * 9.09).toFixed(1)}%</div>
                            <div className="text-[10px] uppercase tracking-widest text-slate-600">Comm.</div>
                        </div>
                        <div className="text-center">
                            <div className="text-white font-bold text-sm">{(session.scores.behavioral * 9.09).toFixed(1)}%</div>
                            <div className="text-[10px] uppercase tracking-widest text-slate-600">Behavioral</div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
