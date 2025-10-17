import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking, Modal, Platform, ImageBackground } from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useRevenueCat from '@/hooks/useRevenueCat';
import usePricing from '@/hooks/usePricing';
import { StatusBar } from 'expo-status-bar';
import Purchases from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import HalloweenDecorations from './HalloweenDecorations';
import HalloweenTheme from '@/constants/themes/Halloween';

interface PaywallModalBProps {
  isVisible: boolean;
  onClose: () => void;
  originalPrice?: number; // Prix original pour calculer la réduction
  discountedPrice?: number; // Prix réduit
}

export default function PaywallModalB({ isVisible, onClose, originalPrice, discountedPrice }: PaywallModalBProps) {
  const { currentOffering, isProMember } = useRevenueCat();
  const { pricing, getFormattedPrice, calculateAnnualSavings } = usePricing();
  const [loading, setLoading] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

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

  const packageToUse = currentOffering?.availablePackages?.find((pkg: any) =>
    pkg.packageType === 'ANNUAL'
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
            subscriptionType: 'annual',
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
            <View style={styles.halloweenDecorations}>
              <HalloweenDecorations />
            </View>
            
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
                  <Text style={styles.heroTitle}>{t('paywall.annual.title')}</Text>
                  <Text style={styles.heroSubtitle}>{t('paywall.annual.subtitle')}</Text>
                  <Text style={styles.tagline}>{t('paywall.annual.tagline')}</Text>
                </View>
              </View>

              {/* Badge de réduction */}
              {discountPercentage > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    -{discountPercentage}% {t('paywall.annual.discount')}
                  </Text>
                </View>
              )}

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
                <View style={styles.featureRow}>
                  <View style={styles.checkContainer}>
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  </View>
                  <Text style={styles.featureText}>{t('paywall.annual.features.savings')}</Text>
                  <Ionicons name="trending-down" size={16} color="#ffffff" style={styles.featureIcon} />
                </View>
              </View>

              <View style={styles.annualPlanContainer}>
                <View style={styles.annualPlanCard}>
                  <View style={styles.annualBadge}>
                    <Text style={styles.annualBadgeText}>{t('paywall.plans.annual.badge')}</Text>
                  </View>
                  
                  <Text style={styles.annualTitle}>{t('paywall.plans.annual.title')}</Text>
                  
                  <View style={styles.priceContainer}>
                    {pricing.monthly && (
                      <Text style={styles.originalPrice}>
                        {(pricing.monthly.priceNumber * 12).toFixed(2)} {pricing.monthly.currency}
                      </Text>
                    )}
                    <Text style={styles.discountedPrice}>
                      {getFormattedPrice('annual')}
                    </Text>
                  </View>
                  
                  <Text style={styles.annualPeriod}>{t('paywall.plans.annual.period')}</Text>
                  <Text style={styles.annualDescription}>{t('paywall.plans.annual.description')}</Text>
                  
                  {true && (
                    <View style={styles.savingsContainer}>
                      <Ionicons name="trending-down" size={16} color="#4CAF50" />
                      <Text style={styles.savingsText}>
                        {(() => {
                          const savings = calculateAnnualSavings();
                          
                          if (savings) {
                            return t('paywall.annual.savingsText', { 
                              amount: savings.amount.toFixed(2),
                              currency: savings.currency
                            });
                          } else {
                            // Récupérer la devise depuis les données disponibles
                            const currency = pricing.annual?.currency || 
                                           pricing.monthly?.currency || 
                                           pricing.weekly?.currency || 
                                           'USD';
                            
                            
                            // Calculer des économies approximatives si les données ne sont pas complètes
                            const monthlyPrice = pricing.monthly?.priceNumber || 6.99;
                            const annualPrice = pricing.annual?.priceNumber || 24.99;
                            const estimatedSavings = (monthlyPrice * 12) - annualPrice;
                            
                            return t('paywall.annual.savingsText', { 
                              amount: estimatedSavings.toFixed(2),
                              currency: currency
                            });
                          }
                        })()}
                      </Text>
                    </View>
                  )}
                </View>
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
                      {t('paywall.annual.cta')}
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
  discountBadge: {
    backgroundColor: '#FF1744',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
  annualPlanContainer: {
    width: '100%',
    marginBottom: 16,
  },
  annualPlanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    position: 'relative',
    alignItems: 'center',
  },
  annualBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  annualBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  annualTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 18,
    color: '#B0B0B0',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  discountedPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  annualPeriod: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  annualDescription: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 12,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  savingsText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 12,
    marginVertical: 10,
    overflow: 'hidden',
    backgroundColor: '#FF6F00',
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
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
