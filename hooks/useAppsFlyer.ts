import { useEffect } from 'react';
import appsFlyer from 'react-native-appsflyer';

const APPSFLYER_DEV_KEY = 'gA54F938iBNhpDafLAYZ6F';
const APPSFLYER_APP_ID = 'com.emplica.nightly';

export const useAppsFlyer = () => {
  useEffect(() => {
    const initAppsFlyer = async () => {
      try {
        const options = {
          devKey: APPSFLYER_DEV_KEY,
          appId: APPSFLYER_APP_ID,
          isDebug: __DEV__,
        };

        await appsFlyer.initSdk(options);
        console.log('AppsFlyer SDK initialisé avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation d\'AppsFlyer:', error);
      }
    };

    initAppsFlyer();
  }, []);

  const logEvent = async (eventName: string, eventValues: Record<string, any> = {}) => {
    try {
      await appsFlyer.logEvent(eventName, eventValues);
      console.log(`Événement AppsFlyer enregistré: ${eventName}`);
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement de l'événement ${eventName}:`, error);
    }
  };

  return {
    logEvent,
  };
}; 