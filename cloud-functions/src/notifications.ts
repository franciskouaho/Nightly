import * as functions from 'firebase-functions/v2';
import { admin } from './firebase-admin-init';

interface UserNotificationPreferences {
    lastNotificationDate: admin.firestore.Timestamp;
    notificationToken: string;
    isActive: boolean;
}

// Fonction pour envoyer une notification à un utilisateur
async function sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>
) {
    const message = {
        notification: {
            title,
            body,
        },
        data,
        token,
    };

    try {
        await admin.messaging().send(message);
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification:', error);
        return false;
    }
}

// Fonction programmée pour les notifications du week-end (vendredi et samedi à 20h)
export const sendWeekendNotifications = functions.scheduler.onSchedule(
    {
        schedule: '0 20 * * 5,6',
        timeZone: 'Europe/Paris',
        region: 'europe-west1'
    },
    async () => {
        console.log('sendWeekendNotifications triggered');
        const db = admin.firestore();
        const usersRef = db.collection('users');
        const now = admin.firestore.Timestamp.now();

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

        const snapshot = await usersRef.where('isActive', '==', true).get();
        console.log(`Utilisateurs actifs trouvés : ${snapshot.size}`);
        if (snapshot.empty) return;

        const batch = db.batch();
        const promises: Promise<boolean>[] = [];

        snapshot.forEach((doc) => {
            const userData = doc.data() as UserNotificationPreferences;
            const message = messages[Math.floor(Math.random() * messages.length)];

            promises.push(
                sendNotification(
                    userData.notificationToken,
                    message.title,
                    message.body,
                    { type: 'weekend_reminder' }
                )
            );
            batch.update(doc.ref, { lastNotificationDate: now });
        });

        await Promise.all(promises);
        await batch.commit();
        console.log('Notifications weekend envoyées.');
    }
);

export const sendSundayNotification = functions.scheduler.onSchedule(
    {
        schedule: '30 20 * * 0',
        timeZone: 'Europe/Paris',
        region: 'europe-west1'
    },
    async () => {
        console.log('sendSundayNotification triggered');
        const db = admin.firestore();
        const usersRef = db.collection('users');
        const now = admin.firestore.Timestamp.now();

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

        const snapshot = await usersRef.where('isActive', '==', true).get();
        console.log(`Utilisateurs actifs trouvés : ${snapshot.size}`);
        if (snapshot.empty) return;

        const batch = db.batch();
        const promises: Promise<boolean>[] = [];

        snapshot.forEach((doc) => {
            const userData = doc.data() as UserNotificationPreferences;
            const message = messages[Math.floor(Math.random() * messages.length)];

            promises.push(
                sendNotification(
                    userData.notificationToken,
                    message.title,
                    message.body,
                    { type: 'sunday_reminder' }
                )
            );
            batch.update(doc.ref, { lastNotificationDate: now });
        });

        await Promise.all(promises);
        await batch.commit();
        console.log('Notifications dimanche envoyées.');
    }
);

// Fonction pour envoyer une notification de nouveau contenu
export const sendNewContentNotification = functions.https.onCall(
    { region: 'europe-west1' },
    async (request) => {
        if (!request.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'L\'utilisateur doit être authentifié'
            );
        }

        const db = admin.firestore();
        const usersRef = db.collection('users');
        const now = admin.firestore.Timestamp.now();

        const message = request.data.contentType === 'challenge'
            ? {
                title: "Nouveau défi dans HOT 18+",
                body: "Oseras-tu le relever ?",
            }
            : {
                title: "Nouveau pack 'Blind Test Apéro'",
                body: "Dispo dès maintenant !",
            };

        const batch = db.batch();
        const promises: Promise<boolean>[] = [];

        for (const userId of request.data.userIds) {
            const userDoc = await usersRef.doc(userId).get();
            const userData = userDoc.data() as UserNotificationPreferences;

            if (userData?.isActive && userData?.notificationToken) {
                promises.push(
                    sendNotification(
                        userData.notificationToken,
                        message.title,
                        message.body,
                        { type: 'new_content', contentType: request.data.contentType }
                    )
                );
                batch.update(userDoc.ref, { lastNotificationDate: now });
            }
        }

        await Promise.all(promises);
        await batch.commit();
        console.log('Notifications de nouveau contenu envoyées.');
    }
);

// Fonction pour envoyer une notification d'événement spécial
export const sendEventNotification = functions.https.onCall(
    { region: 'europe-west1' },
    async (request) => {
        if (!request.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'L\'utilisateur doit être authentifié'
            );
        }

        const db = admin.firestore();
        const usersRef = db.collection('users');
        const now = admin.firestore.Timestamp.now();

        let message = { title: '', body: '' };
        switch (request.data.eventType) {
            case 'halloween':
                message = {
                    title: "Nuit spéciale ce soir !",
                    body: "Le mode Halloween est activé…",
                };
                break;
            case 'valentine':
                message = {
                    title: "Saint-Valentin",
                    body: "Des cartes coquines t'attendent ce 14 février…",
                };
                break;
            case 'newyear':
                message = {
                    title: "Bonne année !",
                    body: "Découvre les nouveaux défis de la nouvelle année !",
                };
                break;
            default:
                throw new functions.https.HttpsError('invalid-argument', 'Type d\'événement inconnu');
        }

        const snapshot = await usersRef.where('isActive', '==', true).get();
        console.log(`Utilisateurs actifs trouvés : ${snapshot.size}`);
        if (snapshot.empty) return;

        const batch = db.batch();
        const promises: Promise<boolean>[] = [];

        snapshot.forEach((doc) => {
            const userData = doc.data() as UserNotificationPreferences;

            if (userData.notificationToken) {
                promises.push(
                    sendNotification(
                        userData.notificationToken,
                        message.title,
                        message.body,
                        { type: 'special_event', eventType: request.data.eventType }
                    )
                );
                batch.update(doc.ref, { lastNotificationDate: now });
            }
        });

        await Promise.all(promises);
        await batch.commit();
        console.log(`Notifications événement "${request.data.eventType}" envoyées.`);
    }
);
