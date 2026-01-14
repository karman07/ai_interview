import { CheckCircle2, TrendingUp, Award, BarChart3, MessageSquare, Clock, Target } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { Evaluation } from "@/api/aiInterview";

interface Props {
  evaluation: Evaluation;
  sessionId: string;
  interviewState?: any;
}

export default function InterviewCompletionScreen({ evaluation, sessionId, interviewState }: Props) {
  const score = evaluation?.total_score || evaluation?.score || 0;
  const totalPossible = evaluation?.total_possible || 11;
  const percentage = ((score / totalPossible) * 100).toFixed(0);
  
  const history = interviewState?.history || [];
  const totalQuestions = history.length;
  
  const scoreData = history.map((item: any, idx: number) => ({
    question: `Q${idx + 1}`,
    score: item.evaluation?.total_score || 0,
    technical: item.technical_evaluation?.technical_depth || 0,
    communication: item.communication_evaluation?.voice_scores?.total || 0
  }));

  const avgTechnical = scoreData.reduce((sum: number, d: any) => sum + d.technical, 0) / (scoreData.length || 1);
  const avgCommunication = scoreData.reduce((sum: number, d: any) => sum + d.communication, 0) / (scoreData.length || 1);

  const performanceData = [
    { subject: 'Technical', score: avgTechnical, fullMark: 10 },
    { subject: 'Communication', score: avgCommunication, fullMark: 10 },
    { subject: 'Clarity', score: history[0]?.technical_evaluation?.raw?.clarity || 0, fullMark: 10 },
    { subject: 'Confidence', score: history[0]?.technical_evaluation?.raw?.confidence || 0, fullMark: 10 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Interview Complete!</h1>
            <p className="text-gray-600 dark:text-gray-400">Here's your detailed performance analysis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Final Score</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score.toFixed(1)}</div>
              <div className="text-xs text-blue-700 dark:text-blue-400">out of {totalPossible}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Questions</span>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalQuestions}</div>
              <div className="text-xs text-purple-700 dark:text-purple-400">answered</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Performance</span>
              </div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{percentage}%</div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400">overall</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-300">Avg Score</span>
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{(score / totalQuestions).toFixed(1)}</div>
              <div className="text-xs text-amber-700 dark:text-amber-400">per question</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-8">
            {percentage}% Performance Score
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Performance Breakdown</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceData}>
                  <PolarGrid stroke="#9ca3af" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#6b7280' }} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} animationDuration={800} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Question-wise Scores</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="question" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280' }} domain={[0, 10]} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="score" fill="#3b82f6" name="Total Score" radius={[8, 8, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Overall Feedback
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <p className="text-gray-700 dark:text-gray-300">{evaluation.feedback}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              Key Suggestions
            </h3>
            <div className="space-y-2">
              {evaluation.suggestions && evaluation.suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <span className="text-orange-600 dark:text-orange-400 mt-0.5">→</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Question Details</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {history.map((item: any, idx: number) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Question {idx + 1}</h4>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                    Score: {item.evaluation?.total_score?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{item.question}</p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your Answer:</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{item.answer}</p>
                </div>
                {item.evaluation?.feedback && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">{item.evaluation.feedback}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
