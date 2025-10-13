"use client";

import HalloweenDecorations from "@/components/HalloweenDecorations";
import { analyticsInstance } from "@/config/firebase";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthAnalytics } from "@/hooks/useAuthAnalytics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const profils: string[] = [
  "https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Frenard.png?alt=media&token=139ed01b-46f2-4f3e-9305-459841f2a893",
  "https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Fchat.png?alt=media&token=0c852d5b-1a14-4b8a-8926-78a7c88c0695",
  "https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Fgrenouille.png?alt=media&token=8257acb0-bcf7-4e30-a7cf-5ddf44e6da01",
  "https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/profils%2Foiseau.png?alt=media&token=5a9a9e36-1651-4461-8702-d7bc8d516423",
];

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(profils[0] as string);
  const { signIn, restoreSession, user, firstLogin, checkExistingUser } =
    useAuth();
  const router = useRouter();
  const authAnalytics = useAuthAnalytics();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  const handleLogin = async () => {
    if (!username) {
      Alert.alert(t("errors.general"), t("auth.login.usernameRequired"));
      return;
    }

    if (username.length < 3) {
      Alert.alert(t("errors.general"), t("auth.login.usernameLength"));
      return;
    }

    setIsLoading(true);

    try {
      if (!selectedProfile) return;

      // Vérifier si l'utilisateur existe déjà
      const userExists = await checkExistingUser(username);

      if (userExists) {
        // L'utilisateur existe déjà et a confirmé la connexion
        await authAnalytics.trackLogin("username", true);
        // Tracking Google Analytics login event
        await analyticsInstance().logEvent("login", {
          method: "username",
          success: true,
        });
        await analyticsInstance().setUserId(username);
        router.replace("/(tabs)");
        return;
      }

      // Si l'utilisateur n'existe pas ou n'a pas confirmé la connexion
      try {
        await restoreSession();
      } catch (error) {
        // Si aucune session n'existe, créer une nouvelle session
        await firstLogin(username);
      }

      // Continuer avec la connexion normale
      await signIn(username, selectedProfile);
      await authAnalytics.trackLogin("username", true);
      // Tracking Google Analytics login event
      await analyticsInstance().logEvent("login", {
        method: "username",
        success: true,
      });
      await analyticsInstance().setUserId(username);
      router.replace("/(tabs)");
    } catch (error: any) {
      await authAnalytics.trackLogin("username", false);
      // Tracking Google Analytics failed login event
      await analyticsInstance().logEvent("login", {
        method: "username",
        success: false,
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
            <Image
              source={{ uri: selectedProfile }}
              style={styles.selectedProfileImage}
            />
            <Text style={styles.title}>{t("app.name")}</Text>
            <Text style={styles.subtitle}>{t("auth.login.enterUsername")}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={24} color="#fff" />
              <TextInput
                style={styles.input}
                placeholder={t("auth.login.username")}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                maxLength={20}
              />
            </View>

            <Text style={styles.profileSelectionTitle}>
              {t("auth.login.selectCharacter")}
            </Text>
            <Text style={styles.profileSelectionSubtitle}>
              {t("auth.login.characterDescription")}
            </Text>

            {chunkArray(profils, 4).map((row: any[], rowIdx: number) => (
              <View style={styles.profilesRow} key={rowIdx}>
                {row.map((img: any, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedProfile(img)}
                  >
                    <Image
                      source={{ uri: img }}
                      style={[
                        styles.profileImg,
                        selectedProfile === img && styles.profileImgSelected,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.buttonContainer,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary, Colors.tertiary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>
                  {isLoading
                    ? t("auth.login.connecting")
                    : t("auth.login.play")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
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
  selectedProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundLighter,
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
  },
  profileSelectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  profileSelectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 15,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundLighter,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 20,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.text,
    fontSize: 16,
    marginLeft: 10,
  },
  profilesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "transparent",
  },
  profileImgSelected: {
    borderColor: Colors.primary,
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 12,
    shadowColor: Colors.primary,
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
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
