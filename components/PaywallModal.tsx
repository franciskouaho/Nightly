import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking, Modal, Platform, ImageBackground, Image } from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useRevenueCat from '@/hooks/useRevenueCat';
import { StatusBar } from 'expo-status-bar';
import Purchases from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import HalloweenDecorations from './HalloweenDecorations';
import HalloweenTheme from '@/constants/themes/Halloween';

interface PaywallModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isVisible, onClose }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const { currentOffering, isProMember } = useRevenueCat();
  const [loading, setLoading] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(true);
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

  const packageToUse = currentOffering?.availablePackages?.find((pkg: any) =>
    selectedPlan === 'weekly'
      ? pkg.packageType === 'WEEKLY'
      : selectedPlan === 'monthly'
      ? pkg.packageType === 'MONTHLY'
      : pkg.packageType === 'ANNUAL'
  );

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
        Alert.alert(
          t('paywall.alerts.success.title'),
          t('paywall.alerts.success.message')
        );
        onClose();
      } else {
        Alert.alert(
          t('paywall.alerts.pending.title'),
          t('paywall.alerts.pending.message')
        );
      }
    } catch (e: any) {
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
      Alert.alert(
        t('paywall.alerts.restoreSuccess.title'),
        t('paywall.alerts.restoreSuccess.message')
      );
      onClose();
    } catch (e) {
      Alert.alert(
        t('paywall.alerts.restoreError.title'),
        t('paywall.alerts.restoreError.message')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTermsPress = async () => {
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
          source={require("@/assets/halloween/logo.png")}
          style={styles.background}
          resizeMode="repeat"
          imageStyle={{ opacity: 0.3 }}
        >
          <LinearGradient
            colors={[
              HalloweenTheme.light?.backgroundDarker || '#120F1C',
              HalloweenTheme.light?.secondary || '#4B1E00',
              HalloweenTheme.light?.primary || '#FF6F00',
              HalloweenTheme.light?.secondary || '#4B1E00',
              HalloweenTheme.light?.backgroundDarker || '#120F1C',
            ]}
            locations={[0, 0.2, 0.5, 0.8, 1]}
            style={styles.gradientOverlay}
          >
            {/* Décorations Halloween */}
            <View style={styles.halloweenDecorations}>
              <HalloweenDecorations />
            </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { zIndex: 15 }]}>
            {showCloseButton && (
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{t('paywall.title')}</Text>
              <Text style={styles.heroSubtitle}>{t('paywall.subtitle')}</Text>
              <Text style={styles.tagline}>{t('paywall.tagline')}</Text>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <View style={styles.checkContainer}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
              <Text style={styles.featureText}>{t('paywall.features.unlimited')}</Text>
              <Ionicons name="game-controller" size={16} color="#ffffff" style={styles.featureIcon} />
            </View>
            <View style={styles.featureRow}>
              <View style={styles.checkContainer}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
              <Text style={styles.featureText}>{t('paywall.features.weekly')}</Text>
              <Ionicons name="refresh" size={16} color="#ffffff" style={styles.featureIcon} />
            </View>
            <View style={styles.featureRow}>
              <View style={styles.checkContainer}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
              <Text style={styles.featureText}>{t('paywall.features.visuals')}</Text>
              <Ionicons name="color-palette" size={16} color="#ffffff" style={styles.featureIcon} />
            </View>
            <View style={styles.featureRow}>
              <View style={styles.checkContainer}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
              <Text style={styles.featureText}>{t('paywall.features.characters')}</Text>
              <Ionicons name="person" size={16} color="#ffffff" style={styles.featureIcon} />
            </View>
            <View style={styles.featureRow}>
              <View style={styles.checkContainer}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
              <Text style={styles.featureText}>{t('paywall.features.updates')}</Text>
              <Ionicons name="star" size={16} color="#ffffff" style={styles.featureIcon} />
            </View>
          </View>

          <View style={styles.subscriptionOptions}>
            <TouchableOpacity
              style={[
                styles.planOption,
                selectedPlan === 'weekly' && styles.selectedPlan
              ]}
              onPress={() => setSelectedPlan('weekly')}
            >
              <View style={[styles.planBadge, styles.weeklyBadge]}>
                <Text style={styles.badgeText}>{t('paywall.plans.weekly.badge')}</Text>
                <Text style={{color: '#111', fontWeight: 'bold', fontSize: 9, marginTop: 1, textAlign: 'center'}}>{t('paywall.freeTrial')}</Text>
              </View>
              <Text style={[styles.planTitle, {marginTop: 18}]}>{t('paywall.plans.weekly.title')}</Text>
              <Text style={styles.planPrice}>{t('paywall.prices.weekly')} {t('paywall.prices.currency')}</Text>
              <Text style={styles.planPeriod}>{t('paywall.plans.weekly.period')}</Text>
              <Text style={styles.planDescription}>{t('paywall.plans.weekly.description')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planOption,
                selectedPlan === 'monthly' && styles.selectedPlan
              ]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <View style={[styles.planBadge, styles.monthlyBadge]}>
                <Text style={styles.badgeText}>{t('paywall.plans.monthly.badge')}</Text>
              </View>
              <Text style={styles.planTitle}>{t('paywall.plans.monthly.title')}</Text>
              <Text style={styles.planPrice}>{t('paywall.prices.monthly')} {t('paywall.prices.currency')}</Text>
              <Text style={styles.planPeriod}>{t('paywall.plans.monthly.period')}</Text>
              <Text style={styles.planDescription}>{t('paywall.plans.monthly.description')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planOption,
                selectedPlan === 'annual' && styles.selectedPlan
              ]}
              onPress={() => setSelectedPlan('annual')}
            >
              <View style={[styles.planBadge, styles.annualBadge]}>
                <Text style={styles.badgeText}>{t('paywall.plans.annual.badge')}</Text>
              </View>
              <Text style={styles.planTitle}>{t('paywall.plans.annual.title')}</Text>
              <Text style={styles.planPrice}>{t('paywall.prices.annual')} {t('paywall.prices.currency')}</Text>
              <Text style={styles.planPeriod}>{t('paywall.plans.annual.period')}</Text>
              <Text style={styles.planDescription}>{t('paywall.plans.annual.description')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleSubscribe}
            disabled={loading}
          >
            <View style={styles.gradientButton}>
              {loading ? (
                <ActivityIndicator color="#E66F50" size="small" />
              ) : (
                <Text style={styles.ctaButtonText}>
                  {t('paywall.cta')}
                </Text>
              )}
            </View>
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
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 25,
    paddingBottom: 5,
    justifyContent: 'flex-end',
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#000',
    shadowColor: '#000',
    marginTop: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  heroContent: {
    width: '100%',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  tagline: {
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: HalloweenTheme.light?.secondary || '#4B1E00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  featureText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
  },
  featureIcon: {
    marginLeft: 4,
  },
  subscriptionOptions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  planOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
    minWidth: 80,
  },
  selectedPlan: {
    borderColor: '#8B4513',
    borderWidth: 2,
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
  },
  planBadge: {
    position: 'absolute',
    top: -12,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weeklyBadge: {
    backgroundColor: HalloweenTheme.light?.primary || '#FF6F00',
  },
  monthlyBadge: {
    backgroundColor: HalloweenTheme.light?.secondary || '#4B1E00',
  },
  annualBadge: {
    backgroundColor: HalloweenTheme.light?.error || '#FF1744',
  },
  badgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 10,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    marginTop: 12,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 6,
  },
  planDescription: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 6,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 12,
    marginVertical: 10,
    overflow: 'hidden',
    backgroundColor: HalloweenTheme.light?.secondary || '#4B1E00',
  },
  gradientButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 4,
    marginBottom: 10,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  halloweenDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none',
  },
}); 
