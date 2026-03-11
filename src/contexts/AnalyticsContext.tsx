import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AnalyticsApi } from "@/api/analytics";
import { analyticsWebSocket } from "@/lib/websocket";
import type {
  TrackVisitorDto,
  TrackPageViewDto,
  StartSessionDto,
  HeartbeatDto,
} from "@/types/analytics";

interface AnalyticsContextType {
  visitorId: string | null;
  sessionId: string | null;
  trackPageView: (path: string, title?: string) => Promise<void>;
  trackEvent: (eventName: string, properties?: Record<string, any>) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
  userId?: string;
  isAdmin?: boolean;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  userId,
  isAdmin = false
}) => {
  const location = useLocation();
  const [visitorId, setVisitorId] = useState<string | null>(localStorage.getItem('analytics_visitor_id'));
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('analytics_session_id'));
  const isInitialized = useRef(false);

  const getDeviceType = (): string => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return "mobile";
    return "desktop";
  };

  const getUserCountry = async (): Promise<string> => {
    try {
      const cached = localStorage.getItem('analytics_user_country');
      if (cached) return cached;

      // We use ipapi.co to cheaply resolve the client IP to a country name
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.country_name) {
          localStorage.setItem('analytics_user_country', data.country_name);
          return data.country_name;
        }
      }
    } catch (e) {
      console.error("Failed to fetch country from IP:", e);
    }
    return "Unknown";
  };

  const initializeAnalytics = useCallback(async () => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      let vId = localStorage.getItem('analytics_visitor_id');
      if (!vId) {
        vId = `v_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('analytics_visitor_id', vId);
      }
      setVisitorId(vId);

      let sId = localStorage.getItem('analytics_session_id');
      if (!sId) {
        sId = `s_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('analytics_session_id', sId);
      }
      setSessionId(sId);

      const country = await getUserCountry();

      // 1. Track Visitor
      const visitorDto: TrackVisitorDto = {
        visitorId: vId,
        userId,
        userAgent: navigator.userAgent,
        country,
        device: getDeviceType(),
        isAdmin
      };
      await AnalyticsApi.trackVisitor(visitorDto);

      // 2. Start Session
      const sessionDto: StartSessionDto = {
        sessionId: sId,
        visitorId: vId,
        userId,
        landingPage: window.location.pathname,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
        country,
        device: getDeviceType(),
      };
      await AnalyticsApi.startSession(sessionDto);

      // 3. Connect WebSocket
      analyticsWebSocket.connect({
        visitorId: vId,
        sessionId: sId,
        userId,
        userAgent: navigator.userAgent,
        country,
        device: getDeviceType(),
        isAdmin
      });

    } catch (error) {
      console.error("📊 Analytics: Initialization failed", error);
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    initializeAnalytics();
  }, [initializeAnalytics]);

  // Ensures user data is reliably attached to active analytics session, covering HMR and Mid-session authentications
  useEffect(() => {
    if (visitorId && sessionId && userId) {
      getUserCountry().then((country) => {
        const visitorDto = {
          visitorId,
          userId,
          userAgent: navigator.userAgent,
          country,
          device: getDeviceType(),
          isAdmin
        };
        AnalyticsApi.trackVisitor(visitorDto).catch(console.error);

        // Attach user to the current session dynamically
        const sessionDto = {
          sessionId,
          visitorId,
          userId,
          landingPage: window.location.pathname,
          userAgent: navigator.userAgent,
          country,
          device: getDeviceType(),
        };
        AnalyticsApi.startSession(sessionDto).catch(console.error);
      });
    }
  }, [userId, isAdmin, visitorId, sessionId]);

  const trackPageView = useCallback(async (path: string, title?: string) => {
    if (!visitorId || !sessionId) return;

    const pageViewDto: TrackPageViewDto = {
      sessionId,
      visitorId,
      userId,
      path,
      title: title || document.title,
    };

    try {
      // Track via HTTP
      await AnalyticsApi.trackPageView(pageViewDto);
      // Track via WebSocket
      analyticsWebSocket.emit('trackPageView', pageViewDto);
    } catch (error) {
      console.error("📊 Analytics: Page view tracking failed", error);
    }
  }, [visitorId, sessionId, userId]);

  const trackEvent = useCallback(async (eventName: string, properties?: Record<string, any>) => {
    if (!visitorId || !sessionId) return;

    analyticsWebSocket.emit('trackEvent', {
      eventName,
      properties,
      sessionId,
      visitorId,
      timestamp: new Date().toISOString()
    });
  }, [visitorId, sessionId]);

  // Handle automatic page tracking on route change
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  // Heartbeat every 45 seconds
  useEffect(() => {
    if (!visitorId || !sessionId) return;

    const interval = setInterval(() => {
      const heartbeatDto: HeartbeatDto = {
        sessionId,
        visitorId,
        path: window.location.pathname
      };
      AnalyticsApi.heartbeat(heartbeatDto).catch(() => { });
      analyticsWebSocket.emit('heartbeat', heartbeatDto);
    }, 45000);

    return () => clearInterval(interval);
  }, [visitorId, sessionId]);

  return (
    <AnalyticsContext.Provider value={{ visitorId, sessionId, trackPageView, trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};