"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { signInWithPseudo } from '../services/auth';

interface AuthContextType {
  user: User | null;
  signIn: (username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Écouter les changements d'état de l'authentification
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (username: string) => {
    try {
      await signInWithPseudo(username);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la connexion');
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error: any) {
      throw new Error('Erreur lors de la déconnexion');
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
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
