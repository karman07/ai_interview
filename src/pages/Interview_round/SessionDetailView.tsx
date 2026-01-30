import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, CheckCircle, TrendingUp, Target, Award,
  MessageSquare, Mic, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';
import { EnhancedInterviewApi, type SessionDetail } from '@/api/enhancedInterviewAnalytics';

export default function SessionDetailView() {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!session) return null;

  const question = session.questions[selectedQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/interview/history')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {session.jobContext.roleTitle} at {session.jobContext.companyName}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="capitalize">{session.roundType} Round</span>
                <span>•</span>
                <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(session.metrics.totalDuration / 60)}m
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{session.scores.overall.toFixed(1)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Overall Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Score Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Score Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Communication', score: session.scores.communication, color: 'blue' },
                  { label: 'Technical', score: session.scores.technical, color: 'emerald' },
                  { label: 'Behavioral', score: session.scores.behavioral, color: 'purple' }
                ].map(({ label, score, color }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{score.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-${color}-500 h-2 rounded-full transition-all`}
                        style={{ width: `${(score / 11) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Questions ({session.questions.length})
              </h3>
              <div className="space-y-2">
                {session.questions.map((q, idx) => (
                  <button
                    key={q._id}
                    onClick={() => setSelectedQuestion(idx)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedQuestion === idx
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Question {idx + 1}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{q.scores.overall.toFixed(1)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Strengths
              </h3>
              <div className="space-y-2">
                {session.strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Improvements
              </h3>
              <div className="space-y-2">
                {session.areasForImprovement.map((area, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500 flex-shrink-0">→</span>
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedQuestion(Math.max(0, selectedQuestion - 1))}
                disabled={selectedQuestion === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Question {selectedQuestion + 1} of {session.questions.length}
              </span>
              <button
                onClick={() => setSelectedQuestion(Math.min(session.questions.length - 1, selectedQuestion + 1))}
                disabled={selectedQuestion === session.questions.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Question {selectedQuestion + 1}</h3>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{question.scores.overall.toFixed(1)}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">/ 11</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6 border-l-4 border-blue-500">
                <p className="text-gray-900 dark:text-white font-medium">{question.questionText}</p>
              </div>

              {/* Response */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-gray-500" />
                  Your Response
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {question.audioAnalysis?.transcription || question.answerText}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {question.responseTime}s
                    </span>
                    {question.audioAnalysis && (
                      <span>Duration: {question.audioAnalysis.duration}s</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Evaluation Breakdown</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(question.scores).filter(([key]) => key !== 'overall').map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{key}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{value.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(value / 1) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Analysis */}
              {question.audioAnalysis && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Voice Analysis</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Clarity', value: question.audioAnalysis.speechClarity },
                      { label: 'Pace', value: question.audioAnalysis.paceScore },
                      { label: 'Confidence', value: question.audioAnalysis.confidenceLevel }
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{value.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Filler Words</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{question.audioAnalysis.fillerWords}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Pauses</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{question.audioAnalysis.pauseCount}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Feedback</h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-gray-700 dark:text-gray-300">{question.feedback}</p>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Strengths</h4>
                  <div className="space-y-2">
                    {question.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                        <span className="text-green-500">✓</span>
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Improvements</h4>
                  <div className="space-y-2">
                    {question.improvements.map((improvement, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                        <span className="text-orange-500">→</span>
                        <span>{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
