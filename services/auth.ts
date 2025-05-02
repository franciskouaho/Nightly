import { signInAnonymously } from 'firebase/auth';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Authentifie un utilisateur avec un pseudo
 * @param pseudo - Le pseudo de l'utilisateur
 * @returns L'UID de l'utilisateur
 * @throws Error si le pseudo est déjà pris
 */
export async function signInWithPseudo(pseudo: string): Promise<string> {
  const trimmedPseudo = pseudo.trim().toLowerCase();

  // Vérifie si le pseudo est déjà pris
  const existing = await getDoc(doc(db, 'usernames', trimmedPseudo));
  if (existing.exists()) {
    throw new Error('Pseudo déjà pris');
  }

  // Connexion anonyme
  const userCredential = await signInAnonymously(auth);
  const uid = userCredential.user.uid;

  // Sauvegarde du pseudo lié à l'UID
  await setDoc(doc(db, 'usernames', trimmedPseudo), {
    uid: uid,
    createdAt: new Date().toISOString(),
  });

  // Sauvegarde des informations de l'utilisateur
  await setDoc(doc(db, 'users', uid), {
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
  const existing = await getDoc(doc(db, 'usernames', trimmedPseudo));
  return !existing.exists();
} 