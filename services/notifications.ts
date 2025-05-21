import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const NOTIFICATION_TOKEN_KEY = '@nightly:notification_token';

export class NotificationService {
  private static instance: NotificationService;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    try {
      // Enregistrer l'appareil pour les messages distants
      await messaging().registerDeviceForRemoteMessages();
      
      // Demander la permission pour les notifications
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        // Récupérer le token FCM
        const token = await messaging().getToken();
        await this.saveToken(token);
        
        // Configurer les gestionnaires de notifications
        this.setupNotificationHandlers();
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
      this.token = token;
      
      // Afficher le token dans la console pour le copier
      console.log('=== VOTRE TOKEN FCM ===');
      console.log(token);
      console.log('======================');
      
      // Enregistrer le token dans Firestore pour l'utilisateur courant
      const user = auth().currentUser;
      console.log('Utilisateur courant pour enregistrement FCM:', user);
      if (user) {
        await firestore().collection('users').doc(user.uid).set(
          {
            notificationToken: token,
            isActive: true,
            lastNotificationDate: new Date(),
          },
          { merge: true }
        );
        console.log('Token FCM enregistré dans Firestore pour l\'utilisateur', user.uid);
      } else {
        console.warn('Aucun utilisateur connecté, impossible d\'enregistrer le token FCM dans Firestore.');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  private setupNotificationHandlers() {
    // Gestionnaire pour les notifications reçues en premier plan
    messaging().onMessage(async remoteMessage => {
      // TODO: Implémenter l'affichage de la notification en premier plan
      console.log('Notification reçue en premier plan:', remoteMessage);
    });

    // Gestionnaire pour les notifications qui ouvrent l'application
    messaging().onNotificationOpenedApp(remoteMessage => {
      // TODO: Implémenter la navigation vers la bonne écran
      console.log('Application ouverte par notification:', remoteMessage);
    });

    // Vérifier si l'application a été ouverte par une notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          // TODO: Implémenter la navigation vers la bonne écran
          console.log('Application ouverte par notification initiale:', remoteMessage);
        }
      });
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
    }
    return this.token;
  }
}

export default NotificationService.getInstance(); 