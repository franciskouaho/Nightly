import * as admin from 'firebase-admin';
import * as serviceAccount from '../serviceAccountKey.json';

// Initialise Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

async function main() {
  const db = admin.firestore();
  const usersSnapshot = await db.collection('users').where('isActive', '==', true).get();

  const tokens: { token: string; userId: string }[] = [];
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.notificationToken) {
      tokens.push({ token: data.notificationToken, userId: doc.id });
    }
  });

  if (tokens.length === 0) {
    console.log('Aucun token FCM trouvé.');
    return;
  }

  const payload = {
    notification: {
      title: "C'est l'heure de l'apéro…",
      body: 'Tu lances la partie ?',
    },
  };

  const messages = tokens.map(({ token }) => ({
    token,
    notification: payload.notification,
    android: {
      priority: 'high' as const,
      notification: {
        sound: 'default'
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default'
        }
      }
    }
  }));

  const results = await Promise.allSettled(
    messages.map(message => admin.messaging().send(message))
  );
  
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const failureCount = results.filter(r => r.status === 'rejected').length;
  
  console.log('Notifications envoyées:', successCount, 'réussies,', failureCount, 'échecs');

  // Gérer les tokens invalides
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'rejected') {
      const error = result.reason as Error & { code?: string };
      if (error.code === 'messaging/registration-token-not-registered' || 
          error.code === 'messaging/third-party-auth-error') {
        console.log(`Token invalide ou problème d'authentification pour l'utilisateur ${tokens[i].userId}, suppression...`);
        try {
          await db.collection('users').doc(tokens[i].userId).update({
            notificationToken: admin.firestore.FieldValue.delete()
          });
          console.log(`Token supprimé pour l'utilisateur ${tokens[i].userId}`);
        } catch (updateError) {
          console.error(`Erreur lors de la suppression du token pour l'utilisateur ${tokens[i].userId}:`, updateError);
        }
      } else {
        console.error(`Erreur pour le token ${tokens[i].token}:`, error);
      }
    }
  }
}

main().catch(console.error); 