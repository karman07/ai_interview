import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  TrendingUp,
  TrendingDown,
  Mic,
  Video,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Home,
  BarChart3,
  Target,
  Zap,
  Eye,
  Heart,
  Brain,
  User,
  Star,
  ArrowRight,
  Clock,
} from "lucide-react";
import { CompleteInterviewV2Response } from "@/api/interviewV2";

export default function InterviewResultsV2() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<CompleteInterviewV2Response | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load from localStorage first
    const storedReport = localStorage.getItem('v2_interview_report');
    if (storedReport) {
      setReport(JSON.parse(storedReport));
      setLoading(false);
    } else {
      // TODO: Fetch from API if not in localStorage
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading interview results...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Results Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Could not load interview results.</p>
          <button
            onClick={() => navigate('/interview_round')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getRecommendationIcon = (rec: string) => {
    if (rec === 'hire') return <CheckCircle className="w-6 h-6" />;
    if (rec === 'maybe') return <AlertCircle className="w-6 h-6" />;
    return <XCircle className="w-6 h-6" />;
  };

  const getRecommendationBg = (rec: string) => {
    if (rec === 'hire') return 'from-green-500 to-emerald-600';
    if (rec === 'maybe') return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Interview Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {report.role} at {report.company} • {report.interview_duration_minutes} minutes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/interview_round')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Home className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Overall Recommendation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${getRecommendationBg(report.evaluation.recommendation)} rounded-3xl shadow-2xl p-8 text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {getRecommendationIcon(report.evaluation.recommendation)}
                <h2 className="text-3xl font-bold capitalize">
                  {report.evaluation.recommendation === 'hire' ? 'Strong Hire' : report.evaluation.recommendation === 'maybe' ? 'Maybe Hire' : 'No Hire'}
                </h2>
              </div>
              <p className="text-white/90 text-lg mb-4">{report.evaluation.summary}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{report.total_questions} questions answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span>{report.interview_duration_minutes} minutes</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                <div className="text-6xl font-bold">{report.evaluation.overall_score}</div>
              </div>
              <div className="text-white/80">Overall Score</div>
            </div>
          </div>
        </motion.div>

        {/* Skill Assessments */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkillCard
            icon={<Brain className="w-6 h-6" />}
            title="Technical Skills"
            score={report.evaluation.technical_skills.score}
            assessment={report.evaluation.technical_skills.assessment}
            color="from-blue-500 to-blue-600"
          />
          <SkillCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Communication"
            score={report.evaluation.communication_skills.score}
            assessment={report.evaluation.communication_skills.assessment}
            color="from-purple-500 to-purple-600"
          />
          <SkillCard
            icon={<Zap className="w-6 h-6" />}
            title="Problem Solving"
            score={report.evaluation.problem_solving.score}
            assessment={report.evaluation.problem_solving.assessment}
            color="from-yellow-500 to-orange-500"
          />
          <SkillCard
            icon={<Heart className="w-6 h-6" />}
            title="Cultural Fit"
            score={report.evaluation.cultural_fit.score}
            assessment={report.evaluation.cultural_fit.assessment}
            color="from-pink-500 to-pink-600"
          />
          <SkillCard
            icon={<User className="w-6 h-6" />}
            title="Experience Relevance"
            score={report.evaluation.experience_relevance.score}
            assessment={report.evaluation.experience_relevance.assessment}
            color="from-green-500 to-emerald-600"
          />
          <SkillCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Overall Performance"
            score={report.metrics.overall_performance}
            assessment={`Response Quality: ${report.metrics.response_quality}/10`}
            color="from-indigo-500 to-indigo-600"
          />
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Strengths
            </h3>
            <ul className="space-y-3">
              {report.evaluation.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-orange-600" />
              Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {report.evaluation.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Voice Analytics */}
        {report.voice_analytics.analysis_performed && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Mic className="w-6 h-6 text-blue-600" />
              Voice Analytics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <VoiceMetric
                label="Fluency"
                score={report.voice_analytics.average_scores?.fluency || 0}
                interpretation={report.voice_analytics.interpretation?.fluency || 'N/A'}
              />
              <VoiceMetric
                label="Clarity"
                score={report.voice_analytics.average_scores?.clarity || 0}
                interpretation={report.voice_analytics.interpretation?.clarity || 'N/A'}
              />
              <VoiceMetric
                label="Confidence"
                score={report.voice_analytics.average_scores?.confidence || 0}
                interpretation={report.voice_analytics.interpretation?.confidence || 'N/A'}
              />
              <VoiceMetric
                label="Pace"
                score={report.voice_analytics.average_scores?.pace || 0}
                interpretation={report.voice_analytics.interpretation?.pace || 'N/A'}
              />
            </div>

            {report.voice_analytics.speaking_rate_wpm && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Speaking Rate
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(report.voice_analytics.speaking_rate_wpm)} WPM
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                  Ideal range: 120-150 WPM
                </p>
              </div>
            )}
          </div>
        )}

        {/* Video Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-600" />
            Video Analytics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <VideoMetric
              label="Confidence"
              value={report.video_analytics.confidence_score}
              max={10}
              icon={<Star className="w-5 h-5" />}
            />
            <VideoMetric
              label="Eye Contact"
              value={report.video_analytics.eye_contact_percentage}
              max={100}
              suffix="%"
              icon={<Eye className="w-5 h-5" />}
            />
            <VideoMetric
              label="Posture"
              value={report.video_analytics.posture_score}
              max={10}
              icon={<User className="w-5 h-5" />}
            />
            <VideoMetric
              label="Professionalism"
              value={report.video_analytics.professionalism_score}
              max={10}
              icon={<Award className="w-5 h-5" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-3">
                Facial Expressions
              </h4>
              <div className="space-y-2">
                <ProgressBar label="Positive" value={report.video_analytics.facial_expressions.positive} color="green" />
                <ProgressBar label="Neutral" value={report.video_analytics.facial_expressions.neutral} color="gray" />
                <ProgressBar label="Stressed" value={report.video_analytics.facial_expressions.stressed} color="red" />
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
                Body Language
              </h4>
              <div className="space-y-2">
                <ProgressBar label="Open" value={report.video_analytics.body_language.open} color="green" />
                <ProgressBar label="Neutral" value={report.video_analytics.body_language.neutral} color="gray" />
                <ProgressBar label="Closed" value={report.video_analytics.body_language.closed} color="red" />
              </div>
            </div>

            <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-pink-900 dark:text-pink-300 mb-3">
                Other Metrics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                  <span className="font-semibold capitalize text-gray-900 dark:text-white">
                    {report.video_analytics.engagement_level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Speech Pace</span>
                  <span className="font-semibold capitalize text-gray-900 dark:text-white">
                    {report.video_analytics.speech_pace}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Energy Level</span>
                  <span className="font-semibold capitalize text-gray-900 dark:text-white">
                    {report.video_analytics.energy_level}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 italic">
            {report.video_analytics.note}
          </p>
        </div>

        {/* Detailed Feedback */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Detailed Feedback
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {report.evaluation.detailed_feedback}
          </p>
        </div>

        {/* Key Highlights */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-2xl border border-yellow-200 dark:border-yellow-800 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-600" />
            Key Highlights
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.evaluation.key_highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Recommendations */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Improvement Recommendations
          </h3>
          <ul className="space-y-3">
            {report.evaluation.improvement_areas.map((area, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{idx + 1}</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{area}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Ready for Your Next Interview?</h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Practice makes perfect. Start another interview to improve your skills and track your progress.
          </p>
          <button
            onClick={() => navigate('/interview_round')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            Start New Interview
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components

const SkillCard = ({ 
  icon, 
  title, 
  score, 
  assessment, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  score: number; 
  assessment: string; 
  color: string; 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
  >
    <div className={`inline-flex p-3 bg-gradient-to-r ${color} rounded-xl text-white mb-4`}>
      {icon}
    </div>
    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
    <div className="flex items-baseline gap-2 mb-3">
      <span className="text-4xl font-bold text-gray-900 dark:text-white">{score}</span>
      <span className="text-gray-500 dark:text-gray-400">/10</span>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400">{assessment}</p>
    
    <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score * 10}%` }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`h-2 rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  </motion.div>
);

const VoiceMetric = ({ 
  label, 
  score, 
  interpretation 
}: { 
  label: string; 
  score: number; 
  interpretation: string; 
}) => (
  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">{label}</h4>
    <div className="flex items-baseline gap-2 mb-1">
      <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score.toFixed(1)}</span>
      <span className="text-sm text-blue-500 dark:text-blue-400">/10</span>
    </div>
    <p className="text-xs text-blue-700 dark:text-blue-400">{interpretation}</p>
  </div>
);

const VideoMetric = ({ 
  label, 
  value, 
  max, 
  suffix = '', 
  icon 
}: { 
  label: string; 
  value: number; 
  max: number; 
  suffix?: string; 
  icon: React.ReactNode; 
}) => (
  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="text-purple-600 dark:text-purple-400">{icon}</div>
      <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300">{label}</h4>
    </div>
    <div className="flex items-baseline gap-1 mb-2">
      <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{value.toFixed(1)}</span>
      <span className="text-sm text-purple-500 dark:text-purple-400">/{max}{suffix}</span>
    </div>
    <div className="w-full bg-purple-200 dark:bg-purple-900/50 rounded-full h-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 1 }}
        className="h-2 rounded-full bg-purple-600 dark:bg-purple-400"
      />
    </div>
  </div>
);

const ProgressBar = ({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: 'green' | 'gray' | 'red'; 
}) => {
  const colors = {
    green: 'bg-green-500',
    gray: 'bg-gray-400',
    red: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
          className={`h-1.5 rounded-full ${colors[color]}`}
        />
      </div>
    </div>
  );
};
