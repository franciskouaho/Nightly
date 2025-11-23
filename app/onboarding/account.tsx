import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_AUTH_CONFIG } from "@/config/googleAuth";
import auth from '@react-native-firebase/auth';

// AppleAuthentication - rendre optionnel si le module n'est pas installé
let AppleAuthentication: any = null;
try {
    AppleAuthentication = require('expo-apple-authentication');
} catch (e) {
    console.warn('AppleAuthentication not available');
}

export default function AccountScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data } = useOnboarding();
    const { setUser } = useAuth();
    const { t } = useTranslation();
    const [loadingGoogle, setLoadingGoogle] = React.useState(false);
    const [loadingApple, setLoadingApple] = React.useState(false);

    // Fonction pour générer un code de couple (lettres et chiffres)
    const generateCoupleCode = (length = 6) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    // Configure Google Sign-In
    React.useEffect(() => {
        GoogleSignin.configure({
            webClientId: GOOGLE_AUTH_CONFIG.webClientId,
            offlineAccess: false,
        });
    }, []);

    const handleGoogleSignIn = async () => {
        setLoadingGoogle(true);
        try {
            // Check Play Services (Android)
            if (Platform.OS === 'android') {
                await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            }

            // Get user info from Google
            const signInResult = await GoogleSignin.signIn();

            // Extract idToken
            const idToken = signInResult.data?.idToken || (signInResult as any).idToken;

            if (!idToken) {
                throw new Error('No ID token received from Google');
            }

            // Create Firebase credential
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
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

            // IMPORTANT: Si on vient de l'onboarding, on utilise TOUJOURS les données de l'onboarding
            // même si le document existe déjà (par exemple si l'utilisateur s'est connecté avec Google avant)
            
            console.log('📝 Données de l\'onboarding:', {
                pseudo: data.pseudo,
                name: data.name,
                avatar: data.avatar,
                allData: data
            });
            
            // Vérifier que le pseudo de l'onboarding est bien défini
            if (!data.pseudo || data.pseudo.trim() === '') {
                console.error('❌ ERREUR: Le pseudo de l\'onboarding est vide!', data);
                throw new Error('Le pseudo est requis pour créer le compte');
            }
            
            // Générer un code de couple si l'utilisateur n'en a pas déjà un
            const existingCoupleCode = userDoc.exists() ? (userDoc.data() as any).coupleCode : null;
            const coupleCode = existingCoupleCode || generateCoupleCode(6);
            
            const userData = {
                uid: user.uid,
                pseudo: data.pseudo.trim(), // TOUJOURS utiliser le pseudo de l'onboarding (NE JAMAIS utiliser displayName de Google)
                name: null, // Le name reste null, on n'utilise PAS les données Google
                birthDate: data.birthDate ? data.birthDate.toISOString() : null,
                gender: data.gender || null,
                goals: data.goals || [],
                createdAt: userDoc.exists() ? (userDoc.data() as any).createdAt : new Date().toISOString(),
                avatar: data.avatar || '', // TOUJOURS utiliser l'avatar de l'onboarding (NE JAMAIS utiliser photoURL de Google)
                points: userDoc.exists() ? ((userDoc.data() as any).points || 0) : 0,
                coupleCode: coupleCode, // Générer et stocker le code de couple
            };
            
            console.log('✅ Création du profil avec les données de l\'onboarding:', {
                pseudo: userData.pseudo,
                avatar: userData.avatar,
                name: userData.name,
                fullUserData: userData
            });
            
            // Mettre à jour ou créer le document avec les données de l'onboarding
            // Utiliser setDoc SANS merge pour ÉCRASER complètement les données existantes
            await setDoc(userRef, userData);
            
            // Sauvegarder le pseudo (mettre à jour si nécessaire)
            await setDoc(doc(db, "usernames", data.pseudo.toLowerCase()), {
                uid: user.uid,
                createdAt: new Date().toISOString(),
                avatar: data.avatar || '',
            }, { merge: true });

            // Attendre un peu pour s'assurer que Firestore a bien écrit les données
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Vérifier que le document a bien été créé avec les bonnes données
            const verifyDoc = await getDoc(userRef);
            if (verifyDoc.exists()) {
                const verifiedData = verifyDoc.data() as any;
                console.log('✅ Document vérifié dans Firestore (Google):', {
                    pseudo: verifiedData.pseudo,
                    name: verifiedData.name,
                    avatar: verifiedData.avatar
                });
                
                // Si le pseudo dans Firestore est différent de celui qu'on voulait, réessayer
                if (verifiedData.pseudo !== data.pseudo.trim()) {
                    console.warn('⚠️ Le pseudo dans Firestore ne correspond pas! Réessayons...', {
                        attendu: data.pseudo.trim(),
                        actuel: verifiedData.pseudo
                    });
                    // Réessayer une fois
                    await setDoc(userRef, userData);
                    await new Promise(resolve => setTimeout(resolve, 200));
                    const verifyDoc2 = await getDoc(userRef);
                    if (verifyDoc2.exists()) {
                        const verifiedData2 = verifyDoc2.data() as any;
                        console.log('✅ Document vérifié après réessai (Google):', {
                            pseudo: verifiedData2.pseudo,
                            name: verifiedData2.name
                        });
                        setUser(verifiedData2 as any);
                    } else {
                        setUser(userData);
                    }
                } else {
                    // Mettre à jour le contexte avec les données vérifiées
                    setUser(verifiedData as any);
                }
            } else {
                console.error('❌ ERREUR: Le document n\'existe pas après création!');
                setUser(userData);
            }

            router.replace("/onboarding/notifications");
        } catch (error: any) {
            console.error('Erreur lors de la connexion Google:', error);

            // User cancelled - don't show error
            if (error.code === '-5' || error.code === 'SIGN_IN_CANCELLED') {
                setLoadingGoogle(false);
                return;
            }

            let errorMessage = 'Échec de la connexion avec Google';
            if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'Un compte existe déjà avec cette adresse email';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Identifiants invalides';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'La connexion Google n\'est pas activée';
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = 'Ce compte a été désactivé';
            }
            // Vous pouvez ajouter une alerte ici si nécessaire
        } finally {
            setLoadingGoogle(false);
        }
    };

    const handleAppleSignIn = async () => {
        if (!AppleAuthentication) {
            console.warn('AppleAuthentication not available');
            return;
        }

        if (Platform.OS !== 'ios') {
            console.warn('Apple Sign-In is only available on iOS');
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
            const { getFirestore, doc, setDoc, getDoc } = await import('@react-native-firebase/firestore');
            const db = getFirestore();
            const firebaseUser = userCredential.user;

            const userRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userRef);

            // IMPORTANT: Si on vient de l'onboarding, on utilise TOUJOURS les données de l'onboarding
            // même si le document existe déjà (par exemple si l'utilisateur s'est connecté avec Apple avant)
            
            console.log('📝 Données de l\'onboarding:', {
                pseudo: data.pseudo,
                name: data.name,
                avatar: data.avatar,
                allData: data
            });
            
            // Vérifier que le pseudo de l'onboarding est bien défini
            if (!data.pseudo || data.pseudo.trim() === '') {
                console.error('❌ ERREUR: Le pseudo de l\'onboarding est vide!', data);
                throw new Error('Le pseudo est requis pour créer le compte');
            }
            
            // Générer un code de couple si l'utilisateur n'en a pas déjà un
            const existingCoupleCode = userDoc.exists() ? (userDoc.data() as any).coupleCode : null;
            const coupleCode = existingCoupleCode || generateCoupleCode(6);
            
            const userData = {
                uid: firebaseUser.uid,
                pseudo: data.pseudo.trim(), // TOUJOURS utiliser le pseudo de l'onboarding (NE JAMAIS utiliser displayName d'Apple)
                name: null, // Le name reste null, on n'utilise PAS les données Apple
                birthDate: data.birthDate ? data.birthDate.toISOString() : null,
                gender: data.gender || null,
                goals: data.goals || [],
                createdAt: userDoc.exists() ? (userDoc.data() as any).createdAt : new Date().toISOString(),
                avatar: data.avatar || '', // TOUJOURS utiliser l'avatar de l'onboarding (NE JAMAIS utiliser photoURL d'Apple)
                points: userDoc.exists() ? ((userDoc.data() as any).points || 0) : 0,
                coupleCode: coupleCode, // Générer et stocker le code de couple
            };
            
            console.log('✅ Création du profil avec les données de l\'onboarding:', {
                pseudo: userData.pseudo,
                avatar: userData.avatar,
                name: userData.name,
                fullUserData: userData
            });
            
            // Mettre à jour ou créer le document avec les données de l'onboarding
            // Utiliser setDoc SANS merge pour ÉCRASER complètement les données existantes
            await setDoc(userRef, userData);
            
            // Sauvegarder le pseudo (mettre à jour si nécessaire)
            await setDoc(doc(db, "usernames", data.pseudo.toLowerCase()), {
                uid: firebaseUser.uid,
                createdAt: new Date().toISOString(),
                avatar: data.avatar || '',
            }, { merge: true });

            // Attendre un peu pour s'assurer que Firestore a bien écrit les données
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Vérifier que le document a bien été créé avec les bonnes données
            const verifyDoc = await getDoc(userRef);
            if (verifyDoc.exists()) {
                const verifiedData = verifyDoc.data() as any;
                console.log('✅ Document vérifié dans Firestore (Apple):', {
                    pseudo: verifiedData.pseudo,
                    name: verifiedData.name,
                    avatar: verifiedData.avatar
                });
                
                // Si le pseudo dans Firestore est différent de celui qu'on voulait, réessayer
                if (verifiedData.pseudo !== data.pseudo.trim()) {
                    console.warn('⚠️ Le pseudo dans Firestore ne correspond pas! Réessayons...', {
                        attendu: data.pseudo.trim(),
                        actuel: verifiedData.pseudo
                    });
                    // Réessayer une fois
                    await setDoc(userRef, userData);
                    await new Promise(resolve => setTimeout(resolve, 200));
                    const verifyDoc2 = await getDoc(userRef);
                    if (verifyDoc2.exists()) {
                        const verifiedData2 = verifyDoc2.data() as any;
                        console.log('✅ Document vérifié après réessai (Apple):', {
                            pseudo: verifiedData2.pseudo,
                            name: verifiedData2.name
                        });
                        setUser(verifiedData2 as any);
                    } else {
                        setUser(userData);
                    }
                } else {
                    // Mettre à jour le contexte avec les données vérifiées
                    setUser(verifiedData as any);
                }
            } else {
                console.error('❌ ERREUR: Le document n\'existe pas après création!');
                setUser(userData);
            }

            router.replace("/onboarding/notifications");
        } catch (e: any) {
            if (e.code === 'ERR_REQUEST_CANCELED' || e.code === '1001') {
                // L'utilisateur a annulé - ne rien faire
                console.log('Apple Sign-In cancelled by user');
            } else {
                console.error('Erreur lors de la connexion Apple:', e);
                let errorMessage = 'Échec de la connexion avec Apple';
                if (e.code === 'auth/invalid-credential') {
                    errorMessage = 'Identifiants Apple invalides';
                } else if (e.code === 'auth/account-exists-with-different-credential') {
                    errorMessage = 'Un compte existe déjà avec cette adresse email';
                } else if (e.code === 'auth/user-disabled') {
                    errorMessage = 'Ce compte a été désactivé';
                }
                // Vous pouvez ajouter une alerte ici si nécessaire
            }
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
                                    router.replace("/onboarding/profile");
                                }
                            }}
                            style={styles.backButton}
                            activeOpacity={0.8}
                        >
                            <View style={styles.backButtonGlass}>
                                <Ionicons name="chevron-back" size={20} color="white" />
                            </View>
                        </TouchableOpacity>

                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: "100%" }]} />
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.mainContent}>
                        <Text style={styles.title}>
                            {t("onboarding.account.title")}
                        </Text>

                        <Text style={styles.subtitle}>
                            {t("onboarding.account.subtitle")}
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
                                    {loadingGoogle ? t("common.loading") || "Connexion..." : t("onboarding.account.signInGoogle")}
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
                                    <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
                                    <Text style={styles.appleButtonText}>
                                        {loadingApple ? t("common.loading") || "Connexion..." : t("onboarding.account.signInApple")}
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
        marginRight: 20,
    },
    backButtonGlass: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    progressBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#FF4500",
        borderRadius: 3,
    },
    mainContent: {
        flex: 1,
        alignItems: "center",
        paddingTop: 40,
    },
    title: {
        fontSize: 26,
        fontFamily: "BebasNeue-Regular",
        color: "white",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 30,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Montserrat-Regular",
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 60,
    },
    mascotContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    bottomSection: {
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
        gap: 12,
    },
    googleButton: {
        width: "100%",
        paddingVertical: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        alignItems: "center",
        borderBottomWidth: 6,
        borderBottomColor: "#E0E0E0",
        marginBottom: 16,
    },
    googleButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    googleButtonText: {
        color: "#000000",
        fontSize: 18,
        fontFamily: "Montserrat-Bold",
        letterSpacing: 0.2,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    appleButton: {
        width: "100%",
        paddingVertical: 16,
        backgroundColor: "#000000",
        borderRadius: 16,
        alignItems: "center",
        borderBottomWidth: 6,
        borderBottomColor: "#333333",
    },
    appleButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    appleButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "Montserrat-Bold",
        letterSpacing: 0.2,
    },
});
