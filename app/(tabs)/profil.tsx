"use client"

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import RoundedButton from '@/components/RoundedButton';
import PaywallModal from '@/components/PaywallModal';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <PaywallModal 
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
      
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      />
      
      <ScrollView style={styles.content}>
        {/* Header with profile information */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user?.pseudo?.charAt(0) || '?'}</Text>
          </View>
          
          <Text style={styles.username}>{user?.pseudo || 'Joueur'}</Text>
        </View>
        
        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>PARAMÈTRES</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('../settings/language')}>
            <MaterialCommunityIcons name="translate" size={24} color="rgba(255,255,255,0.9)" />
            <Text style={styles.settingText}>Langue</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('../settings/notifications')}>
            <MaterialCommunityIcons name="bell" size={24} color="rgba(255,255,255,0.9)" />
            <Text style={styles.settingText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Contact', 'Envoyez-nous un email à support@cosmicquest.com')}>
            <MaterialCommunityIcons name="email" size={24} color="rgba(255,255,255,0.9)" />
            <Text style={styles.settingText}>Nous contacter</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('../settings/privacy')}>
            <MaterialCommunityIcons name="shield-account" size={24} color="rgba(255,255,255,0.9)" />
            <Text style={styles.settingText}>Politique de confidentialité</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          {/* Carte Passe Premium */}
          <View style={styles.premiumCard}>
            <Text style={styles.premiumTitle}>PASSE PREMIUM</Text>
            <View style={styles.premiumFeaturesList}>
              <View style={styles.premiumFeatureRow}>
                <MaterialCommunityIcons name="lock" size={24} color="#7B6EF6" style={styles.premiumIcon} />
                <Text style={styles.premiumFeatureText}><Text style={{fontWeight: 'bold'}}>Débloque tous </Text>les modes</Text>
              </View>
              <View style={styles.premiumFeatureRow}>
                <MaterialCommunityIcons name="fire" size={24} color="#FFB300" style={styles.premiumIcon} />
                <Text style={styles.premiumFeatureText}>Un nouveau pack <Text style={{fontWeight: 'bold'}}>chaque semaine</Text></Text>
              </View>
              <View style={styles.premiumFeatureRow}>
                <MaterialCommunityIcons name="help-circle" size={24} color="#FFD600" style={styles.premiumIcon} />
                <Text style={styles.premiumFeatureText}><Text style={{fontWeight: 'bold'}}>Accès gratuit</Text> pour tes amis</Text>
              </View>
              <View style={styles.premiumFeatureRow}>
                <MaterialCommunityIcons name="diamond" size={24} color="#00E0CA" style={styles.premiumIcon} />
                <Text style={styles.premiumFeatureText}><Text style={{fontWeight: 'bold'}}>Résiliable à</Text> tout moment</Text>
              </View>
            </View>
            <View style={styles.premiumBottomRow}>
              <TouchableOpacity 
                style={styles.premiumButton}
                onPress={() => setShowPaywall(true)}
              >
                <Text style={styles.premiumButtonText}>Essayer le premium</Text>
              </TouchableOpacity>
              <View style={styles.premiumOfferTextContainer}>
                <Text style={styles.premiumOfferMain}>Gratuit 3 jours</Text>
                <Text style={styles.premiumOfferSub}>puis 5,99€ par semaine</Text>
              </View>
            </View>
          </View>
        </View>
        
        <RoundedButton
          title="Déconnexion"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={styles.logoutText}
          icon={<MaterialCommunityIcons name="logout" size={24} color="#ff6b6b" />}
        />
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
    paddingTop: 60,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 0,
    zIndex: 1,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#694ED6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: 10,
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: 'white',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  bottomSpace: {
    height: 80,
  },
  premiumCard: {
    backgroundColor: 'rgba(33, 16, 28, 0.2)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 24,
    marginBottom: 28,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  premiumTitle: {
    color: '#694ED6',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 20,
    letterSpacing: 1,
    textAlign: 'left',
  },
  premiumFeaturesList: {
    marginBottom: 18,
  },
  premiumFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumIcon: {
    width: 28,
    textAlign: 'center',
  },
  premiumFeatureText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 14,
    flex: 1,
  },
  premiumBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    justifyContent: 'space-between',
  },
  premiumButton: {
    backgroundColor: '#694ED6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginRight: 12,
    shadowColor: '#694ED6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  premiumButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  premiumOfferTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    maxWidth: 120,
  },
  premiumOfferMain: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  premiumOfferSub: {
    color: 'white',
    fontSize: 11,
    opacity: 0.7,
    flexWrap: 'wrap',
  },
});