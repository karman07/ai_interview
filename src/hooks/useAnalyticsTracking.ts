import { useCallback } from 'react';
import { useAnalytics } from '@/contexts/AnalyticsContext';

export const useAnalyticsTracking = () => {
  const { trackPageView, trackEvent } = useAnalytics();

  const trackButtonClick = useCallback((buttonName: string, properties?: Record<string, any>) => {
    trackEvent('button_click', { button_name: buttonName, ...properties });
  }, [trackEvent]);

  const trackFormSubmission = useCallback((formName: string, success: boolean) => {
    trackEvent('form_submission', { form_name: formName, success });
  }, [trackEvent]);

  const trackError = useCallback((error: Error | string, context?: string) => {
    const message = error instanceof Error ? error.message : error;
    trackEvent('error', { message, context });
  }, [trackEvent]);

  return {
    trackPageView,
    trackEvent,
    trackButtonClick,
    trackFormSubmission,
    trackError,
  };
};

export default useAnalyticsTracking;