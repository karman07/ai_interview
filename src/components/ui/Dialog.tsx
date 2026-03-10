import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, HelpCircle, CheckCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

type DialogVariant = 'danger' | 'warning' | 'success' | 'info';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: DialogVariant;
}

const variantStyles: Record<DialogVariant, { icon: any; color: string; bg: string; border: string; btn: string }> = {
    danger: {
        icon: AlertCircle,
        color: 'text-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        border: 'border-rose-100 dark:border-rose-900/30',
        btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 dark:shadow-rose-900/20'
    },
    warning: {
        icon: HelpCircle,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-100 dark:border-amber-900/30',
        btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200 dark:shadow-amber-900/20'
    },
    success: {
        icon: CheckCircle,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-100 dark:border-emerald-900/30',
        btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-emerald-900/20'
    },
    info: {
        icon: Info,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        border: 'border-blue-100 dark:border-blue-900/30',
        btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-blue-900/20'
    }
};

export function Dialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'info'
}: DialogProps) {
    const styles = variantStyles[variant];
    const Icon = styles.icon;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm"
                    />

                    {/* Dialog Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden z-10"
                    >
                        {/* Header Image/Icon Section */}
                        <div className={`h-32 flex items-center justify-center ${styles.bg} border-b ${styles.border}`}>
                            <div className={`w-16 h-16 rounded-3xl ${styles.bg} flex items-center justify-center border ${styles.border} shadow-inner`}>
                                <Icon className={`w-8 h-8 ${styles.color}`} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                {title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                                {description}
                            </p>

                            <div className="flex flex-col gap-3">
                                {onConfirm && (
                                    <button
                                        onClick={onConfirm}
                                        className={`w-full py-4 ${styles.btn} font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
                                    >
                                        {confirmLabel}
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98]"
                                >
                                    {cancelLabel}
                                </button>
                            </div>
                        </div>

                        {/* Close Button Top Right */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default Dialog;
