import { useEffect } from 'react';
import { Platform } from 'react-native';
import appsFlyer from 'react-native-appsflyer';

const APPSFLYER_DEV_KEY = 'gA54F938iBNhpDafLAYZ6F';
// App ID selon la plateforme (iOS: id6745452775, Android: com.emplica.nightly.android)
const APPSFLYER_APP_ID_IOS = 'id6745452775';
const APPSFLYER_APP_ID_ANDROID = 'com.emplica.nightly.android';

export const useAppsFlyer = () => {
  useEffect(() => {
    const initAppsFlyer = async () => {
      try {
        const appId = Platform.OS === 'ios' ? APPSFLYER_APP_ID_IOS : APPSFLYER_APP_ID_ANDROID;
        
        const options = {
          devKey: APPSFLYER_DEV_KEY,
          appId: appId,
          isDebug: __DEV__,
        };

        await appsFlyer.initSdk(options);
        console.log('AppsFlyer SDK initialisé avec succès', { appId, platform: Platform.OS });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation d\'AppsFlyer:', error);
      }
    };

    initAppsFlyer();
  }, []);

  const logEvent = async (eventName: string, eventValues: Record<string, any> = {}) => {
    try {
      await appsFlyer.logEvent(eventName, eventValues);
      console.log(`Événement AppsFlyer enregistré: ${eventName}`, eventValues);
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement de l'événement ${eventName}:`, error);
    }
  };

  // Événements standards AppsFlyer

  /**
   * af_login - Track when user successfully logs in
   */
  const logLogin = async () => {
    await logEvent('af_login', {});
  };

  /**
   * af_complete_registration - Track when user completes registration
   * @param registrationMethod - Type of signup method (e.g., "username", "email", "Facebook")
   */
  const logCompleteRegistration = async (registrationMethod: string) => {
    await logEvent('af_complete_registration', {
      af_registration_method: registrationMethod,
    });
  };

  /**
   * af_purchase - Track purchases
   * @param revenue - Revenue value (number, no currency symbols)
   * @param currency - Currency code (e.g., "USD", "EUR")
   * @param quantity - Number of items purchased
   * @param additionalParams - Additional parameters (optional)
   */
  const logPurchase = async (
    revenue: number,
    currency: string,
    quantity: number = 1,
    additionalParams: Record<string, any> = {}
  ) => {
    await logEvent('af_purchase', {
      af_revenue: revenue.toString(),
      af_currency: currency,
      af_quantity: quantity.toString(),
      ...additionalParams,
    });
  };

  /**
   * af_level_achieved - Track when user achieves a level
   * @param level - Level achieved
   * @param score - Score associated with the achievement (optional)
   */
  const logLevelAchieved = async (level: number, score?: number) => {
    const params: Record<string, string> = {
      af_level: level.toString(),
    };
    if (score !== undefined) {
      params.af_score = score.toString();
    }
    await logEvent('af_level_achieved', params);
  };

  /**
   * af_share - Track when user shares content
   * @param description - Reason for sharing
   * @param platform - Platform used for sharing (e.g., "Facebook", "WhatsApp", "email")
   */
  const logShare = async (description: string, platform: string) => {
    await logEvent('af_share', {
      af_description: description,
      platform: platform,
    });
  };

  /**
   * af_invite - Track when user invites a friend
   * @param description - Context of invitation
   */
  const logInvite = async (description: string) => {
    await logEvent('af_invite', {
      af_description: description,
    });
  };

  /**
   * Set Client ID (CUID) - Recommended by AppsFlyer for better attribution
   * @param userId - User ID to set as Client ID
   */
  const setCustomerUserId = async (userId: string) => {
    try {
      await appsFlyer.setCustomerUserId(userId);
      console.log('AppsFlyer Client ID défini:', userId);
    } catch (error) {
      console.error('Erreur lors de la définition du Client ID:', error);
    }
  };

  return {
    logEvent,
    logLogin,
    logCompleteRegistration,
    logPurchase,
    logLevelAchieved,
    logShare,
    logInvite,
    setCustomerUserId,
  };
}; 