import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AnalyticsApi } from "@/api/analytics";
import { analyticsWebSocket } from "@/lib/websocket";
import type {
  AnalyticsStatsDto,
  RealTimeStatsDto,
  TopPagesDto,
  TimeSeriesDataDto,
  AnalyticsDashboardDto,
  TrackVisitorDto,
  TrackPageViewDto,
  StartSessionDto,
} from "@/types/analytics";

interface AnalyticsContextType {
  // Current session data
  visitorId: string | null;
  sessionId: string | null;
  
  // Analytics data
  stats: AnalyticsStatsDto | null;
  realTimeStats: RealTimeStatsDto | null;
  topPages: TopPagesDto[];
  timeSeries: TimeSeriesDataDto[];
  dashboard: AnalyticsDashboardDto | null;
  
  // Page tracking data
  pageViewCount: number;
  
  // Loading states
  isLoading: boolean;
  isTracking: boolean;
  
  // Error state
  error: string | null;
  
  // WebSocket connection management
  connect: () => Promise<void>;
  heartbeat: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Tracking methods
  initializeSession: () => Promise<void>;
  trackPageView: (path: string, title?: string, additionalData?: Partial<TrackPageViewDto>) => Promise<void>;
  updateTimeSpent: (path: string, timeSpent: number) => Promise<void>;
  endSession: () => Promise<void>;
  
  // Session management methods
  getSessionById: (sessionId: string) => Promise<void>;
  getSessions: (limit?: number, offset?: number) => Promise<void>;
  getSessionPageViews: (sessionId: string) => Promise<void>;
  
  // Data fetching methods
  fetchStats: (startDate: string, endDate: string) => Promise<void>;
  fetchRealTimeStats: () => Promise<void>;
  fetchTopPages: (startDate: string, endDate: string, limit?: number) => Promise<void>;
  fetchTimeSeries: (startDate: string, endDate: string, granularity: 'hour' | 'day') => Promise<void>;
  fetchDashboard: (startDate: string, endDate: string) => Promise<void>;
  
  // Visitor management methods
  getUserVisitors: (limit?: number, offset?: number) => Promise<void>;
  getUserVisitorStats: () => Promise<void>;
  
