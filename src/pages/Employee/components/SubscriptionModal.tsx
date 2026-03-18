import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Mail, DollarSign, MapPin, FileText, Upload, RefreshCw, BellOff, CheckCircle, Lock, Sparkles } from 'lucide-react';

interface SubscriptionModalProps {
    showSubscriptionModal: boolean;
    setShowSubscriptionModal: (v: boolean) => void;
    subscriptionEmail: string;
    setSubscriptionEmail: (v: string) => void;
    isSubscribed: boolean;
    frequency: string;
    setFrequency: (v: string) => void;
    subLocation: string;
    setSubLocation: (v: string) => void;
    subMinSalary: string;
    setSubMinSalary: (v: string) => void;
    subInternship: boolean;
    setSubInternship: (v: boolean) => void;
    availableLocations: string[];
    subFile: File | null;
    setSubFile: (f: File | null) => void;
    selectedResumeId: string;
    setSelectedResumeId: (v: string) => void;
    resumes: any[];
    handleSubscribeSubmit: (e: React.FormEvent) => void;
    handleTriggerUpdate: () => void;
    handleUnsubscribe: () => void;
    subscribing: boolean;
    isPaidUser: boolean;
    onUpgradeClick: () => void;
    resumeLimit: number;
}

const SubscriptionModal = ({
    showSubscriptionModal,
    setShowSubscriptionModal,
    subscriptionEmail,
    setSubscriptionEmail,
    isSubscribed,
    frequency,
    setFrequency,
    subLocation,
    setSubLocation,
    subMinSalary,
    setSubMinSalary,
    subInternship,
    setSubInternship,
    availableLocations,
    subFile,
    setSubFile,
    selectedResumeId,
    setSelectedResumeId,
    resumes,
    handleSubscribeSubmit,
    handleTriggerUpdate,
    handleUnsubscribe,
    subscribing,
    isPaidUser,
    onUpgradeClick,
    resumeLimit,
}: SubscriptionModalProps) => {
    const [showResumeDialog, setShowResumeDialog] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const selectedResumeName = selectedResumeId
        ? resumes.find(r => (r.id || r._id) === selectedResumeId)?.filename
        : subFile?.name;

    const handleConfirmResume = () => {
        if (pendingFile) {
            setSubFile(pendingFile);
            setSelectedResumeId('');
        }
        setShowResumeDialog(false);
        setPendingFile(null);
    };

    return (
        <>
        <AnimatePresence>
            {showSubscriptionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSubscriptionModal(false)}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Bell className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                        {isSubscribed ? 'Manage Job Alerts' : 'Set Up Job Alerts'}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Get matched jobs sent to your inbox
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSubscriptionModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Subscribed status bar */}
                        {isSubscribed && isPaidUser && (
                            <div className="mx-6 mt-4 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-lg flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                                    Alerts active — you're receiving {frequency} job matches
                                </p>
                            </div>
                        )}

                        {/* Paywall for free users */}
                        {!isPaidUser ? (
                            <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Premium Feature</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                                        Job alerts are available on paid plans. Upgrade to get AI-matched jobs delivered straight to your inbox.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setShowSubscriptionModal(false); onUpgradeClick(); }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Upgrade Now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSubscriptionModal(false)}
                                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Maybe later
                                </button>
                            </div>
                        ) : (
                        <>{/* Form */}
                        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubscribeSubmit} className="space-y-4">

                                {/* Email + Frequency */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            <input
                                                type="email"
                                                required
                                                value={subscriptionEmail}
                                                onChange={(e) => setSubscriptionEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Frequency</label>
                                        <select
                                            value={frequency}
                                            onChange={(e) => setFrequency(e.target.value)}
                                            className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900 dark:text-white appearance-none"
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Bi-weekly</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            <select
                                                value={subLocation}
                                                onChange={(e) => setSubLocation(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900 dark:text-white appearance-none"
                                            >
                                                <option value="">Anywhere</option>
                                                {availableLocations.map(loc => (
                                                    <option key={loc} value={loc}>{loc}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Min Salary ($/yr)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            <input
                                                type="number"
                                                value={subMinSalary}
                                                onChange={(e) => setSubMinSalary(e.target.value)}
                                                placeholder="0"
                                                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Internship toggle */}
                                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Internships only</span>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={subInternship}
                                            onChange={(e) => setSubInternship(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow after:transition-all peer-checked:after:translate-x-4" />
                                    </div>
                                </label>

                                {/* Resume — compact trigger */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                        Resume <span className="font-normal">(AI uses this to tailor your alerts)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowResumeDialog(true)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 transition-colors text-left group"
                                    >
                                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${selectedResumeName ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                            <FileText className={`w-3.5 h-3.5 ${selectedResumeName ? 'text-white' : 'text-slate-400'}`} />
                                        </div>
                                        <span className={`text-sm truncate flex-1 ${selectedResumeName ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400'}`}>
                                            {selectedResumeName ?? 'Choose or upload a resume…'}
                                        </span>
                                        {selectedResumeName ? (
                                            <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                        ) : (
                                            <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                                        )}
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="pt-2 space-y-2">
                                    <button
                                        type="submit"
                                        disabled={subscribing}
                                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {subscribing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                        {subscribing ? 'Saving…' : isSubscribed ? 'Update Alerts' : 'Activate Alerts'}
                                    </button>

                                    {isSubscribed && (
                                        <button
                                            type="button"
                                            onClick={handleUnsubscribe}
                                            className="w-full py-2.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-800/40 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <BellOff className="w-3.5 h-3.5" />
                                            Unsubscribe
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                        </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* ── Resume picker dialog ── */}
        <AnimatePresence>
            {showResumeDialog && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setShowResumeDialog(false); setPendingFile(null); }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Dialog header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Choose Resume</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Select a saved resume or upload a new one</p>
                                </div>
                                <button
                                    onClick={() => { setShowResumeDialog(false); setPendingFile(null); }}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <X className="w-4 h-4" />
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
                                    <div className={`mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl border ${bgColor}`}>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className={`text-[10px] font-bold uppercase tracking-wide ${textColor}`}>
                                                    {atLimit ? 'Limit reached' : 'Storage used'}
                                                </span>
                                                <span className={`text-[10px] font-bold tabular-nums ${textColor}`}>
                                                    {resumes.length} <span className="font-normal opacity-60">/ {resumeLimit}</span>
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/60 dark:bg-slate-700/60 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                        {atLimit && (
                                            <span className="text-[9px] font-bold text-red-500 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded flex-shrink-0">FULL</span>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Dialog body */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-5">
                                {/* Upload New */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Upload className="w-3 h-3 text-blue-500" /> Upload New
                                    </p>
                                    <label
                                        htmlFor="resume-dialog-upload"
                                        className={`flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                                            pendingFile
                                                ? 'border-blue-400 bg-blue-50/40 dark:bg-blue-900/10'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        {pendingFile ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 text-center px-3 truncate w-full text-center">{pendingFile.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setPendingFile(null); }}
                                                    className="text-[10px] text-slate-400 hover:text-red-500"
                                                >remove</button>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5 text-slate-300" />
                                                <span className="text-xs text-slate-400 font-medium">pdf / docx / txt</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept=".pdf,.docx,.txt"
                                            onChange={(e) => { setPendingFile(e.target.files?.[0] || null); }}
                                            className="hidden"
                                            id="resume-dialog-upload"
                                        />
                                    </label>
                                    {pendingFile && (
                                        <button
                                            type="button"
                                            onClick={handleConfirmResume}
                                            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                                        >
                                            Use This File
                                        </button>
                                    )}
                                </div>

                                {/* Saved Resumes */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="w-3 h-3 text-indigo-500" /> Saved ({resumes.length})
                                    </p>
                                    <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                                        {resumes.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                                <p className="text-xs text-slate-400">No saved resumes yet</p>
                                            </div>
                                        ) : (
                                            resumes.map(r => {
                                                const id = r.id || r._id;
                                                const active = selectedResumeId === id && !pendingFile;
                                                return (
                                                    <button
                                                        key={id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedResumeId(id);
                                                            setSubFile(null);
                                                            setPendingFile(null);
                                                            setShowResumeDialog(false);
                                                        }}
                                                        className={`w-full px-3 py-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                                                            active
                                                                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                                                                : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-300 hover:bg-indigo-50/30'
                                                        }`}
                                                    >
                                                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${active ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                            <FileText className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-500'}`} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{r.filename}</p>
                                                            {r.createdAt && <p className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>}
                                                        </div>
                                                        {active && <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                                                    </button>
                                                );
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
        </>
    );
};

export default SubscriptionModal;
