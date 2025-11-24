import analytics from '@react-native-firebase/analytics';
import posthog from 'posthog-react-native';

/**
 * Service centralisé pour le tracking de l'onboarding
 * Track à la fois dans Firebase Analytics et PostHog
 */

// Track le démarrage de l'onboarding
export async function trackOnboardingStart() {
  await analytics().logEvent('onboarding_start', {
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_start', {
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_start');
}

// Track la vue de l'écran "loading"
export async function trackOnboardingLoading() {
  await analytics().logEvent('onboarding_loading_view', {
    step: 'loading',
    step_number: 0,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_step_viewed', {
    step: 'loading',
    step_number: 0,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_loading_view');
}

// Track la vue de l'écran "ready"
export async function trackOnboardingReady() {
  await analytics().logEvent('onboarding_ready_view', {
    step: 'ready',
    step_number: 1,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_step_viewed', {
    step: 'ready',
    step_number: 1,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_ready_view');
}

// Track la saisie du nom/pseudo
export async function trackOnboardingNameCompleted(name: string) {
  await analytics().logEvent('onboarding_name_completed', {
    step: 'name',
    step_number: 2,
    has_value: !!name,
    name_length: name.length,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_step_completed', {
    step: 'name',
    step_number: 2,
    has_value: !!name,
    name_length: name.length,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_name_completed');
}

// Track la saisie de l'âge
export async function trackOnboardingAgeCompleted(age: string) {
  await analytics().logEvent('onboarding_age_completed', {
    step: 'age',
    step_number: 3,
    has_value: !!age,
    age_range: getAgeRange(age),
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_step_completed', {
    step: 'age',
    step_number: 3,
    has_value: !!age,
    age_range: getAgeRange(age),
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_age_completed');
}

// Track la sélection du genre
export async function trackOnboardingGenderCompleted(gender: string) {
  await analytics().logEvent('onboarding_gender_completed', {
    step: 'gender',
    step_number: 4,
    gender: gender,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_step_completed', {
    step: 'gender',
    step_number: 4,
    gender: gender,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_gender_completed');
}

// Track la sélection des objectifs
export async function trackOnboardingGoalsCompleted(goals: string[]) {
  await analytics().logEvent('onboarding_goals_completed', {
    step: 'goals',
    step_number: 5,
    goals_count: goals.length,
    goals: goals.join(','),
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_step_completed', {
    step: 'goals',
    step_number: 5,
    goals_count: goals.length,
    goals: goals,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_goals_completed');
}

// Track la sélection du profil/avatar
export async function trackOnboardingProfileCompleted(avatar: string) {
  await analytics().logEvent('onboarding_profile_completed', {
    step: 'profile',
    step_number: 6,
    has_avatar: !!avatar,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_step_completed', {
    step: 'profile',
    step_number: 6,
    has_avatar: !!avatar,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_profile_completed');
}

// Track la connexion avec Google/Apple
export async function trackOnboardingAccountCompleted(method: 'google' | 'apple' | 'skip') {
  await analytics().logEvent('onboarding_account_completed', {
    step: 'account',
    step_number: 7,
    method: method,
    is_anonymous: method === 'skip',
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_step_completed', {
    step: 'account',
    step_number: 7,
    method: method,
    is_anonymous: method === 'skip',
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_account_completed:', method);
}

// Track les notifications
export async function trackOnboardingNotificationsCompleted(enabled: boolean) {
  await analytics().logEvent('onboarding_notifications_completed', {
    step: 'notifications',
    step_number: 8,
    enabled: enabled,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_step_completed', {
    step: 'notifications',
    step_number: 8,
    enabled: enabled,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_notifications_completed:', enabled);
}

// Track la fin de l'onboarding
export async function trackOnboardingCompleted(duration_seconds?: number) {
  await analytics().logEvent('onboarding_completed', {
    duration_seconds: duration_seconds,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_completed', {
    duration_seconds: duration_seconds,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_completed');
}

// Track l'abandon de l'onboarding
export async function trackOnboardingAbandoned(step: string, step_number: number) {
  await analytics().logEvent('onboarding_abandoned', {
    step: step,
    step_number: step_number,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('onboarding_abandoned', {
    step: step,
    step_number: step_number,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: onboarding_abandoned at', step);
}

// Fonction helper pour déterminer la tranche d'âge
function getAgeRange(birthDate: string): string {
  if (!birthDate) return 'unknown';

  try {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();

    if (age < 18) return 'under_18';
    if (age >= 18 && age <= 24) return '18-24';
    if (age >= 25 && age <= 34) return '25-34';
    if (age >= 35 && age <= 44) return '35-44';
    if (age >= 45 && age <= 54) return '45-54';
    if (age >= 55) return '55+';

    return 'unknown';
  } catch {
    return 'unknown';
  }
}
