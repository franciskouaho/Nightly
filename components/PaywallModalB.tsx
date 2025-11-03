import ChristmasTheme from "@/constants/themes/Christmas";
import { useAuth } from "@/contexts/AuthContext";
import usePricing from "@/hooks/usePricing";
import useRevenueCat from "@/hooks/useRevenueCat";
import { Ionicons } from "@expo/vector-icons";
import { doc, getFirestore, updateDoc } from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Purchases from "react-native-purchases";
import { SafeAreaView } from "react-native-safe-area-context";

interface PaywallModalBProps {
  isVisible: boolean;
  onClose: () => void;
  originalPrice?: number; // Prix original pour calculer la réduction
  discountedPrice?: number; // Prix réduit
}

export default function PaywallModalB({
  isVisible,
  onClose,
  originalPrice,
  discountedPrice,
}: PaywallModalBProps) {
  const { currentOffering, isProMember } = useRevenueCat();
  const { pricing, getFormattedPrice, calculateAnnualSavings } = usePricing();
  const [loading, setLoading] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

  // Log pour debug
  React.useEffect(() => {
    console.log('💎 PaywallModalB - isVisible:', isVisible, 'isProMember:', isProMember, 'currentOffering:', !!currentOffering);
  }, [isVisible, isProMember, currentOffering]);

  // Calculer la réduction en pourcentage depuis RevenueCat
  useEffect(() => {
    const savings = calculateAnnualSavings();

    if (savings) {
      setDiscountPercentage(savings.percentage);
    } else {
      // Forcer un pourcentage de réduction pour les tests
      setDiscountPercentage(50);
    }
  }, [calculateAnnualSavings, discountPercentage]);

  const packageToUse = currentOffering?.availablePackages?.find(
    (pkg: any) => pkg.packageType === "ANNUAL",
  );

  const handleSubscribe = async () => {
    if (!packageToUse) {
      Alert.alert(
        t("paywall.alerts.productUnavailable.title"),
        t("paywall.alerts.productUnavailable.message"),
      );
      return;
    }
    try {
      setLoading(true);
      const purchaseInfo = await Purchases.purchasePackage(packageToUse);
      if (purchaseInfo?.customerInfo?.entitlements?.active) {
        if (user?.uid) {
          const db = getFirestore();
          await updateDoc(doc(db, "users", user.uid), {
            hasActiveSubscription: true,
            subscriptionType: "annual",
            subscriptionUpdatedAt: new Date().toISOString(),
          });
          setUser(user ? { ...user, hasActiveSubscription: true } : null);
        }
        Alert.alert(
          t("paywall.alerts.success.title"),
          t("paywall.alerts.success.message"),
        );
        onClose();
      } else {
        Alert.alert(
          t("paywall.alerts.pending.title"),
          t("paywall.alerts.pending.message"),
        );
      }
    } catch (e: any) {
      Alert.alert(
        t("paywall.alerts.error.title"),
        e?.message || t("paywall.alerts.error.message"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      await Purchases.restorePurchases();
      Alert.alert(
        t("paywall.alerts.restoreSuccess.title"),
        t("paywall.alerts.restoreSuccess.message"),
      );
      onClose();
    } catch (e) {
      Alert.alert(
        t("paywall.alerts.restoreError.title"),
        t("paywall.alerts.restoreError.message"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTermsPress = async () => {
    const termsUrl = "https://emplica.fr/privacy-policy";
    try {
      const canOpen = await Linking.canOpenURL(termsUrl);
      if (canOpen) {
        await Linking.openURL(termsUrl);
      } else {
        Alert.alert(
          t("paywall.alerts.termsError.title"),
          t("paywall.alerts.termsError.message"),
        );
      }
    } catch (error) {
      Alert.alert(
        t("paywall.alerts.termsError.title"),
        t("paywall.alerts.termsError.message"),
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { zIndex: 10 }]}>
        <StatusBar style="light" />
        <ImageBackground
          source={require("@/assets/images/logo.png")}
          style={styles.background}
          resizeMode="repeat"
          imageStyle={{ opacity: 0.3 }}
        >
          <LinearGradient
            colors={[
              ChristmasTheme.light?.backgroundDarker || "#0D0D1A",
              ChristmasTheme.light?.secondary || "#8B1538",
              ChristmasTheme.light?.primary || "#C41E3A",
              ChristmasTheme.light?.secondary || "#8B1538",
              ChristmasTheme.light?.backgroundDarker || "#0D0D1A",
            ]}
            locations={[0, 0.2, 0.5, 0.8, 1]}
            style={styles.gradientOverlay}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.header, { zIndex: 15 }]}>
                <TouchableOpacity style={styles.backButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={styles.heroSection}>
                <View style={styles.heroContent}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.heroTitle}>NIGHTLY</Text>
                    <Text style={styles.heroTitle}>PREMIUM</Text>
                    <Text style={styles.heroTitle}>CHAOS ILLIMITÉ</Text>
                  </View>
                </View>
              </View>

              <View style={styles.featuresContainer}>
                <View style={styles.featureRow}>
                  <View style={styles.checkContainer}>
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  </View>
                  <Text style={styles.featureText}>Débloque tous les modes</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={styles.checkContainer}>
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  </View>
                  <Text style={styles.featureText}>Accès gratuit pour tes amis</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={styles.checkContainer}>
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  </View>
                  <Text style={styles.featureText}>Plus de 4000 questions folles</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={styles.checkContainer}>
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  </View>
                  <Text style={styles.featureText}>Annulable à tout moment</Text>
                </View>
              </View>

              <View style={styles.annualPlanContainer}>
                <View style={styles.annualPlanCard}>
                  {discountPercentage > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{discountPercentage}%</Text>
                    </View>
                  )}
                  <View style={styles.selectedCheckmark}>
                    <Ionicons name="checkmark-circle" size={24} color={ChristmasTheme.light?.primary || '#C41E3A'} />
                  </View>
                  <Text style={styles.annualTitle}>ANNUEL</Text>
                  <Text style={styles.discountedPrice}>
                    {getFormattedPrice("annual")}
                  </Text>
                  <Text style={styles.annualPeriod}>par an</Text>
                  <Text style={styles.annualDescription}>
                    {t("paywall.plans.annual.description")}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleSubscribe}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={ChristmasTheme.light?.secondary || '#8B1538'} size="small" />
                ) : (
                  <Text style={styles.ctaButtonText}>
                    COMMENCE TON ESSAI GRATUIT
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.footerLinks}>
                <TouchableOpacity onPress={handleRestore} disabled={loading}>
                  <Text style={styles.footerText}>
                    {t("paywall.footer.restore")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleTermsPress}>
                  <Text style={styles.footerText}>
                    {t("paywall.footer.terms")}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </ImageBackground>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gradientOverlay: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 40,
    minHeight: "100%",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 35,
    paddingBottom: 5,
    justifyContent: "flex-end",
    paddingRight: 20,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 15 : 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    padding: 8,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  heroContent: {
    width: "100%",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  titleContainer: {
    width: "100%",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  checkContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ChristmasTheme.light?.secondary || "#8B1538",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
    flex: 1,
  },
  annualPlanContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  annualPlanCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: ChristmasTheme.light?.primary || "#C41E3A",
    position: "relative",
    shadowColor: ChristmasTheme.light?.primary || "#C41E3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: ChristmasTheme.light?.primary || "#C41E3A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  selectedCheckmark: {
    position: "absolute",
    top: 50,
    right: 12,
  },
  annualTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: ChristmasTheme.light?.secondary || "#8B1538",
    marginBottom: 8,
    marginTop: 20,
    textTransform: "uppercase",
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: ChristmasTheme.light?.secondary || "#8B1538",
    marginBottom: 4,
  },
  annualPeriod: {
    fontSize: 14,
    color: ChristmasTheme.light?.secondary || "#8B1538",
    marginBottom: 6,
  },
  annualDescription: {
    fontSize: 13,
    color: ChristmasTheme.light?.secondary || "#8B1538",
    opacity: 0.8,
    marginTop: 6,
  },
  savingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  savingsText: {
    color: "#C41E3A",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  ctaButton: {
    width: "100%",
    borderRadius: 16,
    marginVertical: 20,
    paddingVertical: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: ChristmasTheme.light?.secondary || "#8B1538",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
    opacity: 0.9,
  },
});
