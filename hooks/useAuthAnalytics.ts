import { useFirebaseAnalytics } from './useFirebaseAnalytics';

export const useAuthAnalytics = () => {
  const analytics = useFirebaseAnalytics();

  const trackLogin = async (method: string, success: boolean) => {
    await analytics.logLogin(method);
    await analytics.logEvent('login_attempt', {
      method,
      success,
      timestamp: new Date().toISOString(),
    });
  };

  const trackSignUp = async (method: string, success: boolean) => {
    await analytics.logSignUp(method);
    await analytics.logEvent('signup_attempt', {
      method,
      success,
      timestamp: new Date().toISOString(),
    });
  };

  const trackLogout = async () => {
    await analytics.logEvent('user_logout', {
      timestamp: new Date().toISOString(),
    });
  };

  const trackPasswordReset = async (success: boolean) => {
    await analytics.logEvent('password_reset', {
      success,
      timestamp: new Date().toISOString(),
    });
  };

  const trackEmailVerification = async (success: boolean) => {
    await analytics.logEvent('email_verification', {
      success,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackLogin,
    trackSignUp,
    trackLogout,
    trackPasswordReset,
    trackEmailVerification,
  };
}; 