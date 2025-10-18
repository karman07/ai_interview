import { useCallback, useRef } from 'react';
import { useAnalytics } from '@/contexts/AnalyticsContext';

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  path?: string;
  userId?: string;
  sessionId?: string;
  visitorId?: string;
  customProperties?: Record<string, any>;
}

export interface AnalyticsTrackingHook {
  // Page tracking
  trackPageView: (path: string, title?: string, customData?: Record<string, any>) => Promise<void>;
  
  // Event tracking
  trackEvent: (event: AnalyticsEvent) => Promise<void>;
  
  // User interaction tracking
  trackButtonClick: (buttonName: string, location?: string) => Promise<void>;
  trackFormSubmission: (formName: string, success: boolean, errors?: string[]) => Promise<void>;
  trackFileDownload: (fileName: string, fileType: string) => Promise<void>;
  trackSearch: (query: string, results: number) => Promise<void>;
  trackVideoPlay: (videoId: string, videoTitle?: string) => Promise<void>;
  trackVideoComplete: (videoId: string, duration: number) => Promise<void>;
  
  // E-commerce tracking (if applicable)
  trackPurchase: (orderId: string, amount: number, currency?: string, items?: any[]) => Promise<void>;
  trackAddToCart: (productId: string, productName: string, price: number) => Promise<void>;
  
  // Custom events
  trackCustomEvent: (eventName: string, properties?: Record<string, any>) => Promise<void>;
  
  // Error tracking
  trackError: (error: Error | string, context?: string) => Promise<void>;
  
  // Performance tracking
  trackPerformance: (metric: string, value: number, unit?: string) => Promise<void>;
}