  // Utility methods
  healthCheck: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  autoTrack?: boolean;
  userId?: string;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children, 
  autoTrack = true,
  userId 
}) => {
  const location = useLocation();
  
  // Session state
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Analytics data state
  const [stats, setStats] = useState<AnalyticsStatsDto | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStatsDto | null>(null);
  const [topPages, setTopPages] = useState<TopPagesDto[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesDataDto[]>([]);
  const [dashboard, setDashboard] = useState<AnalyticsDashboardDto | null>(null);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [apiFailureCount, setApiFailureCount] = useState(0);
  const [analyticsDisabled, setAnalyticsDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Page tracking state
  const [currentPath, setCurrentPath] = useState<string>('');
  const [pageStartTime, setPageStartTime] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [pageViewCount, setPageViewCount] = useState<number>(0);

  // Helper functions
  const generateVisitorId = (): string => {
    return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Circuit breaker for analytics API failures (more resilient)
  const handleApiFailure = useCallback((error: any) => {
    setApiFailureCount(prev => {
      const newCount = prev + 1;
      console.log(`Analytics: API failure #${newCount}:`, error?.message || error);
      
      // Only disable analytics after 15 consecutive failures (increased threshold)
      // and only if errors are not just network/connection issues
      if (newCount >= 15) {
        const errorMessage = error?.message || error?.toString() || '';
        // Don't disable for common network errors that might be temporary
        if (!errorMessage.includes('ERR_CONNECTION_REFUSED') && 
            !errorMessage.includes('ERR_NETWORK') &&
            !errorMessage.includes('Network Error')) {
          setAnalyticsDisabled(true);
          console.warn('🚨 Analytics DISABLED due to repeated API failures after 15 attempts');
          console.warn('🚨 Last error:', error);
        } else {
          console.warn('⚠️ Analytics: Network errors detected, but keeping analytics enabled');
        }
      }
      return newCount;
    });
    console.warn('Analytics API failure (non-blocking):', error);
  }, []);

  // Reset failure count on successful API call and periodic recovery
  const handleApiSuccess = useCallback(() => {
    if (apiFailureCount > 0) {
      setApiFailureCount(0);
      if (analyticsDisabled) {
        setAnalyticsDisabled(false);
        console.log('Analytics re-enabled after successful API call');
      }
    }
  }, [apiFailureCount, analyticsDisabled]);

  // Periodic recovery attempt for disabled analytics
  useEffect(() => {
    if (analyticsDisabled) {
      const recoveryInterval = setInterval(() => {
        console.log('Analytics: Attempting recovery...');
        setApiFailureCount(prev => Math.max(0, prev - 5)); // Gradually reduce failure count
        if (apiFailureCount <= 5) {
          setAnalyticsDisabled(false);
          console.log('Analytics: Recovered from disabled state');
        }
      }, 60000); // Try recovery every minute
      
      return () => clearInterval(recoveryInterval);
    }
  }, [analyticsDisabled, apiFailureCount]);

  // Periodic heartbeat to keep session alive
  useEffect(() => {
    if (sessionId && sessionInitialized && !analyticsDisabled) {
      const heartbeatInterval = setInterval(() => {
        console.log('💓 Analytics: Sending heartbeat...');
        
        // Send WebSocket heartbeat
        if (analyticsWebSocket.isConnected()) {
          analyticsWebSocket.emit('heartbeat', {});
          console.log('💓 Analytics: WebSocket heartbeat sent');
        }
        
        // Also call API heartbeat if sessionId exists
        if (sessionId) {
          AnalyticsApi.heartbeat({ sessionId }).then(() => {
            console.log('✅ Analytics: API heartbeat sent successfully');
            localStorage.setItem('analytics_last_activity', Date.now().toString());
            handleApiSuccess();
          }).catch(err => {
            console.warn('Analytics: API heartbeat failed:', err);
            handleApiFailure(err);
          });
        }
      }, 30000); // Send heartbeat every 30 seconds
      
      return () => clearInterval(heartbeatInterval);
    }
  }, [sessionId, sessionInitialized, analyticsDisabled, handleApiSuccess, handleApiFailure]);

  // Get device type as string
  const getDeviceType = (): string => {
    if (typeof window === 'undefined') return 'desktop';
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\\sce|palm|smartphone|iemobile/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  };

  // Get visitor data
  const getVisitorData = (): Partial<TrackVisitorDto> => {
    if (typeof window === 'undefined') return {};
    
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      referrer: document.referrer || undefined,
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      userId: userId || undefined,
    };
  };

  // Initialize analytics session (respects existing sessions)
  const initializeSession = useCallback(async () => {
    // Allow re-initialization if needed
    if (analyticsDisabled || isInitializing) {
      console.log('Analytics: Initialization blocked -', analyticsDisabled ? 'disabled' : 'already initializing');
      return;
    }

    try {
      setIsInitializing(true);
      setIsTracking(true);
      setError(null);

      console.log('Analytics: Starting session initialization...');

      // Check for existing session first
      let newVisitorId = localStorage.getItem('analytics_visitor_id');
      let newSessionId = localStorage.getItem('analytics_session_id');
      
      // Only generate new IDs if none exist
      if (!newVisitorId) {
        newVisitorId = generateVisitorId();
        localStorage.setItem('analytics_visitor_id', newVisitorId);
        console.log('Analytics: Generated new visitor ID:', newVisitorId);
      } else {
        console.log('Analytics: Using existing visitor ID:', newVisitorId);
      }
      
      if (!newSessionId) {
        newSessionId = generateSessionId();
        localStorage.setItem('analytics_session_id', newSessionId);
        localStorage.setItem('analytics_session_start', Date.now().toString());
        // Reset page count for new session only
        localStorage.removeItem('analytics_page_count');
        setPageViewCount(0);
        console.log('Analytics: Generated new session ID:', newSessionId);
      } else {
        // Restore existing page count
        const existingPageCount = localStorage.getItem('analytics_page_count');
        if (existingPageCount) {
          setPageViewCount(parseInt(existingPageCount));
          console.log('Analytics: Restored existing session with page count:', existingPageCount);
        } else {
          console.log('Analytics: Using existing session ID:', newSessionId);
        }
      }
      
      localStorage.setItem('analytics_last_activity', Date.now().toString());

      setVisitorId(newVisitorId);
      setSessionId(newSessionId);
      
      const startTime = localStorage.getItem('analytics_session_start');
      setSessionStartTime(startTime ? parseInt(startTime) : Date.now());
      setSessionInitialized(true);

      console.log('Analytics: Session state updated successfully');

      // Track visitor and start session (restored API calls)
      const additionalData = getVisitorData();
      
      const visitorData: TrackVisitorDto = {
        visitorId: newVisitorId,
        sessionId: newSessionId,
        device: getDeviceType(),
        isReturning: false, // Always start as new to ensure fresh start
        ...additionalData,
      };

      // Only include fields that StartSessionDto expects
      const sessionData: StartSessionDto = {
        visitorId: newVisitorId,
        sessionId: newSessionId,
        entryPage: window.location.pathname,
        userId: userId,
        userAgent: additionalData.userAgent,
        referrer: additionalData.referrer,
        utmSource: additionalData.utmSource,
        utmMedium: additionalData.utmMedium,
        utmCampaign: additionalData.utmCampaign,
      };

      // Make API calls (don't block on these)
      console.log('🌐 Analytics: Making initialization API calls...');
      console.log('📤 Analytics: trackVisitor API call:', {
        url: '/api/analytics/visitors',
        method: 'POST',
        data: visitorData
      });
      console.log('📤 Analytics: startSession API call:', {
        url: '/api/analytics/sessions/start', 
        method: 'POST',
        data: sessionData
      });
      
      Promise.all([
        AnalyticsApi.trackVisitor(visitorData).then(response => {
          console.log('📥 Analytics: trackVisitor API response:', response);
          return response;
        }),
        AnalyticsApi.startSession(sessionData).then(response => {
          console.log('📥 Analytics: startSession API response:', response);
          return response;
        }),
        // Also establish WebSocket connection
        AnalyticsApi.connect({
          visitorId: newVisitorId,
          sessionId: newSessionId,
          userId: userId,
          country: visitorData.country,
          device: visitorData.device
        }).then(response => {
          console.log('📥 Analytics: connect API response:', response);
          return response;
        }).catch(err => {
          console.warn('⚠️ Analytics: WebSocket connect failed (non-blocking):', err);
          return null; // Don't fail entire initialization
        }),
        // Connect to WebSocket
        new Promise<void>((resolve) => {
          try {
            analyticsWebSocket.connect(newVisitorId, newSessionId, userId);
            console.log('🔌 Analytics: WebSocket connection initiated');
            resolve();
          } catch (err) {
            console.warn('⚠️ Analytics: WebSocket connection failed (non-blocking):', err);
            resolve(); // Don't fail entire initialization
          }
        })
      ]).then((responses) => {
        handleApiSuccess();
        console.log('✅ Analytics: Session initialized successfully with API calls');
        console.log('✅ Analytics: All initialization API responses:', responses.filter(Boolean));
      }).catch((err: any) => {
        console.error('❌ Analytics: Session initialization failed:', err);
        console.error('❌ Analytics: Error details:', {
          message: err?.message || 'Unknown error',
          status: err?.status || 'No status',
          url: err?.config?.url || 'No URL',
          method: err?.config?.method || 'No method'
        });
        handleApiFailure(err);
      });

    } catch (err) {
      console.warn('Analytics: Initialization error:', err);
      handleApiFailure(err);
    } finally {
      setIsTracking(false);
      setIsInitializing(false);
    }
  }, [userId, analyticsDisabled, isInitializing, handleApiFailure, handleApiSuccess]);

  // Track page view (fixed for proper counting and WebSocket compatibility)
  const trackPageView = useCallback(async (
    path: string, 
    title?: string, 
    additionalData?: Partial<TrackPageViewDto>
  ) => {
    // Basic guards only
    if (!visitorId || !sessionId || analyticsDisabled) {
      console.log('Analytics: Skipping page view - not initialized');
      return;
    }
    
    console.log(`Analytics: Tracking page view for ${path}`);
    
    try {
      // Always update time spent on previous page first
      if (currentPath && pageStartTime && currentPath !== path) {
        const timeSpentMs = Date.now() - pageStartTime;
        const timeSpentSeconds = Math.floor(timeSpentMs / 1000);
        if (timeSpentSeconds > 0) {
          console.log(`Analytics: Time spent on ${currentPath}: ${timeSpentSeconds} seconds`);
          // Call updateTimeSpent but don't wait for it
          updateTimeSpent(currentPath, timeSpentSeconds);
        }
      }

      // Update state immediately (always increment page count for new paths)
      setCurrentPath(path);
      setPageStartTime(Date.now());
      
      // Always increment page count when tracking a new page
      setPageViewCount(prev => {
        const newCount = prev + 1;
        localStorage.setItem('analytics_page_count', newCount.toString());
        console.log(`Analytics: Page count incremented to: ${newCount}`);
        return newCount;
      });
      
      localStorage.setItem('analytics_last_activity', Date.now().toString());
      localStorage.setItem('analytics_last_tracked_path', path);

        // Make API call to track page view
        try {
          const pageViewData: TrackPageViewDto = {
            visitorId,
            sessionId,
            url: window.location.href,
            path,
            title: title || document.title,
            device: getDeviceType() as any,
            previousPage: currentPath || undefined,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                    navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                    navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown',
            operatingSystem: navigator.platform,
            ...getVisitorData(),
            ...additionalData,
          };

          // Emit WebSocket event for page view (real-time tracking)
          console.log('🔌 Analytics: Emitting WebSocket trackPageView event');
          console.log('🔌 Analytics: WebSocket connected status:', analyticsWebSocket.isConnected());
          
          if (analyticsWebSocket.isConnected()) {
            analyticsWebSocket.emit('trackPageView', pageViewData);
            console.log('✅ Analytics: WebSocket trackPageView event emitted successfully');
          } else {
            console.warn('⚠️ Analytics: WebSocket not connected, attempting to reconnect...');
            analyticsWebSocket.connect(visitorId, sessionId, userId);
            // Try to emit after connection attempt
            setTimeout(() => {
              if (analyticsWebSocket.isConnected()) {
                analyticsWebSocket.emit('trackPageView', pageViewData);
                console.log('✅ Analytics: WebSocket trackPageView event emitted after reconnection');
              }
            }, 1000);
          }

          // Make API call (don't block)
          console.log('📤 Analytics: trackPageView API call:', {
            url: '/api/analytics/pageviews',
            method: 'POST',
            data: pageViewData
          });
          
          AnalyticsApi.trackPageView(pageViewData)
            .then((response) => {
              console.log('📥 Analytics: trackPageView API response:', response);
              console.log(`✅ Analytics: Successfully sent page view API for ${path}`);
              handleApiSuccess();
            })
            .catch((err: any) => {
              console.error('❌ Analytics: trackPageView API failed:', err);
              console.error('❌ Analytics: Page view error details:', {
                message: err?.message || 'Unknown error',
                status: err?.status || 'No status',
                url: err?.config?.url || 'No URL',
                method: err?.config?.method || 'No method',
                path: path
              });
              handleApiFailure(err);
            });
        } catch (apiErr) {
          console.warn('Analytics: Error making page view API call:', apiErr);
          handleApiFailure(apiErr);
        }    } catch (err) {
      console.warn('Analytics: Error in trackPageView:', err);
    }
  }, [visitorId, sessionId, currentPath, pageStartTime, analyticsDisabled]);

  // Update time spent on page (with API calls restored)
  const updateTimeSpent = useCallback(async (path: string, timeSpent: number) => {
    if (!sessionId || timeSpent < 1 || analyticsDisabled) return;

    try {
      // Ensure proper time calculation (timeSpent should be in seconds)
      const timeInSeconds = Math.floor(timeSpent);
      
      console.log(`Analytics: Updating time spent on ${path}: ${timeInSeconds} seconds`);
      
      // Emit WebSocket event for time spent (real-time tracking)
      console.log('🔌 Analytics: Emitting WebSocket updateTimeSpent event');
      console.log('🔌 Analytics: WebSocket connected status:', analyticsWebSocket.isConnected());
      
      if (analyticsWebSocket.isConnected()) {
        analyticsWebSocket.emit('updateTimeSpent', {
          sessionId,
          path,
          timeSpent: timeInSeconds
        });
        console.log('✅ Analytics: WebSocket updateTimeSpent event emitted successfully');
      } else {
        console.warn('⚠️ Analytics: WebSocket not connected for time tracking');
        // Try to reconnect and emit
        if (visitorId && sessionId) {
          analyticsWebSocket.connect(visitorId, sessionId, userId);
          setTimeout(() => {
            if (analyticsWebSocket.isConnected()) {
              analyticsWebSocket.emit('updateTimeSpent', {
                sessionId,
                path,
                timeSpent: timeInSeconds
              });
              console.log('✅ Analytics: WebSocket updateTimeSpent event emitted after reconnection');
            }
          }, 1000);
        }
      }
      
      // Make API call for time tracking
      const timeApiUrl = `/api/analytics/pageviews/${sessionId}/${encodeURIComponent(path)}/time-spent`;
      console.log('📤 Analytics: updateTimeSpent API call:', {
        url: timeApiUrl,
        method: 'POST',
        sessionId: sessionId,
        path: path,
        timeSpent: timeInSeconds
      });
      
      AnalyticsApi.updateTimeSpent(sessionId, path, timeInSeconds)
        .then((response) => {
          console.log('📥 Analytics: updateTimeSpent API response:', response);
          console.log(`✅ Analytics: Successfully updated time spent on ${path}: ${timeInSeconds}s`);
          handleApiSuccess();
        })
        .catch((err: any) => {
          console.error('❌ Analytics: updateTimeSpent API failed:', err);
          console.error('❌ Analytics: Time spent error details:', {
            message: err?.message || 'Unknown error',
            status: err?.status || 'No status',
            url: err?.config?.url || 'No URL',
            method: err?.config?.method || 'No method',
            sessionId: sessionId,
            path: path,
            timeSpent: timeInSeconds
          });
          handleApiFailure(err);
        });
    } catch (err) {
      console.warn('Analytics: Error in updateTimeSpent:', err);
      handleApiFailure(err);
    }
  }, [sessionId, analyticsDisabled, handleApiFailure, handleApiSuccess]);

  // End session (with API calls restored)
  const endSession = useCallback(async () => {
    if (!sessionId || analyticsDisabled) {
      console.log('Analytics: Session end blocked -', !sessionId ? 'no session ID' : 'analytics disabled');
      return;
    }

    console.log('Analytics: Ending session:', sessionId);

    try {
      const startTime = sessionStartTime || parseInt(localStorage.getItem('analytics_session_start') || '0');
      const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
      
      const endData = {
        sessionId,
        exitPage: window.location.pathname,
        duration,
        pageViews: pageViewCount || 1,
      };

      console.log('Analytics: Sending session end data:', endData);

      // Emit WebSocket event for session end (real-time tracking)
      console.log('🔌 Analytics: Emitting WebSocket endSession event');
      analyticsWebSocket.emit('endSession', endData);

      console.log('📤 Analytics: endSession API call:', {
        url: '/api/analytics/sessions/end',
        method: 'POST',
        data: endData
      });

      // Make API calls to end session and disconnect WebSocket
      Promise.all([
        AnalyticsApi.endSession(endData).then((response) => {
          console.log('📥 Analytics: endSession API response:', response);
          return response;
        }),
        AnalyticsApi.disconnect({
          sessionId,
          exitPage: window.location.pathname
        }).then((response) => {
          console.log('📥 Analytics: disconnect API response:', response);
          return response;
        }).catch(err => {
          console.warn('⚠️ Analytics: WebSocket disconnect failed (non-blocking):', err);
          return null; // Don't fail entire session end
        })
      ]).then((responses) => {
        console.log('✅ Analytics: Session ended successfully');
        console.log('✅ Analytics: Session end responses:', responses.filter(Boolean));
        handleApiSuccess();
      }).catch((err: any) => {
        console.error('❌ Analytics: endSession API failed:', err);
        console.error('❌ Analytics: Session end error details:', {
          message: err?.message || 'Unknown error',
          status: err?.status || 'No status',
          url: err?.config?.url || 'No URL',
          method: err?.config?.method || 'No method',
          sessionId: sessionId
        });
        handleApiFailure(err);
      });
        
      // Clean up session data
      localStorage.removeItem('analytics_session_id');
      localStorage.removeItem('analytics_session_start');
      setSessionInitialized(false);
      setPageViewCount(0);
      
      console.log('Analytics: Session data cleaned up');
    } catch (err) {
      console.error('Analytics: Error ending session:', err);
      handleApiFailure(err);
    }
  }, [sessionId, sessionStartTime, pageViewCount, analyticsDisabled, handleApiFailure, handleApiSuccess]);

  // Data fetching methods
  const fetchStats = useCallback(async (startDate: string, endDate: string) => {
    if (analyticsDisabled) return;
    
    setIsLoading(true);
    try {
      const data = await AnalyticsApi.getStats(startDate, endDate);
      if (data.success && data.data) {
        setStats(data.data);
        handleApiSuccess();
      }
    } catch (err) {
      handleApiFailure(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsDisabled, handleApiFailure, handleApiSuccess]);

  const fetchRealTimeStats = useCallback(async () => {
    if (analyticsDisabled) return;
    
    try {
      // Fetch real-time stats from API
      console.log('📤 Analytics: fetchRealTimeStats API call:', {
        url: '/api/analytics/realtime',
        method: 'GET'
      });
      
      const data = await AnalyticsApi.getRealTimeStats();
      
      console.log('📥 Analytics: getRealTimeStats API response:', data);
      
      if (data.success && data.data) {
        setRealTimeStats(data.data);
        handleApiSuccess();
        console.log('✅ Analytics: Real-time stats fetched successfully');
        console.log('📊 Analytics: Real-time stats data:', data.data);
      } else {
        console.warn('⚠️ Analytics: Real-time stats API returned no data');
      }
    } catch (err: any) {
      console.error('❌ Analytics: getRealTimeStats API failed:', err);
      console.error('❌ Analytics: Real-time stats error details:', {
        message: err?.message || 'Unknown error',
        status: err?.status || 'No status',
        url: err?.config?.url || 'No URL',
        method: err?.config?.method || 'No method'
      });
      handleApiFailure(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch real-time stats');
    }
  }, [analyticsDisabled, handleApiFailure, handleApiSuccess]);

  const fetchTopPages = useCallback(async (startDate: string, endDate: string, limit?: number) => {
    if (analyticsDisabled) return;
    
    setIsLoading(true);
    try {
      const data = await AnalyticsApi.getTopPages(startDate, endDate, limit);
      if (data.success && data.data) {
        setTopPages(data.data);
        handleApiSuccess();
      }
    } catch (err) {
      handleApiFailure(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch top pages');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsDisabled, handleApiFailure, handleApiSuccess]);

  const fetchTimeSeries = useCallback(async (
    startDate: string, 
    endDate: string, 
    granularity: 'hour' | 'day'
  ) => {
    if (analyticsDisabled) return;
    
    setIsLoading(true);
    try {
      const data = await AnalyticsApi.getTimeSeriesData(startDate, endDate, granularity);
      if (data.success && data.data) {
        setTimeSeries(data.data);
        handleApiSuccess();
      }
    } catch (err) {
      handleApiFailure(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch time series data');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsDisabled, handleApiFailure, handleApiSuccess]);

  const fetchDashboard = useCallback(async (startDate: string, endDate: string) => {
    if (analyticsDisabled) return;
    
    setIsLoading(true);
    try {
      const data = await AnalyticsApi.getDashboard(startDate, endDate);
      if (data.success && data.data) {
        setDashboard(data.data);
        handleApiSuccess();
      }
    } catch (err) {
      handleApiFailure(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsDisabled, handleApiFailure, handleApiSuccess]);

  // ===== WebSocket Connection Management =====
  
  const connect = useCallback(async () => {
    if (!visitorId || !sessionId || analyticsDisabled) {
      console.log('Analytics: Connect blocked - not initialized');
      return;
    }

    try {
      // Connect via WebSocket
      analyticsWebSocket.connect(visitorId, sessionId, userId);
      console.log('🔌 Analytics: WebSocket connection initiated');

      // Also make HTTP API call for connect
      const connectData = {
        visitorId,
        sessionId,
        userId: userId,
        country: getVisitorData().country,
        device: getDeviceType(),
      };

      console.log('📤 Analytics: connect API call:', {
        url: '/api/analytics/connect',
        method: 'POST',
        data: connectData
      });

      const response = await AnalyticsApi.connect(connectData);
      
      console.log('📥 Analytics: connect API response:', response);
      
      if (response.success) {
        handleApiSuccess();
        console.log('✅ Analytics: Successfully connected to WebSocket and API');
      }
    } catch (err: any) {
      console.error('❌ Analytics: connect failed:', err);
      console.error('❌ Analytics: Connect error details:', {
        message: err?.message || 'Unknown error',
        status: err?.status || 'No status',
        url: err?.config?.url || 'No URL'
      });
      handleApiFailure(err);
    }
  }, [visitorId, sessionId, userId, analyticsDisabled, handleApiFailure, handleApiSuccess]);

  const heartbeat = useCallback(async () => {
    if (!sessionId || analyticsDisabled) {
      console.log('Analytics: Heartbeat blocked - no session or disabled');
      return;
    }

    try {
      // Send WebSocket heartbeat
      if (analyticsWebSocket.isConnected()) {
        analyticsWebSocket.emit('heartbeat', {});
        console.log('💓 Analytics: WebSocket heartbeat sent');
      }

      // Also send HTTP API heartbeat
      const heartbeatData = { sessionId };

      console.log('📤 Analytics: heartbeat API call:', {
        url: '/api/analytics/heartbeat',
        method: 'POST',
        data: heartbeatData
      });

      const response = await AnalyticsApi.heartbeat(heartbeatData);
      
      console.log('📥 Analytics: heartbeat API response:', response);
      
      if (response.success) {
        handleApiSuccess();
        console.log('✅ Analytics: Heartbeat sent successfully (WebSocket + API)');
        localStorage.setItem('analytics_last_activity', Date.now().toString());
      }
    } catch (err: any) {
      console.error('❌ Analytics: heartbeat failed:', err);
      handleApiFailure(err);
    }
  }, [sessionId, analyticsDisabled, handleApiFailure, handleApiSuccess]);

  const disconnect = useCallback(async () => {
    if (!sessionId || analyticsDisabled) {
      console.log('Analytics: Disconnect blocked - no session or disabled');
      return;
    }

    try {
      // Disconnect WebSocket
      analyticsWebSocket.disconnect();
      console.log('🔌 Analytics: WebSocket disconnected');

      // Also make HTTP API call for disconnect
      const disconnectData = {
        sessionId,
        exitPage: window.location.pathname,
      };

      console.log('📤 Analytics: disconnect API call:', {
        url: '/api/analytics/disconnect',
        method: 'POST',
        data: disconnectData
      });

      const response = await AnalyticsApi.disconnect(disconnectData);
      
      console.log('📥 Analytics: disconnect API response:', response);
      
      if (response.success) {
        handleApiSuccess();
        console.log('✅ Analytics: Successfully disconnected from WebSocket and API');
      }
    } catch (err: any) {
      console.error('❌ Analytics: disconnect failed:', err);
      handleApiFailure(err);
    }
  }, [sessionId, analyticsDisabled, handleApiFailure, handleApiSuccess]);

  // ===== Session Management Methods =====
  
  const getSessionById = useCallback(async (sessionId: string) => {
    if (analyticsDisabled) return;
    
    setIsLoading(true);
    try {
      console.log('📤 Analytics: getSessionById API call:', {
        url: `/api/analytics/sessions/${sessionId}`,
        method: 'GET',
        sessionId
      });

      const data = await AnalyticsApi.getSessionById(sessionId);
      
      console.log('📥 Analytics: getSessionById API response:', data);
      
      if (data.success && data.data) {
        handleApiSuccess();
        console.log('✅ Analytics: Session data fetched successfully');
        console.log('📊 Analytics: Session data:', data.data);
      }
    } catch (err: any) {
      console.error('❌ Analytics: getSessionById API failed:', err);
      handleApiFailure(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch session');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsDisabled, handleApiFailure, handleApiSuccess]);

  const getSessions = useCallback(async (limit: number = 20, offset: number = 0) => {
    if (analyticsDisabled) return;
    
    setIsLoading(true);
    try {
      console.log('📤 Analytics: getSessions API call:', {
        url: '/api/analytics/sessions',
        method: 'GET',
        params: { limit, offset }
      });

      const data = await AnalyticsApi.getSessions(limit, offset);
      
      console.log('📥 Analytics: getSessions API response:', data);
      
      if (data.success && data.data) {
        handleApiSuccess();
        console.log('✅ Analytics: Sessions list fetched successfully');
        console.log('📊 Analytics: Sessions data:', data.data);
      }
    } catch (err: any) {
      console.error('❌ Analytics: getSessions API failed:', err);
      handleApiFailure(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsDisabled, handleApiFailure, handleApiSuccess]);

  const getSessionPageViews = useCallback(async (sessionId: string) => {
    if (analyticsDisabled) return;
    
    setIsLoading(true);
    try {
      console.log('📤 Analytics: getSessionPageViews API call:', {
        url: `/api/analytics/sessions/${sessionId}/pageviews`,
        method: 'GET',
        sessionId
      });

      const data = await AnalyticsApi.getSessionPageViews(sessionId);
      
      console.log('📥 Analytics: getSessionPageViews API response:', data);
      
      if (data.success && data.data) {
        handleApiSuccess();
        console.log('✅ Analytics: Session page views fetched successfully');
        console.log('📊 Analytics: Page views data:', data.data);
      }
    } catch (err: any) {
      console.error('❌ Analytics: getSessionPageViews API failed:', err);
      handleApiFailure(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch session page views');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsDisabled, handleApiFailure, handleApiSuccess]);

  // ===== Visitor Management Methods =====
  
  const getUserVisitors = useCallback(async (limit: number = 50, offset: number = 0) => {
    if (analyticsDisabled) return;
    
    setIsLoading(true);
    try {
      console.log('📤 Analytics: getUserVisitors API call:', {
        url: '/api/analytics/visitors/me',
        method: 'GET',
        params: { limit, offset }
      });

      const data = await AnalyticsApi.getUserVisitors(limit, offset);
      
      console.log('📥 Analytics: getUserVisitors API response:', data);
      
      if (data.success && data.data) {
        handleApiSuccess();
        console.log('✅ Analytics: User visitors fetched successfully');
        console.log('📊 Analytics: Visitors data:', data.data);
      }
    } catch (err: any) {
      console.error('❌ Analytics: getUserVisitors API failed:', err);
      handleApiFailure(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user visitors');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsDisabled, handleApiFailure, handleApiSuccess]);

  const getUserVisitorStats = useCallback(async () => {
    if (analyticsDisabled) return;
    
    setIsLoading(true);
    try {
      console.log('📤 Analytics: getUserVisitorStats API call:', {
        url: '/api/analytics/visitors/me/stats',
        method: 'GET'
      });

      const data = await AnalyticsApi.getUserVisitorStats();
      
      console.log('📥 Analytics: getUserVisitorStats API response:', data);
      
      if (data.success && data.data) {
        handleApiSuccess();
        console.log('✅ Analytics: User visitor stats fetched successfully');
        console.log('📊 Analytics: Visitor stats data:', data.data);
      }
    } catch (err: any) {
      console.error('❌ Analytics: getUserVisitorStats API failed:', err);
      handleApiFailure(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user visitor stats');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsDisabled, handleApiFailure, handleApiSuccess]);

  // ===== Enhanced Utility Methods =====
  
  const healthCheck = useCallback(async () => {
    try {
      console.log('📤 Analytics: healthCheck API call:', {
        url: '/api/analytics/health',
        method: 'GET'
      });

      const data = await AnalyticsApi.healthCheck();
      
      console.log('📥 Analytics: healthCheck API response:', data);
      
      if (data.success) {
        handleApiSuccess();
        console.log('✅ Analytics: Health check successful');
        console.log('🩺 Analytics: Health status:', data.data);
      }
    } catch (err: any) {
      console.error('❌ Analytics: healthCheck API failed:', err);
      handleApiFailure(err);
      setError(err instanceof Error ? err.message : 'Health check failed');
    }
  }, [handleApiFailure, handleApiSuccess]);

  // Utility methods
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    console.log('🔄 Analytics: Manual reset triggered');
    console.log('🔄 Analytics: Clearing all analytics data and state');
    
    setStats(null);
    setRealTimeStats(null);
    setTopPages([]);
    setTimeSeries([]);
    setDashboard(null);
    setError(null);
    setCurrentPath('');
    setPageViewCount(0);
    
    // Clean up localStorage
    const keysToRemove = [
      'analytics_last_tracked_path',
      'analytics_page_count', 
      'analytics_last_activity',
      'analytics_session_start'
    ];
    
    keysToRemove.forEach(key => {
      const oldValue = localStorage.getItem(key);
      if (oldValue) {
        localStorage.removeItem(key);
        console.log(`🔄 Analytics: Removed ${key}:`, oldValue);
      }
    });
    
    console.log('✅ Analytics: Reset completed - ready for new session');
  }, []);

  // Auto-track page views when path changes (using React Router location)
  useEffect(() => {
    if (!autoTrack || !visitorId || !sessionId || analyticsDisabled) {
      console.log('🚫 Analytics: Auto-tracking disabled -', {
        autoTrack,
        hasVisitorId: !!visitorId,
        hasSessionId: !!sessionId,
        analyticsDisabled,
        currentPath: location.pathname
      });
      return;
    }
    
    const currentPathname = location.pathname;
    
    // Only track if this is a different path than what's currently tracked
    if (currentPathname !== currentPath) {
      console.log(`🔄 Analytics: React Router path change detected: ${currentPath || '(none)'} -> ${currentPathname}`);
      console.log('🔌 Analytics: Will emit WebSocket trackPageView event');
      
      // Track the page view immediately (WebSocket + API)
      trackPageView(currentPathname, document.title);
    }
  }, [location.pathname, autoTrack, visitorId, sessionId, analyticsDisabled, currentPath, trackPageView]);

  // Initialize session on mount with strict persistence check
  useEffect(() => {
    console.log('🚀 Analytics: Component effect triggered, autoTrack:', autoTrack, 'analyticsDisabled:', analyticsDisabled);
    
    if (autoTrack && !analyticsDisabled) {
      // Check for existing session first
      const existingSessionId = localStorage.getItem('analytics_session_id');
      const existingVisitorId = localStorage.getItem('analytics_visitor_id');
      const sessionStartTime = localStorage.getItem('analytics_session_start');
      const lastActivity = localStorage.getItem('analytics_last_activity');
      
      console.log('📊 Analytics: Checking existing session data:', {
        existingSessionId: existingSessionId ? existingSessionId.slice(0, 15) + '...' : 'none',
        existingVisitorId: existingVisitorId ? existingVisitorId.slice(0, 15) + '...' : 'none',
        sessionStartTime,
        lastActivity,
        currentVisitorId: visitorId ? visitorId.slice(0, 15) + '...' : 'none',
        currentSessionId: sessionId ? sessionId.slice(0, 15) + '...' : 'none'
      });
      
      // If we already have these IDs in state, don't reinitialize
      if (visitorId && sessionId && visitorId === existingVisitorId && sessionId === existingSessionId) {
        console.log('✅ Analytics: Session already active, skipping initialization');
        return;
      }
      
      // Check if existing session is still valid (within 24 hours and recent activity)
      const now = Date.now();
      const sessionAge = sessionStartTime ? now - parseInt(sessionStartTime) : 0;
      const lastActivityTime = lastActivity ? parseInt(lastActivity) : 0;
      const timeSinceActivity = now - lastActivityTime;
      
      const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
      const ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
      
      console.log('🕒 Analytics: Session validation:', {
        sessionAge: Math.round(sessionAge / 1000) + 's',
        timeSinceActivity: Math.round(timeSinceActivity / 1000) + 's',
        sessionValid: sessionAge < SESSION_TIMEOUT,
        activityValid: timeSinceActivity < ACTIVITY_TIMEOUT
      });
      
      if (existingSessionId && existingVisitorId && 
          sessionAge < SESSION_TIMEOUT && 
          timeSinceActivity < ACTIVITY_TIMEOUT) {
        // Resume existing session
        console.log('✅ Analytics: Resuming existing session');
        setVisitorId(existingVisitorId);
        setSessionId(existingSessionId);
        setSessionStartTime(parseInt(sessionStartTime || '0'));
        setSessionInitialized(true);
        
        // Restore page count
        const pageCount = localStorage.getItem('analytics_page_count');
        if (pageCount) {
          setPageViewCount(parseInt(pageCount));
          console.log('📊 Analytics: Restored page count:', pageCount);
        }
        
        // Update last activity
        localStorage.setItem('analytics_last_activity', now.toString());
      } else {
        // Create new session only if we don't have valid existing one
        const reason = !existingSessionId ? 'no existing session' :
                      !existingVisitorId ? 'no visitor ID' :
                      sessionAge >= SESSION_TIMEOUT ? 'session expired (24h+)' :
                      'activity timeout (30min+)';
        console.log('🆕 Analytics: Creating new session, reason:', reason);
        initializeSession();
      }
    } else {
      console.log('⏸️ Analytics: Skipping initialization -', !autoTrack ? 'autoTrack disabled' : 'analytics disabled');
    }
  }, [autoTrack, analyticsDisabled]); // Removed initializeSession dependency to prevent loops

  // Only end sessions on actual tab/browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('📜 Analytics: Tab/browser closing - ending session...');
      
      if (sessionId && sessionInitialized && !analyticsDisabled) {
        const startTime = sessionStartTime || parseInt(localStorage.getItem('analytics_session_start') || '0');
        const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
        
        const endSessionData = {
          sessionId,
          exitPage: window.location.pathname,
          duration,
          pageViews: pageViewCount || 1,
        };
        
        console.log('📜 Analytics: Sending session end beacon:', endSessionData);
        
        try {
          // Use sendBeacon for reliable tracking on page unload
          if (navigator.sendBeacon) {
            const beacon = navigator.sendBeacon(
              `${window.location.origin}/api/analytics/sessions/end`,
              JSON.stringify(endSessionData)
            );
            if (beacon) {
              console.log('✅ Analytics: Session end beacon sent successfully');
            } else {
              console.warn('⚠️ Analytics: Session end beacon failed to send');
            }
          } else {
            // Fallback for browsers without sendBeacon
            console.log('🔄 Analytics: Using fallback session end method');
            endSession();
          }

          // Disconnect WebSocket
          analyticsWebSocket.disconnect();
          console.log('🔌 Analytics: WebSocket disconnected on page unload');
        } catch (err) {
          console.error('🚨 Analytics: Failed to send session end beacon:', err);
        }
      } else {
        console.log('⏸️ Analytics: Skipping session end -', 
          !sessionId ? 'no session ID' : 
          !sessionInitialized ? 'not initialized' : 
          'analytics disabled');
      }
    };

    // Also handle page visibility change for mobile browsers
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionId && !analyticsDisabled) {
        console.log('👁️ Analytics: Page hidden - updating last activity');
        // Update last activity time when page becomes hidden
        localStorage.setItem('analytics_last_activity', Date.now().toString());
      } else if (document.visibilityState === 'visible' && sessionId && !analyticsDisabled) {
        console.log('👁️ Analytics: Page visible - updating last activity');
        localStorage.setItem('analytics_last_activity', Date.now().toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Do NOT end session on component unmount - only on actual tab close
      console.log('🧹 Analytics: Component cleanup - NOT ending session (sessions persist across navigation)');
    };
  }, [sessionId, sessionInitialized, sessionStartTime, pageViewCount, analyticsDisabled, endSession]);

  const value: AnalyticsContextType = {
    // Session data
    visitorId,
    sessionId,
    
    // Analytics data
    stats,
    realTimeStats,
    topPages,
    timeSeries,
    dashboard,
    
    // Page tracking data
    pageViewCount,
    
    // Loading states
    isLoading,
    isTracking,
    
    // Error state
    error,
    
    // WebSocket connection management
    connect,
    heartbeat,
    disconnect,
    
    // Tracking methods
    initializeSession,
    trackPageView,
    updateTimeSpent,
    endSession,
    
    // Session management methods
    getSessionById,
    getSessions,
    getSessionPageViews,
    
    // Data fetching methods
    fetchStats,
    fetchRealTimeStats,
    fetchTopPages,
    fetchTimeSeries,
    fetchDashboard,
    
    // Visitor management methods
    getUserVisitors,
    getUserVisitorStats,
    
    // Utility methods
    healthCheck,
    clearError,
    reset,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};