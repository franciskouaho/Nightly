import { useFirebaseAnalytics } from './useFirebaseAnalytics';

export const useProfileAnalytics = () => {
  const analytics = useFirebaseAnalytics();

  const trackProfileView = async () => {
    await analytics.logEvent('profile_view', {
      timestamp: new Date().toISOString(),
    });
  };

  const trackProfileUpdate = async (fields: string[]) => {
    await analytics.logEvent('profile_update', {
      fields,
      timestamp: new Date().toISOString(),
    });
  };

  const trackAvatarChange = async () => {
    await analytics.logEvent('avatar_change', {
      timestamp: new Date().toISOString(),
    });
  };

  const trackSettingsChange = async (setting: string, value: any) => {
    await analytics.logEvent('settings_change', {
      setting,
      value,
      timestamp: new Date().toISOString(),
    });
  };

  const trackNotificationPreferences = async (preferences: Record<string, boolean>) => {
    await analytics.logEvent('notification_preferences_update', {
      preferences,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackProfileView,
    trackProfileUpdate,
    trackAvatarChange,
    trackSettingsChange,
    trackNotificationPreferences,
  };
}; 