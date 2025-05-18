import * as functions from 'firebase-functions/v2';
import { admin } from './firebase-admin-init';

async function deleteCollection(collectionPath: string) {
  const collectionRef = admin.firestore().collection(collectionPath);
  const snapshot = await collectionRef.get();
  const batchSize = 500;
  let deleted = 0;

  while (!snapshot.empty) {
    const batch = admin.firestore().batch();
    snapshot.docs.slice(0, batchSize).forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    deleted += snapshot.docs.length;
    if (snapshot.docs.length < batchSize) break;
  }
  return deleted;
}

export const scheduledDeleteCollections = functions.scheduler.onSchedule({
  schedule: '0 6 * * *', // Tous les jours à 6h du matin
  timeZone: 'Europe/Paris',
  region: 'europe-west1'
}, async (event) => {
  await deleteCollection('rooms');
  await deleteCollection('games');
  console.log('Collections rooms et games supprimées !');
}); 