export interface NotificationMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class NotificationScheduler {
  // Messages pour les rappels festifs (vendredi et samedi)
  static getWeekendReminder(): NotificationMessage {
    const messages = [
      {
        title: "C'est l'heure de l'apéro…",
        body: "Tu lances la partie ?",
      },
      {
        title: "Soirée en vue ?",
        body: "Pense à chauffer l'ambiance avec Nightly !",
      },
    ];
    return messages[Math.floor(Math.random() * messages.length)] as NotificationMessage;
  }

  // Messages pour les nouveaux contenus
  static getNewContentNotification(contentType: 'challenge' | 'pack'): NotificationMessage {
    if (contentType === 'challenge') {
      return {
        title: "Nouveau défi dans HOT 18+",
        body: "Oseras-tu le relever ?",
      };
    }
    return {
      title: "Nouveau pack 'Blind Test Apéro'",
      body: "Dispo dès maintenant !",
    };
  }

  // Messages pour la relance après inactivité
  static getInactivityReminder(): NotificationMessage {
    const messages = [
      {
        title: "Tes amis t'attendent",
        body: "Nightly ne fait pas la fête sans toi !",
      },
      {
        title: "Une partie, un fou rire, un souvenir",
        body: "Tu relances Nightly ?",
      },
    ];
    return messages[Math.floor(Math.random() * messages.length)] as NotificationMessage;
  }

  // Messages pour les événements spéciaux
  static getEventNotification(eventType: 'halloween' | 'valentine' | 'newyear'): NotificationMessage {
    switch (eventType) {
      case 'halloween':
        return {
          title: "Nuit spéciale ce soir !",
          body: "Le mode Halloween est activé…",
        };
      case 'valentine':
        return {
          title: "Saint-Valentin",
          body: "Des cartes coquines t'attendent ce 14 février…",
        };
      case 'newyear':
        return {
          title: "Bonne année !",
          body: "Découvre les nouveaux défis de la nouvelle année !",
        };
    }
  }

  // Fonction pour vérifier si on peut envoyer une notification
  static canSendNotification(lastNotificationDate: Date): boolean {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastNotificationDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays >= 3; // Maximum 2 notifications par semaine
  }

  // Fonction pour obtenir le prochain moment d'envoi de notification
  static getNextNotificationTime(): Date {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    // Si c'est vendredi ou samedi après 18h
    if ((day === 5 || day === 6) && hour >= 18) {
      return new Date(now.setHours(18, 0, 0, 0));
    }

    // Si c'est vendredi ou samedi avant 18h
    if (day === 5 || day === 6) {
      return new Date(now.setHours(18, 0, 0, 0));
    }

    // Sinon, programmer pour le prochain vendredi à 18h
    const daysUntilFriday = (5 - day + 7) % 7;
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    nextFriday.setHours(18, 0, 0, 0);
    return nextFriday;
  }
}

export default NotificationScheduler; 