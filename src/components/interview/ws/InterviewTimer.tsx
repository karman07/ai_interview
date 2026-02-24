import React from 'react';

interface InterviewTimerProps {
    formattedTime: string;
}

export const WSInterviewTimer: React.FC<InterviewTimerProps> = ({ formattedTime }) => {
    return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm font-semibold tracking-wider text-gray-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formattedTime}
            </span>
        </div>
    );
};
