import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking, Modal, Platform, ImageBackground } from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useRevenueCat from '@/hooks/useRevenueCat';
import usePricing from '@/hooks/usePricing';
import { useAppsFlyer } from '@/hooks/useAppsFlyer';
import { StatusBar } from 'expo-status-bar';
import Purchases from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import ChristmasTheme from '@/constants/themes/Christmas';
import {
  trackPaywallPlanSelected,
  trackPaywallPurchaseSuccess,
  trackPaywallPurchaseFailed,
  trackPaywallPurchaseCancelled,
  trackPaywallClosed,
  trackPaywallRestoreAttempt,
  trackPaywallTermsClicked
} from '@/services/paywallAnalytics';

interface PaywallModalAProps {
  isVisible: boolean;
  onClose: () => void;
  onUpgradeToAnnual?: () => void; // Callback pour suggérer l'annuel
}

export default function PaywallModalA({ isVisible, onClose, onUpgradeToAnnual }: PaywallModalAProps) {
  const [selectedPlan, setSelectedPlan] = useState('weekly');
  const { currentOffering, isProMember } = useRevenueCat();
  const { pricing, getFormattedPrice } = usePricing();
  const { logPurchase } = useAppsFlyer();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

  // Log pour debug
  React.useEffect(() => {
    console.log('💰 PaywallModalA - isVisible:', isVisible, 'isProMember:', isProMember, 'currentOffering:', !!currentOffering);
  }, [isVisible, isProMember, currentOffering]);

  const packageToUse = currentOffering?.availablePackages?.find((pkg: any) =>
    selectedPlan === 'weekly'
      ? pkg.packageType === 'WEEKLY'
      : pkg.packageType === 'ANNUAL'
  );

  // Calculer le pourcentage de réduction annuel
  const calculateDiscountPercentage = () => {
    if (!pricing.weekly || !pricing.annual) return null;
    const weeklyYearlyCost = pricing.weekly.priceNumber * 52; // 52 semaines dans une année
    const savings = weeklyYearlyCost - pricing.annual.priceNumber;
    const discountPercentage = Math.round((savings / weeklyYearlyCost) * 100);
    return discountPercentage > 0 ? discountPercentage : null;
  };

  const discountPercentage = calculateDiscountPercentage();

  // Track plan selection
  React.useEffect(() => {
    if (isVisible && packageToUse?.product) {
      trackPaywallPlanSelected(
        'A',
        selectedPlan as 'weekly' | 'annual',
        packageToUse.product.price
      );
    }
  }, [selectedPlan, isVisible]);

  const handleSubscribe = async () => {
    if (!packageToUse) {
      Alert.alert(
        t('paywall.alerts.productUnavailable.title'),
        t('paywall.alerts.productUnavailable.message')
      );
      return;
    }
    try {
      setLoading(true);
      const purchaseInfo = await Purchases.purchasePackage(packageToUse);
      if (purchaseInfo?.customerInfo?.entitlements?.active) {
        if (user?.uid) {
          const db = getFirestore();
          await updateDoc(doc(db, 'users', user.uid), {
            hasActiveSubscription: true,
            subscriptionType: selectedPlan,
            subscriptionUpdatedAt: new Date().toISOString(),
          });
          setUser(user ? { ...user, hasActiveSubscription: true } : null);
        }

        // Track AppsFlyer purchase event
        if (packageToUse?.product) {
          const revenue = packageToUse.product.price;
          const currency = packageToUse.product.currencyCode || 'USD';
          await logPurchase(revenue, currency, 1, {
            subscription_type: selectedPlan,
            package_type: packageToUse.packageType,
          });

          // Track purchase success in analytics
          await trackPaywallPurchaseSuccess(
            'A',
            selectedPlan as 'weekly' | 'annual',
            revenue,
            currency
          );
        }

        Alert.alert(
          t('paywall.alerts.success.title'),
          t('paywall.alerts.success.message')
        );
        await trackPaywallClosed('A', 'purchase_success');
        onClose();
      } else {
        Alert.alert(
          t('paywall.alerts.pending.title'),
          t('paywall.alerts.pending.message')
        );
      }
    } catch (e: any) {
      // Check if user cancelled
      if (e?.code === 'PURCHASES_CANCELLED_ERROR' || e?.userCancelled) {
        await trackPaywallPurchaseCancelled('A', selectedPlan as 'weekly' | 'annual');
      } else {
        await trackPaywallPurchaseFailed('A', selectedPlan as 'weekly' | 'annual', e?.message);
      }

      Alert.alert(
        t('paywall.alerts.error.title'),
        e?.message || t('paywall.alerts.error.message')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      await Purchases.restorePurchases();
      await trackPaywallRestoreAttempt('A', true);
      Alert.alert(
        t('paywall.alerts.restoreSuccess.title'),
        t('paywall.alerts.restoreSuccess.message')
      );
      await trackPaywallClosed('A', 'purchase_success');
      onClose();
    } catch (e) {
      await trackPaywallRestoreAttempt('A', false);
      Alert.alert(
        t('paywall.alerts.restoreError.title'),
        t('paywall.alerts.restoreError.message')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTermsPress = async () => {
    await trackPaywallTermsClicked('A');
    const termsUrl = 'https://emplica.fr/privacy-policy';
    try {
      const canOpen = await Linking.canOpenURL(termsUrl);
      if (canOpen) {
        await Linking.openURL(termsUrl);
      } else {
        Alert.alert(
          t('paywall.alerts.termsError.title'),
          t('paywall.alerts.termsError.message')
        );
      }
    } catch (error) {
      Alert.alert(
        t('paywall.alerts.termsError.title'),
        t('paywall.alerts.termsError.message')
      );
    }
  };

  const handleClose = async () => {
    // Track paywall closed by user
    await trackPaywallClosed('A', 'user_closed');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={handleClose}
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
              ChristmasTheme.light?.backgroundDarker || '#0D0D1A',
              ChristmasTheme.light?.secondary || '#8B1538',
              ChristmasTheme.light?.primary || '#C41E3A',
              ChristmasTheme.light?.secondary || '#8B1538',
              ChristmasTheme.light?.backgroundDarker || '#0D0D1A',
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
                <TouchableOpacity style={styles.backButton} onPress={handleClose}>
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

              <View style={styles.subscriptionOptions}>
                <TouchableOpacity
                  style={[
                    styles.planOption,
                    styles.annualCard,
                    selectedPlan === 'annual' && styles.selectedAnnual
                  ]}
                  onPress={() => setSelectedPlan('annual')}
                >
                  {discountPercentage && (
                    <View style={[
                      styles.discountBadge,
                      selectedPlan === 'annual' && styles.discountBadgeSelected
                    ]}>
                      <Text style={styles.discountText}>-{discountPercentage}%</Text>
                    </View>
                  )}
                  {selectedPlan === 'annual' && (
                    <View style={styles.selectedCheckmarkAnnual}>
                      <Ionicons name="checkmark-circle" size={24} color={ChristmasTheme.light?.primary || '#C41E3A'} />
                    </View>
                  )}
                  <Text style={[
                    styles.planTitleAnnual,
                    selectedPlan === 'annual' && styles.planTitleAnnualSelected
                  ]}>ANNUEL</Text>
                  <Text style={[
                    styles.planPriceAnnual,
                    selectedPlan === 'annual' && styles.planPriceAnnualSelected
                  ]}>
                    {getFormattedPrice('annual')}
                  </Text>
                  <Text style={[
                    styles.planPeriodAnnual,
                    selectedPlan === 'annual' && styles.planPeriodAnnualSelected
                  ]}>par an</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.planOption,
                    styles.weeklyCard,
                    selectedPlan === 'weekly' && styles.selectedWeekly
                  ]}
                  onPress={() => setSelectedPlan('weekly')}
                >
                  <View style={styles.specialOfferBadge}>
                    <Text style={styles.specialOfferText}>OFFRE SPÉCIALE</Text>
                  </View>
                  {selectedPlan === 'weekly' && (
                    <View style={styles.selectedCheckmark}>
                      <Ionicons name="checkmark-circle" size={24} color={ChristmasTheme.light?.primary || '#C41E3A'} />
                    </View>
                  )}
                  <Text style={styles.planTitleWeekly}>ESSAI GRATUIT</Text>
                  <Text style={styles.planPriceWeekly}>
                    3 jours gratuits, puis {getFormattedPrice('weekly')} par semaine
                  </Text>
                </TouchableOpacity>
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
                  <Text style={styles.footerText}>{t('paywall.footer.restore')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleTermsPress}>
                  <Text style={styles.footerText}>{t('paywall.footer.terms')}</Text>
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
    position: 'absolute',
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
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 5,
    justifyContent: 'flex-end',
    paddingRight: 20,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 15 : 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    padding: 8,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  heroContent: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  titleContainer: {
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  devilIcon: {
    fontSize: 40,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  checkContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ChristmasTheme.light?.secondary || '#8B1538',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    flex: 1,
  },
  subscriptionOptions: {
    width: '100%',
    paddingHorizontal: 20,
    gap: 16,
  },
  planOption: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    borderWidth: 2,
  },
  annualCard: {
    backgroundColor: 'rgba(240, 98, 146, 0.3)', // Light pink/purple
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedAnnual: {
    backgroundColor: '#ffffff', // Blanc quand sélectionné
    borderColor: ChristmasTheme.light?.primary || '#C41E3A',
    borderWidth: 2,
    shadowColor: ChristmasTheme.light?.primary || '#C41E3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  weeklyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent quand non sélectionné
    borderColor: 'rgba(139, 21, 56, 0.3)',
  },
  selectedWeekly: {
    backgroundColor: '#ffffff', // Blanc complet quand sélectionné
    borderColor: ChristmasTheme.light?.primary || '#C41E3A',
    borderWidth: 2,
    shadowColor: ChristmasTheme.light?.primary || '#C41E3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: ChristmasTheme.light?.secondary || '#8B1538',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgeSelected: {
    backgroundColor: ChristmasTheme.light?.primary || '#C41E3A',
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  specialOfferBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF8C00', // Orange
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialOfferText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  selectedCheckmark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  selectedCheckmarkAnnual: {
    position: 'absolute',
    top: 50, // Plus bas pour éviter le badge de réduction
    right: 12,
  },
  planTitleAnnual: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  planTitleAnnualSelected: {
    color: ChristmasTheme.light?.secondary || '#8B1538',
  },
  planPriceAnnual: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  planPriceAnnualSelected: {
    color: ChristmasTheme.light?.secondary || '#8B1538',
  },
  planPeriodAnnual: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  planPeriodAnnualSelected: {
    color: ChristmasTheme.light?.secondary || '#8B1538',
    opacity: 1,
  },
  planTitleWeekly: {
    fontSize: 20,
    fontWeight: '800',
    color: ChristmasTheme.light?.secondary || '#8B1538',
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  planPriceWeekly: {
    fontSize: 15,
    fontWeight: '600',
    color: ChristmasTheme.light?.secondary || '#8B1538',
    lineHeight: 20,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 16,
    marginVertical: 20,
    paddingVertical: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: ChristmasTheme.light?.secondary || '#8B1538',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
});
