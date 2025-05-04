"use client"

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import RoundedButton from '@/components/RoundedButton';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

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
      
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      />
      
      <ScrollView style={styles.content}>
        {/* Header with profile information */}
        <View style={styles.profileHeader}>
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
          
          <RoundedButton
            title="Déconnexion"
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={styles.logoutText}
            icon={<MaterialCommunityIcons name="logout" size={24} color="#ff6b6b" />}
          />
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
});