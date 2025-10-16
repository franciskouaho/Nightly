"use client";

import HalloweenDecorations from "@/components/HalloweenDecorations";
import { analyticsInstance } from "@/config/firebase";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthAnalytics } from "@/hooks/useAuthAnalytics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GOOGLE_AUTH_CONFIG } from '@/config/googleAuth';

// Configuration pour Google Auth
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const authAnalytics = useAuthAnalytics();
  const { t } = useTranslation();
  const { username, selectedProfile } = useLocalSearchParams<{
    username?: string;
    selectedProfile?: string;
  }>();

  // Configuration Google Auth (seulement si configuré)
  const [request, response, promptAsync] = Google.useAuthRequest(
    GOOGLE_AUTH_CONFIG.isDevelopment && GOOGLE_AUTH_CONFIG.expoClientId === 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com'
      ? null // Désactive Google Auth en mode développement non configuré
      : {
          expoClientId: GOOGLE_AUTH_CONFIG.expoClientId,
          iosClientId: GOOGLE_AUTH_CONFIG.iosClientId,
          androidClientId: GOOGLE_AUTH_CONFIG.androidClientId,
          webClientId: GOOGLE_AUTH_CONFIG.webClientId,
          scopes: GOOGLE_AUTH_CONFIG.scopes,
        }
  );

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication?.accessToken);
    }
  }, [response]);

  const handleGoogleSignIn = async (accessToken?: string) => {
    if (!accessToken) {
      Alert.alert(t("errors.general"), "Erreur lors de l'authentification Google");
      return;
    }

    setIsLoading(true);

    try {
      // Récupérer les informations de l'utilisateur Google
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
      const userInfo = await response.json();

      // Utiliser le pseudo de l'onboarding ou l'email Google
      const finalUsername = username || userInfo.email?.split('@')[0] || 'User';
      const finalProfile = selectedProfile || 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Frenard.png?alt=media&token=139ed01b-46f2-4f3e-9305-459841f2a893';

      // Créer ou connecter l'utilisateur
      await signIn(finalUsername, finalProfile);
      
      await authAnalytics.trackLogin("google", true);
      await analyticsInstance().logEvent("login", {
        method: "google",
        success: true,
      });
      await analyticsInstance().setUserId(finalUsername);
      
      router.replace("/(tabs)");
    } catch (error: any) {
      await authAnalytics.trackLogin("google", false);
      await analyticsInstance().logEvent("login", {
        method: "google",
        success: false,
      });
      Alert.alert(t("errors.general"), error.message || t("errors.authError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOnboarding = () => {
    router.push('/onboarding/username');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0.95)",
          "rgba(80, 40, 20, 0.9)",
          "rgba(120, 60, 30, 0.9)",
          "rgba(80, 40, 20, 0.9)",
          "rgba(0, 0, 0, 0.95)",
        ]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
        {/* Décorations Halloween */}
        <View style={styles.halloweenDecorationsContainer}>
          <HalloweenDecorations />
        </View>

        {/* Effets de particules flottantes */}
        <View style={[styles.floatingParticles, { zIndex: 1, opacity: 0.2 }]}>
          <View style={[styles.particle, styles.particle1]} />
          <View style={[styles.particle, styles.particle2]} />
          <View style={[styles.particle, styles.particle3]} />
          <View style={[styles.particle, styles.particle4]} />
          <View style={[styles.particle, styles.particle5]} />
        </View>

        <View style={[styles.content, { zIndex: 15 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("app.name")}</Text>
            <Text style={styles.subtitle}>
              {t("auth.login.subtitle", "Connectez-vous pour commencer à jouer")}
            </Text>
          </View>

          {/* Affichage des informations de l'onboarding si disponibles */}
          {(username || selectedProfile) && (
            <View style={styles.onboardingInfo}>
              <Text style={styles.onboardingTitle}>
                {t("auth.login.onboardingInfo", "Informations de votre profil")}
              </Text>
              {username && (
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color="#fff" />
                  <Text style={styles.infoText}>{username}</Text>
                </View>
              )}
              {selectedProfile && (
                <View style={styles.avatarPreview}>
                  <Image
                    source={{ uri: selectedProfile }}
                    style={styles.avatarImage}
                  />
                </View>
              )}
            </View>
          )}

          <View style={styles.loginOptions}>
            {/* Bouton Google Sign In */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                (isLoading || !request) && styles.buttonDisabled,
              ]}
              onPress={() => promptAsync()}
              disabled={isLoading || !request}
            >
              <LinearGradient
                colors={["#4285F4", "#34A853", "#FBBC05", "#EA4335"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Ionicons name="logo-google" size={24} color="#fff" />
                <Text style={styles.buttonText}>
                  {isLoading
                    ? t("auth.login.connecting")
                    : !request
                    ? "Google Auth non configuré"
                    : t("auth.login.signInWithGoogle", "Se connecter avec Google")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Bouton pour recommencer l'onboarding */}
            {!username && (
              <TouchableOpacity
                style={styles.onboardingButton}
                onPress={handleStartOnboarding}
              >
                <Text style={styles.onboardingButtonText}>
                  {t("auth.login.startOnboarding", "Commencer l'onboarding")}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 10,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 5,
    textAlign: "center",
  },
  onboardingInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  onboardingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 15,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 10,
    fontWeight: "600",
  },
  avatarPreview: {
    alignItems: "center",
    marginTop: 10,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  loginOptions: {
    width: "100%",
  },
  googleButton: {
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#4285F4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  onboardingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  onboardingButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  background: {
    flex: 1,
  },
  halloweenDecorationsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 5,
    opacity: 0.3,
  },
  floatingParticles: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  particle: {
    position: "absolute",
    backgroundColor: Colors.primary,
    borderRadius: 50,
    opacity: 0.3,
  },
  particle1: {
    width: 4,
    height: 4,
    top: "20%",
    left: "10%",
  },
  particle2: {
    width: 6,
    height: 6,
    top: "40%",
    right: "15%",
  },
  particle3: {
    width: 3,
    height: 3,
    top: "60%",
    left: "20%",
  },
  particle4: {
    width: 5,
    height: 5,
    top: "80%",
    right: "25%",
  },
  particle5: {
    width: 4,
    height: 4,
    top: "30%",
    left: "70%",
  },
});
