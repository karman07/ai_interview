import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import InterviewRecorderV2 from "./InterviewRecorderV2";
import InterviewCompletionScreen from "./InterviewCompletionScreen";
import { 
  Loader2,
  Clock,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  startInterview,
  startInterviewWithResume,
  getInterviewReport,
  type InterviewState,
  type Evaluation,
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
  const [interviewStartTime] = useState(new Date());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [finalEvaluation, setFinalEvaluation] = useState<Evaluation | null>(null);
  const [isQuestionSpeaking, setIsQuestionSpeaking] = useState(false);

  const handleStartNewInterview = () => {
    navigate('/interview_round')
  }

  useEffect(() => {
    if (question && !initializing) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsQuestionSpeaking(true);
      utterance.onend = () => setIsQuestionSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [question, initializing]);

  const handleAnswerSubmit = async (response: any) => {
    window.speechSynthesis.cancel();
    
    if (response.state?.status === 'completed' || response.state?.completed) {
      setFinalEvaluation(response.evaluation || { total_score: 0, feedback: 'Interview completed', suggestions: [] });
      setInterviewState(response.state || response);
      setIsComplete(true);
      try {
        await getInterviewReport(user?._id || '', sessionId);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    } else if (response.next_question) {
      setQuestion(response.next_question);
      setCurrentQuestionIndex(prev => prev + 1);
      setInterviewState(response.state);
    } else if (!response.has_next_question) {
      setFinalEvaluation(response.evaluation || { total_score: 0, feedback: 'Interview completed', suggestions: [] });
      setInterviewState(response.state || response);
      setIsComplete(true);
      try {
        await getInterviewReport(user?._id || '', sessionId);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
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
            cv_id: parsedDetails.cvId,
            jd_id: parsedDetails.jdId,
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

  const getElapsedTime = () => {
    const elapsed = Math.floor((Date.now() - interviewStartTime.getTime()) / 1000 / 60);
    return `${elapsed} min`;
  };

  const currentHistory = interviewState?.history || [];
  const answeredCount = currentHistory.filter(h => h.answer !== null).length;

  if (isComplete && interviewState) {
    return <InterviewCompletionScreen evaluation={finalEvaluation || { total_score: 0, feedback: 'Interview completed', suggestions: [] }} sessionId={sessionId} interviewState={interviewState} />;
  }

  if (error && initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-red-600 dark:text-red-400" />
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {currentQuestionIndex + 1}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                  {round} Interview
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{getElapsedTime()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">{answeredCount} answered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {initializing ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Starting Interview</h3>
            <p className="text-gray-600 dark:text-gray-400">Preparing your first question...</p>
          </div>
        ) : question ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Question {currentQuestionIndex + 1}</h3>
                  {isQuestionSpeaking && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">Speaking...</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-l-4 border-indigo-500">
                  <p className="text-lg text-gray-900 dark:text-white leading-relaxed">
                    {question}
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">💡 Tips</h4>
                <ul className="space-y-1 text-sm text-indigo-800 dark:text-indigo-300">
                  <li>• Speak clearly and confidently</li>
                  <li>• Answer will auto-submit after 3s of silence</li>
                  <li>• Take your time to think before answering</li>
                </ul>
              </div>
            </div>

            <div>
              <InterviewRecorderV2
                questionId={`q_${currentQuestionIndex + 1}`}
                sessionId={sessionId}
                onSubmit={handleAnswerSubmit}
                onNextQuestion={() => {}}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Preparing Question</h3>
            <p className="text-gray-600 dark:text-gray-400">Please wait...</p>
          </div>
        )}
      </div>
    </div>
  );
}
