import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { ExpoNotificationService } from '@/services/expoNotificationService';

export const useExpoNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const [lastNotificationResponse, setLastNotificationResponse] = useState<Notifications.NotificationResponse | null>(null);

  useEffect(() => {
    // Initialiser le service de notifications
    const initializeNotifications = async () => {
      try {
        // Vérifier les permissions
        const { status } = await Notifications.getPermissionsAsync();
        setIsPermissionGranted(status === 'granted');

        if (status === 'granted') {
          // Initialiser le service Expo
          const notificationService = ExpoNotificationService.getInstance();
          await notificationService.initialize();
          
          // Récupérer le token
          const token = await notificationService.getToken();
          setExpoPushToken(token);

          // Configurer les gestionnaires
          const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            setLastNotificationResponse(response);
            console.log('📱 Notification response:', response);
          });

          return () => subscription.remove();
        }
        return undefined;
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des notifications Expo:', error);
        return undefined;
      }
    };

    initializeNotifications();
  }, []);

  // Fonction pour envoyer une notification locale
  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    try {
      const notificationService = ExpoNotificationService.getInstance();
      await notificationService.scheduleLocalNotification(title, body, data);
      console.log('✅ Notification locale envoyée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification locale:', error);
    }
  };

  // Fonction pour programmer une notification
  const scheduleNotification = async (title: string, body: string, seconds: number, data?: any) => {
    try {
      const notificationService = ExpoNotificationService.getInstance();
      await notificationService.scheduleDelayedNotification(title, body, seconds, data);
      console.log(`✅ Notification programmée dans ${seconds} secondes`);
    } catch (error) {
      console.error('❌ Erreur lors de la programmation de la notification:', error);
    }
  };

  // Fonction pour annuler toutes les notifications
  const cancelAllNotifications = async () => {
    try {
      const notificationService = ExpoNotificationService.getInstance();
      await notificationService.cancelAllNotifications();
      console.log('✅ Toutes les notifications annulées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation des notifications:', error);
    }
  };

  // Fonction spéciale pour les notifications Halloween Quiz
  const sendHalloweenQuizNotification = async (title: string, body: string, data?: any) => {
    try {
      const notificationService = ExpoNotificationService.getInstance();
      await notificationService.scheduleHalloweenQuizNotification(title, body, data);
      console.log('🎃 Notification Halloween Quiz envoyée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification Halloween Quiz:', error);
    }
  };

  return {
    expoPushToken,
    isPermissionGranted,
    lastNotificationResponse,
    sendLocalNotification,
    scheduleNotification,
    sendHalloweenQuizNotification,
    cancelAllNotifications,
  };
};
