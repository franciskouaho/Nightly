"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';

interface User {
  uid: string;
  pseudo: string;
  createdAt: string;
}

interface Username {
  uid: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (username: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithPseudo: (pseudo: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Écouter les changements d'état de l'authentification
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Récupérer les données utilisateur depuis Firestore
          const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data() as User;
            setUser(userData);
          } else {
            console.error('❌ Document utilisateur non trouvé dans Firestore');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Erreur lors de la récupération des données utilisateur:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithPseudo = async (pseudo: string): Promise<string> => {
    const trimmedPseudo = pseudo.trim().toLowerCase();

    try {
      // Vérifie si le pseudo est déjà pris
      const usernameDoc = await firestore().collection('usernames').doc(trimmedPseudo).get();
      const usernameData = usernameDoc.data();
      
      if (usernameData) {
        // Vérifier si l'utilisateur associé à ce pseudo existe toujours
        const userDoc = await firestore().collection('users').doc(usernameData.uid).get();
        if (userDoc.exists) {
          throw new Error('Pseudo déjà pris');
        } else {
          // Si l'utilisateur n'existe plus, on peut supprimer l'ancien pseudo
          await firestore().collection('usernames').doc(trimmedPseudo).delete();
          console.log('✅ Ancien pseudo libéré car l\'utilisateur n\'existe plus');
        }
      }

      // Connexion anonyme
      const userCredential = await auth().signInAnonymously();
      const uid = userCredential.user.uid;

      // Sauvegarde du pseudo lié à l'UID
      await firestore().collection('usernames').doc(trimmedPseudo).set({
        uid: uid,
        createdAt: new Date().toISOString(),
      });

      const userData: User = {
        uid,
        pseudo: trimmedPseudo,
        createdAt: new Date().toISOString(),
      };

      await firestore().collection('users').doc(uid).set(userData);
      setUser(userData);

      return uid;
    } catch (error) {
      console.error('❌ Erreur lors de la connexion avec pseudo:', error);
      throw error;
    }
  };

  const signIn = async (username: string) => {
    try {
      await auth().signInWithEmailAndPassword(username, 'password'); // Example usage
    } catch (error: any) {
      throw new Error((error as FirebaseError).message || 'Erreur lors de la connexion');
    }
  };

  const signOut = async () => {
    try {
      // Si l'utilisateur est connecté, nettoyer toutes ses données
      if (user?.uid && user?.pseudo) {
        // Supprimer le pseudo de la collection usernames
        await firestore().collection('usernames').doc(user.pseudo).delete();
        console.log('✅ Pseudo supprimé de la collection usernames');

        // Supprimer l'utilisateur de la collection users
        await firestore().collection('users').doc(user.uid).delete();
        console.log('✅ Utilisateur supprimé de la collection users');

        // Supprimer toutes les salles créées par l'utilisateur
        const roomsQuery = await firestore()
          .collection('rooms')
          .where('createdBy', '==', user.uid)
          .get();

        const batch = firestore().batch();
        roomsQuery.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('✅ Salles de l\'utilisateur supprimées');
      }

      // Déconnecter l'utilisateur de Firebase Auth
      await auth().signOut();
      setUser(null);
      console.log('✅ Utilisateur déconnecté avec succès');
    } catch (error: any) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, signInWithPseudo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}
