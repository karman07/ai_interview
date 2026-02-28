import { useState, useEffect, useRef, useCallback } from 'react';

const WEBSOCKET_URL = import.meta.env.VITE_INTERVIEW_WS_URL || "ws://localhost:9000/ws/stream";

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface WSInitData {
    resumeText: string;
    jdText: string;
    interviewType?: string;
    role?: string;
    company?: string;
}

export const useInterviewWebSocket = (clientId: string, initData: WSInitData | null) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreamingResponse, setIsStreamingResponse] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const [interviewEnded, setInterviewEnded] = useState(false);
    const feedbackRef = useRef<any>(null);

    const isStreamingResponseRef = useRef(false);

    const setStreamingInfo = (val: boolean) => {
        setIsStreamingResponse(val);
        isStreamingResponseRef.current = val;
    };

    const initDataRef = useRef(initData);
    useEffect(() => {
        initDataRef.current = initData;
    }, [initData]);

    const connect = useCallback(() => {
        if (!initDataRef.current) return;

        const ws = new WebSocket(`${WEBSOCKET_URL}/${clientId}`);

        ws.onopen = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            ws.send(JSON.stringify({
                type: "init",
                resume_text: initDataRef.current!.resumeText,
                jd_text: initDataRef.current!.jdText,
                interview_type: initDataRef.current!.interviewType || "technical",
                role: initDataRef.current!.role || "",
                company: initDataRef.current!.company || "",
            }));
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
            if (!feedbackRef.current) {
                setIsConnected(false);
            }
            setStreamingInfo(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'stream_start') {
                setStreamingInfo(true);
            } else if (data.type === 'stream_end') {
                setStreamingInfo(false);
            } else if (data.type === 'text') {
                const isStreaming = isStreamingResponseRef.current;

                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (isStreaming) {
                        if (lastMsg && lastMsg.role === 'model') {
                            const newContent = lastMsg.content + data.content;
                            return [...prev.slice(0, -1), { ...lastMsg, content: newContent }];
                        } else {
                            return [...prev, { role: 'model', content: data.content }];
                        }
                    } else {
                        return [...prev, { role: 'model', content: data.content }];
                    }
                });
            } else if (data.type === 'info') {
                console.log("System Info:", data.content);
            } else if (data.type === 'end_interview') {
                console.log("Interview Ended", data.feedback);
                feedbackRef.current = data.feedback;
                setFeedback(data.feedback);
                setInterviewEnded(true);
            }
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [clientId]);

    const sendMessage = useCallback((text: string) => {
        if (socket && isConnected) {
            setMessages(prev => [...prev, { role: 'user', content: text }]);
            socket.send(JSON.stringify({
                type: 'message',
                content: text
            }));
        }
    }, [socket, isConnected]);

    const sendEndSession = useCallback(() => {
        if (socket && isConnected) {
            socket.send(JSON.stringify({ type: 'end_session' }));
        }
    }, [socket, isConnected]);

    useEffect(() => {
        if (clientId && initData) {
            return connect();
        }
    }, [clientId, initData, connect]);

    return { isConnected, messages, sendMessage, sendEndSession, isStreamingResponse, feedback, interviewEnded };
};
