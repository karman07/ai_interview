import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, TrendingUp, Award } from "lucide-react";
import type { Evaluation } from "@/api/aiInterview";

interface Props {
  evaluation: Evaluation;
  sessionId: string;
}

export default function InterviewCompletionScreen({ evaluation, sessionId }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/interview/analytics', { state: { sessionId } });
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate, sessionId]);

  const percentage = ((evaluation.score / evaluation.total_possible) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Interview Complete!</h1>
            <p className="text-gray-600 dark:text-gray-400">Great job completing the interview</p>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Final Score</h2>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {evaluation.score.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  out of {evaluation.total_possible}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-center mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {percentage}% Performance
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Feedback
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{evaluation.feedback}</p>
            </div>

            {evaluation.suggestions && evaluation.suggestions.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Key Suggestions</h3>
                <ul className="space-y-1">
                  {evaluation.suggestions.slice(0, 3).map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Redirecting to detailed analytics in 5 seconds...
            </p>
            <button
              onClick={() => navigate('/interview/analytics', { state: { sessionId } })}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              View Detailed Report Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
