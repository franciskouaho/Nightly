"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (username: string) => {
    try {
      // Vérifier si le pseudo existe déjà
      const usersRef = doc(db, 'users', username);
      const userDoc = await getDoc(usersRef);

      if (!userDoc.exists()) {
        // Si le pseudo n'existe pas, créer un nouvel utilisateur anonyme
        const userCredential = await signInAnonymously(auth);
        
        // Créer un document utilisateur dans Firestore
        await setDoc(usersRef, {
          username,
          createdAt: new Date(),
          uid: userCredential.user.uid
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
