"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInAnonymously } from '@react-native-firebase/auth';
import { collection, doc, getDoc, setDoc, getFirestore } from '@react-native-firebase/firestore';
import { useAnalytics } from '@/hooks/useAnalytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  uid: string;
  pseudo: string;
  createdAt: string;
  avatar: string;
  points: number;
  hasActiveSubscription?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (pseudo: string, avatar: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@nightly_user_uid';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { identifyUser, resetUser, trackEvent } = useAnalytics();

  const saveUserUid = async (uid: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, uid);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de l\'UID:', err);
    }
  };

  const restoreSession = async () => {
    try {
      const savedUid = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedUid) {
        const auth = getAuth();
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', savedUid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          identifyUser(userData.uid, {
            pseudo: userData.pseudo,
            createdAt: userData.createdAt
          });
        } else {
          // Si l'utilisateur n'existe plus dans la base de données
          await AsyncStorage.removeItem(STORAGE_KEY);
          await auth.signOut();
          setUser(null);
          resetUser();
          throw new Error('Compte introuvable');
        }
      }
    } catch (err) {
      console.error('Erreur lors de la restauration de la session:', err);
      // En cas d'erreur, on nettoie les données locales
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
      resetUser();
      throw err;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await restoreSession();
      } catch (err) {
        console.log('Aucune session précédente trouvée');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            await saveUserUid(firebaseUser.uid);
            identifyUser(userData.uid, {
              pseudo: userData.pseudo,
              createdAt: userData.createdAt
            });
          }
        } catch (err) {
          setError(err as Error);
        }
      } else {
        setUser(null);
        resetUser();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (pseudo: string, avatar: string) => {
    try {
      setLoading(true);
      const auth = getAuth();
      const db = getFirestore();
      
      // Vérifier si le pseudo est déjà pris
      const usernameDoc = await getDoc(doc(db, 'usernames', pseudo.toLowerCase()));
      if (usernameDoc.exists()) {
        throw new Error('Ce pseudo est déjà pris');
      }

      // Connexion anonyme
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      // Sauvegarder le pseudo
      await setDoc(doc(db, 'usernames', pseudo.toLowerCase()), {
        uid,
        createdAt: new Date().toISOString(),
        avatar,
      });

      // Sauvegarder les informations de l'utilisateur
      const userData = {
        uid,
        pseudo,
        createdAt: new Date().toISOString(),
        avatar,
        points: 0,
      };
      await setDoc(doc(db, 'users', uid), userData);
      await saveUserUid(uid);
      setUser(userData);

      // Track sign in event
      trackEvent('user_signed_in', {
        pseudo,
        uid,
        avatar,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
      
      // Ne pas effacer l'UID sauvegardé
      // await AsyncStorage.clear();
      
      // Réinitialiser l'état
      setUser(null);
      resetUser();
      trackEvent('user_signed_out');
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut, setUser, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
