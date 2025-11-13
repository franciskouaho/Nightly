"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { useAppsFlyer } from "@/hooks/useAppsFlyer";
import { usePostHog } from "@/hooks/usePostHog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    getAuth,
    onAuthStateChanged,
    signInAnonymously,
} from "@react-native-firebase/auth";
import {
    doc,
    getDoc,
    getFirestore,
    setDoc,
} from "@react-native-firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

const REVIEWER_PSEUDOS = ["reviewer_google", "reviewer_apple"];
const DEFAULT_AVATAR =
  "https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Frenard.png?alt=media&token=139ed01b-46f2-4f3e-9305-459841f2a893";

interface User {
  uid: string;
  pseudo: string;
  createdAt: string;
  avatar: string;
  points: number;
  hasActiveSubscription?: boolean;
  isReviewer?: boolean;
  isAdmin?: boolean;
  subscriptionType?: string;
  subscriptionUpdatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (pseudo: string, avatar: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  restoreSession: () => Promise<void>;
  firstLogin: (pseudo: string) => Promise<void>;
  checkExistingUser: (pseudo: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "@nightly_user_uid";
const DISCONNECTED_UID_KEY = "@nightly_disconnected_uid";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { identifyUser, resetUser, trackEvent } = useAnalytics();
  const { track, identify } = usePostHog();
  const { logLogin, logCompleteRegistration, setCustomerUserId } = useAppsFlyer();

  const saveUserUid = async (uid: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, uid);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de l'UID:", err);
    }
  };

  const saveDisconnectedUid = async (uid: string) => {
    try {
      await AsyncStorage.setItem(DISCONNECTED_UID_KEY, uid);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de l'UID déconnecté:", err);
    }
  };

