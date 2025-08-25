import { useState, useEffect } from 'react';
import { 
  Play, 
  FileText, 
  CheckCircle, 
  XCircle, 

  Briefcase, 
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
  Calendar,
  Eye,
  AlertCircle
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useInterview } from '@/contexts/InterviewContext';
import { useResults } from '@/contexts/ResultsContext';
import { ResultsApi } from '@/api/results';
import { CreateInterviewDto } from '@/api/interviews';

import { InterviewQuestion } from '@/contexts/InterviewContext';
import { Result as ResultType } from '@/types/results';

// interface ApiError {
//   message: string;
//   details?: any;
// }

// Use contexts for interview and results data

const InterviewApp = () => {
  // Authentication from context
  const { user } = useAuth();

  // Application state
  const [currentView, setCurrentView] = useState<'home' | 'create' | 'interview' | 'results' | 'result-detail'>('home');
  const { generatedQuestions, generateQuestions: ctxGenerate } = useInterview();
  const { results: ctxResults, fetchMine, submitRun } = useResults();
  const [interviewData, setInterviewData] = useState<CreateInterviewDto>({
    jobDescription: '',
    difficulty: 'medium',
    format: 'text',
    positionTitle: '',
    candidateName: ''
  });
  const [questions, setQuestions] = useState<InterviewQuestion[]>(generatedQuestions ?? []);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<ResultType | null>(null);
  const [interviewComplete, setInterviewComplete] = useState(false);

  useEffect(() => {
    if (currentView === 'results' && user) {
      loadResults();
    }
  }, [currentView, user]);

  // logout is available from AuthContext; AuthContext will manage token storage.

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    try {
  await fetchMine();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const loadResultById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ResultsApi.getOne(id);
      const result: ResultType = res.data;
      setSelectedResult(result);
      setCurrentView('result-detail');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load result details');
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (!interviewData.jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const g = await ctxGenerate(interviewData as any);
      setQuestions(g);
      setAnswers(new Array(g.length).fill(''));
      setCurrentView('interview');
      setCurrentQuestionIndex(0);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const submitInterview = async () => {
    setLoading(true);
    setError(null);
    try {
      const dto: CreateInterviewDto = {
        ...interviewData,
  questions: questions.map((q: InterviewQuestion) => q.question),
        answers: answers
      };

  const result: ResultType = await submitRun(dto);
  setSelectedResult(result);
      setInterviewComplete(true);
      setCurrentView('result-detail');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit interview');
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setInterviewData({
      jobDescription: '',
      difficulty: 'medium',
      format: 'text',
      positionTitle: '',
      candidateName: ''
    });
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setInterviewComplete(false);
    setSelectedResult(null);
    setError(null);
    setCurrentView('home');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };
  
  // safer variants that accept undefined
  const scoreColor = (score?: number) => getScoreColor(score ?? 0);
  const scoreBg = (score?: number) => getScoreBg(score ?? 0);

  // Error Alert Component
  const ErrorAlert = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg z-50 max-w-md">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 mr-3" />
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="ml-3 text-red-500 hover:text-red-700">
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // If there's no authenticated user, show a small prompt and link to the app's login page.
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
          <h2 className="text-xl font-semibold mb-4">Please sign in</h2>
          <p className="text-gray-600 mb-6">You need to sign in to access interviews and results.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => (window.location.href = '/login')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Header Component for authenticated views
//   const Header = () => (
//     <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
//       <div className="container mx-auto px-4 py-4">
//         <div className="flex items-center justify-between">
//           <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//             AI Interview System
//           </h1>
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center text-gray-600">
//               <User className="w-5 h-5 mr-2" />
//               {user?.name || user?.email}
//             </div>
//             <button
//               onClick={handleLogout}
//               className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
//             >
//               <LogOut className="w-5 h-5 mr-1" />
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

  // Home View
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {/* <Header /> */}
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Hi {user?.name}!
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practice interviews with AI-powered questions tailored to your job description
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div 
              onClick={() => setCurrentView('create')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors">
                <Play className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Start Interview</h3>
              <p className="text-gray-600 leading-relaxed">
                Create a new interview session with custom job description and difficulty level
              </p>
            </div>

            <div 
              onClick={() => setCurrentView('results')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6 group-hover:bg-purple-200 transition-colors">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">View Results</h3>
              <p className="text-gray-600 leading-relaxed">
                Review your past interview performances and track your progress
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create Interview View
  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {/* <Header /> */}
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setCurrentView('home')}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create Interview</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={interviewData.positionTitle || ''}
                    onChange={(e) => setInterviewData({...interviewData, positionTitle: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Senior Frontend Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidate Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={interviewData.candidateName || ''}
                    onChange={(e) => setInterviewData({...interviewData, candidateName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter candidate name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={interviewData.jobDescription}
                    onChange={(e) => setInterviewData({...interviewData, jobDescription: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe the job role, required skills, and responsibilities..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={interviewData.difficulty}
                    onChange={(e) => setInterviewData({...interviewData, difficulty: e.target.value as any})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="junior">Junior Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Format
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setInterviewData({...interviewData, format: 'text'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        interviewData.format === 'text' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText className="w-6 h-6 mx-auto mb-2" />
                      Text Questions
                    </button>
                    <button
                      onClick={() => setInterviewData({...interviewData, format: 'mcq'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        interviewData.format === 'mcq' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                      Multiple Choice
                    </button>
                  </div>
                </div>

                <button
                  onClick={generateQuestions}
                  disabled={loading || !interviewData.jobDescription.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Generating Questions...
                    </div>
                  ) : (
                    'Generate Interview Questions'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview View
  if (currentView === 'interview') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {/* <Header /> */}
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Progress Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Interview in Progress</h2>
                  <span className="text-sm opacity-90">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                    {currentQuestion?.question}
                  </h3>

                  {currentQuestion?.options ? (
                    // MCQ Format
                    <div className="space-y-3">
                      {currentQuestion.options.map((option: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => {
                            const newAnswers = [...answers];
                            newAnswers[currentQuestionIndex] = option;
                            setAnswers(newAnswers);
                          }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            answers[currentQuestionIndex] === option
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    // Text Format
                    <textarea
                      value={answers[currentQuestionIndex] || ''}
                      onChange={(e) => {
                        const newAnswers = [...answers];
                        newAnswers[currentQuestionIndex] = e.target.value;
                        setAnswers(newAnswers);
                      }}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Type your answer here..."
                    />
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Previous
                  </button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={submitInterview}
                      disabled={loading}
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition-all transform hover:scale-105"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Submit Interview
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                      Next
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results List View
  if (currentView === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {/* <Header /> */}
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setCurrentView('home')}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Interview Results</h1>
              <div></div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : ctxResults.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Results Yet</h3>
                <p className="text-gray-500 mb-6">Take your first interview to see results here</p>
                <button 
                  onClick={() => setCurrentView('create')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Start First Interview
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
            {ctxResults.map((result: ResultType) => (
                  <div 
            key={result._id}
            onClick={() => loadResultById(result._id)}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {result.jobDescription.substring(0, 100)}...
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(result.createdAt ?? '')}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {result.difficulty} level
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {result.questions.length} questions
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${scoreBg(result.overall?.overallScore)} ${scoreColor(result.overall?.overallScore)}`}>
                          {result.overall?.overallScore ?? 0}%
                        </div>
                        <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Result Detail View
  if (currentView === 'result-detail' && selectedResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {/* <Header /> */}
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setCurrentView(interviewComplete ? 'home' : 'results')}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {interviewComplete ? 'Back to Home' : 'Back to Results'}
              </button>
              {interviewComplete && (
                <button 
                  onClick={resetInterview}
                  className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Take Another Interview
                </button>
              )}
            </div>

            {/* Overall Score Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${scoreBg(selectedResult.overall?.overallScore)} ${scoreColor(selectedResult.overall?.overallScore)} mb-4`}>
                  {selectedResult.overall?.overallScore ?? 0}%
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {interviewComplete ? 'Interview Complete!' : 'Interview Results'}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {selectedResult.overall.summary}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="font-semibold text-gray-800">{selectedResult.questions.length}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="font-semibold text-gray-800">
                    {selectedResult.items.filter(item => item.isCorrect).length}
                  </div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-3">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="font-semibold text-gray-800">
                    {selectedResult.items.filter(item => !item.isCorrect).length}
                  </div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800">Detailed Results</h3>
              
              {selectedResult.items.map((item: any, index: number) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex-1 pr-4">
                      Question {index + 1}: {item.question}
                    </h4>
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.isCorrect 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.score}%
                      </div>
                      {item.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Your Answer:</h5>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-800">{item.answer || 'No answer provided'}</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Feedback:</h5>
                      <div className={`rounded-lg p-4 ${
                        item.isCorrect ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <p className="text-gray-800">{item.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Job Description Reference */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">{selectedResult.jobDescription}</p>
              </div>
              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {selectedResult.difficulty} level
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(selectedResult.createdAt ?? '')}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {interviewComplete && (
              <div className="flex justify-center space-x-4 mt-8">
                <button 
                  onClick={() => setCurrentView('results')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                >
                  View All Results
                </button>
                <button 
                  onClick={() => setCurrentView('create')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Start New Interview
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InterviewApp;