import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useRevenueCat from '@/hooks/useRevenueCat';
import { StatusBar } from 'expo-status-bar';
import Purchases from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

const WEEKLY_PRICE = '3,99';
const MONTHLY_PRICE = '7,99';
const ANNUAL_PRICE = '29,99';

interface PaywallModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isVisible, onClose }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const { currentOffering, isProMember } = useRevenueCat();
  const [loading, setLoading] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowCloseButton(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowCloseButton(false);
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
        'Produit non disponible',
        'L\'abonnement n\'est pas disponible pour le moment. Veuillez réessayer plus tard.'
      );
      return;
    }
    try {
      setLoading(true);
      const purchaseInfo = await Purchases.purchasePackage(packageToUse);
      if (purchaseInfo?.customerInfo?.entitlements?.active) {
        Alert.alert(
          'Succès',
          'Merci pour votre achat!'
        );
        onClose();
      } else {
        Alert.alert(
          'Information',
          'Votre abonnement a été traité mais n\'est pas encore actif. Veuillez redémarrer l\'application.'
        );
      }
    } catch (e: any) {
      Alert.alert(
        'Erreur',
        e?.message || 'L\'achat a échoué. Veuillez réessayer ou choisir un autre moyen de paiement.'
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
        'Succès',
        'Votre achat a été restauré!'
      );
      onClose();
    } catch (e) {
      Alert.alert(
        'Erreur',
        'La restauration des achats a échoué'
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
          'Erreur',
          'Impossible d\'ouvrir les CGU'
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Erreur lors de l\'ouverture des CGU'
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
                <Text style={styles.heroTitle}>Nightly Premium</Text>
                <Text style={styles.heroSubtitle}>UNLIMITED ACCESS</Text>
                <Text style={styles.tagline}>JOUEZ SANS LIMITES</Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <View style={styles.checkContainer}>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>Accès illimité à tous les modes</Text>
                <Ionicons name="game-controller" size={20} color="#ffffff" style={styles.featureIcon} />
              </View>
              <View style={styles.featureRow}>
                <View style={styles.checkContainer}>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>Nouvelles cartes chaque semaine</Text>
                <Ionicons name="refresh" size={20} color="#ffffff" style={styles.featureIcon} />
              </View>
              <View style={styles.featureRow}>
                <View style={styles.checkContainer}>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>Ambiances visuelles exclusives</Text>
                <Ionicons name="color-palette" size={20} color="#ffffff" style={styles.featureIcon} />
              </View>
              <View style={styles.featureRow}>
                <View style={styles.checkContainer}>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>Personnalisation des personnages</Text>
                <Ionicons name="person" size={20} color="#ffffff" style={styles.featureIcon} />
              </View>
              <View style={styles.featureRow}>
                <View style={styles.checkContainer}>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>Mises à jour prioritaires</Text>
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
                  <Text style={styles.badgeText}>PASS</Text>
                </View>
                <Text style={styles.planTitle}>Nightly Pass</Text>
                <Text style={styles.planPrice}>{WEEKLY_PRICE} €</Text>
                <Text style={styles.planPeriod}>par semaine</Text>
                <Text style={styles.planDescription}>Parfait pour une soirée ou un week-end entre amis</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planOption,
                  selectedPlan === 'monthly' && styles.selectedPlan
                ]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <View style={[styles.planBadge, styles.monthlyBadge]}>
                  <Text style={styles.badgeText}>PARTY</Text>
                </View>
                <Text style={styles.planTitle}>Nightly Party</Text>
                <Text style={styles.planPrice}>{MONTHLY_PRICE} €</Text>
                <Text style={styles.planPeriod}>par mois</Text>
                <Text style={styles.planDescription}>Pour ceux qui jouent régulièrement</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planOption,
                  selectedPlan === 'annual' && styles.selectedPlan
                ]}
                onPress={() => setSelectedPlan('annual')}
              >
                <View style={[styles.planBadge, styles.annualBadge]}>
                  <Text style={styles.badgeText}>ALL ACCESS</Text>
                </View>
                <Text style={styles.planTitle}>Nightly All Access</Text>
                <Text style={styles.planPrice}>{ANNUAL_PRICE} €</Text>
                <Text style={styles.planPeriod}>par an</Text>
                <Text style={styles.planDescription}>L'offre ultime pour les fans</Text>
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
                    Commencer maintenant
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={handleRestore} disabled={loading}>
                <Text style={styles.footerText}>Restaurer les achats</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleTermsPress}>
                <Text style={styles.footerText}>CGU</Text>
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
    paddingTop: 2,
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
    fontSize: 24,
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