  const getDisconnectedUid = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(DISCONNECTED_UID_KEY);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'UID déconnecté:", err);
      return null;
    }
  };

  const clearDisconnectedUid = async () => {
    try {
      await AsyncStorage.removeItem(DISCONNECTED_UID_KEY);
    } catch (err) {
      console.error("Erreur lors de la suppression de l'UID déconnecté:", err);
    }
  };


  const restoreSession = async () => {
    try {
      const authInstance = getAuth();
      const db = getFirestore();
      const savedUid = await AsyncStorage.getItem(STORAGE_KEY);
      const firebaseUser = authInstance.currentUser;

      const loadUserData = async (uid: string) => {
        const snapshot = await getDoc(doc(db, "users", uid));
        return snapshot.exists() ? (snapshot.data() as User) : null;
      };

      const applyUserToContext = async (uid: string, data: User) => {
        setUser(data);
        await saveUserUid(uid);
        identifyUser(data.uid, {
          pseudo: data.pseudo,
          createdAt: data.createdAt,
        });
        console.log("✅ Session restaurée avec UID:", uid);
      };

      // Cas 1 : utilisateur Firebase déjà authentifié → source de vérité
      if (firebaseUser) {
        let activeUserData = await loadUserData(firebaseUser.uid);

        // Cas 1.a : document manquant → tenter une migration depuis l'UID sauvegardé
        if (!activeUserData && savedUid && savedUid !== firebaseUser.uid) {
          const savedUserData = await loadUserData(savedUid);
          if (savedUserData) {
            const migratedData: User = {
              ...savedUserData,
              uid: firebaseUser.uid,
            };

            await setDoc(doc(db, "users", firebaseUser.uid), migratedData);
            await setDoc(
              doc(db, "usernames", savedUserData.pseudo.toLowerCase()),
              {
                uid: firebaseUser.uid,
                createdAt: savedUserData.createdAt,
                avatar: savedUserData.avatar,
              },
              { merge: true },
            );

            console.log(
              `🔁 Migration du profil ${savedUid} vers ${firebaseUser.uid}`,
            );
            activeUserData = migratedData;
          }
        }

        if (activeUserData) {
          // Vérifier si c'est un compte reviewer
          if (REVIEWER_PSEUDOS.includes(activeUserData.pseudo)) {
            console.log(
              "🤖 Session reviewer restaurée:",
              activeUserData.pseudo,
            );
          }
          await applyUserToContext(firebaseUser.uid, activeUserData);
          return;
        }

        // Aucun document associé à l'utilisateur Firebase → réinitialisation
        console.warn(
          "⚠️ Aucun document utilisateur correspondant à l'UID Firebase. Réinitialisation de la session locale.",
        );
        await AsyncStorage.removeItem(STORAGE_KEY);
        setUser(null);
        resetUser();
        return;
      }

      // Cas 2 : pas d'utilisateur Firebase, mais un UID sauvegardé localement
      if (savedUid) {
        const savedUserData = await loadUserData(savedUid);

        if (savedUserData) {
          if (REVIEWER_PSEUDOS.includes(savedUserData.pseudo)) {
            console.log("🤖 Session reviewer restaurée:", savedUserData.pseudo);
          }
          await applyUserToContext(savedUid, savedUserData);
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setUser(null);
          resetUser();
          throw new Error("Compte introuvable");
        }
      }
    } catch (err) {
      console.error("Erreur lors de la restauration de la session:", err);
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
        console.log("Aucune session précédente trouvée");
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
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          let userData: User | null = null;

          if (userDoc.exists()) {
            userData = userDoc.data() as User;
          } else {
            const savedUid = await AsyncStorage.getItem(STORAGE_KEY);
            if (savedUid && savedUid !== firebaseUser.uid) {
              const previousDoc = await getDoc(doc(db, "users", savedUid));
              if (previousDoc.exists()) {
                const previousData = previousDoc.data() as User;
                const migratedData: User = {
                  ...previousData,
                  uid: firebaseUser.uid,
                };

                await setDoc(userRef, migratedData);
                await setDoc(
                  doc(db, "usernames", previousData.pseudo.toLowerCase()),
                  {
                    uid: firebaseUser.uid,
                    createdAt: previousData.createdAt,
                    avatar: previousData.avatar,
                  },
                  { merge: true },
                );

                console.log(
                  `🔁 Migration du profil ${savedUid} vers ${firebaseUser.uid} (onAuthStateChanged)`,
                );
                userData = migratedData;
              }
            }
          }

          if (userData) {
            setUser(userData);
            await saveUserUid(firebaseUser.uid);
            identifyUser(userData.uid, {
              pseudo: userData.pseudo,
              createdAt: userData.createdAt,
            });
            // Set AppsFlyer Client ID
            await setCustomerUserId(userData.uid);
          } else {
            setUser(null);
            resetUser();
            await AsyncStorage.removeItem(STORAGE_KEY);
            console.warn(
              "⚠️ Aucun profil utilisateur disponible après authentification.",
            );
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
      const usernameDoc = await getDoc(
        doc(db, "usernames", pseudo.toLowerCase()),
      );
      if (usernameDoc.exists()) {
        throw new Error("Ce pseudo est déjà pris");
      }

      // Connexion anonyme - Firebase génère automatiquement un UUID unique
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      // Sauvegarder le pseudo
      await setDoc(doc(db, "usernames", pseudo.toLowerCase()), {
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
      await setDoc(doc(db, "users", uid), userData);
      await saveUserUid(uid);
      setUser(userData);

      // Track sign in event
      trackEvent("user_signed_in", {
        pseudo,
        uid,
        avatar,
      });

      // Track PostHog login event
      track.login("anonymous", true);
      identify(uid, {
        username: pseudo,
        avatar,
        created_at: new Date().toISOString(),
      });

      // Track AppsFlyer events
      await logLogin();
      await logCompleteRegistration("username");
      await setCustomerUserId(uid);
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
      if (!auth.currentUser) {
        setUser(null);
        resetUser();
        return;
      }
      // Sauvegarder l'UID avant la déconnexion
      await saveDisconnectedUid(auth.currentUser.uid);
      await auth.signOut();
      setUser(null);
      resetUser();
      trackEvent("user_signed_out");

      // Track PostHog logout event
      track.logout();
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
      setError(err as Error);
      throw err;
    }
  };

  const createReviewerAccount = async (pseudo: string, uid: string) => {
    const userData = {
      uid,
      pseudo,
      createdAt: new Date().toISOString(),
      avatar: DEFAULT_AVATAR,
      points: 999999,
      hasActiveSubscription: true,
      isReviewer: true,
      subscriptionType: "monthly",
      subscriptionUpdatedAt: "2025-05-25T20:27:13.689Z",
    };

    const db = getFirestore();
    await setDoc(doc(db, "users", uid), userData);
    await saveUserUid(uid);
    setUser(userData);

    trackEvent("reviewer_login", {
      pseudo,
      platform: pseudo === "reviewer_google" ? "google" : "apple",
    });

    return userData;
  };

  const firstLogin = async (pseudo: string) => {
    try {
      setLoading(true);
      const auth = getAuth();
      const db = getFirestore();
      // Ajout import dynamique pour analyticsInstance
      const { analyticsInstance } = await import("@/config/firebase");

      // Vérifier si c'est un compte reviewer (comptes spéciaux pour validation stores)
      const isReviewer = REVIEWER_PSEUDOS.includes(pseudo);

      if (isReviewer) {
        console.log('🤖 Premier login reviewer détecté:', pseudo);
        // Connexion anonyme pour les reviewers (pas de vérification de session)
        const userCredential = await signInAnonymously(auth);
        const uid = userCredential.user.uid;
        await createReviewerAccount(pseudo, uid);
        // Tracking Google Analytics sign_up event pour reviewer
        await analyticsInstance.logEvent("sign_up", {
          method: "reviewer",
        });
        await analyticsInstance.setUserId(pseudo);
        // Track AppsFlyer registration for reviewer
        await logCompleteRegistration("reviewer");
        await setCustomerUserId(uid);
        return;
      }

      // Vérifier si le pseudo est déjà pris (pour les utilisateurs normaux)
      const usernameDoc = await getDoc(
        doc(db, "usernames", pseudo.toLowerCase()),
      );
      if (usernameDoc.exists()) {
        throw new Error("Ce pseudo est déjà pris");
      }

      // Connexion anonyme normale
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      // Sauvegarder le pseudo
      await setDoc(doc(db, "usernames", pseudo.toLowerCase()), {
        uid,
        createdAt: new Date().toISOString(),
      });

      // Créer le document utilisateur
      const userData = {
        uid,
        pseudo,
        createdAt: new Date().toISOString(),
        avatar: DEFAULT_AVATAR,
        points: 0,
      };
      await setDoc(doc(db, "users", uid), userData);
      setUser(userData);

      // Sauvegarder l'UID dans le localStorage
      await saveUserUid(uid);

      // Track first login event
      trackEvent("user_first_login", {
        pseudo,
        uid,
      });

      // Tracking Google Analytics sign_up event
      await analyticsInstance.logEvent("sign_up", {
        method: "username",
      });
      await analyticsInstance.setUserId(pseudo);

      // Track AppsFlyer registration
      await logCompleteRegistration("username");
      await setCustomerUserId(uid);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const migrateExistingUser = async (uid: string, pseudo: string) => {
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // Sauvegarder l'UID dans les deux clés pour assurer la transition
        await saveUserUid(uid);
        await saveDisconnectedUid(uid);

        // Mettre à jour le document usernames si nécessaire
        const usernameDoc = await getDoc(
          doc(db, "usernames", pseudo.toLowerCase()),
        );
        if (!usernameDoc.exists()) {
          await setDoc(doc(db, "usernames", pseudo.toLowerCase()), {
            uid,
            createdAt: userData.createdAt,
          });
        }

        return userData;
      }
      return null;
    } catch (err) {
      console.error("Erreur lors de la migration de l'utilisateur:", err);
      return null;
    }
  };

  const checkExistingUser = async (pseudo: string): Promise<boolean> => {
    try {
      const db = getFirestore();

      // Vérifier si c'est un compte reviewer (comptes spéciaux pour validation stores)
      if (REVIEWER_PSEUDOS.includes(pseudo)) {
        console.log('🤖 Connexion reviewer détectée:', pseudo);
        const auth = getAuth();
        const userCredential = await signInAnonymously(auth);
        const uid = userCredential.user.uid;
        const userData = await createReviewerAccount(pseudo, uid);
        setUser(userData);
        await saveUserUid(uid);
        identifyUser(userData.uid, {
          pseudo: userData.pseudo,
          createdAt: userData.createdAt,
        });
        await setCustomerUserId(uid);
        await logLogin();
        return true;
      }

      // Vérifier si l'utilisateur a déjà une session active
      const savedUid = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedUid) {
        // L'utilisateur a déjà une session - vérifier si c'est le bon pseudo
        const userDoc = await getDoc(doc(db, "users", savedUid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.pseudo === pseudo) {
            // C'est le bon utilisateur - restaurer la session
            setUser(userData);
            identifyUser(userData.uid, {
              pseudo: userData.pseudo,
              createdAt: userData.createdAt,
            });
            await setCustomerUserId(userData.uid);
            await logLogin();
            console.log('✅ Reconnexion avec le même compte:', pseudo);
            return true;
          } else {
            // Tentative de connexion avec un autre pseudo
            Alert.alert(
              "Compte différent",
              `Vous êtes déjà connecté avec le pseudo "${userData.pseudo}". Voulez-vous vous déconnecter et créer un nouveau compte ?`,
              [
                {
                  text: "Annuler",
                  style: "cancel",
                  onPress: () => false,
                },
                {
                  text: "Déconnexion",
                  onPress: async () => {
                    await signOut();
                    return false;
                  },
                },
              ],
            );
            return false;
          }
        }
      }

      // Vérifier si le pseudo existe déjà
      const usernameDoc = await getDoc(
        doc(db, "usernames", pseudo.toLowerCase()),
      );

      if (usernameDoc.exists()) {
        // Le pseudo existe - se reconnecter avec cet utilisateur
        const usernameData = usernameDoc.data();
        const existingUid = usernameData?.uid;
        
        if (existingUid) {
          // S'authentifier d'abord pour avoir les permissions de lecture
          const auth = getAuth();
          await signInAnonymously(auth);
          
          // Maintenant on peut lire les données utilisateur
          const userDoc = await getDoc(doc(db, "users", existingUid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            
            setUser(userData);
            await saveUserUid(existingUid);
            identifyUser(userData.uid, {
              pseudo: userData.pseudo,
              createdAt: userData.createdAt,
            });
            await setCustomerUserId(existingUid);
            await logLogin();
            
            console.log('✅ Reconnexion réussie avec:', pseudo);
            return true;
          }
        }
        
        // Le pseudo existe mais pas de données utilisateur trouvées
        Alert.alert(
          "Erreur",
          "Impossible de récupérer les données de ce compte.",
          [{ text: "OK", onPress: () => false }]
        );
        return false;
      }

      // Le pseudo est disponible - on peut créer un nouveau compte
      return false;
    } catch (err) {
      console.error("Erreur lors de la vérification de l'utilisateur:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signOut,
        setUser,
        restoreSession,
        firstLogin,
        checkExistingUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
