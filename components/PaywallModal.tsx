import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useRevenueCat from '@/hooks/useRevenueCat';
import { StatusBar } from 'expo-status-bar';
import Purchases from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface PaywallModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isVisible, onClose }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const { currentOffering, isProMember } = useRevenueCat();
  const [loading, setLoading] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowCloseButton(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowCloseButton(false);
      return undefined;
    }
  }, [isVisible]);

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
    const termsUrl = 'https://emplica.fr/terms-of-use';
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
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={styles.background}
        />
        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <View style={styles.header}>
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
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>{t('paywall.features.unlimited')}</Text>
                <Ionicons name="game-controller" size={20} color="#ffffff" style={styles.featureIcon} />
              </View>
              <View style={styles.featureRow}>
                <View style={styles.checkContainer}>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>{t('paywall.features.weekly')}</Text>
                <Ionicons name="refresh" size={20} color="#ffffff" style={styles.featureIcon} />
              </View>
              <View style={styles.featureRow}>
                <View style={styles.checkContainer}>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>{t('paywall.features.visuals')}</Text>
                <Ionicons name="color-palette" size={20} color="#ffffff" style={styles.featureIcon} />
              </View>
              <View style={styles.featureRow}>
                <View style={styles.checkContainer}>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>{t('paywall.features.characters')}</Text>
                <Ionicons name="person" size={20} color="#ffffff" style={styles.featureIcon} />
              </View>
              <View style={styles.featureRow}>
                <View style={styles.checkContainer}>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>{t('paywall.features.updates')}</Text>
                <Ionicons name="star" size={20} color="#ffffff" style={styles.featureIcon} />
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
                </View>
                <Text style={styles.planTitle}>{t('paywall.plans.weekly.title')}</Text>
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
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 5,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#000',
    shadowColor: '#000',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  heroContent: {
    width: '100%',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  tagline: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 15,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#694ED6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
  },
  featureIcon: {
    marginLeft: 8,
  },
  subscriptionOptions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  planOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
    minWidth: 100,
  },
  selectedPlan: {
    borderColor: '#694ED6',
    borderWidth: 2,
    backgroundColor: 'rgba(105, 78, 214, 0.1)',
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
    backgroundColor: '#FFD700',
  },
  monthlyBadge: {
    backgroundColor: '#9370DB',
  },
  annualBadge: {
    backgroundColor: '#32CD32',
  },
  badgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 10,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 5,
    marginTop: 10,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 8,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 20,
    marginVertical: 20,
    overflow: 'hidden',
    backgroundColor: '#694ED6',
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
}); 
