import NotificationService from '../services/notifications';

async function getFCMToken() {
  try {
    await NotificationService.initialize();
    const token = await NotificationService.getToken();
    console.log('Votre token FCM est:', token);
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
  }
}

getFCMToken(); 