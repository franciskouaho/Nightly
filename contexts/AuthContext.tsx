"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInAnonymously } from '@react-native-firebase/auth';
import { collection, doc, getDoc, setDoc, getFirestore } from '@react-native-firebase/firestore';
import { useAnalytics } from '@/hooks/useAnalytics';

interface User {
  uid: string;
  pseudo: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (pseudo: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { identifyUser, resetUser, trackEvent } = useAnalytics();

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

  const signIn = async (pseudo: string) => {
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
        createdAt: new Date().toISOString()
      });

      // Sauvegarder les informations de l'utilisateur
      const userData = {
        uid,
        pseudo,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', uid), userData);
      setUser(userData);

      // Track sign in event
      trackEvent('user_signed_in', {
        pseudo,
        uid
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
      setUser(null);
      resetUser();
      trackEvent('user_signed_out');
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
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
