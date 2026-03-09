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
    const [isEnding, setIsEnding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const feedbackRef = useRef<any>(null);

    const isStreamingResponseRef = useRef(false);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const setStreamingInfo = (val: boolean) => {
        setIsStreamingResponse(val);
        isStreamingResponseRef.current = val;
    };

    const initDataRef = useRef(initData);
    useEffect(() => {
        initDataRef.current = initData;
    }, [initData]);

    const initSentRef = useRef(false);

    const connect = useCallback(() => {
        if (!initDataRef.current || interviewEnded) return;

        const token = localStorage.getItem('access_token');
        const wsUrl = token
            ? `${WEBSOCKET_URL}/${clientId}?token=${encodeURIComponent(token)}`
            : `${WEBSOCKET_URL}/${clientId}`;

        console.log(`[WS] Connecting to ${wsUrl}...`);
        const ws = new WebSocket(wsUrl);

        let heartbeatInterval: any;

        ws.onopen = () => {
            console.log('[WS] Connected');
            setIsConnected(true);
            setError(null);
            reconnectAttempts.current = 0;
            initSentRef.current = false;

            // Start heartbeat
            heartbeatInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping' }));
                }
            }, 15000);
        };

        ws.onclose = (event) => {
            console.log(`[WS] Disconnected (Code: ${event.code})`);
            clearInterval(heartbeatInterval);

            if (!feedbackRef.current && !interviewEnded) {
                setIsConnected(false);
                // Attempt reconnect if not a clean close and not at limit
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
                    console.log(`[WS] Reconnecting in ${delay}ms... (Attempt ${reconnectAttempts.current + 1})`);
                    setTimeout(() => {
                        reconnectAttempts.current += 1;
                        connect();
                    }, delay);
                } else {
                    setError('Connection lost. Please refresh the page to try again.');
                }
            }
            setStreamingInfo(false);
        };

        ws.onerror = (err) => {
            console.error('[WS] Error:', err);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'restored') {
                    console.log('[WS] Session restored from cache');
                    initSentRef.current = true;
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
                    const isStreaming = isStreamingResponseRef.current;
                    setMessages(prev => {
                        const lastMsg = prev[prev.length - 1];
                        if (isStreaming && lastMsg && lastMsg.role === 'model') {
                            const newContent = lastMsg.content + data.content;
                            return [...prev.slice(0, -1), { ...lastMsg, content: newContent }];
                        } else {
                            return [...prev, { role: 'model', content: data.content }];
                        }
                    });
                } else if (data.type === 'info') {
                    console.log("[WS] Info:", data.content);
                    if (!initSentRef.current && data.content === 'Context initialized.') {
                        initSentRef.current = true;
                    }
                } else if (data.type === 'end_interview') {
                    console.log("[WS] Interview Ended");
                    feedbackRef.current = data.feedback;
                    setFeedback(data.feedback);
                    setInterviewEnded(true);
                } else if (data.type === 'error') {
                    console.error("[WS] Server Error:", data.content);
                    setError(data.content);
                } else if (data.type === 'pong') {
                    // Heartbeat response
                }
            } catch (e) {
                console.error('[WS] Failed to parse message:', e);
            }
        };

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
                console.log('[WS] Sent init payload');
            }
        }, 1000); // 1s buffer for "restored" signal

        setSocket(ws);

        return () => {
            clearTimeout(initTimer);
            clearInterval(heartbeatInterval);
            ws.close();
        };
    }, [clientId, interviewEnded]);

    const sendMessage = useCallback((text: string) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            setMessages(prev => [...prev, { role: 'user', content: text }]);
            socket.send(JSON.stringify({
                type: 'message',
                content: text
            }));
        } else {
            setError('Socket is not connected. Attempting to restore...');
        }
    }, [socket]);

    const sendEndSession = useCallback(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            setIsEnding(true);
            socket.send(JSON.stringify({ type: 'end_session' }));
        }
    }, [socket]);

    useEffect(() => {
        if (clientId && initData && !interviewEnded) {
            return connect();
        }
    }, [clientId, initData, connect, interviewEnded]);

    return { isConnected, messages, sendMessage, sendEndSession, isStreamingResponse, feedback, interviewEnded, isEnding, error };
};
