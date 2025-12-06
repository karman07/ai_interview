import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Loader2, 
  Send, 
  CheckCircle2, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Clock,
  MessageSquare,
  Award,
  Zap,
  BookOpen,
  User,
  BarChart3,
  Users,
  Code,
  Lightbulb,
  MessageCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
  startInterview,
  submitAnswer as submitAnswerAPI,
  getInterviewReport,
  type InterviewReport,
  type InterviewState,
} from "@/api/aiInterview";

type Props = { round: string };

export default function InterviewRoom({ round }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Session state
  const [sessionId, setSessionId] = useState<string>("");
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  
  // UI state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [showResults, setShowResults] = useState(false);
  const [report, setReport] = useState<InterviewReport | null>(null);

  // Speech features state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interviewStartTime] = useState(new Date());
  
  const recognitionRef = useRef<any>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech features
  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        setAnswer(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    speechSynthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  const handleStartNewInterview = () => {
    navigate('/interview_round')
  }

  // Initialize interview session
  useEffect(() => {
    const initInterview = async () => {
      if (!user) return;
      
      try {
        // Reset all state when switching rounds
        setInitializing(true);
        setError(null);
        setShowResults(false);
        setReport(null);
        setInterviewState(null);
        setQuestion("");
        setAnswer("");
        setLoading(false);

        // Get interview details from localStorage
        const interviewDetails = localStorage.getItem("interview_details");
        const parsedDetails = interviewDetails ? JSON.parse(interviewDetails) : {};

        // Generate session ID with timestamp to ensure uniqueness
        const newSessionId = `session_${user._id}_${round}_${Date.now()}`;
        setSessionId(newSessionId);

        console.log('[InterviewRoom] Starting interview session:', {
          userId: user._id,
          sessionId: newSessionId,
          round,
          details: parsedDetails
        });

        // Start interview via REST API
        const response = await startInterview({
          user_id: user._id,
          session_id: newSessionId,
          role_title: parsedDetails.role || 'Software Engineer',
          company_name: parsedDetails.company || 'Tech Company',
          industry: parsedDetails.industry || 'Technology',
          jd: parsedDetails.jd || parsedDetails.jobDescription || 'General software development role',
          cv: parsedDetails.cv || parsedDetails.resume || user.email || 'Candidate profile',
          round_type: (round as any) || 'full'
        });

        console.log('[InterviewRoom] Interview started successfully:', response);

        setInterviewState(response.state);
        setQuestion(response.first_question);
        setInitializing(false);
      } catch (err: any) {
        console.error('[InterviewRoom] Failed to start interview:', err);
        setError(err.response?.data?.message || err.message || 'Failed to start interview');
        setInitializing(false);
      }
    };

    initInterview();
    
    // Cleanup function to reset state when component unmounts or round changes
    return () => {
      setQuestion("");
      setAnswer("");
      setLoading(false);
    };
  }, [round, user]);

  // Toggle speech recognition
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text to speech for questions
  const speakQuestion = (text: string) => {
    if (!speechSynthRef.current) return;

    if (isSpeaking) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthRef.current.speak(utterance);
    }
  };

  // Get interview type info
  const getInterviewInfo = (interviewType: string) => {
    const types: Record<string, { icon: JSX.Element; color: string; title: string; bgColor: string }> = {
      technical: {
        icon: <Code className="w-5 h-5" />,
        color: "from-blue-500 to-blue-600",
        title: "Technical",
        bgColor: "bg-blue-50 border-blue-200"
      },
      behavioral: {
        icon: <Users className="w-5 h-5" />,
        color: "from-emerald-500 to-emerald-600", 
        title: "Behavioral",
        bgColor: "bg-emerald-50 border-emerald-200"
      },
      problem: {
        icon: <Lightbulb className="w-5 h-5" />,
        color: "from-amber-500 to-orange-500",
        title: "Problem Solving",
        bgColor: "bg-amber-50 border-amber-200"
      },
      hr: {
        icon: <MessageCircle className="w-5 h-5" />,
        color: "from-purple-500 to-purple-600",
        title: "HR Discussion",
        bgColor: "bg-purple-50 border-purple-200"
      }
    };
    return types[interviewType] || types.technical;
  };

  const interviewInfo = getInterviewInfo(round);

  const getElapsedTime = () => {
    const elapsed = Math.floor((Date.now() - interviewStartTime.getTime()) / 1000 / 60);
    return `${elapsed} min`;
  };

  // Submit answer to current question
  const handleSubmitAnswer = async () => {
    if (!user || !answer.trim() || !sessionId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('[InterviewRoom] Submitting answer:', {
        userId: user._id,
        sessionId,
        answerLength: answer.length
      });

      // Submit answer via REST API
      const response = await submitAnswerAPI({
        user_id: user._id,
        session_id: sessionId,
        answer: answer.trim()
      });

      console.log('[InterviewRoom] Answer submitted, received:', response);

      // Update state
      setInterviewState(response.state);
      setAnswer("");

      // Check if interview is complete (next_question is null AND state.completed is true)
      if (response.next_question === null && response.state.completed === true) {
        console.log('[InterviewRoom] Interview completed, fetching report...');
        await fetchReport();
      } else if (response.next_question) {
        // Set next question
        setQuestion(response.next_question);
      } else {
        // Handle unexpected state
        console.warn('[InterviewRoom] Unexpected state: next_question is null but interview not completed');
        setError('Unexpected interview state. Please try again.');
      }
    } catch (err: any) {
      console.error('[InterviewRoom] Failed to submit answer:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  // Fetch final interview report
  const fetchReport = async () => {
    if (!user || !sessionId) return;

    try {
      console.log('[InterviewRoom] Fetching interview report...');
      const reportData = await getInterviewReport(user._id, sessionId);
      console.log('[InterviewRoom] Report received:', reportData);

      setReport(reportData);
      setShowResults(true);
    } catch (err: any) {
      console.error('[InterviewRoom] Failed to fetch report:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch report');
    }
  };

  // Compute data for charts
  const pieData = useMemo(() => {
    if (!report?.history) return [];
    const buckets = { "0-3": 0, "4-6": 0, "7-8": 0, "9-10": 0 };
    
    for (const item of report.history) {
      if (!item.evaluation) continue;
      const score = item.evaluation.technical_depth;
      if (score <= 3) buckets["0-3"]++;
      else if (score <= 6) buckets["4-6"]++;
      else if (score <= 8) buckets["7-8"]++;
      else buckets["9-10"]++;
    }
    
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [report]);

  const barData = useMemo(() => {
    if (!report?.history) return [];
    return report.history
      .filter(item => item.evaluation)
      .map((item, idx) => ({
        name: `Q${idx + 1}`,
        score: item.evaluation?.technical_depth || 0,
      }));
  }, [report]);

  const COLORS = ["#ef4444", "#f59e0b", "#60a5fa", "#10b981"];

  // Show error state
  if (error && initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Start Interview</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleStartNewInterview}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentHistory = interviewState?.history || [];
  const answeredCount = currentHistory.filter(h => h.answer !== null).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${interviewInfo.color} text-white shadow-lg`}>
                {interviewInfo.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {round} Round Interview
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.name || 'Candidate'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{getElapsedTime()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">{answeredCount} answered</span>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${interviewInfo.bgColor}`}>
                {showResults ? "Completed" : initializing ? "Starting..." : "In Progress"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!showResults ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Interview Progress</h3>
                <span className="text-sm text-gray-500">Question {answeredCount + 1}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${interviewInfo.color} transition-all duration-500`}
                  style={{ width: `${Math.min((answeredCount / 5) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Current Question */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${interviewInfo.color}`} />
              
              <div className="p-8">
                {initializing ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-pulse mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${interviewInfo.color} rounded-full flex items-center justify-center`}>
                        <Loader2 className="animate-spin w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Starting Your Interview</h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Our AI interviewer is analyzing your profile and preparing your first question...
                    </p>
                  </div>
                ) : question ? (
                  <div className="space-y-6">
                    {/* Question with TTS */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Current Question</span>
                        </div>
                        <button
                          onClick={() => speakQuestion(question)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSpeaking 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                          title={isSpeaking ? "Stop reading question" : "Read question aloud"}
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-4 h-4" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4" />
                              Listen
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-500">
                        <p className="text-lg font-medium text-gray-900 leading-relaxed">
                          {question}
                        </p>
                      </div>
                    </div>

                    {/* Answer Input with STT */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Your Answer</span>
                        </div>
                        {speechSupported && (
                          <button
                            onClick={toggleListening}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isListening 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title={isListening ? "Stop voice input" : "Start voice input"}
                          >
                            {isListening ? (
                              <>
                                <MicOff className="w-4 h-4" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Mic className="w-4 h-4" />
                                Speak
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      
                      <div className="relative">
                        <textarea
                          className={`w-full p-6 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500 ${
                            isListening ? 'ring-2 ring-green-500 border-green-300' : ''
                          }`}
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) handleSubmitAnswer();
                          }}
                          placeholder={`Share your thoughts here... Take your time to provide a comprehensive answer.

💡 Tips:
• Structure your response clearly
• Use specific examples when possible
• Explain your reasoning
${speechSupported ? '• Click "Speak" to use voice input' : ''}
• Press Ctrl+Enter to submit`}
                          rows={8}
                          disabled={loading}
                        />
                        {isListening && (
                          <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Listening...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>💡 Press Ctrl+Enter for quick submit</span>
                        <span>•</span>
                        <span>{answer.length} characters</span>
                        {/* {speechSupported && (
                          <>
                            <span>•</span>
                            <span>🎤 Voice input available</span>
                          </>
                        )} */}
                      </div>
                      
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={loading || !answer.trim()}
                        className={`inline-flex items-center gap-3 ${
                          loading || !answer.trim()
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : `bg-gradient-to-r ${interviewInfo.color} hover:shadow-lg transform hover:scale-105`
                        } text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all duration-300`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin w-5 h-5" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Submit Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-pulse mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${interviewInfo.color} rounded-full flex items-center justify-center`}>
                        <Loader2 className="animate-spin w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Preparing Your Question</h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Our AI interviewer is analyzing your profile and preparing a personalized question for you...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Previous Responses */}
            {currentHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Previous Responses
                </h3>
                <div className="space-y-4">
                  {currentHistory.filter(h => h.answer).map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Q: {item.question}</p>
                      <p className="text-sm text-gray-600 mb-2">A: {item.answer}</p>
                      {item.evaluation && (
                        <div className="text-xs text-green-700 bg-green-50 rounded p-2">
                          <span className="font-semibold">Evaluation:</span> {item.evaluation.summary}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results Page - Enhanced UI */
          <div className="space-y-8">
            {/* Header Results */}
            <div className="text-center space-y-4">
              <div className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${interviewInfo.color} text-white rounded-2xl shadow-lg`}>
                <Award className="w-6 h-6" />
                <span className="font-bold text-lg">Interview Completed!</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Your Performance Report</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Comprehensive analysis of your {interviewInfo.title.toLowerCase()} interview performance
              </p>
            </div>

            {/* Overall Performance Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${interviewInfo.color}`} />
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <h3 className="text-2xl font-bold text-gray-900">Final Interview Report</h3>
                    </div>
                    {report && (
                      <>
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Role:</span> {report.role}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Company:</span> {report.company}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Industry:</span> {report.industry}
                          </p>
                        </div>
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Average Scores</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Technical Depth: <span className="font-semibold">{report.avg_scores.technical_depth.toFixed(1)}</span></div>
                            <div>Relevance: <span className="font-semibold">{report.avg_scores.relevance.toFixed(1)}</span></div>
                            <div>Communication: <span className="font-semibold">{report.avg_scores.communication.toFixed(1)}</span></div>
                            <div>Behavioral: <span className="font-semibold">{report.avg_scores.behavioral.toFixed(1)}</span></div>
                          </div>
                          <div className="mt-3 text-lg font-bold text-gray-900">
                            Overall: <span className={`${
                              report.avg_scores.overall.includes('Hire') ? 'text-green-600' : 'text-red-600'
                            }`}>{report.avg_scores.overall}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="w-72 ml-8">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} label>
                          {pieData.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <ReTooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <h4 className="text-xl font-bold text-gray-900">Per-question Scores</h4>
                </div>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <ReTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e5e5', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No score details available.</p>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                  <h4 className="text-xl font-bold text-gray-900">Detailed Q/A & Feedback</h4>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {report?.history.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${interviewInfo.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="text-sm text-gray-500">Q{idx + 1} - {item.stage}</p>
                            <p className="font-medium text-gray-800 text-sm">{item.question}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              <span className="font-semibold">Answer:</span> {item.answer || 'No answer provided'}
                            </p>
                            {item.evaluation && (
                              <div className="text-xs text-green-700 mt-1 bg-green-50 rounded p-2">
                                <p className="font-semibold mb-1">Evaluation:</p>
                                <p>{item.evaluation.summary}</p>
                                <div className="flex gap-3 mt-2">
                                  <span>Clarity: {item.evaluation.clarity}/10</span>
                                  <span>Confidence: {item.evaluation.confidence}/10</span>
                                  <span>Technical: {item.evaluation.technical_depth}/10</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-8">No history available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-8">
              {/* <button className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Download Report
              </button> */}
              <button onClick={handleStartNewInterview} className={`px-8 py-3 bg-gradient-to-r ${interviewInfo.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105`}>
                Start New Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}