"use client";

import { usePaywall } from "@/contexts/PaywallContext";
import PointsDisplay from "@/components/PointsDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { ExpoNotificationService } from "@/services/expoNotificationService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Purchases from "react-native-purchases";
import { useExpoNotifications } from "@/hooks/useExpoNotifications";
import HalloweenNotificationScheduler from "@/services/halloweenNotificationScheduler";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { showPaywallA, showPaywallB, closePaywallB, paywallState } = usePaywall();
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { sendHalloweenQuizNotification } = useExpoNotifications();

  // Vérifier si l'utilisateur est admin depuis Firestore
  const isAdmin = user?.isAdmin === true;

  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        const notificationService = ExpoNotificationService.getInstance();
        const enabled = await notificationService.areNotificationsEnabled();
        setNotificationsEnabled(enabled);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut des notifications:', error);
        setNotificationsEnabled(false);
      }
    };

    checkNotificationStatus();
  }, []);

  const handleToggleNotifications = async (value: boolean) => {
    try {
      if (value) {
        // Activer les notifications
        const notificationService = ExpoNotificationService.getInstance();
        await notificationService.initialize();
        
        // Vérifier si l'initialisation a réussi
        const token = await notificationService.getToken();
        setNotificationsEnabled(!!token);
        
        if (token) {
          Alert.alert(
            t("profile.notificationsEnabled", "Notifications activées"),
            t("profile.notificationsEnabledMessage", "Vous recevrez maintenant des notifications de Nightly")
          );
        } else {
          Alert.alert(
            t("profile.notificationsError", "Erreur"),
            t("profile.notificationsErrorMessage", "Impossible d'activer les notifications. Vérifiez les permissions dans les paramètres.")
          );
          setNotificationsEnabled(false);
        }
      } else {
        // Désactiver les notifications
        const notificationService = ExpoNotificationService.getInstance();
        await notificationService.disableNotifications();
        setNotificationsEnabled(false);
        
        Alert.alert(
          t("profile.notificationsDisabled", "Notifications désactivées"),
          t("profile.notificationsDisabledMessage", "Vous ne recevrez plus de notifications de Nightly")
        );
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des notifications:', error);
      setNotificationsEnabled(false);
      Alert.alert(
        t("profile.notificationsError", "Erreur"),
        t("profile.notificationsErrorMessage", "Une erreur est survenue lors de la gestion des notifications")
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert(t("errors.general"), t("profile.logoutError"));
    }
  };

  const handleRestorePurchases = async () => {
    try {
      await Purchases.restorePurchases();
      Alert.alert(
        t("profile.restoreSuccess"),
        t("profile.restoreSuccessMessage"),
      );
    } catch (error) {
      Alert.alert(t("errors.general"), t("profile.restoreError"));
    }
  };

  const handleOpenPaywallB = async () => {
    try {
      console.log("🧪 Ouverture du PaywallB (mode dev - forceShow)");
      await showPaywallB(true);
    } catch (error: any) {
      console.error("Erreur lors de l'ouverture du PaywallB:", error);
      Alert.alert("Erreur", "Impossible d'ouvrir le paywall. Erreur: " + error?.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#1A1A2E', '#8B1538', '#C41E3A', '#8B1538', '#0D0D1A']}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
      </LinearGradient>

      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>{t("profile.title")}</Text>
        <View style={styles.headerRight}>
          {/* Affichage des points dans l'en-tête */}
          <PointsDisplay size="medium" />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Header with profile information */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.pseudo?.charAt(0) || "?"}
              </Text>
            )}
          </View>

          <Text style={styles.username}>
            {user?.pseudo || t("profile.defaultUsername")}
          </Text>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>
            {t("settings.title").toUpperCase()}
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("../settings/language")}
          >
            <MaterialCommunityIcons
              name="translate"
              size={24}
              color="#FFD700"
            />
            <Text style={styles.settingText}>{t("settings.language")}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#E8B4B8"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() =>
              Alert.alert(t("profile.contact"), t("profile.contactEmail"))
            }
          >
            <MaterialCommunityIcons
              name="email"
              size={24}
              color="#FFD700"
            />
            <Text style={styles.settingText}>{t("profile.contact")}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#E8B4B8"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Linking.openURL("https://emplica.fr/privacy-policy")}
          >
            <MaterialCommunityIcons
              name="shield-account"
              size={24}
              color="#FFD700"
            />
            <Text style={styles.settingText}>{t("settings.privacy")}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#E8B4B8"
            />
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleRestorePurchases}
          >
            <MaterialCommunityIcons
              name="restore"
              size={24}
              color="#FFD700"
            />
            <Text style={styles.settingText}>
              {t("profile.restorePurchases")}
            </Text>
          </TouchableOpacity>

          {/* Switch pour activer/désactiver les notifications */}
          <View style={styles.settingItem}>
            <MaterialCommunityIcons
              name="bell-ring"
              size={24}
              color="#FFD700"
            />
            <Text style={styles.settingText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              thumbColor={notificationsEnabled ? "#C41E3A" : "#ccc"}
              trackColor={{ false: "#888", true: "#C41E3A" }}
            />
          </View>

          {/* Carte Passe Premium */}
          <View style={styles.premiumCard}>
            <Text style={styles.premiumTitle}>
              {t("profile.premium.title").toUpperCase()}
            </Text>
            <View style={styles.premiumFeaturesList}>
              <View style={styles.premiumFeatureRow}>
                <MaterialCommunityIcons
                  name="lock"
                  size={24}
                  color="#7B6EF6"
                  style={styles.premiumIcon}
                />
                <Text style={styles.premiumFeatureText}>
                  {t("profile.premium.features.unlock")}
                </Text>
              </View>
              <View style={styles.premiumFeatureRow}>
                <MaterialCommunityIcons
                  name="fire"
                  size={24}
                  color="#FFB300"
                  style={styles.premiumIcon}
                />
                <Text style={styles.premiumFeatureText}>
                  {t("profile.premium.features.weekly")}
                </Text>
              </View>
              <View style={styles.premiumFeatureRow}>
                <MaterialCommunityIcons
                  name="help-circle"
                  size={24}
                  color="#FFD600"
                  style={styles.premiumIcon}
                />
                <Text style={styles.premiumFeatureText}>
                  {t("profile.premium.features.friends")}
                </Text>
              </View>
              <View style={styles.premiumFeatureRow}>
                <MaterialCommunityIcons
                  name="diamond"
                  size={24}
                  color="#00E0CA"
                  style={styles.premiumIcon}
                />
                <Text style={styles.premiumFeatureText}>
                  {t("profile.premium.features.cancel")}
                </Text>
              </View>
            </View>
            <View style={styles.premiumBottomRow}>
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => {
                  console.log('🔥 Bouton Premium cliqué');
                  showPaywallA(true); // Force l'affichage même pour les membres pro
                }}
              >
                <Text style={styles.premiumButtonText}>
                  {t("profile.premium.try")}
                </Text>
              </TouchableOpacity>
              <View style={styles.premiumOfferTextContainer}>
                <Text style={styles.premiumOfferMain}>
                  {t("profile.premium.free")}
                </Text>
                <Text style={styles.premiumOfferSub}>
                  {t("profile.premium.price")}
                </Text>
              </View>
            </View>
          </View>

          {/* Bouton Admin */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/admin")}
            >
              <MaterialCommunityIcons
                name="shield-crown"
                size={24}
                color="#FFD700"
              />
              <Text style={styles.settingText}>Admin</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#E8B4B8"
              />
            </TouchableOpacity>
          )}

          {/* Section de tests (développement) */}
          {__DEV__ && (
            <View style={styles.testSection}>
              <Text style={styles.testSectionTitle}>🧪 TESTS (DEV ONLY)</Text>
              <View style={styles.testButtonsRow}>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => {
                    sendHalloweenQuizNotification(
                      "Quiz Halloween",
                      "Une partie effrayante t'attend !",
                    );
                  }}
                >
                  <Text style={styles.testButtonText}>🎃 Quiz</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.testButton}
                  onPress={async () => {
                    await HalloweenNotificationScheduler.scheduleTestHalloweenNotification();
                    Alert.alert(
                      "🎃 Test",
                      "Notification Halloween programmée dans 5 secondes !",
                    );
                  }}
                >
                  <Text style={styles.testButtonText}>📅 Oct</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.testButton}
                  onPress={handleOpenPaywallB}
                >
                  <Text style={styles.testButtonText}>💰 PaywallB</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Bouton de déconnexion */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <MaterialCommunityIcons name="logout" size={24} color="#ff6b6b" />
            <Text style={styles.logoutText}>{t("profile.logout")}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerRight: {
    minWidth: 0,
    flexShrink: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: "relative",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#694ED6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255, 111, 0, 0.6)",
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFAF0",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomSpace: {
    height: 80,
  },
  premiumCard: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 111, 0, 0.6)",
    padding: 24,
    marginBottom: 28,
    marginTop: 10,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumTitle: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 20,
    letterSpacing: 1,
    textAlign: "left",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  premiumFeaturesList: {
    marginBottom: 18,
  },
  premiumFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  premiumIcon: {
    width: 28,
    textAlign: "center",
  },
  premiumFeatureText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 14,
    flex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  premiumBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    justifyContent: "space-between",
  },
  premiumButton: {
    backgroundColor: "#C41E3A",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginRight: 12,
    shadowColor: "rgba(255, 111, 0, 0.5)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  premiumOfferTextContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    maxWidth: 120,
  },
  premiumOfferMain: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  premiumOfferSub: {
    color: "#FFFFFF",
    fontSize: 11,
    opacity: 0.9,
    flexWrap: "wrap",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 107, 107, 0.6)",
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 17,
    color: "#ff6b6b",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  testSection: {
    backgroundColor: "rgba(255, 152, 0, 0.2)",
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 152, 0, 0.5)",
  },
  testSectionTitle: {
    color: "#FFA726",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  testButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8,
  },
  testButton: {
    backgroundColor: "#C41E3A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  testButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
});
