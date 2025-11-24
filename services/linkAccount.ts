import { getAuth } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_AUTH_CONFIG } from '@/config/googleAuth';
import auth from '@react-native-firebase/auth';
import { Platform, Alert } from 'react-native';
import analytics from '@react-native-firebase/analytics';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import posthog from 'posthog-react-native';

/**
 * Vérifie si l'utilisateur actuel est connecté de manière anonyme
 */
export function isAnonymousUser(): boolean {
  const currentUser = getAuth().currentUser;
  return currentUser?.isAnonymous === true;
}

/**
 * Lie un compte anonyme avec Google
 * Conserve toutes les données de l'utilisateur anonyme
 */
export async function linkWithGoogle(): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = getAuth().currentUser;

    if (!currentUser) {
      return { success: false, error: 'Aucun utilisateur connecté' };
    }

    if (!currentUser.isAnonymous) {
      return { success: false, error: 'Le compte est déjà lié' };
    }

    console.log('🔗 Début de la liaison du compte anonyme avec Google...');

    // Configurer Google Sign-In
    GoogleSignin.configure({
      webClientId: GOOGLE_AUTH_CONFIG.webClientId,
      offlineAccess: false,
    });

    // Check Play Services (Android)
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    // Obtenir les informations de connexion Google
    const signInResult = await GoogleSignin.signIn();
    const idToken = signInResult.data?.idToken || (signInResult as any).idToken;

    if (!idToken) {
      return { success: false, error: 'Impossible d\'obtenir le token Google' };
    }

    // Créer le credential Google
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Lier le compte anonyme avec Google
    await currentUser.linkWithCredential(googleCredential);

    console.log('✅ Compte anonyme lié avec succès à Google');

    // Track Firebase Analytics
    await analytics().logEvent('account_linked', {
      method: 'google',
      user_id: currentUser.uid,
      timestamp: new Date().toISOString(),
    });

    // Track PostHog
    posthog?.capture('account_linked', {
      method: 'google',
      user_id: currentUser.uid,
      was_anonymous: true,
      timestamp: new Date().toISOString(),
    });

    return { success: true };

  } catch (error: any) {
    console.error('❌ Erreur lors de la liaison avec Google:', error);

    let errorMessage = 'Une erreur est survenue lors de la liaison';

    if (error.code === 'auth/credential-already-in-use') {
      errorMessage = 'Ce compte Google est déjà utilisé par un autre compte. Vos données actuelles seront conservées.';
      // Le compte Google est déjà lié à un autre compte Firebase
      // On pourrait proposer une migration des données ici
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Cette adresse email est déjà utilisée par un autre compte';
    } else if (error.code === 'auth/provider-already-linked') {
      errorMessage = 'Ce compte est déjà lié à Google';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Identifiants Google invalides';
    } else if (error.code === '-5' || error.code === 'SIGN_IN_CANCELLED') {
      errorMessage = 'Connexion annulée';
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      errorMessage = 'Google Play Services non disponible';
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Lie un compte anonyme avec Apple (iOS uniquement)
 * Conserve toutes les données de l'utilisateur anonyme
 */
export async function linkWithApple(): Promise<{ success: boolean; error?: string }> {
  try {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'Apple Sign-In est disponible uniquement sur iOS' };
    }

    const currentUser = getAuth().currentUser;

    if (!currentUser) {
      return { success: false, error: 'Aucun utilisateur connecté' };
    }

    if (!currentUser.isAnonymous) {
      return { success: false, error: 'Le compte est déjà lié' };
    }

    console.log('🔗 Début de la liaison du compte anonyme avec Apple...');

    // Charger le module Apple Authentication
    let AppleAuthentication: any = null;
    try {
      AppleAuthentication = require('expo-apple-authentication');
    } catch (e) {
      return { success: false, error: 'Apple Sign-In non disponible' };
    }

    // Demander la connexion Apple
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { success: false, error: 'Token Apple non disponible' };
    }

    // Créer le credential Apple
    const appleCredential = auth.AppleAuthProvider.credential(
      credential.identityToken,
      credential.nonce || undefined
    );

    // Lier le compte anonyme avec Apple
    await currentUser.linkWithCredential(appleCredential);

    console.log('✅ Compte anonyme lié avec succès à Apple');

    // Track Firebase Analytics
    await analytics().logEvent('account_linked', {
      method: 'apple',
      user_id: currentUser.uid,
      timestamp: new Date().toISOString(),
    });

    // Track PostHog
    posthog?.capture('account_linked', {
      method: 'apple',
      user_id: currentUser.uid,
      was_anonymous: true,
      timestamp: new Date().toISOString(),
    });

    return { success: true };

  } catch (error: any) {
    console.error('❌ Erreur lors de la liaison avec Apple:', error);

    // User cancelled
    if (error.code === 'ERR_REQUEST_CANCELED' || error.code === '1001') {
      return { success: false, error: 'Connexion annulée' };
    }

    let errorMessage = 'Une erreur est survenue lors de la liaison';

    if (error.code === 'auth/credential-already-in-use') {
      errorMessage = 'Ce compte Apple est déjà utilisé par un autre compte. Vos données actuelles seront conservées.';
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Cette adresse email est déjà utilisée par un autre compte';
    } else if (error.code === 'auth/provider-already-linked') {
      errorMessage = 'Ce compte est déjà lié à Apple';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Identifiants Apple invalides';
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Retourne le type de compte de l'utilisateur
 */
export function getAccountType(): 'anonymous' | 'google' | 'apple' | 'other' | null {
  const currentUser = getAuth().currentUser;

  if (!currentUser) {
    return null;
  }

  if (currentUser.isAnonymous) {
    return 'anonymous';
  }

  const providers = currentUser.providerData;

  if (providers.some(p => p.providerId === 'google.com')) {
    return 'google';
  }

  if (providers.some(p => p.providerId === 'apple.com')) {
    return 'apple';
  }

  return 'other';
}

/**
 * Attribue un abonnement Premium gratuit de 3 jours à l'utilisateur
 * Cette fonction est appelée après la liaison réussie du compte
 */
export async function grantFreePremiumSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);

    // Calculer la date d'expiration (3 jours à partir de maintenant)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 3);

    // Mettre à jour le document utilisateur avec l'abonnement gratuit
    await updateDoc(userRef, {
      hasActiveSubscription: true,
      subscriptionType: 'link_reward', // Type spécial pour identifier qu'il s'agit d'une récompense de liaison
      subscriptionUpdatedAt: new Date().toISOString(),
      subscriptionExpiresAt: expirationDate.toISOString(),
      linkRewardGranted: true, // Flag pour ne pas donner la récompense plusieurs fois
      linkRewardGrantedAt: new Date().toISOString(),
    });

    console.log('✅ Abonnement Premium gratuit de 3 jours accordé jusqu\'au:', expirationDate.toISOString());

    // Track Firebase Analytics
    await analytics().logEvent('premium_granted', {
      reason: 'account_link',
      user_id: userId,
      duration_days: 3,
      timestamp: new Date().toISOString(),
    });

    // Track PostHog
    posthog?.capture('premium_granted', {
      reason: 'account_link',
      user_id: userId,
      duration_days: 3,
      subscription_type: 'link_reward',
      expiration_date: expirationDate.toISOString(),
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'attribution de l\'abonnement gratuit:', error);
    return { success: false, error: error.message || 'Erreur lors de l\'attribution de l\'abonnement' };
  }
}
