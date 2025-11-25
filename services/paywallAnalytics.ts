import analytics from '@react-native-firebase/analytics';

/**
 * Service centralisé pour le tracking du paywall
 * Track dans Firebase Analytics
 * Note: PostHog tracking doit être fait dans les composants via usePostHog() hook
 */

// Track l'affichage du paywall A (après onboarding)
export async function trackPaywallViewed(paywallType: 'A' | 'B', source?: string) {
  try {
    await analytics().logEvent('paywall_viewed', {
      paywall_type: paywallType,
      source: source || 'unknown',
      timestamp: new Date().toISOString(),
    });
    console.log('📊 Tracking: paywall_viewed', paywallType, source);
  } catch (error) {
    console.error('Error tracking paywall_viewed:', error);
  }
}

// Track la sélection d'un plan
export async function trackPaywallPlanSelected(
  paywallType: 'A' | 'B',
  planType: 'weekly' | 'monthly' | 'annual',
  price?: number
) {
  try {
    await analytics().logEvent('paywall_plan_selected', {
      paywall_type: paywallType,
      plan_type: planType,
      price: price,
      timestamp: new Date().toISOString(),
    });
    console.log('📊 Tracking: paywall_plan_selected', planType, price);
  } catch (error) {
    console.error('Error tracking paywall_plan_selected:', error);
  }
}

// Track un achat réussi
export async function trackPaywallPurchaseSuccess(
  paywallType: 'A' | 'B',
  planType: 'weekly' | 'monthly' | 'annual',
  price: number,
  currency: string
) {
  try {
    await analytics().logEvent('paywall_purchase_success', {
      paywall_type: paywallType,
      plan_type: planType,
      price: price,
      currency: currency,
      timestamp: new Date().toISOString(),
    });
    console.log('📊 Tracking: paywall_purchase_success', planType, price, currency);
  } catch (error) {
    console.error('Error tracking paywall_purchase_success:', error);
  }
}

// Track un échec d'achat
export async function trackPaywallPurchaseFailed(
  paywallType: 'A' | 'B',
  planType: 'weekly' | 'monthly' | 'annual',
  errorMessage?: string
) {
  try {
    await analytics().logEvent('paywall_purchase_failed', {
      paywall_type: paywallType,
      plan_type: planType,
      error_message: errorMessage || 'unknown',
      timestamp: new Date().toISOString(),
    });
    console.log('📊 Tracking: paywall_purchase_failed', planType, errorMessage);
  } catch (error) {
    console.error('Error tracking paywall_purchase_failed:', error);
  }
}

// Track un achat annulé par l'utilisateur
export async function trackPaywallPurchaseCancelled(
  paywallType: 'A' | 'B',
  planType: 'weekly' | 'monthly' | 'annual'
) {
  try {
    await analytics().logEvent('paywall_purchase_cancelled', {
      paywall_type: paywallType,
      plan_type: planType,
      timestamp: new Date().toISOString(),
    });
    console.log('📊 Tracking: paywall_purchase_cancelled', planType);
  } catch (error) {
    console.error('Error tracking paywall_purchase_cancelled:', error);
  }
}

// Track la fermeture du paywall
export async function trackPaywallClosed(
  paywallType: 'A' | 'B',
  reason: 'user_closed' | 'purchase_success' | 'upgrade_suggested'
) {
  try {
    await analytics().logEvent('paywall_closed', {
      paywall_type: paywallType,
      reason: reason,
      timestamp: new Date().toISOString(),
    });
    console.log('📊 Tracking: paywall_closed', paywallType, reason);
  } catch (error) {
    console.error('Error tracking paywall_closed:', error);
  }
}

// Track la restauration d'achat
export async function trackPaywallRestoreAttempt(paywallType: 'A' | 'B', success: boolean) {
  try {
    await analytics().logEvent('paywall_restore_attempt', {
      paywall_type: paywallType,
      success: success,
      timestamp: new Date().toISOString(),
    });
    console.log('📊 Tracking: paywall_restore_attempt', paywallType, success);
  } catch (error) {
    console.error('Error tracking paywall_restore_attempt:', error);
  }
}

// Track le clic sur les CGU/Privacy Policy
export async function trackPaywallTermsClicked(paywallType: 'A' | 'B') {
  try {
    await analytics().logEvent('paywall_terms_clicked', {
      paywall_type: paywallType,
      timestamp: new Date().toISOString(),
    });
    console.log('📊 Tracking: paywall_terms_clicked', paywallType);
  } catch (error) {
    console.error('Error tracking paywall_terms_clicked:', error);
  }
}
