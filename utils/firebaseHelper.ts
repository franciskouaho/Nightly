import { getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

/**
 * Vérifie la connectivité avec Firestore
 * @returns Promise avec un état de connexion
 */
export const testFirestoreConnection = async (timeoutMs = 5000): Promise<boolean> => {
  const db = getFirestore(getApp());
  
  try {
    // Créer une requête légère qui se termine rapidement
    const testQuery = query(collection(db, 'rooms'), limit(1));
    
    // Créer une promesse avec timeout
    const queryPromise = new Promise<boolean>(async (resolve, reject) => {
      try {
        const querySnapshot = await getDocs(testQuery);
        console.log(`✅ Test de connexion Firestore réussi, ${querySnapshot.size} documents récupérés`);
        resolve(true);
      } catch (error) {
        console.error('❌ Erreur de connexion Firestore:', error);
        reject(error);
      }
    });
    
    // Ajouter un timeout
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Connexion Firestore timeout après ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    // Utiliser Promise.race pour implémenter le timeout
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (error) {
    console.error('❌ Test de connexion Firestore échoué:', error);
    return false;
  }
};

/**
 * Nettoie un objet pour le rendre sérialisable pour Firestore
 */
export const sanitizeForFirestore = (obj: any): any => {
  // Si l'objet est null ou undefined, le retourner tel quel
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Si c'est un Date, le convertir en string ISO
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  // Si c'est un tableau, nettoyer chaque élément
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }
  
  // Si c'est un objet, nettoyer chaque propriété
  if (typeof obj === 'object') {
    const cleanObj: Record<string, any> = {};
    
    Object.keys(obj).forEach(key => {
      // Ignorer les fonctions et autres types non sérialisables
      const value = obj[key];
      if (typeof value !== 'function' && typeof value !== 'symbol') {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    });
    
    return cleanObj;
  }
  
  // Retourner les types primitifs tels quels
  return obj;
};
