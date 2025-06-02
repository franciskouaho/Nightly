import { admin } from './firebase-admin-init';
import * as functions from 'firebase-functions';
import { CallableRequest } from 'firebase-functions/v2/https';

interface UserData {
  uid: string;
  pseudo?: string;
}

export const deleteUser = functions.https.onCall(async (request: CallableRequest<UserData>) => {
  // Vérification de l'authentification
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Vous devez être authentifié pour effectuer cette action'
    );
  }

  const { uid } = request.data;
  if (!uid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'L\'UID de l\'utilisateur est requis'
    );
  }

  try {
    const db = admin.firestore();
    const batch = db.batch();

    // Supprimer l'utilisateur de la collection users
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Utilisateur non trouvé'
      );
    }

    const userData = userDoc.data();
    if (userData?.pseudo) {
      // Supprimer l'entrée dans la collection usernames
      const usernameRef = db.collection('usernames').doc(userData.pseudo.toLowerCase());
      batch.delete(usernameRef);
    }

    // Supprimer l'utilisateur
    batch.delete(userRef);

    // Exécuter la transaction
    await batch.commit();

    return { success: true, message: 'Utilisateur supprimé avec succès' };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Une erreur est survenue lors de la suppression de l\'utilisateur'
    );
  }
});

export const setAnnualSubscription = functions.https.onCall(async (request: CallableRequest<UserData>) => {
  // Vérification de l'authentification
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Vous devez être authentifié pour effectuer cette action'
    );
  }

  const { uid } = request.data;
  if (!uid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'L\'UID de l\'utilisateur est requis'
    );
  }

  try {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Utilisateur non trouvé'
      );
    }

    // Calculer la date d'expiration (1 an à partir de maintenant)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    // Mettre à jour l'utilisateur avec l'abonnement annuel
    await userRef.update({
      hasActiveSubscription: true,
      subscriptionType: 'annual',
      subscriptionUpdatedAt: oneYearFromNow.toISOString()
    });

    return {
      success: true,
      message: 'Abonnement annuel activé avec succès',
      subscriptionExpiresAt: oneYearFromNow.toISOString()
    };
  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'abonnement:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Une erreur est survenue lors de l\'activation de l\'abonnement'
    );
  }
}); 