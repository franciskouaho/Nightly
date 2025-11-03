import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, getFirestore } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import HalloweenTheme from '@/constants/themes/Halloween';
import ChristmasTheme from '@/constants/themes/Christmas';

type RulesDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  gameId?: string;
  isStartingGame?: boolean;
};

interface GameRule {
  title: string;
  description: string;
  emoji: string;
  colors?: {
    title: string;
    description: string;
    background: string;
  };
}

const windowHeight = Dimensions.get('window').height;

const RulesDrawer = ({ visible, onClose, onConfirm, gameId, isStartingGame }: RulesDrawerProps) => {
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const [rules, setRules] = useState<GameRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  // Vérifier si c'est le Quiz Halloween
  const isHalloweenGame = gameId === 'quiz-halloween';

  useEffect(() => {
    if (visible && gameId) {
      console.log('[DEBUG RulesDrawer] Ouverture du drawer pour gameId:', gameId, 'onConfirm:', !!onConfirm);
      fetchRules();
    }
  }, [visible, gameId, language, onConfirm]);

  const fetchRules = async () => {
    try {
      const db = getFirestore();
      const rulesRef = doc(db, 'rules', gameId || '');
      const rulesDoc = await getDoc(rulesRef);
      
      if (rulesDoc.exists()) {
        const data = rulesDoc.data();
        // Récupérer les règles dans la langue actuelle, avec fallback sur le français
        const currentLangRules = data?.translations?.[language]?.rules || data?.translations?.fr?.rules || [];
        setRules(currentLangRules);
        
        console.log(`Règles trouvées (${language}):`, currentLangRules.length);
      } else {
        console.error('Aucune règle trouvée pour ce mode de jeu dans Firestore');
        // Règles par défaut si aucune règle n'est trouvée
        setRules([
          {
            title: t('rules.general.title', "RÈGLES GÉNÉRALES"),
            description: t('rules.general.description', "Un joueur est désigné aléatoirement à chaque tour."),
            emoji: "🎲"
          },
          {
            title: t('rules.participation.title', "PARTICIPATION"),
            description: t('rules.participation.description', "Tous les joueurs doivent participer activement."),
            emoji: "👥"
          },
          {
            title: t('rules.scoring.title', "SCORING"),
            description: t('rules.scoring.description', "Les points sont attribués selon les règles spécifiques du jeu."),
            emoji: "🏆"
          }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des règles:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnimation]);

  const translateY = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
    extrapolate: 'clamp',
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={isHalloweenGame 
          ? ["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]
          : [ChristmasTheme.light?.backgroundDarker || "#0D0D1A", ChristmasTheme.light?.background || "#1A1A2E", ChristmasTheme.light?.secondary || "#8B1538", ChristmasTheme.light?.background || "#1A1A2E", ChristmasTheme.light?.backgroundDarker || "#0D0D1A"]
        }
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.container, 
            { 
              transform: [{ translateY }],
              backgroundColor: isHalloweenGame ? (HalloweenTheme.light?.backgroundDarker || '#120F1C') : (ChristmasTheme.light?.backgroundLighter || '#2D223A')
            }
          ]}
        >
          <View style={styles.inner}>
            <View style={styles.header}>
              <Text 
                style={[
                  styles.title,
                  isHalloweenGame ? { color: HalloweenTheme.light?.primary || '#FF6F00' } : { color: ChristmasTheme.light?.textSecondary || '#E8B4B8' }
                ]}
              >
                {t('rules.title')}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={isHalloweenGame ? (HalloweenTheme.light?.primary || '#FF6F00') : (ChristmasTheme.light?.textSecondary || '#E8B4B8')} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {loading ? (
                <Text style={styles.loadingText}>{t('rules.loading')}</Text>
              ) : (
                rules.map((rule, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.ruleCard,
                      rule.colors && { backgroundColor: rule.colors.background }
                    ]}
                  >
                    <Text style={styles.emoji}>{rule.emoji}</Text>
                    <View style={styles.ruleContent}>
                      <Text 
                        style={[
                          styles.ruleTitle,
                          rule.colors && { color: rule.colors.title }
                        ]}
                      >
                        {rule.title}
                      </Text>
                      <Text 
                        style={[
                          styles.ruleText,
                          rule.colors && { color: rule.colors.description }
                        ]}
                      >
                        {rule.description}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {onConfirm ? (
              <TouchableOpacity 
                style={[
                  styles.confirmButton,
                  isHalloweenGame 
                    ? { backgroundColor: HalloweenTheme.light?.primary || '#FF6F00' }
                    : { backgroundColor: ChristmasTheme.light?.primary || '#C41E3A' }
                ]}
                onPress={() => {
                  console.log('[DEBUG RulesDrawer] Bouton de confirmation cliqué');
                  onConfirm();
                }}
              >
                <Text style={styles.confirmButtonText}>
                  {isStartingGame 
                    ? (t('rules.confirmStart', 'Démarrer') || 'Démarrer')
                    : (t('rules.confirm', 'Je suis prêt') || 'Je suis prêt')}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ padding: 20 }}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>Aucun callback de confirmation</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 6, 20, 0.92)',
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#2D223A', // Christmas theme backgroundLighter
    shadowColor: '#C41E3A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    maxHeight: '85%',
  },
  inner: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 0,
    maxHeight: windowHeight * 0.45,
  },
  ruleCard: {
    backgroundColor: 'rgba(196, 30, 58, 0.15)',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(196, 30, 58, 0.3)',
  },
  emoji: {
    fontSize: 28,
    marginRight: 14,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    color: '#E8B4B8',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ruleText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#C41E3A',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    marginBottom: -16,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RulesDrawer;