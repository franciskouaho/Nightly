import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const useNotifications = () => {
  const [notificationToken, setNotificationToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Demander la permission pour les notifications
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        setIsPermissionGranted(enabled);

        if (enabled) {
          // Récupérer le token FCM
          const token = await messaging().getToken();
          setNotificationToken(token);

          // Enregistrer le token dans Firestore
          const user = auth().currentUser;
          if (user) {
            await firestore().collection('users').doc(user.uid).update({
              notificationToken: token,
              isActive: true,
              lastNotificationDate: firestore.FieldValue.serverTimestamp(),
            });
          }

          // Configurer les gestionnaires de notifications
          messaging().onMessage(async remoteMessage => {
            // TODO: Implémenter l'affichage de la notification en premier plan
            console.log('Notification reçue en premier plan:', remoteMessage);
          });

          messaging().onNotificationOpenedApp(remoteMessage => {
            // TODO: Implémenter la navigation vers la bonne écran
            console.log('Application ouverte par notification:', remoteMessage);
          });

          // Vérifier si l'application a été ouverte par une notification
          const initialNotification = await messaging().getInitialNotification();
          if (initialNotification) {
            // TODO: Implémenter la navigation vers la bonne écran
            console.log('Application ouverte par notification initiale:', initialNotification);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des notifications:', error);
      }
    };

    initializeNotifications();

    // Nettoyer lors du démontage
    return () => {
      // Désactiver les notifications lors de la déconnexion
      const user = auth().currentUser;
      if (user) {
        firestore().collection('users').doc(user.uid).update({
          isActive: false,
        });
      }
    };
  }, []);

  return {
    notificationToken,
    isPermissionGranted,
  };
}; 