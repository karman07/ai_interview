import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, CheckCircle, Loader2, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/button';

interface MatchResumeModalProps {
    open: boolean;
    onClose: () => void;
    resumes: any[];
    onSelectResume: (resume: any) => void;
    onUploadNew: (file: File) => Promise<void>;
    uploadingResume: boolean;
    setShowPricing: (v: boolean) => void;
    resumeLimit: number;
}

const MatchResumeModal = ({
    open,
    onClose,
    resumes,
    onSelectResume,
    onUploadNew,
    uploadingResume,
    setShowPricing,
    resumeLimit,
}: MatchResumeModalProps) => {
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-950/40 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-white/20 overflow-hidden z-10 flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Resume matcher</h3>
                                    <p className="text-xs font-medium text-slate-500 mt-1">Select an existing resume or upload a new one to filter perfectly matched positions.</p>
                                </div>
                                <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-all flex-shrink-0">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Usage indicator */}
                            {(() => {
                                const pct = Math.min((resumes.length / resumeLimit) * 100, 100);
                                const atLimit = resumes.length >= resumeLimit;
                                const nearLimit = !atLimit && resumes.length / resumeLimit >= 0.8;
                                const color = atLimit ? 'bg-red-500' : nearLimit ? 'bg-amber-500' : 'bg-blue-500';
                                const textColor = atLimit ? 'text-red-600 dark:text-red-400' : nearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400';
                                const bgColor = atLimit ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30' : nearLimit ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30';
                                return (
                                    <div className={`mt-4 flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${bgColor}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className={`text-[11px] font-bold uppercase tracking-wide ${textColor}`}>
                                                    {atLimit ? 'Limit reached' : 'Storage used'}
                                                </span>
                                                <span className={`text-[11px] font-bold tabular-nums ${textColor}`}>
                                                    {resumes.length} <span className="font-normal opacity-60">/ {resumeLimit}</span>
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-white/60 dark:bg-slate-700/60 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                        {atLimit && (
                                            <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-md flex-shrink-0">FULL</span>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Upload New */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <Upload className="w-4 h-4 text-blue-500" /> Upload New
                                    </h4>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".pdf,.docx,.doc"
                                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                            className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                                        />
                                    </div>
                                    <Button
                                        disabled={!uploadFile || uploadingResume}
                                        onClick={() => { if (uploadFile) { onUploadNew(uploadFile); setUploadFile(null); } }}
                                        className="w-full h-12 rounded-xl font-bold gap-2 shadow-lg text-xs uppercase"
                                    >
                                        {uploadingResume ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Upload & Match
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Previous Resumes */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-indigo-500" /> Saved Resumes ({resumes.length})
                                    </h4>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {resumes.length === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-xs font-bold text-slate-400">No resumes saved yet.</p>
                                            </div>
                                        ) : (
                                            resumes.map((resume) => {
                                                return (
                                                    <button
                                                        key={resume.id || resume._id}
                                                        onClick={() => { onSelectResume(resume); onClose(); }}
                                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 hover:border-indigo-400 rounded-2xl flex items-center justify-between transition-all text-left"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-indigo-500 rounded-xl text-white">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[140px]">{resume.filename}</p>
                                                                <p className="text-[10px] font-semibold text-slate-400">{resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                        <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                                                    </button>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MatchResumeModal;