export const useAnalyticsTracking = (): AnalyticsTrackingHook => {
  const { trackPageView: contextTrackPageView, visitorId, sessionId } = useAnalytics();
  
  // Rate limiting and deduplication
  const lastEventTimestamp = useRef<Record<string, number>>({});
  const eventQueue = useRef<Set<string>>(new Set());
  const RATE_LIMIT_WINDOW = 1000; // 1 second
  const MAX_EVENTS_PER_MINUTE = 30;

  // Enhanced page view tracking
  const trackPageView = useCallback(async (
    path: string, 
    title?: string, 
    customData?: Record<string, any>
  ) => {
    try {
      await contextTrackPageView(path, title, {
        referrer: document.referrer,
        metadata: customData,
      });
    } catch (error) {
      console.warn('Failed to track page view:', error);
    }
  }, [contextTrackPageView]);

  // Generic event tracking with rate limiting
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      // Create unique event key for deduplication
      const eventKey = `${event.category}-${event.action}-${event.label || ''}-${event.path || window.location.pathname}`;
      const now = Date.now();
      
      // Rate limiting: prevent same event within time window
      const lastTime = lastEventTimestamp.current[eventKey] || 0;
      if (now - lastTime < RATE_LIMIT_WINDOW) {
        console.log('Event rate limited:', eventKey);
        return;
      }
      
      // Prevent duplicate events in queue
      if (eventQueue.current.has(eventKey)) {
        console.log('Event already queued:', eventKey);
        return;
      }
      
      // Check global rate limit
      const recentEvents = Object.values(lastEventTimestamp.current)
        .filter(timestamp => now - timestamp < 60000).length; // Last minute
        
      if (recentEvents >= MAX_EVENTS_PER_MINUTE) {
        console.log('Global event rate limit exceeded');
        return;
      }
      
      // Add to queue and update timestamp
      eventQueue.current.add(eventKey);
      lastEventTimestamp.current[eventKey] = now;
      
      // For now, we'll log events and send them to our analytics API
      // In a real implementation, this would integrate with your analytics backend
      const eventData = {
        ...event,
        timestamp: new Date().toISOString(),
        visitorId,
        sessionId,
        url: window.location.href,
        path: event.path || window.location.pathname,
      };
      
      console.log('Analytics Event:', eventData);
      
      // Here you would send the event to your analytics API
      // await AnalyticsApi.trackEvent(eventData);
      
      // Remove from queue after processing
      setTimeout(() => {
        eventQueue.current.delete(eventKey);
      }, RATE_LIMIT_WINDOW);
      
    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }, [visitorId, sessionId]);

  // Button click tracking
  const trackButtonClick = useCallback(async (
    buttonName: string, 
    location?: string
  ) => {
    await trackEvent({
      category: 'UI Interaction',
      action: 'Button Click',
      label: buttonName,
      customProperties: {
        location: location || window.location.pathname,
        timestamp: Date.now(),
      }
    });
  }, [trackEvent]);

  // Form submission tracking
  const trackFormSubmission = useCallback(async (
    formName: string, 
    success: boolean, 
    errors?: string[]
  ) => {
    await trackEvent({
      category: 'Form',
      action: success ? 'Form Submit Success' : 'Form Submit Error',
      label: formName,
      value: success ? 1 : 0,
      customProperties: {
        errors: errors || [],
        timestamp: Date.now(),
      }
    });
  }, [trackEvent]);

  // File download tracking
  const trackFileDownload = useCallback(async (
    fileName: string, 
    fileType: string
  ) => {
    await trackEvent({
      category: 'File',
      action: 'Download',
      label: fileName,
      customProperties: {
        fileType,
        fileSize: 0, // Could be populated if available
        timestamp: Date.now(),
      }
    });
  }, [trackEvent]);

  // Search tracking
  const trackSearch = useCallback(async (
    query: string, 
    results: number
  ) => {
    await trackEvent({
      category: 'Search',
      action: 'Search Query',
      label: query,
      value: results,
      customProperties: {
        hasResults: results > 0,
        timestamp: Date.now(),
      }
    });
  }, [trackEvent]);

  // Video tracking
  const trackVideoPlay = useCallback(async (
    videoId: string, 
    videoTitle?: string
  ) => {
    await trackEvent({
      category: 'Video',
      action: 'Play',
      label: videoTitle || videoId,
      customProperties: {
        videoId,
        timestamp: Date.now(),
      }
    });
  }, [trackEvent]);

  const trackVideoComplete = useCallback(async (
    videoId: string, 
    duration: number
  ) => {
    await trackEvent({
      category: 'Video',
      action: 'Complete',
      label: videoId,
      value: duration,
      customProperties: {
        videoId,
        durationSeconds: duration,
        timestamp: Date.now(),
      }
    });
  }, [trackEvent]);

  // E-commerce tracking
  const trackPurchase = useCallback(async (
    orderId: string, 
    amount: number, 
    currency: string = 'USD', 
    items?: any[]
  ) => {
    await trackEvent({
      category: 'E-commerce',
      action: 'Purchase',
      label: orderId,
      value: amount,
      customProperties: {
        orderId,
        currency,
        items: items || [],
        timestamp: Date.now(),
      }
    });
  }, [trackEvent]);

  const trackAddToCart = useCallback(async (
    productId: string, 
    productName: string, 
    price: number
  ) => {
    await trackEvent({
      category: 'E-commerce',
      action: 'Add to Cart',
      label: productName,
      value: price,
      customProperties: {
        productId,
        price,
        timestamp: Date.now(),
      }
    });
  }, [trackEvent]);

  // Custom event tracking
  const trackCustomEvent = useCallback(async (
    eventName: string, 
    properties?: Record<string, any>
  ) => {
    await trackEvent({
      category: 'Custom',
      action: eventName,
      customProperties: {
        ...properties,
        timestamp: Date.now(),
      }
    });
  }, [trackEvent]);

  // Error tracking
  const trackError = useCallback(async (
    error: Error | string, 
    context?: string
  ) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;
    
    await trackEvent({
      category: 'Error',
      action: 'Application Error',
      label: errorMessage,
      customProperties: {
        errorMessage,
        stack,
        context: context || 'Unknown',
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      }
    });
  }, [trackEvent]);

  // Performance tracking
  const trackPerformance = useCallback(async (
    metric: string, 
    value: number, 
    unit: string = 'ms'
  ) => {
    await trackEvent({
      category: 'Performance',
      action: 'Metric',
      label: metric,
      value,
      customProperties: {
        metric,
        unit,
        timestamp: Date.now(),
      }
    });
  }, [trackEvent]);

  return {
    trackPageView,
    trackEvent,
    trackButtonClick,
    trackFormSubmission,
    trackFileDownload,
    trackSearch,
    trackVideoPlay,
    trackVideoComplete,
    trackPurchase,
    trackAddToCart,
    trackCustomEvent,
    trackError,
    trackPerformance,
  };
};

// Export analytics utilities
export const AnalyticsUtils = {
  // Date formatting utilities
  formatDateRange: (startDate: Date, endDate: Date) => ({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }),

  // Get relative date ranges
  getDateRange: (period: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year') => {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setDate(start.getDate() - 30);
        break;
      case 'quarter':
        start.setDate(start.getDate() - 90);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  },

  // Calculate percentage change
  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  },

  // Format numbers for display
  formatNumber: (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  },

  // Format duration in seconds to human readable
  formatDuration: (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  },

  // Device type detection
  getDeviceType: (): 'mobile' | 'tablet' | 'desktop' => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\\sce|palm|smartphone|iemobile/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  },

  // Browser detection
  getBrowser: (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  },

  // Operating system detection
  getOperatingSystem: (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  },
};

export default useAnalyticsTracking;