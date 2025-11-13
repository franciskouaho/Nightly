import * as functions from 'firebase-functions/v2';
import { CallableRequest } from 'firebase-functions/v2/https';
import { admin } from './firebase-admin-init';

interface UserData {
  uid: string;
  pseudo?: string;
}

interface AwardLumiCoinsData {
  userId: string;
  amount: number;
  reason: string;
  rank_name: string;
}

interface PurchaseAssetData {
  assetId: string;
}

export const deleteUser = functions.https.onCall<UserData>(async (request: CallableRequest<UserData>) => {
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

export const setAnnualSubscription = functions.https.onCall<UserData>(async (request: CallableRequest<UserData>) => {
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

export const awardLumiCoins = functions.https.onCall<AwardLumiCoinsData>(async (request: CallableRequest<AwardLumiCoinsData>) => {
  const { userId, amount, reason, rank_name } = request.data;

  if (!userId || !amount || !reason) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'userId, amount et reason sont requis'
    );
  }

  if (amount <= 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Le montant doit être positif'
    );
  }

  try {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Utilisateur non trouvé'
      );
    }

    const userData = userDoc.data();
    const currentPoints = userData?.points || 0;
    const newPoints = currentPoints + amount;

    // Mettre à jour les points de l'utilisateur
    await userRef.update({
      points: newPoints,
    });

    // Enregistrer la transaction
    await db.collection('pointTransactions').add({
      userId,
      amount,
      previousBalance: currentPoints,
      newBalance: newPoints,
      reason,
      rank_name: rank_name || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ LumiCoins attribués: ${amount} à ${userId}. Nouveau total: ${newPoints}`);

    return {
      success: true,
      message: `${amount} LumiCoins attribués avec succès`,
      newBalance: newPoints,
      previousBalance: currentPoints
    };
  } catch (error) {
    console.error('Erreur lors de l\'attribution des LumiCoins:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Une erreur est survenue lors de l\'attribution des LumiCoins'
    );
  }
});

export const purchaseAsset = functions.https.onCall<PurchaseAssetData>(async (request: CallableRequest<PurchaseAssetData>) => {
    // Vérification de l'authentification
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Vous devez être authentifié pour effectuer cette action'
      );
    }

    const { assetId } = request.data;
    const userId = request.auth.uid;

  if (!assetId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'L\'ID de l\'asset est requis'
    );
  }

  try {
    const db = admin.firestore();

    // Utiliser une transaction pour garantir l'atomicité
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const assetRef = db.collection('assets').doc(assetId);

      // Récupérer les données de l'utilisateur et de l'asset
      const [userDoc, assetDoc] = await Promise.all([
        transaction.get(userRef),
        transaction.get(assetRef)
      ]);

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Utilisateur non trouvé'
        );
      }

      if (!assetDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Asset non trouvé'
        );
      }

      const userData = userDoc.data();
      const assetData = assetDoc.data();
      const userPoints = userData?.points || 0;
      const assetCost = assetData?.cost || 0;
      const unlockedAssets = userData?.unlockedAssets || [];

      // Vérifier si l'asset est déjà débloqué
      if (unlockedAssets.includes(assetId)) {
        throw new functions.https.HttpsError(
          'already-exists',
          'Cet asset est déjà débloqué'
        );
      }

      // Vérifier si l'utilisateur a assez de points
      if (userPoints < assetCost) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Points insuffisants. Vous avez ${userPoints} points, mais cet asset coûte ${assetCost} points.`
        );
      }

      // Calculer les nouveaux points
      const newPoints = userPoints - assetCost;

      // Mettre à jour l'utilisateur avec l'asset débloqué et les nouveaux points
      transaction.update(userRef, {
        points: newPoints,
        unlockedAssets: admin.firestore.FieldValue.arrayUnion(assetId)
      });

      // Enregistrer la transaction
      const purchaseRef = db.collection('purchases').doc(userId).collection('history').doc();
      transaction.set(purchaseRef, {
        assetId,
        assetName: assetData?.name || assetId,
        assetCost,
        previousBalance: userPoints,
        newBalance: newPoints,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        newPoints,
        previousPoints: userPoints,
        assetCost,
        assetName: assetData?.name || assetId
      };
    });

    console.log(`✅ Asset acheté: ${result.assetName} par ${userId}. Coût: ${result.assetCost}. Nouveau total: ${result.newPoints}`);

    return {
      success: true,
      message: 'Asset acheté avec succès',
      newPoints: result.newPoints,
      previousPoints: result.previousPoints,
      assetCost: result.assetCost
    };
  } catch (error) {
    console.error('Erreur lors de l\'achat d\'asset:', error);

    // Si c'est déjà une HttpsError, on la relance
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Une erreur est survenue lors de l\'achat de l\'asset'
    );
  }
});
