import { useFirebaseAnalytics } from './useFirebaseAnalytics';

export const useTutorialAnalytics = () => {
  const analytics = useFirebaseAnalytics();

  const trackTutorialStart = async () => {
    await analytics.logTutorialBegin();
    await analytics.logEvent('tutorial_start', {
      timestamp: new Date().toISOString(),
    });
  };

  const trackTutorialStep = async (step: number, stepName: string) => {
    await analytics.logEvent('tutorial_step', {
      step,
      step_name: stepName,
      timestamp: new Date().toISOString(),
    });
  };

  const trackTutorialSkip = async (step: number) => {
    await analytics.logEvent('tutorial_skip', {
      step,
      timestamp: new Date().toISOString(),
    });
  };

  const trackTutorialComplete = async (totalSteps: number, timeSpent: number) => {
    await analytics.logTutorialComplete();
    await analytics.logEvent('tutorial_complete', {
      total_steps: totalSteps,
      time_spent: timeSpent,
      timestamp: new Date().toISOString(),
    });
  };

  const trackTutorialHelp = async (step: number, helpType: string) => {
    await analytics.logEvent('tutorial_help', {
      step,
      help_type: helpType,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackTutorialStart,
    trackTutorialStep,
    trackTutorialSkip,
    trackTutorialComplete,
    trackTutorialHelp,
  };
}; 