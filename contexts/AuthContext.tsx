"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';
import { useFirestore } from '@/hooks/useFirestore';

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
  const { get: getUsername } = useFirestore<Username>('usernames');
  const { get: getUser } = useFirestore<User>('users');

  useEffect(() => {
    // Écouter les changements d'état de l'authentification
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Récupérer les données utilisateur depuis Firestore
        const userData = await getUser(firebaseUser.uid);
        if (userData) {
          setUser(userData);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithPseudo = async (pseudo: string): Promise<string> => {
    const trimmedPseudo = pseudo.trim().toLowerCase();

    // Vérifie si le pseudo est déjà pris
    const existingUsername = await getUsername(trimmedPseudo);
    if (existingUsername) {
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

    const userData: User = {
      uid,
      pseudo: trimmedPseudo,
      createdAt: new Date().toISOString(),
    };

    await firestore().collection('users').doc(uid).set(userData);
    setUser(userData);

    return uid;
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
      await auth().signOut();
      setUser(null);
    } catch (error: any) {
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
