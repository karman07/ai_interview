import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import InterviewRecorder from "./InterviewRecorder";
import { 
  Loader2, 
  Volume2, 
  VolumeX,
  Clock,
  MessageSquare,
  User,
  Users,
  Code,
  Lightbulb,
  MessageCircle,

} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  startInterview,
  startInterviewWithResume,

  type InterviewState,

} from "@/api/aiInterview";

type Props = { round: string };

export default function InterviewRoom({ round }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState<string>("");
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [question, setQuestion] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewStartTime] = useState(new Date());

  const handleStartNewInterview = () => {
    navigate('/interview_round')
  }

  const speakQuestion = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const initInterview = async () => {
      if (!user) return;
      
      const interviewDetails = localStorage.getItem("interview_details");
      if (!interviewDetails) {
        setError('No interview details found. Please start from the interview setup page.');
        setInitializing(false);
        return;
      }
      
      try {
        setInitializing(true);
        setError(null);
        const parsedDetails = JSON.parse(interviewDetails);
        
        let cvFile = null;
        let jdFile = null;
        
        if (parsedDetails.hasCV) {
          const cvData = sessionStorage.getItem('cvFile');
          if (cvData) {
            const cvInfo = JSON.parse(cvData);
            const response = await fetch(cvInfo.data);
            const blob = await response.blob();
            cvFile = new File([blob], cvInfo.name, { type: cvInfo.type });
          }
        }
        
        if (parsedDetails.hasJD) {
          const jdData = sessionStorage.getItem('jdFile');
          if (jdData) {
            const jdInfo = JSON.parse(jdData);
            const response = await fetch(jdInfo.data);
            const blob = await response.blob();
            jdFile = new File([blob], jdInfo.name, { type: jdInfo.type });
          }
        }
        
        const newSessionId = `session_${user._id}_${round}_${Date.now()}`;
        setSessionId(newSessionId);

        let response;
        if (cvFile || jdFile) {
          response = await startInterviewWithResume({
            resume: cvFile || new File([parsedDetails.experience || user.name || 'User'], 'user_profile.txt', { type: 'text/plain' }),
            jd_file: jdFile || undefined,
            user_id: user._id,
            session_id: newSessionId,
            role_title: parsedDetails.role || 'Software Engineer',
            company_name: parsedDetails.company || 'Tech Company',
            industry: parsedDetails.industry || 'Technology',
            jd: parsedDetails.jobDescription || 'General software development role',
            round_type: (round as any) || 'full'
          });
        } else {
          response = await startInterview({
            user_id: user._id,
            session_id: newSessionId,
            role_title: parsedDetails.role || 'Software Engineer',
            company_name: parsedDetails.company || 'Tech Company',
            industry: parsedDetails.industry || 'Technology',
            jd: parsedDetails.jobDescription || 'General software development role',
            cv: parsedDetails.experience || user.email || 'Candidate profile',
            round_type: (round as any) || 'full'
          });
        }

        setInterviewState(response.state);
        setQuestion(response.first_question);
        setInitializing(false);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to start interview');
        setInitializing(false);
      }
    };

    initInterview();
  }, [round, user]);

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

  const currentHistory = interviewState?.history || [];
  const answeredCount = currentHistory.filter(h => h.answer !== null).length;

  if (error && initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to Start Interview</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${interviewInfo.color} text-white shadow-lg`}>
                {interviewInfo.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {round} Round Interview
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.name || 'Candidate'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{getElapsedTime()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">{answeredCount} answered</span>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${interviewInfo.bgColor} dark:bg-opacity-20 dark:text-white`}>
                {initializing ? "Starting..." : "In Progress"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Interview Progress</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">Question {answeredCount + 1}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${interviewInfo.color} transition-all duration-500`}
                style={{ width: `${Math.min((answeredCount / 5) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${interviewInfo.color}`} />
            
            <div className="p-8">
              {initializing ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-pulse mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${interviewInfo.color} rounded-full flex items-center justify-center`}>
                      <Loader2 className="animate-spin w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Starting Your Interview</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    Our AI interviewer is analyzing your profile and preparing your first question...
                  </p>
                </div>
              ) : question ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">📋 Interview Instructions</h3>
                    <div className="space-y-2 text-blue-800 dark:text-blue-300">
                      <p>• Read the question below carefully</p>
                      <p>• Click "Unmute & Start Recording" when ready to answer</p>
                      <p>• Speak your answer clearly to the camera</p>
                      <p>• Click "Stop & Submit" when finished</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${interviewInfo.color} flex items-center justify-center text-white font-bold`}>
                          {answeredCount + 1}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Question {answeredCount + 1}</h3>
                      </div>
                      <button
                        onClick={() => speakQuestion(question)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSpeaking 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-4 h-4" />
                            Stop Reading
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            Read Aloud
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border-l-4 border-blue-500 dark:border-blue-400">
                      <p className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
                        {question}
                      </p>
                    </div>
                  </div>

                  <InterviewRecorder
                    questionId={`q_${answeredCount + 1}`}
                    sessionId={sessionId}
                    onSubmit={() => {}}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-pulse mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${interviewInfo.color} rounded-full flex items-center justify-center`}>
                      <Loader2 className="animate-spin w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Preparing Your Question</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    Our AI interviewer is analyzing your profile and preparing a personalized question for you...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}