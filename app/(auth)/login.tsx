"use client";

import { analyticsInstance } from "@/config/firebase";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthAnalytics } from "@/hooks/useAuthAnalytics";
import { usePostHog } from "@/hooks/usePostHog";
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
  const { user, signIn } = useAuth();
  const router = useRouter();
  const authAnalytics = useAuthAnalytics();
  const { track } = usePostHog();
  const { t } = useTranslation();
  const { username, selectedProfile } = useLocalSearchParams<{
    username?: string;
    selectedProfile?: string;
  }>();

  // Configuration Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_AUTH_CONFIG.webClientId,
    scopes: GOOGLE_AUTH_CONFIG.scopes,
  });

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
      await analyticsInstance.logEvent("login", {
        method: "google",
        success: true,
      });
      await analyticsInstance.setUserId(finalUsername);
      
      // Track PostHog Google login event
      track.login("google", true);
      
      router.replace("/(tabs)");
    } catch (error: any) {
      await authAnalytics.trackLogin("google", false);
      await analyticsInstance.logEvent("login", {
        method: "google",
        success: false,
      });
      
      // Track PostHog Google login error
      track.login("google", false);
      track.error("google_auth_error", error.message || "Unknown error", {
        method: "google",
        hasUsername: !!username,
        hasProfile: !!selectedProfile,
      });
      
      Alert.alert(t("errors.general"), error.message || t("errors.authError"));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={[
          Colors.light?.gradient?.midnight?.from || "#1A1A2E",
          Colors.light?.gradient?.midnight?.from || "#1A1A2E",
          Colors.light?.gradient?.midnight?.middle || "#4B1E00",
          Colors.light?.gradient?.midnight?.from || "#1A1A2E",
          Colors.light?.gradient?.midnight?.to || "#120F1C",
        ]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
      

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
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/login.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.title}>{t("app.name")}</Text>
              <View style={styles.titleAccent} />
            </View>
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
              <View style={[styles.button, { backgroundColor: Colors.light?.primary || "#FF6F00" }]}>
                <View style={styles.googleIconContainer}>
                  <Ionicons name="logo-google" size={24} color="#fff" />
                </View>
                <Text style={styles.buttonText}>
                  {isLoading
                    ? t("auth.login.connecting")
                    : t("auth.login.signInWithGoogle")}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>ou</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Texte informatif */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Connectez-vous pour accéder à tous les jeux et fonctionnalités
              </Text>
            </View>

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
    marginBottom: 50,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 75,
    shadowColor: Colors.light?.primary || "#FF6F00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: Colors.light?.text || "#FFFAF0",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 2,
    marginBottom: 8,
  },
  titleAccent: {
    width: 60,
    height: 4,
    backgroundColor: Colors.light?.primary || "#FF6F00",
    borderRadius: 2,
    shadowColor: Colors.light?.primary || "#FF6F00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light?.textSecondary || "#FFB347",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 24,
    paddingHorizontal: 20,
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
    color: Colors.light?.text || "#FFFAF0",
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
    color: Colors.light?.text || "#FFFAF0",
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
    borderColor: Colors.light?.primary || "#FF6F00",
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
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    shadowColor: Colors.light?.primary || "#FF6F00",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  googleIconContainer: {
    marginRight: 12,
    padding: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonText: {
    color: Colors.light?.text || "#FFFAF0",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  separatorText: {
    color: Colors.light?.textSecondary || "#FFB347",
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  infoContainerText: {
    color: Colors.light?.textSecondary || "#FFB347",
    fontSize: 14,
    marginLeft: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
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
    backgroundColor: Colors.light?.primary || "#FF6F00",
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
