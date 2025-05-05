import * as admin from 'firebase-admin';
import * as serviceAccount from '../serviceAccountKey.json';

// Initialise Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

async function main() {
  const db = admin.firestore();
  const usersSnapshot = await db.collection('users').where('isActive', '==', true).get();

  const tokens: string[] = [];
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.notificationToken) {
      tokens.push(data.notificationToken);
    }
  });

  if (tokens.length === 0) {
    console.log('Aucun token FCM trouvé.');
    return;
  }

  const payload = {
    notification: {
      title: 'Test FCM à tous',
      body: 'Ceci est une notification envoyée à tous les utilisateurs actifs.',
    },
  };

  const messages = tokens.map(token => ({
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

  const results = await Promise.all(
    messages.map(message => admin.messaging().send(message))
  );
  
  const successCount = results.filter(r => r !== null).length;
  const failureCount = results.filter(r => r === null).length;
  
  console.log('Notifications envoyées:', successCount, 'réussies,', failureCount, 'échecs');
  if (failureCount > 0) {
    results.forEach((result, idx) => {
      if (result === null) {
        console.error('Erreur pour le token', tokens[idx]);
      }
    });
  }
}

main().catch(console.error); 