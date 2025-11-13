"use client";

import { analyticsInstance } from "@/config/firebase";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthAnalytics } from "@/hooks/useAuthAnalytics";
import { cacheRemoteImage } from "@/utils/cacheRemoteImage";
import { Ionicons } from "@expo/vector-icons";
import storage from "@react-native-firebase/storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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
  const [profiles, setProfiles] = useState<
    { remoteUrl: string; localUri: string }[]
  >([]);
  const [selectedProfile, setSelectedProfile] = useState<{
    remoteUrl: string;
    localUri: string;
  } | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const { signIn, restoreSession, user, firstLogin, checkExistingUser } =
    useAuth();
  const router = useRouter();
  const authAnalytics = useAuthAnalytics();
  const { t } = useTranslation();
  
  // Couleurs du thème Halloween
  const primary = Colors.light.primary;
  const secondary = Colors.light.secondary;
  const tertiary = Colors.light.tertiary;
  const background = Colors.light.background;
  const backgroundDarker = Colors.light.backgroundDarker;
  const backgroundLighter = Colors.light.backgroundLighter;
  const text = Colors.light.text;
  const textSecondary = Colors.light.textSecondary;

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
      borderColor: primary,
      backgroundColor: backgroundLighter,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: text,
      marginTop: 10,
      textShadowColor: backgroundDarker,
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
      letterSpacing: 1,
    },
    subtitle: {
      fontSize: 16,
      color: textSecondary,
      marginTop: 5,
    },
    profileSelectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: text,
      marginTop: 20,
      marginBottom: 8,
    },
    profileSelectionSubtitle: {
      fontSize: 14,
      color: textSecondary,
      marginBottom: 15,
    },
    form: {
      width: "100%",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: backgroundLighter,
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: primary,
      shadowColor: primary,
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
      color: text,
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
      borderColor: primary,
      borderWidth: 3,
      transform: [{ scale: 1.1 }],
      shadowColor: primary,
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
      shadowColor: primary,
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
      color: text,
      fontSize: 16,
      fontWeight: "bold",
      textShadowColor: backgroundDarker,
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
      backgroundColor: primary,
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

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfiles = async () => {
      try {
        setIsLoadingProfiles(true);
        const listResult = await storage().ref("profils").listAll();
        const urls = await Promise.all(
          listResult.items.map(async (item) => item.getDownloadURL()),
        );

        const cachedProfiles = await Promise.all(
          urls.map(async (remoteUrl) => {
            const localUri = await cacheRemoteImage(remoteUrl, "profils");
            return { remoteUrl, localUri };
          }),
        );

        if (!isMounted) {
          return;
        }

        setProfiles(cachedProfiles);
        setSelectedProfile(
          (current) => current ?? cachedProfiles[0] ?? null,
        );
      } catch (error) {
        console.error("Erreur lors du chargement des profils:", error);
        if (isMounted) {
          setProfilesError("Impossible de charger les avatars.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfiles(false);
        }
      }
    };

    fetchProfiles();

    return () => {
      isMounted = false;
    };
  }, []);

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
      if (!selectedProfile) {
        Alert.alert(
          t("errors.general"),
          t(
            "auth.login.profileRequired",
            "Veuillez sélectionner un avatar avant de continuer.",
          ),
        );
        return;
      }

      // Vérifier si l'utilisateur existe déjà
      const userExists = await checkExistingUser(username);

      if (userExists) {
        // L'utilisateur existe déjà et a confirmé la connexion
        await authAnalytics.trackLogin("username", true);
        // Tracking Google Analytics login event
        await analyticsInstance.logEvent("login", {
          method: "username",
          success: true,
        });
        await analyticsInstance.setUserId(username);
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
      await signIn(username, selectedProfile.remoteUrl);
      await authAnalytics.trackLogin("username", true);
      // Tracking Google Analytics login event
      await analyticsInstance.logEvent("login", {
        method: "username",
        success: true,
      });
      await analyticsInstance.setUserId(username);
      router.replace("/(tabs)");
    } catch (error: any) {
      await authAnalytics.trackLogin("username", false);
      // Tracking Google Analytics failed login event
      await analyticsInstance.logEvent("login", {
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
          backgroundDarker,
          secondary,
          primary,
          secondary,
          backgroundDarker,
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
            {selectedProfile ? (
              <Image
                source={{
                  uri: selectedProfile.localUri || selectedProfile.remoteUrl,
                }}
                style={styles.selectedProfileImage}
              />
            ) : (
              <View
                style={[
                  styles.selectedProfileImage,
                  {
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                {isLoadingProfiles ? (
                  <ActivityIndicator color={primary} />
                ) : (
                  <Ionicons name="image-outline" size={36} color={primary} />
                )}
              </View>
            )}
            <Text style={styles.title}>{t("app.name")}</Text>
            <Text style={styles.subtitle}>{t("auth.login.enterUsername")}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={24} color={text} />
              <TextInput
                style={styles.input}
                placeholder={t("auth.login.username")}
                placeholderTextColor={textSecondary}
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

            {isLoadingProfiles ? (
              <ActivityIndicator color={primary} />
            ) : profilesError ? (
              <Text style={styles.profileSelectionSubtitle}>
                {profilesError}
              </Text>
            ) : profiles.length === 0 ? (
              <Text style={styles.profileSelectionSubtitle}>
                {t(
                  "auth.login.noProfilesAvailable",
                  "Aucun avatar n'est disponible pour le moment.",
                )}
              </Text>
            ) : (
              chunkArray(profiles, 4).map((row, rowIdx: number) => (
                <View style={styles.profilesRow} key={rowIdx}>
                  {row.map((profile, idx: number) => (
                    <TouchableOpacity
                      key={`${profile.remoteUrl}-${idx}`}
                      onPress={() => setSelectedProfile(profile)}
                    >
                      <Image
                        source={{
                          uri: profile.localUri || profile.remoteUrl,
                        }}
                        style={[
                          styles.profileImg,
                          selectedProfile?.remoteUrl === profile.remoteUrl &&
                            styles.profileImgSelected,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            )}

            <TouchableOpacity
              style={[
                styles.buttonContainer,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[primary, secondary, tertiary]}
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