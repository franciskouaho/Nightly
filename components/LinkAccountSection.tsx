import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { linkWithGoogle, linkWithApple } from '@/services/linkAccount';
import { useTranslation } from 'react-i18next';

interface LinkAccountSectionProps {
  onLinkSuccess?: () => void;
}

export default function LinkAccountSection({ onLinkSuccess }: LinkAccountSectionProps) {
  const { t } = useTranslation();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);

  const handleLinkWithGoogle = async () => {
    setLoadingGoogle(true);
    try {
      const result = await linkWithGoogle();

      if (result.success) {
        Alert.alert(
          t('linkAccount.successTitle') || 'Compte lié !',
          t('linkAccount.successMessage') || 'Votre compte a été lié avec succès à Google. Vos données sont maintenant sécurisées !',
          [
            {
              text: 'OK',
              onPress: () => {
                onLinkSuccess?.();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          t('linkAccount.errorTitle') || 'Erreur',
          result.error || t('linkAccount.errorMessage') || 'Impossible de lier votre compte'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la liaison:', error);
      Alert.alert(
        t('linkAccount.errorTitle') || 'Erreur',
        t('linkAccount.errorMessage') || 'Une erreur inattendue est survenue'
      );
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleLinkWithApple = async () => {
    setLoadingApple(true);
    try {
      const result = await linkWithApple();

      if (result.success) {
        Alert.alert(
          t('linkAccount.successTitle') || 'Compte lié !',
          t('linkAccount.successAppleMessage') || 'Votre compte a été lié avec succès à Apple. Vos données sont maintenant sécurisées !',
          [
            {
              text: 'OK',
              onPress: () => {
                onLinkSuccess?.();
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
      }
    } catch (error) {
      console.error('Erreur lors de la liaison:', error);
      Alert.alert(
        t('linkAccount.errorTitle') || 'Erreur',
        t('linkAccount.errorMessage') || 'Une erreur inattendue est survenue'
      );
    } finally {
      setLoadingApple(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Badge d'avertissement */}
      <View style={styles.warningBadge}>
        <MaterialCommunityIcons name="shield-alert" size={24} color="#FFA726" />
        <Text style={styles.warningText}>
          {t('linkAccount.warning') || 'Compte non sécurisé'}
        </Text>
      </View>

      {/* Titre et description */}
      <Text style={styles.title}>
        {t('linkAccount.title') || 'SÉCURISEZ VOTRE COMPTE'}
      </Text>
      <Text style={styles.description}>
        {t('linkAccount.description') || 'Liez votre compte à Google ou Apple pour ne jamais perdre votre progression, vos points et vos achats.'}
      </Text>

      {/* Liste des avantages */}
      <View style={styles.benefitsList}>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>
            {t('linkAccount.benefit1') || 'Sauvegarde automatique de vos données'}
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="cloud-sync" size={20} color="#2196F3" />
          <Text style={styles.benefitText}>
            {t('linkAccount.benefit2') || 'Connexion sur plusieurs appareils'}
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="lock-reset" size={20} color="#FF9800" />
          <Text style={styles.benefitText}>
            {t('linkAccount.benefit3') || 'Récupération facile en cas de perte'}
          </Text>
        </View>
      </View>

      {/* Boutons de liaison */}
      <View style={styles.buttonsContainer}>
        {/* Bouton Google */}
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
              <MaterialCommunityIcons name="google" size={20} color="#4285F4" />
              <Text style={styles.googleButtonText}>
                {t('linkAccount.linkGoogle') || 'Lier avec Google'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Bouton Apple (iOS seulement) */}
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
                <Ionicons name="logo-apple" size={20} color="#000" />
                <Text style={styles.appleButtonText}>
                  {t('linkAccount.linkApple') || 'Lier avec Apple'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Note de sécurité */}
      <Text style={styles.securityNote}>
        {t('linkAccount.securityNote') || 'Vos données actuelles seront conservées lors de la liaison'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 152, 0, 0.5)',
    padding: 20,
    marginBottom: 20,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  warningText: {
    color: '#FFA726',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  title: {
    color: '#FFA726',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: 10,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  appleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  securityNote: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
