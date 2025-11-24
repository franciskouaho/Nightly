import analytics from '@react-native-firebase/analytics';
import posthog from 'posthog-react-native';

/**
 * Service centralisé pour le tracking du paywall
 * Track à la fois dans Firebase Analytics et PostHog
 */

// Track l'affichage du paywall A (après onboarding)
export async function trackPaywallViewed(paywallType: 'A' | 'B', source?: string) {
  await analytics().logEvent('paywall_viewed', {
    paywall_type: paywallType,
    source: source || 'unknown',
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('paywall_viewed', {
    paywall_type: paywallType,
    source: source || 'unknown',
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: paywall_viewed', paywallType, source);
}

// Track la sélection d'un plan
export async function trackPaywallPlanSelected(
  paywallType: 'A' | 'B',
  planType: 'weekly' | 'monthly' | 'annual',
  price?: number
) {
  await analytics().logEvent('paywall_plan_selected', {
    paywall_type: paywallType,
    plan_type: planType,
    price: price,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('paywall_plan_selected', {
    paywall_type: paywallType,
    plan_type: planType,
    price: price,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: paywall_plan_selected', planType, price);
}

// Track un achat réussi
export async function trackPaywallPurchaseSuccess(
  paywallType: 'A' | 'B',
  planType: 'weekly' | 'monthly' | 'annual',
  price: number,
  currency: string
) {
  await analytics().logEvent('paywall_purchase_success', {
    paywall_type: paywallType,
    plan_type: planType,
    price: price,
    currency: currency,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('paywall_purchase_success', {
    paywall_type: paywallType,
    plan_type: planType,
    price: price,
    currency: currency,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: paywall_purchase_success', planType, price, currency);
}

// Track un échec d'achat
export async function trackPaywallPurchaseFailed(
  paywallType: 'A' | 'B',
  planType: 'weekly' | 'monthly' | 'annual',
  errorMessage?: string
) {
  await analytics().logEvent('paywall_purchase_failed', {
    paywall_type: paywallType,
    plan_type: planType,
    error_message: errorMessage || 'unknown',
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('paywall_purchase_failed', {
    paywall_type: paywallType,
    plan_type: planType,
    error_message: errorMessage || 'unknown',
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: paywall_purchase_failed', planType, errorMessage);
}

// Track un achat annulé par l'utilisateur
export async function trackPaywallPurchaseCancelled(
  paywallType: 'A' | 'B',
  planType: 'weekly' | 'monthly' | 'annual'
) {
  await analytics().logEvent('paywall_purchase_cancelled', {
    paywall_type: paywallType,
    plan_type: planType,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('paywall_purchase_cancelled', {
    paywall_type: paywallType,
    plan_type: planType,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: paywall_purchase_cancelled', planType);
}

// Track la fermeture du paywall
export async function trackPaywallClosed(
  paywallType: 'A' | 'B',
  reason: 'user_closed' | 'purchase_success' | 'upgrade_suggested'
) {
  await analytics().logEvent('paywall_closed', {
    paywall_type: paywallType,
    reason: reason,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('paywall_closed', {
    paywall_type: paywallType,
    reason: reason,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: paywall_closed', paywallType, reason);
}

// Track la restauration d'achat
export async function trackPaywallRestoreAttempt(paywallType: 'A' | 'B', success: boolean) {
  await analytics().logEvent('paywall_restore_attempt', {
    paywall_type: paywallType,
    success: success,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('paywall_restore_attempt', {
    paywall_type: paywallType,
    success: success,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: paywall_restore_attempt', paywallType, success);
}

// Track le clic sur les CGU/Privacy Policy
export async function trackPaywallTermsClicked(paywallType: 'A' | 'B') {
  await analytics().logEvent('paywall_terms_clicked', {
    paywall_type: paywallType,
    timestamp: new Date().toISOString(),
  });

  posthog?.capture('paywall_terms_clicked', {
    paywall_type: paywallType,
    timestamp: new Date().toISOString(),
  });

  console.log('📊 Tracking: paywall_terms_clicked', paywallType);
}
