import * as Notifications from 'expo-notifications';
import HalloweenTheme from '@/constants/themes/Halloween';

// Messages Halloween répartis sur le mois avec heures spécifiques
const HALLOWEEN_NOTIFICATIONS = [
  {
    title: "🎃 Halloween approche !",
    body: "Viens jouer au Quiz Halloween et gagner des points effrayants !",
    delay: 3 * 24 * 60 * 60 * 1000, // 3 jours
    hour: 18, // 18h (soir)
  },
  {
    title: "🕸️ Toilettes d'araignées dans l'app !",
    body: "Découvre les nouvelles décorations Halloween dans Nightly !",
    delay: 7 * 24 * 60 * 60 * 1000, // 1 semaine
    hour: 20, // 20h (soirée)
  },
  {
    title: "👻 Nuit effrayante !",
    body: "Parfait pour jouer au Quiz Halloween avec tes amis !",
    delay: 10 * 24 * 60 * 60 * 1000, // 10 jours
    hour: 19, // 19h (soir)
  },
  {
    title: "🎭 Déguisements et jeux !",
    body: "Quel costume as-tu choisi ? Viens le partager dans l'app !",
    delay: 14 * 24 * 60 * 60 * 1000, // 2 semaines
    hour: 17, // 17h (fin d'après-midi)
  },
  {
    title: "🎃 Quiz Halloween spécial !",
    body: "Questions effrayantes t'attendent ! Es-tu prêt ?",
    delay: 21 * 24 * 60 * 60 * 1000, // 3 semaines
    hour: 21, // 21h (soirée)
  },
  {
    title: "🎃 Joyeux Halloween !",
    body: "C'est le grand jour ! Viens fêter avec le Quiz Halloween !",
    delay: 31 * 24 * 60 * 60 * 1000, // 31 jours (fin octobre)
    hour: 16, // 16h (après-midi)
  },
];

export class HalloweenNotificationScheduler {
  private static instance: HalloweenNotificationScheduler;

  private constructor() {}

  static getInstance(): HalloweenNotificationScheduler {
    if (!HalloweenNotificationScheduler.instance) {
      HalloweenNotificationScheduler.instance = new HalloweenNotificationScheduler();
    }
    return HalloweenNotificationScheduler.instance;
  }

  // Vérifier si on est en octobre
  private isOctober(): boolean {
    const now = new Date();
    return now.getMonth() === 9; // Octobre = mois 9 (0-indexé)
  }

  // Programmer toutes les notifications Halloween pour octobre
  async scheduleHalloweenNotifications() {
    if (!this.isOctober()) {
      console.log('🎃 Pas en octobre, notifications Halloween non programmées');
      return;
    }

    try {
      // Annuler toutes les notifications précédentes
      await this.cancelHalloweenNotifications();

      console.log('🎃 Programmation des notifications Halloween pour octobre...');

      for (let i = 0; i < HALLOWEEN_NOTIFICATIONS.length; i++) {
        const notification = HALLOWEEN_NOTIFICATIONS[i];
        if (!notification) continue;
        
        // Calculer la date de déclenchement avec l'heure spécifique
        const triggerDate = new Date();
        triggerDate.setDate(triggerDate.getDate() + (notification.delay / (24 * 60 * 60 * 1000)));
        triggerDate.setHours(notification.hour, 0, 0, 0); // Heure spécifique, minutes=0, secondes=0
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: {
              type: 'halloween-promotion',
              theme: 'halloween',
              gameId: 'quiz-halloween',
              color: HalloweenTheme.primary,
              notificationId: `halloween-${i + 1}`,
              scheduledTime: triggerDate.toISOString(),
            },
            sound: 'default',
            color: HalloweenTheme.primary,
          },
          trigger: triggerDate,
        });

        console.log(`🎃 Notification Halloween ${i + 1} programmée pour ${triggerDate.toLocaleDateString()} à ${notification.hour}h`);
      }

      console.log('✅ Toutes les notifications Halloween programmées !');
    } catch (error) {
      console.error('❌ Erreur lors de la programmation des notifications Halloween:', error);
    }
  }

  // Annuler toutes les notifications Halloween
  async cancelHalloweenNotifications() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === 'halloween-promotion') {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`🎃 Notification Halloween annulée: ${notification.identifier}`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation des notifications Halloween:', error);
    }
  }

  // Programmer une notification immédiate de test
  async scheduleTestHalloweenNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎃 Test Halloween !",
        body: "Les notifications Halloween fonctionnent parfaitement !",
        data: {
          type: 'halloween-test',
          theme: 'halloween',
          color: HalloweenTheme.primary,
        },
        sound: 'default',
        color: HalloweenTheme.primary,
      },
      trigger: null, // Immédiat
    });
  }

  // Obtenir le statut des notifications Halloween
  async getHalloweenNotificationsStatus() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const halloweenNotifications = scheduledNotifications.filter(
        n => n.content.data?.type === 'halloween-promotion'
      );
      
      return {
        total: halloweenNotifications.length,
        notifications: halloweenNotifications.map(n => ({
          id: n.identifier,
          title: n.content.title,
          trigger: n.trigger || null,
        })),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du statut:', error);
      return { total: 0, notifications: [] };
    }
  }
}

export default HalloweenNotificationScheduler.getInstance();
