import React from 'react';
import { Timer } from 'lucide-react';

interface InterviewTimerProps {
    formattedTime: string;
}

export const WSInterviewTimer: React.FC<InterviewTimerProps> = ({ formattedTime }) => {
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400">
                <Timer className="w-4 h-4" />
            </div>
            <span className="text-sm font-black tracking-[0.1em] text-white tabular-nums px-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formattedTime}
            </span>
        </div>
    );
};
