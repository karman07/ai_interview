import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LiveSpeakingInterface from "./LiveSpeakingInterface";
import { 
  Loader2,
  Clock,
  Volume2,
  VolumeX,
  Video
} from "lucide-react";
import {
  submitAnswerV2,
  completeInterviewV2,
  createAudioFile,
  streamQuestion,
  getSessionState,
  getPerformanceMetrics,
  validateAudioFile,
  handleAPIError,
  type SubmitAnswerV2Response,
  type CompleteInterviewV2Response,
  type SessionStateResponse,
  type PerformanceMetricsResponse
} from "@/api/interviewV2";
import { speakTextWithControl, stopSpeaking as stopGoogleTTS } from "@/services/googleTTS";

type Props = { round: string };

export default function InterviewRoomV2({ round }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewStartTime] = useState(new Date());
  const [isComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // New state for streaming and evaluation
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<SubmitAnswerV2Response['evaluation'] | null>(null);
  const [lastVoiceAnalysis, setLastVoiceAnalysis] = useState<SubmitAnswerV2Response['voice_analysis'] | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [_performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricsResponse | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const hasInitializedRef = useRef<boolean>(false);
  const currentQuestionRef = useRef<string>("");
  const streamCancelRef = useRef<(() => void) | null>(null);

  const handleGoBack = () => {
    navigate('/interview_round');
  };

  // Google Cloud TTS function with duplicate prevention
  const speakTextRobust = async (text: string): Promise<void> => {
    if (isMuted) {
      console.log('⚠️ TTS skipped - muted');
      return;
    }

    // Prevent duplicate calls for the same text
    if (currentQuestionRef.current === text && isSpeakingRef.current) {
      console.log('⚠️ TTS already in progress for this text, skipping duplicate call');
      return;
    }

    // If speaking different text, stop it first
    if (isSpeakingRef.current) {
      console.log('🛑 Stopping existing speech...');
      stopGoogleTTS();
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Mark this text as current
    currentQuestionRef.current = text;

    try {
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      
      await speakTextWithControl(text, {
        languageCode: 'en-IN',
        voiceName: 'en-IN-Wavenet-D',
        speakingRate: 0.95
      });
      
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      currentQuestionRef.current = "";
    } catch (error) {
      console.error('❌ Google TTS error:', error);
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      currentQuestionRef.current = "";
      throw error;
    }
  };



  const stopSpeaking = () => {
    console.log('🛑 Manually stopping speech');
    stopGoogleTTS();
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  };

  const toggleMute = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    // Prevent double initialization (React 18 strict mode in dev)
    if (hasInitializedRef.current) {
      console.log('⚠️ Interview already initialized, skipping');
      return;
    }
    hasInitializedRef.current = true;

    const initInterview = async () => {
      const sessionData = localStorage.getItem('v2_interview_session');
      
      if (!sessionData) {
        setError('No interview session found. Please start from the setup page.');
        setInitializing(false);
        return;
      }

      try {
        const parsedData = JSON.parse(sessionData);
        setSessionId(parsedData.sessionId);
        setQuestion(parsedData.firstQuestion);
        setQuestionNumber(parsedData.questionNumber);
        
        // Start camera
        await startCamera();
        
        setInitializing(false);
        
        // Speak first question using Google TTS (no retry to avoid duplicates)
        setTimeout(() => {
          if (parsedData.firstQuestion && !isSpeakingRef.current) {
            console.log('🎬 Starting first question TTS');
            speakTextRobust(parsedData.firstQuestion).catch(err => {
              console.error('❌ Failed to speak first question:', err);
            });
          }
        }, 1000);
      } catch (err: any) {
        setError('Failed to initialize interview');
        setInitializing(false);
      }
    };

    initInterview();

    return () => {
      stopGoogleTTS();
      // Cancel any active streaming
      if (streamCancelRef.current) {
        streamCancelRef.current();
        streamCancelRef.current = null;
      }
      // Don't stop camera on cleanup to prevent video disappearing
      // Camera will be stopped when navigating away from the page
    };
  }, []);

  // Cleanup camera only on final unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  // Camera cleanup handled in useEffect on unmount
  // const stopCamera = () => {
  //   if (videoRef.current && videoRef.current.srcObject) {
  //     const stream = videoRef.current.srcObject as MediaStream;
  //     stream.getTracks().forEach(track => track.stop());
  //   }
  // };

  const handleAnswerSubmit = async (audioBlob: Blob, _transcript: string) => {
    stopSpeaking();

    try {
      // Validate audio file
      const audioValidation = validateAudioFile(audioBlob);
      if (!audioValidation.valid) {
        setError(audioValidation.error || 'Invalid audio file');
        return;
      }

      const audioFile = createAudioFile(audioBlob, sessionId);
      
      console.log('📤 Submitting answer to API...');
      const response: SubmitAnswerV2Response = await submitAnswerV2(sessionId, {
        session_id: sessionId,
        answer_audio: audioFile
      });

      console.log('📥 Response received:', response);

      // Store evaluation and voice analysis
      if (response.evaluation) {
        setLastEvaluation(response.evaluation);
        setShowEvaluation(true);
        
        // Auto-hide evaluation after 10 seconds
        setTimeout(() => setShowEvaluation(false), 10000);
      }

      if (response.voice_analysis) {
        setLastVoiceAnalysis(response.voice_analysis);
      }

      // Check if interview is complete
      if (response.status === 'completed') {
        console.log('🏁 Interview completed - calling handleComplete');
        await handleComplete();
      } else if (response.status === 'active' && response.question) {
        console.log('▶️ Interview continues - next question');
        setQuestionNumber(response.question_number || questionNumber + 1);
        
        // Use streaming for better UX
        setIsStreaming(true);
        setQuestion(''); // Clear current question
        
        // Stream the new question with progressive display
        streamCancelRef.current = streamQuestion(
          sessionId,
          // On each chunk
          (_chunk, fullText) => {
            setQuestion(fullText);
          },
          // On complete
          (fullQuestion) => {
            setIsStreaming(false);
            setQuestion(fullQuestion);
            
            // Speak the complete question
            setTimeout(() => {
              if (!isSpeakingRef.current && !isMuted) {
                speakTextRobust(fullQuestion).catch(err => {
                  console.error('❌ Failed to speak question:', err);
                });
              }
            }, 500);
          },
          // On error - fallback to direct question from response
          (error) => {
            console.error('❌ Streaming error:', error);
            setIsStreaming(false);
            setQuestion(response.question || '');
            
            // Speak fallback question
            if (response.question && !isMuted) {
              setTimeout(() => {
                speakTextRobust(response.question!).catch(err => {
                  console.error('❌ Failed to speak question:', err);
                });
              }, 500);
            }
          }
        );
      }
    } catch (error: any) {
      console.error('❌ Error submitting answer:', error);
      const errorMessage = handleAPIError(error);
      
      // Check if error indicates completion
      if (errorMessage.toLowerCase().includes('complete')) {
        console.log('🏁 Error indicates completion - calling handleComplete');
        await handleComplete();
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleComplete = async () => {
    try {
      console.log('🏁 Completing interview...');
      
      // Cancel any active streaming
      if (streamCancelRef.current) {
        streamCancelRef.current();
        streamCancelRef.current = null;
      }

      // Get performance metrics before completing
      try {
        const metrics = await getPerformanceMetrics(sessionId);
        console.log('📊 Performance metrics:', metrics);
        setPerformanceMetrics(metrics);
      } catch (metricsError) {
        console.warn('⚠️ Could not fetch performance metrics:', metricsError);
      }

      const report: CompleteInterviewV2Response = await completeInterviewV2(sessionId, {
        final_notes: `${round} interview completed successfully`
      });

      console.log('✅ Interview completed successfully:', report);
      
      // Store report in localStorage for results page
      localStorage.setItem('v2_interview_report', JSON.stringify(report));
      localStorage.removeItem('v2_interview_session');
      
      console.log('📊 Navigating to results page:', `/interview/results/${sessionId}`);
      // Navigate to results page
      navigate(`/interview/results/${sessionId}`);
    } catch (error: any) {
      console.error('❌ Error completing interview:', error);
      setError(handleAPIError(error));
    }
  };

  // Function to load session state (for resume functionality)
  // Can be called externally or on component mount to resume interrupted sessions
  const loadSessionState = async (sessionIdToLoad: string) => {
    try {
      const state: SessionStateResponse = await getSessionState(sessionIdToLoad);
      
      if (state.completed) {
        console.log('⚠️ Session already completed');
        navigate(`/interview/results/${sessionIdToLoad}`);
        return;
      }

      // Get last interviewer message
      const lastQuestion = state.messages
        .slice()
        .reverse()
        .find(msg => msg.role === 'interviewer');

      if (lastQuestion) {
        setQuestion(lastQuestion.content);
        setQuestionNumber(state.question_count);
        
        // Speak the question
        setTimeout(() => {
          if (!isMuted) {
            speakTextRobust(lastQuestion.content).catch(err => {
              console.error('❌ Failed to speak question:', err);
            });
          }
        }, 1000);
      }

      console.log(`✅ Resumed session at question ${state.question_count}`);
    } catch (error) {
      console.error('❌ Failed to load session state:', error);
      setError(handleAPIError(error));
    }
  };

  // Expose loadSessionState for potential future use (e.g., resume button)
  // Currently not used but available for session recovery features
  React.useEffect(() => {
    if (window) {
      (window as any).__interviewLoadState = loadSessionState;
    }
  }, []);

  const getElapsedTime = () => {
    const elapsed = Math.floor((Date.now() - interviewStartTime.getTime()) / 1000 / 60);
    return `${elapsed} min`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center text-white font-bold">
                {questionNumber}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                  {round} Interview
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{getElapsedTime()}</span>
              </div>
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {initializing ? (
          <div className="min-h-[60vh] bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md">
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-slate-600 dark:text-slate-400 mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Preparing Your Interview
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Setting up camera and microphone...
                </p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md text-center">
              <h2 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-4">
                Error
              </h2>
              <p className="text-red-700 dark:text-red-400 mb-6">{error}</p>
              <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : question ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Feed - Left Column */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Your Video
                  </h3>
                </div>
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Question and Answer - Right Columns */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Question {questionNumber}
                  </h3>
                  <div className="flex items-center gap-2">
                    {isSpeaking && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <div className="w-2 h-2 bg-slate-600 dark:bg-slate-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Speaking...</span>
                      </div>
                    )}
                    {isStreaming && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Loader2 className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin" />
                        <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Streaming...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border-l-4 border-slate-600">
                  <p className="text-lg text-gray-900 dark:text-white leading-relaxed">
                    {question}
                    {isStreaming && <span className="inline-block ml-1 animate-pulse">▋</span>}
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Speaking Tips</h4>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                  <li>• Enable microphone and start speaking naturally</li>
                  <li>• Your answer auto-submits after 3s of silence</li>
                  <li>• Speak clearly at a comfortable pace</li>
                  <li>• Watch your video to maintain good posture</li>
                </ul>
              </div>

              {/* Evaluation Panel - Shows after answer submission */}
              {showEvaluation && lastEvaluation && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="text-green-600 dark:text-green-400">✓</span>
                      Answer Evaluation
                    </h4>
                    <button
                      onClick={() => setShowEvaluation(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {lastEvaluation.clarity}/10
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Clarity</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {lastEvaluation.relevance}/10
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Relevance</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {lastEvaluation.depth}/10
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Depth</div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Feedback:</span> {lastEvaluation.feedback}
                    </p>
                  </div>

                  {/* Voice Analysis (if available) */}
                  {lastVoiceAnalysis && (
                    <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg p-3">
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Voice Analysis
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Fluency:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {lastVoiceAnalysis.fluency_score.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Clarity:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {lastVoiceAnalysis.clarity_score.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {lastVoiceAnalysis.confidence_score.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Pace:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {lastVoiceAnalysis.pace_score.toFixed(1)}/10
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Speaking Rate:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.round(lastVoiceAnalysis.rate_wpm)} WPM
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Streaming Indicator */}
              {isStreaming && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
                        Generating next question...
                      </h4>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        Using real-time streaming for faster response
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Speaking Interface */}
              <LiveSpeakingInterface
                onSubmit={handleAnswerSubmit}
                disabled={initializing || isComplete}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
