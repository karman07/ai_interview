import { useEffect } from 'react';

/**
 * Web Vitals monitoring component for SEO and performance tracking
 * Tracks Core Web Vitals: LCP, INP, CLS
 */
const WebVitalsMonitor = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'web-vital' in window) {
      return;
    }

    // Dynamic import of web-vitals for better code splitting
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      const sendToAnalytics = (metric: any) => {
        // Log to console in development
        if (import.meta.env.DEV) {
          console.log('Web Vital:', metric);
        }

        // Send to your analytics service
        if (window.umami) {
          window.umami.track(metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            rating: metric.rating,
          });
        }

        // You can also send to Google Analytics
        if (window.gtag) {
          window.gtag('event', metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
          });
        }
      };

      // Core Web Vitals
      onCLS(sendToAnalytics);  // Cumulative Layout Shift
      onINP(sendToAnalytics);  // Interaction to Next Paint (replaces FID)
      onLCP(sendToAnalytics);  // Largest Contentful Paint
      
      // Additional metrics
      onFCP(sendToAnalytics);  // First Contentful Paint
      onTTFB(sendToAnalytics); // Time to First Byte
    }).catch((error) => {
      console.error('Failed to load web-vitals:', error);
    });
  }, []);

  return null;
};

export default WebVitalsMonitor;

// Type declarations for analytics
declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, any>) => void;
    };
    gtag?: (...args: any[]) => void;
  }
}
