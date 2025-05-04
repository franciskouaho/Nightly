import { useAnalytics } from './useAnalytics';
import { usePathname } from 'expo-router';

export const usePageAnalytics = () => {
  const { trackEvent } = useAnalytics();
  const pathname = usePathname();

  const trackInteraction = (action: string, properties?: Record<string, any>) => {
    trackEvent('user_interaction', {
      page: pathname,
      action,
      timestamp: new Date().toISOString(),
      ...properties
    });
  };

  const trackError = (error: Error, context?: Record<string, any>) => {
    trackEvent('error_occurred', {
      page: pathname,
      error_message: error.message,
      error_stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    });
  };

  const trackFeatureUsage = (feature: string, properties?: Record<string, any>) => {
    trackEvent('feature_used', {
      page: pathname,
      feature,
      timestamp: new Date().toISOString(),
      ...properties
    });
  };

  return {
    trackInteraction,
    trackError,
    trackFeatureUsage
  };
}; 