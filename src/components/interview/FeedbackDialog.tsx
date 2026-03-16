import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2, MessageSquare, Star } from "lucide-react";
import http from "@/api/http";

interface FeedbackDialogProps {
  sessionId: string;
  open: boolean;
  onClose: () => void;
}

async function submitFeedback(
  sessionId: string,
  experienceRating: number,
  resultRating: number,
  comment: string,
) {
  // Post to results feedback (session-level) AND to reviews collection (admin-visible)
  try {
    const responses = await Promise.allSettled([
      http.post(`/results/${sessionId}/feedback`, {
        experienceRating,
        resultRating,
        comment,
      }),
      http.post('/reviews', {
        experienceRating,
        resultRating,
        comment: comment || undefined,
        sessionId,
      }),
    ]);
    console.log("Feedback submission results:", responses);
  } catch (err) {
    console.error("Failed to post feedback:", err);
  }
}

/* ── Star row ─────────────────────────────────────────────────────── */
function StarRow({
  label,
  rating,
  onChange,
}: {
  label: string;
  rating: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((v) => {
          const filled = v <= (hovered || rating);
          return (
            <button
              key={v}
              type="button"
              onMouseEnter={() => setHovered(v)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(v)}
              className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${v} star${v > 1 ? "s" : ""}`}
            >
              <Star
                className={`w-7 h-7 transition-colors duration-100 ${
                  filled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-slate-300 dark:text-slate-600"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Dialog ───────────────────────────────────────────────────────── */
export default function FeedbackDialog({ sessionId, open, onClose }: FeedbackDialogProps) {
  const [experienceRating, setExperienceRating] = useState(0);
  const [resultRating, setResultRating]         = useState(0);
  const [comment, setComment]                   = useState("");
  const [loading, setLoading]                   = useState(false);
  const [done, setDone]                         = useState(false);

  const canSubmit = experienceRating > 0 && resultRating > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !sessionId) return;
    setLoading(true);
    try {
      await submitFeedback(sessionId, experienceRating, resultRating, comment);
      setDone(true);
      setTimeout(onClose, 1800);
    } catch (error) {
      console.error('Feedback submission failed:', error);
      // Still show success to avoid blocking user  
      setDone(true);
      setTimeout(onClose, 1800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* panel */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-7">
                {done ? (
                  /* success state */
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      Thanks for your feedback!
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      It helps us improve the platform for everyone.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                          How did it go?
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Takes 20 seconds. Helps us improve.
                        </p>
                      </div>
                    </div>

                    {/* ratings */}
                    <div className="space-y-5 mb-5">
                      <StarRow
                        label="How was the interview experience?"
                        rating={experienceRating}
                        onChange={setExperienceRating}
                      />
                      <StarRow
                        label="How accurate and useful was the AI result?"
                        rating={resultRating}
                        onChange={setResultRating}
                      />
                    </div>

                    {/* comment */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                        Any additional comments?{" "}
                        <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What worked well? What could be better?"
                        className="w-full px-3.5 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none transition-colors"
                      />
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || loading}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                          canSubmit && !loading
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                        }`}
                      >
                        {loading ? (
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Submit Feedback
                      </button>
                      <button
                        onClick={onClose}
                        className="px-4 py-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Skip
                      </button>
                    </div>

                    {!canSubmit && (
                      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                        Select both ratings to submit
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
