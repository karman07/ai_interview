import { useState, useEffect, useRef } from 'react';

export const useInterviewTimer = (durationMinutes?: number) => {
    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    const formattedTime = `${hours}:${mins}:${secs}`;

    // isTimeUp = true once elapsed exceeds durationMinutes (with 30s grace)
    const limitSeconds = durationMinutes ? durationMinutes * 60 + 30 : null;
    const isTimeUp = limitSeconds !== null && seconds >= limitSeconds;

    return { formattedTime, seconds, isTimeUp };
};
