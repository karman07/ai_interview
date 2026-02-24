import React from 'react';

interface VideoPanelProps {
    isSpeaking: boolean;
    isListening: boolean;
    isTranscribing: boolean;
    webcamRef: React.RefObject<HTMLVideoElement>;
    webcamActive: boolean;
}

export const WSVideoPanel: React.FC<VideoPanelProps> = ({ isSpeaking, isListening, isTranscribing, webcamRef, webcamActive }) => {
    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #e0e7f1 0%, #c9d5e3 50%, #d6dde8 100%)' }}>
            {/* AI Interviewer Avatar */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                    <div className="w-64 h-72 rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(160deg, #b8c9dc 0%, #8fa4bd 40%, #7b92ad 100%)' }}>
                        <svg viewBox="0 0 256 288" className="w-full h-full" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }}>
                            <ellipse cx="128" cy="100" rx="52" ry="60" fill="#c4a882" />
                            <path d="M76 90 Q76 40 128 35 Q180 40 180 90 Q180 60 165 50 Q145 38 128 38 Q111 38 91 50 Q76 60 76 90Z" fill="#2c1810" />
                            <path d="M72 95 Q70 75 80 60 L76 95Z" fill="#2c1810" />
                            <path d="M184 95 Q186 75 176 60 L180 95Z" fill="#2c1810" />
                            <ellipse cx="108" cy="95" rx="6" ry="4" fill="#1a1a2e" />
                            <ellipse cx="148" cy="95" rx="6" ry="4" fill="#1a1a2e" />
                            <circle cx="110" cy="94" r="1.5" fill="white" opacity="0.7" />
                            <circle cx="150" cy="94" r="1.5" fill="white" opacity="0.7" />
                            <path d="M98 84 Q108 80 118 83" stroke="#2c1810" strokeWidth="2" fill="none" />
                            <path d="M138 83 Q148 80 158 84" stroke="#2c1810" strokeWidth="2" fill="none" />
                            <path d="M128 100 Q124 112 120 114 Q128 117 136 114 Q132 112 128 100" fill="#b89a76" opacity="0.6" />
                            <path d="M116 125 Q128 132 140 125" stroke="#a07060" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <rect x="118" y="155" width="20" height="20" rx="4" fill="#c4a882" />
                            <path d="M60 288 L60 210 Q60 180 90 170 L118 162 L128 175 L138 162 L166 170 Q196 180 196 210 L196 288Z" fill="#1e3352" />
                            <path d="M118 162 L128 200 L105 185 Z" fill="#172845" />
                            <path d="M138 162 L128 200 L151 185 Z" fill="#172845" />
                            <path d="M118 162 L128 195 L138 162 L133 170 L128 168 L123 170 Z" fill="#e8e0d8" />
                        </svg>
                    </div>
                    {isSpeaking && (
                        <div className="absolute -inset-3 rounded-2xl opacity-30" style={{ background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #3b82f6)', backgroundSize: '200% 200%', filter: 'blur(12px)', zIndex: -1, animation: 'gradient 3s ease infinite' }} />
                    )}
                </div>
            </div>

            {/* Status Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                {isSpeaking && (
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                        <span className="text-sm font-medium text-blue-600 tracking-wide uppercase">AI is Speaking</span>
                    </div>
                )}
                {isTranscribing && !isSpeaking && (
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        <span className="text-sm font-medium text-yellow-600 tracking-wide uppercase">Transcribing...</span>
                    </div>
                )}
                {isListening && !isTranscribing && !isSpeaking && (
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm font-medium text-green-600 tracking-wide uppercase">Listening...</span>
                    </div>
                )}
            </div>

            {/* Webcam PIP */}
            <div className="absolute top-4 right-4 w-36 h-28 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                {webcamActive ? (
                    <video ref={webcamRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1" style={{ background: 'linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%)' }}>
                        <span className="text-xs text-gray-500">Camera Off</span>
                    </div>
                )}
                <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-gray-300 font-medium">You</div>
            </div>
        </div>
    );
};
