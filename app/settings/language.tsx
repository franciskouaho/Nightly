import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryFlag from "react-native-country-flag";
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n/i18n';

// Définition des langues disponibles
const languages = [
  { id: 'fr', name: 'Français', countryCode: 'FR', rtl: false },
  { id: 'en', name: 'English', countryCode: 'US', rtl: false },
  { id: 'es', name: 'Español', countryCode: 'ES', rtl: false },
  { id: 'de', name: 'Deutsch', countryCode: 'DE', rtl: false },
  { id: 'it', name: 'Italiano', countryCode: 'IT', rtl: false },
  { id: 'pt', name: 'Português', countryCode: 'PT', rtl: false },
  { id: 'ar', name: 'العربية', countryCode: 'SA', rtl: true },
  { id: 'ja', name: '日本語', countryCode: 'JP', rtl: false },
  { id: 'zh', name: '中文', countryCode: 'CN', rtl: false },
  { id: 'ru', name: 'Русский', countryCode: 'RU', rtl: false },
  { id: 'ko', name: '한국어', countryCode: 'KR', rtl: false },
  { id: 'nl', name: 'Nederlands', countryCode: 'NL', rtl: false },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  // Charger la langue actuelle au démarrage
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('@app_language');
        if (storedLanguage) {
          setSelectedLanguage(storedLanguage);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la langue:', error);
      }
    };
    loadLanguage();
  }, []);

  // Changer de langue
  const handleLanguageChange = async (langId: string) => {
    try {
      if (langId === selectedLanguage) {
        return;
      }
      
      await changeLanguage(langId);
      setSelectedLanguage(langId);
    
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
      Alert.alert(t('language.error'), t('language.errorMessage'));
    }
  };

  // Rendu d'une langue dans la liste
  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.languageItem, 
        item.id === selectedLanguage && styles.selectedLanguageItem
      ]}
      onPress={() => handleLanguageChange(item.id)}
    >
      <View style={styles.flagContainer}>
        <CountryFlag isoCode={item.countryCode} size={24} />
      </View>
      
      <Text style={[styles.languageName, item.rtl && styles.rtlText]}>
        {item.name}
      </Text>
      
      {item.id === selectedLanguage && (
        <MaterialCommunityIcons name="check-circle" size={24} color="#8c42f5" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language.title')}</Text>
        <View style={styles.headerRight} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={24} color="rgba(255,255,255,0.9)" />
          <Text style={styles.infoText}>
            {t('language.selectLanguage')}
          </Text>
        </View>
        
        <FlatList
          data={languages}
          renderItem={renderLanguageItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.languageList}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(105, 78, 214, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(105, 78, 214, 0.3)',
  },
  infoText: {
    color: 'white',
    marginLeft: 12,
    flex: 1,
  },
  languageList: {
    paddingBottom: 40,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedLanguageItem: {
    backgroundColor: 'rgba(140, 66, 245, 0.1)',
    borderColor: 'rgba(140, 66, 245, 0.3)',
  },
  flagContainer: {
    marginRight: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  languageName: {
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  rtlText: {
    textAlign: 'right',
  },
});
