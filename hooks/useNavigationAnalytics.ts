import { useFirebaseAnalytics } from './useFirebaseAnalytics';

export const useNavigationAnalytics = () => {
  const analytics = useFirebaseAnalytics();

  const trackScreenView = async (screenName: string, screenClass?: string) => {
    await analytics.logScreenView(screenName, screenClass);
    await analytics.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass,
      timestamp: new Date().toISOString(),
    });
  };

  const trackNavigation = async (fromScreen: string, toScreen: string) => {
    await analytics.logEvent('navigation', {
      from_screen: fromScreen,
      to_screen: toScreen,
      timestamp: new Date().toISOString(),
    });
  };

  const trackDeepLink = async (link: string, source: string) => {
    await analytics.logEvent('deep_link', {
      link,
      source,
      timestamp: new Date().toISOString(),
    });
  };

  const trackTabChange = async (tabName: string) => {
    await analytics.logEvent('tab_change', {
      tab_name: tabName,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackScreenView,
    trackNavigation,
    trackDeepLink,
    trackTabChange,
  };
}; 