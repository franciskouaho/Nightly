import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, getFirestore } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

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
}

const windowHeight = Dimensions.get('window').height;

const RulesDrawer = ({ visible, onClose, onConfirm, gameId, isStartingGame }: RulesDrawerProps) => {
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const [rules, setRules] = useState<GameRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && gameId) {
      fetchRules();
    }
  }, [visible, gameId]);

  const fetchRules = async () => {
    try {
      const db = getFirestore();
      const rulesRef = doc(db, 'rules', gameId || '');
      const rulesDoc = await getDoc(rulesRef);
      
      if (rulesDoc.exists()) {
        const data = rulesDoc.data();
        setRules(data?.rules ?? []);
      } else {
        // Règles par défaut si aucune règle n'est trouvée
        setRules([
          {
            title: "RÈGLES GÉNÉRALES",
            description: "Un joueur est désigné aléatoirement à chaque tour.",
            emoji: "🎲"
          },
          {
            title: "PARTICIPATION",
            description: "Tous les joueurs doivent participer activement.",
            emoji: "👥"
          },
          {
            title: "SCORING",
            description: "Les points sont attribués selon les règles spécifiques du jeu.",
            emoji: "🏆"
          }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des règles:', error);
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
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
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
            { transform: [{ translateY }] }
          ]}
        >
          <View style={styles.inner}>
            <View style={styles.header}>
              <Text style={styles.title}>RÈGLES DU JEU</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {loading ? (
                <Text style={styles.loadingText}>Chargement des règles...</Text>
              ) : (
                rules.map((rule, index) => (
                  <View key={index} style={styles.ruleCard}>
                    <Text style={styles.emoji}>{rule.emoji}</Text>
                    <View style={styles.ruleContent}>
                      <Text style={styles.ruleTitle}>{rule.title}</Text>
                      <Text style={styles.ruleText}>{rule.description}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {isStartingGame && (
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={onConfirm}
              >
                <Text style={styles.confirmButtonText}>J'ai lu les règles, démarrer la partie</Text>
              </TouchableOpacity>
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
    backgroundColor: '#2B1845',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
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
    backgroundColor: '#3D2956',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  emoji: {
    fontSize: 28,
    marginRight: 14,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    color: '#C7B8F5',
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
    backgroundColor: '#A259FF',
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