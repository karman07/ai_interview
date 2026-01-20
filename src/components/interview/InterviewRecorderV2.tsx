import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import http from '@/api/http';

interface InterviewRecorderProps {
  questionId: string;
  sessionId: string;
  onSubmit: (result?: any) => void;
  onNextQuestion: () => void;
}

const InterviewRecorderV2: React.FC<InterviewRecorderProps> = ({ sessionId, onSubmit }) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [silenceTimer, setSilenceTimer] = useState<number>(0);
  const [canRecord, setCanRecord] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const videoChunksRef = useRef<BlobPart[]>([]);
  const audioChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    startCamera();
    const timer = setTimeout(() => setCanRecord(true), 2000);
    return () => {
      clearTimeout(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const detectSilence = () => {
    if (!streamRef.current) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(streamRef.current);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    microphone.connect(analyser);
    analyser.fftSize = 512;
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const checkAudioLevel = () => {
      if (!analyserRef.current || !isRecording) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      if (average < 10) {
        setSilenceTimer(prev => {
          const newVal = prev + 1;
          if (newVal >= 3) {
            stopRecordingAndSubmit();
          }
          return newVal;
        });
      } else {
        setSilenceTimer(0);
      }

      if (isRecording) {
        requestAnimationFrame(checkAudioLevel);
      }
    };

    checkAudioLevel();
  };

  const startRecording = async () => {
    if (!streamRef.current) return;
    
    try {
      setError('');
      videoChunksRef.current = [];
      audioChunksRef.current = [];
      
      const videoRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
      const audioRecorder = new MediaRecorder(new MediaStream(streamRef.current.getAudioTracks()), { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current = videoRecorder;
      audioRecorderRef.current = audioRecorder;
      
      videoRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) videoChunksRef.current.push(event.data);
      };
      
      audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      videoRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Video blob size:', videoBlob.size);
        console.log('Audio blob size:', audioBlob.size);
        if (audioBlob.size === 0) {
          console.error('Audio blob is empty!');
        }
        uploadResponse(videoBlob, audioBlob);
      };
      
      videoRecorder.start();
      audioRecorder.start();
      setIsRecording(true);
      setDuration(0);
      setSilenceTimer(0);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      detectSilence();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording.');
    }
  };

  const stopRecordingAndSubmit = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    }
  };

const uploadResponse = async (videoBlob: Blob, audioBlob: Blob) => {
    if (!videoBlob || !user) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('video_file', new File([videoBlob], `answer_${Date.now()}.mp4`, { type: 'video/mp4' }));
      formData.append('audio_file', new File([audioBlob], `answer_${Date.now()}.mp3`, { type: 'audio/mp3' }));
      
      const { data } = await http.post('/enhanced-interview/answer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000
      });
      
      if (data) onSubmit(data);
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload response');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-[500px] object-cover"
        />
        
        {isRecording && (
          <div className="absolute top-6 left-6 flex items-center gap-3 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="font-semibold">{formatTime(duration)}</span>
          </div>
        )}

        {isRecording && silenceTimer > 0 && (
          <div className="absolute top-6 right-6 bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg">
            <span className="text-sm font-medium">Auto-submit in {3 - silenceTimer}s</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
              <p className="text-white font-semibold">Analyzing your answer...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={isRecording ? stopRecordingAndSubmit : startRecording}
          disabled={isUploading || !canRecord}
          className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
          } disabled:opacity-50`}
        >
          {isRecording ? (
            <>
              <Send className="w-6 h-6" />
              Submit Answer
            </>
          ) : (
            <>
              <Video className="w-6 h-6" />
              {canRecord ? 'Start Recording' : 'Please wait...'}
            </>
          )}
        </button>
      </div>

      {isRecording && (
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          💡 Your answer will auto-submit after 3 seconds of silence
        </p>
      )}
    </div>
  );
};

export default InterviewRecorderV2;
