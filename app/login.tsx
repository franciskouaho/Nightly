import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_AUTH_CONFIG } from "@/config/googleAuth";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

// AppleAuthentication - rendre optionnel si le module n'est pas installé
let AppleAuthentication: any = null;
try {
    AppleAuthentication = require('expo-apple-authentication');
} catch (e) {
    console.log('AppleAuthentication not available');
}

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { setUser } = useAuth();
    const { t } = useTranslation();
    const [loadingGoogle, setLoadingGoogle] = React.useState(false);
    const [loadingApple, setLoadingApple] = React.useState(false);

    // Configure Google Sign-In
    React.useEffect(() => {
        GoogleSignin.configure({
            webClientId: GOOGLE_AUTH_CONFIG.webClientId,
            offlineAccess: false,
        });
        console.log('🔐 Google Sign-In configured with webClientId:', GOOGLE_AUTH_CONFIG.webClientId);
    }, []);

    const handleGoogleSignIn = async () => {
        setLoadingGoogle(true);
        try {
            console.log('🚀 Starting Google Sign-In...');

            // Check Play Services (Android)
            if (Platform.OS === 'android') {
                await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            }

            // Get user info from Google
            console.log('📱 Calling GoogleSignin.signIn()...');
            const signInResult = await GoogleSignin.signIn();
            console.log('✅ Sign-In result received:', signInResult);

            // Extract idToken
            const idToken = signInResult.data?.idToken || (signInResult as any).idToken;

            if (!idToken) {
                throw new Error('No ID token received from Google');
            }

            // Create Firebase credential
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign in with Firebase
            const userCredential = await auth().signInWithCredential(googleCredential);
            
            // Récupérer les informations de l'utilisateur
            const user = userCredential.user;
            const displayName = user.displayName || user.email?.split('@')[0] || 'User';
            const photoURL = user.photoURL || '';
            
            // Créer ou mettre à jour le profil utilisateur
            const { getFirestore, doc, setDoc, getDoc } = await import('@react-native-firebase/firestore');
            const db = getFirestore();
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
                // Créer un profil minimal avec les données Google/Apple et connecter directement
                const userName = displayName;
                const userData = {
                    uid: user.uid,
                    pseudo: userName,
                    name: displayName,
                    birthDate: null,
                    gender: null,
                    goals: [],
                    createdAt: new Date().toISOString(),
                    avatar: photoURL || '',
                    points: 0,
                };
                await setDoc(userRef, userData);
                
                // Sauvegarder le pseudo
                await setDoc(doc(db, "usernames", userName.toLowerCase()), {
                    uid: user.uid,
                    createdAt: new Date().toISOString(),
                    avatar: photoURL || '',
                });
                
                setUser(userData);
                router.replace("/(tabs)");
            } else {
                // Utilisateur existant - se connecter
                const userData = userDoc.data() as any;
                setUser(userData);
                router.replace("/(tabs)");
            }
        } catch (error: any) {
            console.error('Erreur lors de la connexion Google:', error);
            let errorMessage = 'Échec de la connexion avec Google';

            if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'Un compte existe déjà avec cette adresse email';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Identifiants invalides';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'La connexion Google n\'est pas activée';
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = 'Ce compte a été désactivé';
            } else if (error.code === '-5' || error.code === 'SIGN_IN_CANCELLED') {
                // User cancelled - don't show error
                setLoadingGoogle(false);
                return;
            } else if (error.code === 'IN_PROGRESS') {
                errorMessage = 'Connexion en cours...';
            } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
                errorMessage = 'Google Play Services non disponible';
            }

            Alert.alert('Erreur', errorMessage);
        } finally {
            setLoadingGoogle(false);
        }
    };

    const handleAppleSignIn = async () => {
        if (!AppleAuthentication) {
            Alert.alert('Non disponible', 'Apple Sign-In n\'est pas disponible');
            return;
        }

        if (Platform.OS !== 'ios') {
            Alert.alert('Non disponible', 'Apple Sign-In est disponible uniquement sur iOS');
            return;
        }

        setLoadingApple(true);
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            if (!credential.identityToken) {
                throw new Error('Identity token non disponible');
            }

            // Create Firebase credential
            const appleCredential = auth.AppleAuthProvider.credential(
                credential.identityToken,
                credential.nonce || undefined
            );

            // Sign in with Firebase
            const userCredential = await auth().signInWithCredential(appleCredential);
            const firebaseUser = userCredential.user;

            const { getFirestore, doc, setDoc, getDoc } = await import('@react-native-firebase/firestore');
            const db = getFirestore();
            const userRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                // Créer un profil minimal avec les données Apple et connecter directement
                const fullName = credential.fullName;
                const appleDisplayName = fullName 
                    ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
                    : '';
                const userName = appleDisplayName || 'User';
                
                const userData = {
                    uid: firebaseUser.uid,
                    pseudo: userName,
                    name: appleDisplayName || null,
                    birthDate: null,
                    gender: null,
                    goals: [],
                    createdAt: new Date().toISOString(),
                    avatar: '',
                    points: 0,
                };
                await setDoc(userRef, userData);
                
                // Sauvegarder le pseudo
                await setDoc(doc(db, "usernames", userName.toLowerCase()), {
                    uid: firebaseUser.uid,
                    createdAt: new Date().toISOString(),
                    avatar: '',
                });
                
                setUser(userData);
                router.replace("/(tabs)");
            } else {
                // Utilisateur existant - se connecter
                const userData = userDoc.data() as any;
                setUser(userData);
                router.replace("/(tabs)");
            }
        } catch (e: any) {
            console.error('Erreur lors de la connexion Apple:', e);

            // User cancelled
            if (e.code === 'ERR_REQUEST_CANCELED' || e.code === '1001') {
                setLoadingApple(false);
                return;
            }

            let errorMessage = 'Échec de la connexion avec Apple';
            if (e.code === 'auth/invalid-credential') {
                errorMessage = 'Identifiants Apple invalides';
            } else if (e.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'Un compte existe déjà avec cette adresse email';
            } else if (e.code === 'auth/user-disabled') {
                errorMessage = 'Ce compte a été désactivé';
            }

            Alert.alert('Erreur', errorMessage);
        } finally {
            setLoadingApple(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[
                    "#C41E3A", // Red top
                    "#8B1538", // Darker red middle
                    "#2A0505", // Very dark bottom
                ]}
                locations={[0, 0.4, 1]}
                style={styles.background}
            >
                <View style={[styles.contentContainer, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            onPress={() => {
                                if (router.canGoBack()) {
                                    router.back();
                                } else {
                                    router.replace("/welcome");
                                }
                            }} 
                            style={styles.backButton} 
                            activeOpacity={0.8}
                        >
                            <View style={styles.backButtonGlass}>
                                <Ionicons name="chevron-back" size={20} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.mainContent}>
                        <Text style={styles.title}>
                            {t("login.title")}
                        </Text>

                        <Text style={styles.subtitle}>
                            {t("login.subtitle")}
                        </Text>
                    </View>

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        {/* Google Sign In Button */}
                        <TouchableOpacity
                            style={[styles.googleButton, (loadingGoogle || loadingApple) && styles.buttonDisabled]}
                            onPress={handleGoogleSignIn}
                            disabled={loadingGoogle || loadingApple}
                            activeOpacity={0.8}
                        >
                            <View style={styles.googleButtonContent}>
                                <MaterialCommunityIcons name="google" size={22} color="#4285F4" />
                                <Text style={styles.googleButtonText}>
                                    {loadingGoogle ? t("common.loading") || "Connexion..." : t("login.signInGoogle")}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Apple Sign In Button */}
                        {Platform.OS === 'ios' && AppleAuthentication && (
                            <TouchableOpacity
                                style={[styles.appleButton, (loadingApple || loadingGoogle) && styles.buttonDisabled]}
                                onPress={handleAppleSignIn}
                                disabled={loadingApple || loadingGoogle}
                                activeOpacity={0.8}
                            >
                                <View style={styles.appleButtonContent}>
                                    <Ionicons name="logo-apple" size={22} color="#000" />
                                    <Text style={styles.appleButtonText}>
                                        {loadingApple ? t("common.loading") || "Connexion..." : t("login.signInApple")}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1A0505",
    },
    background: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 40,
    },
    backButton: {
        zIndex: 10,
    },
    backButtonGlass: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    mainContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 36,
        fontFamily: "BebasNeue-Regular",
        color: "white",
        textAlign: "center",
        marginBottom: 16,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Montserrat-Regular",
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    bottomSection: {
        width: "100%",
        gap: 16,
        marginBottom: 20,
    },
    googleButton: {
        backgroundColor: "white",
        width: "100%",
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    googleButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    googleButtonText: {
        color: "#333",
        fontSize: 16,
        fontFamily: "Montserrat-Bold",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    appleButton: {
        width: "100%",
        height: 54,
        backgroundColor: "white",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.1)",
    },
    appleButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    appleButtonText: {
        color: "#000",
        fontSize: 16,
        fontFamily: "Montserrat-Medium",
        letterSpacing: 0.2,
    },
});

