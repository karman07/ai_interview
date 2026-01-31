import { useEffect, useState, useRef } from "react";
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
  type SubmitAnswerV2Response,
  type CompleteInterviewV2Response
} from "@/api/interviewV2";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleGoBack = () => {
    navigate('/interview_round');
  };

  // Robust TTS function that ensures speech works
  const speakTextRobust = (text: string, isRetry = false): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isMuted) {
        console.log('⚠️ TTS skipped - muted');
        resolve();
        return;
      }

      // If already speaking, stop it first (only on initial call, not retries)
      if (!isRetry && isSpeakingRef.current) {
        console.log('🛑 Stopping existing speech...');
        window.speechSynthesis.cancel();
        currentUtteranceRef.current = null;
        // Wait longer for cancel to complete
        setTimeout(() => {
          speakTextRobust(text, true).then(resolve).catch(reject);
        }, 300);
        return;
      }

      console.log(`🗣️ Starting TTS:`, text.substring(0, 50) + '...');
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';
      currentUtteranceRef.current = utterance;

      // Try to use a specific voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
          console.log('🎙️ Using voice:', englishVoice.name);
        }
      }

      utterance.onstart = () => {
        console.log('✅ TTS started successfully');
        isSpeakingRef.current = true;
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        console.log('✅ TTS ended successfully');
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        resolve();
      };

      utterance.onerror = (e) => {
        console.error('❌ TTS error:', e.error, e);
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        
        // Don't retry on 'canceled' errors - that's us stopping it intentionally
        if (e.error === 'canceled') {
          console.log('ℹ️ TTS was canceled (expected behavior)');
          resolve();
          return;
        }
        
        // For other errors, just reject - don't retry to avoid loops
        reject(e);
      };

      // Small delay before speaking to ensure everything is ready
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    });
  };

  // Speak question using Web Speech API
  const speakQuestion = (text: string) => {
    if (isMuted) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    console.log('🛑 Manually stopping speech');
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    currentUtteranceRef.current = null;
  };

  const toggleMute = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    const initInterview = async () => {
      const sessionData = localStorage.getItem('v2_interview_session');
      
      if (!sessionData) {
        setError('No interview session found. Please start from the setup page.');
        setInitializing(false);
        return;
      }

      try {
        // Ensure voices are loaded
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          console.log('🎙️ Available voices:', voices.length);
          if (voices.length > 0) {
            const englishVoices = voices.filter(v => v.lang.startsWith('en'));
            console.log('🎙️ English voices:', englishVoices.map(v => v.name));
          }
        };
        
        // Load voices immediately and on voiceschanged event
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        const parsedData = JSON.parse(sessionData);
        setSessionId(parsedData.sessionId);
        setQuestion(parsedData.firstQuestion);
        setQuestionNumber(parsedData.questionNumber);
        
        // Start camera
        await startCamera();
        
        setInitializing(false);
        
        // Speak first question using robust TTS
        setTimeout(() => {
          if (parsedData.firstQuestion) {
            console.log('🎬 Starting first question TTS');
            speakTextRobust(parsedData.firstQuestion).catch(err => {
              console.error('Failed to speak first question:', err);
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
      window.speechSynthesis.cancel();
      stopCamera();
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

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    if (question && !initializing && !isComplete) {
      speakQuestion(question);
    }
  }, [question, initializing, isComplete, isMuted]);

  const handleAnswerSubmit = async (audioBlob: Blob, _transcript: string) => {
    stopSpeaking();

    try {
      const audioFile = createAudioFile(audioBlob, sessionId);
      
      console.log('📤 Submitting answer to API...');
      const response: SubmitAnswerV2Response = await submitAnswerV2(sessionId, {
        answer_audio: audioFile
      });

      console.log('📥 Response received:', response);

      // Check if interview is complete (backend will return specific status)
      if (response.status === 'active') {
        console.log('▶️ Interview continues - next question');
        setQuestion(response.question);
        setQuestionNumber(response.question_number);
        
        // Speak the new question using robust TTS
        console.log('🔊 New question received:', response.question);
        setTimeout(() => {
          speakTextRobust(response.question).catch(err => {
            console.error('Failed to speak question:', err);
          });
        }, 800);
      } else if (response.status === 'completed') {
        // Interview completed, get final report
        console.log('🏁 Interview status is completed - calling handleComplete');
        await handleComplete();
      } else {
        console.warn('⚠️ Unknown status:', response.status);
      }
    } catch (error: any) {
      console.error('❌ Error submitting answer:', error);
      
      // Check if error indicates completion
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('complete')) {
        console.log('🏁 Error indicates completion - calling handleComplete');
        await handleComplete();
      } else {
        setError(error.response?.data?.detail || error.message || 'Failed to submit answer');
      }
    }
  };

  const handleComplete = async () => {
    try {
      console.log('🏁 Completing interview...');
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
      setError('Failed to complete interview');
    }
  };

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
                  {isSpeaking && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <div className="w-2 h-2 bg-slate-600 dark:bg-slate-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Speaking...</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border-l-4 border-slate-600">
                  <p className="text-lg text-gray-900 dark:text-white leading-relaxed">
                    {question}
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
