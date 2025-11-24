import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { linkWithGoogle, linkWithApple, grantFreePremiumSubscription } from '@/services/linkAccount';
import { useTranslation } from 'react-i18next';
import { getAuth } from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('window');

interface LinkAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onLinkSuccess: () => void;
}

export default function LinkAccountModal({ visible, onClose, onLinkSuccess }: LinkAccountModalProps) {
  const { t } = useTranslation();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);

  const handleLinkWithGoogle = async () => {
    setLoadingGoogle(true);
    try {
      const result = await linkWithGoogle();

      if (result.success) {
        // Attribuer l'abonnement gratuit
        const userId = getAuth().currentUser?.uid;
        if (userId) {
          const subscriptionResult = await grantFreePremiumSubscription(userId);
          if (!subscriptionResult.success) {
            console.error('Erreur lors de l\'attribution de l\'abonnement:', subscriptionResult.error);
          }
        }

        Alert.alert(
          t('linkAccount.successTitle') || 'Compte lié !',
          t('linkAccountModal.successWithReward') || 'Votre compte a été lié avec succès ! Vous avez gagné 1 mois d\'abonnement Premium gratuit ! 🎉',
          [
            {
              text: 'OK',
              onPress: () => {
                onLinkSuccess();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          t('linkAccount.errorTitle') || 'Erreur',
          result.error || t('linkAccount.errorMessage') || 'Impossible de lier votre compte'
        );
        setLoadingGoogle(false);
      }
    } catch (error) {
      console.error('Erreur lors de la liaison:', error);
      Alert.alert(
        t('linkAccount.errorTitle') || 'Erreur',
        t('linkAccount.errorMessage') || 'Une erreur inattendue est survenue'
      );
      setLoadingGoogle(false);
    }
  };

  const handleLinkWithApple = async () => {
    setLoadingApple(true);
    try {
      const result = await linkWithApple();

      if (result.success) {
        // Attribuer l'abonnement gratuit
        const userId = getAuth().currentUser?.uid;
        if (userId) {
          const subscriptionResult = await grantFreePremiumSubscription(userId);
          if (!subscriptionResult.success) {
            console.error('Erreur lors de l\'attribution de l\'abonnement:', subscriptionResult.error);
          }
        }

        Alert.alert(
          t('linkAccount.successTitle') || 'Compte lié !',
          t('linkAccountModal.successWithReward') || 'Votre compte a été lié avec succès ! Vous avez gagné 3 jours d\'abonnement Premium gratuit ! 🎉',
          [
            {
              text: 'OK',
              onPress: () => {
                onLinkSuccess();
              },
            },
          ]
        );
      } else {
        if (result.error !== 'Connexion annulée') {
          Alert.alert(
            t('linkAccount.errorTitle') || 'Erreur',
            result.error || t('linkAccount.errorMessage') || 'Impossible de lier votre compte'
          );
        }
        setLoadingApple(false);
      }
    } catch (error) {
      console.error('Erreur lors de la liaison:', error);
      Alert.alert(
        t('linkAccount.errorTitle') || 'Erreur',
        t('linkAccount.errorMessage') || 'Une erreur inattendue est survenue'
      );
      setLoadingApple(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={50} style={styles.blurContainer}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContainer}
          >
            <LinearGradient
              colors={['#2A0505', '#8B1538', '#C41E3A']}
              style={styles.modalContent}
            >
              {/* Bouton fermer */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="close" size={24} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>

              {/* Icône principale */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#FFA726', '#FF6F00']}
                  style={styles.iconGradient}
                >
                  <MaterialCommunityIcons name="shield-alert" size={50} color="#FFF" />
                </LinearGradient>
              </View>

              {/* Titre */}
              <Text style={styles.title}>
                {t('linkAccountModal.title') || 'Sécurisez votre compte !'}
              </Text>

              {/* Description */}
              <Text style={styles.description}>
                {t('linkAccountModal.description') || 'Votre compte n\'est pas encore sécurisé. Liez-le maintenant et recevez :'}
              </Text>

              {/* Récompense en vedette */}
              <View style={styles.rewardBox}>
                <LinearGradient
                  colors={['rgba(255, 215, 0, 0.3)', 'rgba(255, 193, 7, 0.2)']}
                  style={styles.rewardGradient}
                >
                  <MaterialCommunityIcons name="crown" size={32} color="#FFD700" />
                  <Text style={styles.rewardTitle}>
                    {t('linkAccountModal.reward') || '1 MOIS PREMIUM GRATUIT'}
                  </Text>
                  <Text style={styles.rewardSubtitle}>
                    {t('linkAccountModal.rewardValue') || 'Valeur : 15,96€'}
                  </Text>
                </LinearGradient>
              </View>

              {/* Liste des avantages */}
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.benefitText}>
                    {t('linkAccount.benefit1') || 'Sauvegarde automatique'}
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.benefitText}>
                    {t('linkAccount.benefit2') || 'Connexion multi-appareils'}
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.benefitText}>
                    {t('linkAccount.benefit3') || 'Récupération facile'}
                  </Text>
                </View>
              </View>

              {/* Boutons d'action */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.linkButton, styles.googleButton, (loadingGoogle || loadingApple) && styles.buttonDisabled]}
                  onPress={handleLinkWithGoogle}
                  disabled={loadingGoogle || loadingApple}
                  activeOpacity={0.8}
                >
                  {loadingGoogle ? (
                    <ActivityIndicator color="#4285F4" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="google" size={22} color="#4285F4" />
                      <Text style={styles.googleButtonText}>
                        {t('linkAccount.linkGoogle') || 'Lier avec Google'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[styles.linkButton, styles.appleButton, (loadingApple || loadingGoogle) && styles.buttonDisabled]}
                    onPress={handleLinkWithApple}
                    disabled={loadingApple || loadingGoogle}
                    activeOpacity={0.8}
                  >
                    {loadingApple ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <>
                        <Ionicons name="logo-apple" size={22} color="#000" />
                        <Text style={styles.appleButtonText}>
                          {t('linkAccount.linkApple') || 'Lier avec Apple'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Bouton "Plus tard" */}
              <TouchableOpacity
                style={styles.laterButton}
                onPress={onClose}
              >
                <Text style={styles.laterButtonText}>
                  {t('linkAccountModal.later') || 'Plus tard'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.85,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFA726',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  rewardBox: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rewardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rewardSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  benefitsList: {
    width: '100%',
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  benefitText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat-Bold',
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  appleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat-Bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  laterButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  laterButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
