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
    duration?: number;
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

    // Track whether we've already sent init for this connection
    const initSentRef = useRef(false);

    const connect = useCallback(() => {
        if (!initDataRef.current) return;

        const token = localStorage.getItem('access_token');
        const wsUrl = token
            ? `${WEBSOCKET_URL}/${clientId}?token=${encodeURIComponent(token)}`
            : `${WEBSOCKET_URL}/${clientId}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            // Don't send init immediately — wait to see if server sends "restored"
            // We use a small timeout: if no "restored" arrives within 500ms, send init
            initSentRef.current = false;
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

            if (data.type === 'restored') {
                // ── Session restored from Redis cache ──
                console.log('Session restored from cache:', data.messages?.length, 'messages');
                initSentRef.current = true; // Skip sending init
                if (data.messages && Array.isArray(data.messages)) {
                    const restoredMessages: ChatMessage[] = data.messages.map((msg: any) => ({
                        role: msg.role as 'user' | 'model',
                        content: msg.content,
                    }));
                    setMessages(restoredMessages);
                }
            } else if (data.type === 'stream_start') {
                setStreamingInfo(true);
            } else if (data.type === 'stream_end') {
                setStreamingInfo(false);
            } else if (data.type === 'text') {
                // If this is the first text chunk and we haven't sent init,
                // it means the server had no cached session and is waiting for init.
                // But actually if we get text, the server already processed something.
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
                // If the server sends info and we haven't sent init yet, send it now
                if (!initSentRef.current && data.content === 'Context initialized.') {
                    initSentRef.current = true;
                }
            } else if (data.type === 'end_interview') {
                console.log("Interview Ended", data.feedback);
                feedbackRef.current = data.feedback;
                setFeedback(data.feedback);
                setInterviewEnded(true);
            }
        };

        // After connection opens, wait briefly then send init if server hasn't restored
        const initTimer = setTimeout(() => {
            if (!initSentRef.current && ws.readyState === WebSocket.OPEN && initDataRef.current) {
                initSentRef.current = true;
                ws.send(JSON.stringify({
                    type: "init",
                    resume_text: initDataRef.current.resumeText,
                    jd_text: initDataRef.current.jdText,
                    interview_type: initDataRef.current.interviewType || "technical",
                    role: initDataRef.current.role || "",
                    company: initDataRef.current.company || "",
                    duration: initDataRef.current.duration || 0,
                }));
                console.log('[WS] Sent init payload (no cached session found)');
            }
        }, 800);

        setSocket(ws);

        return () => {
            clearTimeout(initTimer);
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
