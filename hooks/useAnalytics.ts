import { usePostHog } from 'posthog-react-native';

export const useAnalytics = () => {
  const posthog = usePostHog();

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    posthog.capture(eventName, properties);
  };

  const identifyUser = (userId: string, properties?: Record<string, any>) => {
    posthog.identify(userId, properties);
  };

  const resetUser = () => {
    posthog.reset();
  };

  return {
    trackEvent,
    identifyUser,
    resetUser,
  };
}; 