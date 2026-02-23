import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Mail, Filter, DollarSign, ChevronRight, Briefcase, FileText, MapPin } from 'lucide-react';

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
}: SubscriptionModalProps) => {
    return (
        <AnimatePresence>
            {showSubscriptionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSubscriptionModal(false)}
                        className="absolute inset-0 bg-gray-950/60 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gray-900 px-10 py-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                            <button
                                onClick={() => setShowSubscriptionModal(false)}
                                className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                                    <Bell className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3">Job Infiltration Alerts</h2>
                                <p className="text-blue-200/60 font-medium">New opportunities delivered straight to your operations center.</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubscribeSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Deployment Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                type="email"
                                                required
                                                value={subscriptionEmail}
                                                onChange={(e) => setSubscriptionEmail(e.target.value)}
                                                placeholder="agent@aiops.com"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Frequency</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                            <select
                                                value={frequency}
                                                onChange={(e) => setFrequency(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold appearance-none"
                                            >
                                                <option value="daily">Daily Briefing</option>
                                                <option value="weekly">Weekly Report</option>
                                                <option value="biweekly">Bi-Weekly Overview</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl border border-blue-100/30 dark:border-blue-800/20 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Location Filter</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                <select
                                                    value={subLocation}
                                                    onChange={(e) => setSubLocation(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold appearance-none"
                                                >
                                                    <option value="">Global Ops</option>
                                                    {availableLocations.map(loc => (
                                                        <option key={loc} value={loc}>{loc}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Min Annual Target ($)</label>
                                            <div className="relative group">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type="number"
                                                    value={subMinSalary}
                                                    onChange={(e) => setSubMinSalary(e.target.value)}
                                                    placeholder="0"
                                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-white/50 dark:bg-gray-800/50">
                                        <Filter className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex-1">Restrict to Internship roles?</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={subInternship}
                                                onChange={(e) => setSubInternship(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {resumes.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Personnel Intelligence (Existing)</label>
                                            <div className="relative group">
                                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                <select
                                                    value={selectedResumeId}
                                                    onChange={(e) => {
                                                        setSelectedResumeId(e.target.value);
                                                        setSubFile(null);
                                                    }}
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold appearance-none"
                                                >
                                                    <option value="">Select an existing file</option>
                                                    {resumes.map(r => (
                                                        <option key={r.id || r._id} value={r.id || r._id}>{r.filename}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
                                            {selectedResumeId ? 'Or Replace with New Intelligence' : 'Upload Personnel File (.pdf, .docx, .txt)'}
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept=".pdf,.docx,.txt"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0] || null;
                                                    setSubFile(f);
                                                    if (f) setSelectedResumeId('');
                                                }}
                                                className="hidden"
                                                id="sub-file-upload"
                                            />
                                            <label
                                                htmlFor="sub-file-upload"
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] bg-gray-50/50 dark:bg-gray-900/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/80 transition-all group-hover:border-blue-500/50"
                                            >
                                                <X className={`w-8 h-8 ${subFile ? 'text-emerald-500 rotate-45' : 'text-gray-400'} mb-2`} />
                                                <span className="text-xs font-bold text-gray-500">
                                                    {subFile ? subFile.name : 'Upload Personnel File'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                    <button
                                        type="submit"
                                        disabled={subscribing}
                                        className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-sm uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {subscribing ? 'Processing Intelligence...' : (isSubscribed ? 'Update Intelligence feed' : 'Activate Alerts')}
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    {isSubscribed && (
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={handleTriggerUpdate}
                                                className="flex-1 py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-xs flex items-center justify-center gap-2"
                                            >
                                                <Bell className="w-4 h-4" /> Trigger Intelligence Scan
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleUnsubscribe}
                                                className="flex-1 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl transition-all hover:bg-red-100 dark:hover:bg-red-900/30 text-xs"
                                            >
                                                Deactivate Alert Feed
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SubscriptionModal;
