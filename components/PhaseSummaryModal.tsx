import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Props {
  visible: boolean;
  phase: 'night' | 'day';
  actionSummary: string;
  mainPlayer?: Player | null;
  emoji?: string;
  color?: string;
  onContinue?: () => void;
  isHost?: boolean;
}

export default function PhaseSummaryModal({
  visible,
  phase,
  actionSummary,
  mainPlayer,
  emoji,
  color = '#A855F7',
  onContinue,
  isHost = false,
}: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}> 
      <LinearGradient
        colors={["#1a1033", color + '99', '#21101C']}
        style={styles.modal}
      >
        <Text style={styles.phaseTitle}>{phase === 'night' ? 'Résumé de la Nuit' : 'Résumé du Jour'}</Text>
        <Text style={styles.summaryText}>{actionSummary}</Text>
        {mainPlayer && (
          <View style={styles.playerCard}>
            <Image source={{ uri: mainPlayer.avatar || 'https://via.placeholder.com/80' }} style={styles.avatar} />
            <Text style={[styles.playerName, { color }]}>{emoji} {mainPlayer.name}</Text>
          </View>
        )}
        {isHost && onContinue && (
          <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onContinue}>
            <Text style={styles.buttonText}>Continuer</Text>
          </TouchableOpacity>
        )}
        {!isHost && (
          <Text style={styles.waitingText}>En attente de l'hôte...</Text>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modal: {
    width: '85%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  phaseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  playerCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 24,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
  },
}); 