import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Authentifie un utilisateur avec un pseudo
 * @param pseudo - Le pseudo de l'utilisateur
 * @returns L'UID de l'utilisateur
 * @throws Error si le pseudo est déjà pris
 */
export async function signInWithPseudo(pseudo: string): Promise<string> {
  const trimmedPseudo = pseudo.trim().toLowerCase();

  // Vérifie si le pseudo est déjà pris
  const existing = await firestore().collection('usernames').doc(trimmedPseudo).get();
  if (existing.exists()) {
    throw new Error('Pseudo déjà pris');
  }

  // Connexion anonyme
  const userCredential = await auth().signInAnonymously();
  const uid = userCredential.user.uid;

  // Sauvegarde du pseudo lié à l'UID
  await firestore().collection('usernames').doc(trimmedPseudo).set({
    uid: uid,
    createdAt: new Date().toISOString(),
  });

  // Sauvegarde des informations de l'utilisateur
  await firestore().collection('users').doc(uid).set({
    pseudo: trimmedPseudo,
    createdAt: new Date().toISOString(),
  });

  return uid;
}

/**
 * Vérifie si un pseudo est disponible
 * @param pseudo - Le pseudo à vérifier
 * @returns true si le pseudo est disponible, false sinon
 */
export async function isPseudoAvailable(pseudo: string): Promise<boolean> {
  const trimmedPseudo = pseudo.trim().toLowerCase();
  const existing = await firestore().collection('usernames').doc(trimmedPseudo).get();
  return !existing.exists();
}