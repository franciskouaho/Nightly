import analytics from '@react-native-firebase/analytics';
import { usePostHog } from '@/hooks/usePostHog';

/**
 * Service d'analytics pour le système de couples
 * Tracks tous les événements liés aux couples dans Firebase Analytics et PostHog
 */

// Types pour les événements
export type CoupleConnectionSource = 'code_entry' | 'qr_scan' | 'link';
export type CoupleDisconnectionReason = 'user_initiated' | 'partner_deleted' | 'error';
export type DailyChallengeStatus = 'started' | 'completed' | 'skipped' | 'failed';

/**
 * Track quand un utilisateur voit l'écran couples
 */
export async function trackCouplesScreenViewed(
  hasPartner: boolean,
  options?: {
    currentStreak?: number;
    distanceKm?: number;
    hasActiveChallenge?: boolean;
    locationSharingEnabled?: boolean;
  }
) {
  const eventName = 'couples_screen_viewed';
  const properties = {
    has_partner: hasPartner,
    current_streak: options?.currentStreak || 0,
    distance_km: options?.distanceKm || null,
    has_active_challenge: options?.hasActiveChallenge || false,
    location_sharing_enabled: options?.locationSharingEnabled || false,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    // Firebase Analytics
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track quand un utilisateur copie son code couple
 */
export async function trackCoupleCodeCopied(coupleCode: string) {
  const eventName = 'couple_code_copied';
  const properties = {
    code_length: coupleCode.length,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track quand un utilisateur ouvre le drawer pour entrer un code
 */
export async function trackCoupleCodeEntryStarted() {
  const eventName = 'couple_code_entry_started';
  const properties = {
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track quand deux utilisateurs se connectent avec succès
 */
export async function trackCoupleConnected(
  partnerPseudo: string,
  source: CoupleConnectionSource = 'code_entry'
) {
  const eventName = 'couple_connected';
  const properties = {
    partner_pseudo: partnerPseudo,
    source: source,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track quand une tentative de connexion échoue
 */
export async function trackCoupleConnectionFailed(reason: string) {
  const eventName = 'couple_connection_failed';
  const properties = {
    reason: reason,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track quand un couple se déconnecte
 */
export async function trackCoupleDisconnected(
  reason: CoupleDisconnectionReason = 'user_initiated'
) {
  const eventName = 'couple_disconnected';
  const properties = {
    reason: reason,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track quand un utilisateur upload une photo de couple
 */
export async function trackCouplePhotoUploaded(photoSize?: number) {
  const eventName = 'couple_photo_uploaded';
  const properties = {
    photo_size_kb: photoSize ? Math.round(photoSize / 1024) : undefined,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track le défi quotidien
 */
export async function trackDailyChallenge(
  status: DailyChallengeStatus,
  challengeType?: string
) {
  const eventName = 'daily_challenge';
  const properties = {
    status: status,
    challenge_type: challengeType,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track quand le streak augmente
 */
export async function trackStreakIncreased(newStreak: number) {
  const eventName = 'couple_streak_increased';
  const properties = {
    new_streak: newStreak,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track quand le streak est perdu
 */
export async function trackStreakLost(lastStreak: number) {
  const eventName = 'couple_streak_lost';
  const properties = {
    last_streak: lastStreak,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track quand la distance GPS est calculée
 */
export async function trackDistanceCalculated(distanceKm: number) {
  const eventName = 'couple_distance_calculated';
  const properties = {
    distance_km: Math.round(distanceKm),
    distance_range: getDistanceRange(distanceKm),
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track quand l'utilisateur active/désactive le partage de localisation
 */
export async function trackLocationSharingToggled(enabled: boolean) {
  const eventName = 'location_sharing_toggled';
  const properties = {
    enabled: enabled,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Helper: Convertir la distance en range pour analytics
 */
function getDistanceRange(distanceKm: number): string {
  if (distanceKm < 1) return '0-1km';
  if (distanceKm < 5) return '1-5km';
  if (distanceKm < 10) return '5-10km';
  if (distanceKm < 50) return '10-50km';
  if (distanceKm < 100) return '50-100km';
  if (distanceKm < 500) return '100-500km';
  if (distanceKm < 1000) return '500-1000km';
  return '1000km+';
}

/**
 * Track les widgets ajoutés/supprimés
 */
export async function trackWidgetAction(
  action: 'add' | 'remove',
  widgetType: string
) {
  const eventName = 'couple_widget_action';
  const properties = {
    action: action,
    widget_type: widgetType,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track quand l'utilisateur interagit avec le défi quotidien (afficher, ouvrir)
 */
export async function trackDailyChallengeViewed(hasCompleted: boolean) {
  const eventName = 'daily_challenge_viewed';
  const properties = {
    has_completed: hasCompleted,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}

/**
 * Track l'utilisation générale du système de couples
 */
export async function trackCouplesSystemUsage(metrics: {
  daysTogether?: number;
  currentStreak?: number;
  longestStreak?: number;
  challengesCompleted?: number;
  locationSharingEnabled?: boolean;
  averageDistanceKm?: number;
}) {
  const eventName = 'couples_system_usage';
  const properties = {
    ...metrics,
    timestamp: new Date().toISOString(),
  };

  console.log(`📊 Tracking: ${eventName}`, properties);

  try {
    await analytics().logEvent(eventName, properties);
  } catch (error) {
    console.error(`Error tracking ${eventName}:`, error);
  }
}
