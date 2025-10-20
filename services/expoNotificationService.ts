import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HalloweenTheme from '@/constants/themes/Halloween';

const NOTIFICATION_TOKEN_KEY = '@nightly:expo_notification_token';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class ExpoNotificationService {
  private static instance: ExpoNotificationService;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): ExpoNotificationService {
    if (!ExpoNotificationService.instance) {
      ExpoNotificationService.instance = new ExpoNotificationService();
    }
    return ExpoNotificationService.instance;
  }

  async initialize() {
    try {
      console.log('🎯 Initialisation des notifications Expo...');
      
      // Vérifier si c'est un appareil physique
      if (!Device.isDevice) {
        console.warn('⚠️ Les notifications push ne fonctionnent que sur un appareil physique');
        return false;
      }

      // Demander les permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('🔐 Demande de permissions de notification...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Permission de notification refusée - Status:', finalStatus);
        return false;
      }

      console.log('✅ Permissions de notification accordées');

      // Obtenir le token Expo Push
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '3de41614-7f99-4215-bec0-9a2ece4bbd35', // Project ID Expo correct
      });

      console.log('🎯 Token Expo Push obtenu:', token.data);
      
      // Sauvegarder le token
      await this.saveToken(token.data);
      
      // Configurer les gestionnaires
      this.setupNotificationHandlers();

      // Configurer les canaux de notification pour Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      console.log('✅ Notifications Expo initialisées avec succès');
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des notifications Expo:', error);
      return false;
    }
  }

  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
      this.token = token;
      
      console.log('=== VOTRE TOKEN EXPO PUSH ===');
      console.log(token);
      console.log('=============================');
      
      // Token sauvegardé localement pour utilisation future
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du token:', error);
    }
  }

  private async setupAndroidChannels() {
    await Notifications.setNotificationChannelAsync('game-invites', {
      name: '🎃 Invitations de jeu',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6F00",
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('game-updates', {
      name: '🕸️ Mises à jour de jeu',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6F00",
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('general', {
      name: '🎃 Général',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('halloween', {
      name: '🎃 Halloween',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6F00",
      sound: 'default',
    });
  }

  private setupNotificationHandlers() {
    // Gestionnaire pour les notifications reçues
    Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification reçue:', notification);
    });

    // Gestionnaire pour les notifications sur lesquelles on clique
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée:', response);
      // TODO: Implémenter la navigation
    });
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
    }
    return this.token;
  }

  // Vérifier si les notifications sont activées
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const token = await this.getToken();
      return status === 'granted' && !!token;
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  // Désactiver complètement les notifications
  async disableNotifications(): Promise<void> {
    try {
      // Annuler toutes les notifications programmées
      await this.cancelAllNotifications();
      
      // Supprimer le token du stockage local
      await AsyncStorage.removeItem(NOTIFICATION_TOKEN_KEY);
      this.token = null;
      
      console.log('🔕 Notifications désactivées');
    } catch (error) {
      console.error('Erreur lors de la désactivation des notifications:', error);
    }
  }

  // Méthode pour envoyer une notification locale avec thème Halloween
  async scheduleLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🎃 ${title}`,
        body: `🕸️ ${body}`,
        data: {
          ...data,
          theme: 'halloween',
          color: "#FF6F00",
        },
        sound: 'default',
        color: "#FF6F00",
      },
      trigger: null, // Immédiat
    });
  }

  // Méthode pour envoyer une notification différée avec thème Halloween
  async scheduleDelayedNotification(title: string, body: string, seconds: number, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🎃 ${title}`,
        body: `🕸️ ${body}`,
        data: {
          ...data,
          theme: 'halloween',
          color: "#FF6F00",
        },
        sound: 'default',
        color: "#FF6F00",
      },
      trigger: null,
    });
  }

  // Méthode spéciale pour les notifications Halloween Quiz
  async scheduleHalloweenQuizNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🎃 ${title}`,
        body: `🕸️ ${body}`,
        data: {
          ...data,
          theme: 'halloween-quiz',
          gameId: 'quiz-halloween',
          color: "#FF1744",
        },
        sound: 'default',
        color: "#FF1744",
      },
      trigger: null,
    });
  }

  // Méthode pour annuler toutes les notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export default ExpoNotificationService.getInstance();
