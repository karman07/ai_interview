import React, { useState, useRef, useEffect } from 'react';
import { Video, Mic, MicOff, Square, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import http from '@/api/http';

interface InterviewRecorderProps {
  questionId: string;
  sessionId: string;
  onSubmit: (result?: any) => void;
}

const InterviewRecorder: React.FC<InterviewRecorderProps> = ({ questionId, sessionId, onSubmit }) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isMuted, setIsMuted] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Start camera immediately
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
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
      
      // Mute audio by default
      stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) return;
    
    try {
      setError('');
      
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const uploadResponse = async () => {
    if (!recordedBlob || !user) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      const fileName = `${questionId}_${Date.now()}.webm`;
      formData.append('files', recordedBlob, fileName);
      formData.append('question_id', questionId);
      formData.append('response_duration', duration.toString());
      
      const response = await http.post(`/ai-interview/session/${sessionId}/upload-response`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data) {
        onSubmit(response.data);
      }
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Video Feed */}
      <div className="relative bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-80 object-cover"
        />
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="font-medium">REC {formatTime(duration)}</span>
          </div>
        )}
        
        {/* Mic Status */}
        <div className="absolute top-4 right-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isMuted ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="text-sm font-medium">{isMuted ? 'MUTED' : 'LIVE'}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 space-y-4">
        {!recordedBlob ? (
          <>
            {/* Mic Control */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleMute}
                disabled={isRecording}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  isMuted
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isMuted ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Unmute Microphone
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Mute Microphone
                  </>
                )}
              </button>
            </div>

            {/* Recording Control */}
            <div className="flex items-center justify-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isUploading || isMuted}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : isMuted
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-6 h-6" />
                    Stop & Submit Answer
                  </>
                ) : (
                  <>
                    <Video className="w-6 h-6" />
                    {isMuted ? 'Unmute First to Record' : 'Start Recording Answer'}
                  </>
                )}
              </button>
            </div>
            
            {isMuted && (
              <p className="text-center text-sm text-gray-500">
                🎤 Please unmute your microphone before recording your answer
              </p>
            )}
          </>
        ) : (
          /* Preview & Submit */
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Answer Recorded!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Duration: {formatTime(duration)}
              </p>
              <video
                src={URL.createObjectURL(recordedBlob)}
                controls
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setRecordedBlob(null);
                  setDuration(0);
                }}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Record Again
              </button>
              <button
                onClick={uploadResponse}
                disabled={isUploading}
                className="flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Submit Answer
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewRecorder;