import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  start,
  stop,
  requestPermissions,
  isAvailable,
  addSpeechResultListener,
  addSpeechErrorListener,
  addSpeechEndListener,
  type SpeechResult,
} from '@dbkable/react-native-speech-to-text';

const { width } = Dimensions.get('window');

interface VoiceRecognitionButtonProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  correctAnswer: string;
  isEnabled?: boolean;
  language?: string;
}

export default function VoiceRecognitionButton({
  onResult,
  onError,
  correctAnswer,
  isEnabled = true,
  language = 'fr-FR',
}: VoiceRecognitionButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Écouter les résultats de transcription
    const resultListener = addSpeechResultListener((result: SpeechResult) => {
      setTranscript(result.transcript);
      
      // Vérifier si la réponse est correcte (même partielle)
      const isCorrect = checkAnswer(result.transcript, correctAnswer);
      
      if (isCorrect) {
        console.log('✅ Réponse correcte détectée:', result.transcript, 'vs', correctAnswer);
        onResult(result.transcript);
        stopListening();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (result.isFinal) {
        console.log('❌ Réponse finale mais incorrecte:', result.transcript, 'vs', correctAnswer);
      }
    });

    // Écouter les erreurs
    const errorListener = addSpeechErrorListener((error) => {
      console.error('Erreur de reconnaissance vocale:', error);
      stopListening();
      onError?.(error.message || 'Erreur de reconnaissance vocale');
    });

    // Écouter la fin de la reconnaissance
    const endListener = addSpeechEndListener(() => {
      setIsListening(false);
      stopPulseAnimation();
    });

    // Nettoyage
    return () => {
      resultListener.remove();
      errorListener.remove();
      endListener.remove();
    };
  }, [correctAnswer, onResult, onError]);

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s]/g, '') // Supprimer la ponctuation
      .trim();
  };

  const checkAnswer = (userText: string, correctAnswer: string): boolean => {
    const normalizedUserAnswer = normalizeText(userText);
    const normalizedCorrectAnswer = normalizeText(correctAnswer);
    
    // Comparaison exacte
    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      return true;
    }
    
    // Si la réponse contient la bonne réponse ou vice versa
    if (
      normalizedUserAnswer.includes(normalizedCorrectAnswer) || 
      normalizedCorrectAnswer.includes(normalizedUserAnswer)
    ) {
      return true;
    }
    
    // Comparaison par mots clés
    const userWords = normalizedUserAnswer.split(/\s+/).filter(w => w.length > 2);
    const correctWords = normalizedCorrectAnswer.split(/\s+/).filter(w => w.length > 2);
    
    if (correctWords.length === 0) {
      return false;
    }
    
    // Si au moins 70% des mots clés correspondent
    const matchingWords = correctWords.filter(word => 
      userWords.some(uw => uw.includes(word) || word.includes(uw))
    );
    
    const matchRatio = matchingWords.length / correctWords.length;
    return matchRatio >= 0.7;
  };

  const startListening = async () => {
    if (!isEnabled) return;
    
    try {
      // Vérifier si la reconnaissance vocale est disponible
      const available = await isAvailable();
      if (!available) {
        console.warn('La reconnaissance vocale n\'est pas disponible');
        onError?.('La reconnaissance vocale n\'est pas disponible sur cet appareil');
        return;
      }

      // Demander les permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.warn('Permissions refusées');
        onError?.('Permission refusée pour accéder au microphone');
        return;
      }

      // Démarrer la reconnaissance vocale
      await start({ language });
      setIsListening(true);
      startPulseAnimation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error: any) {
      console.error('Erreur lors du démarrage de la reconnaissance vocale:', error);
      onError?.(error?.message || 'Impossible de démarrer la reconnaissance vocale');
    }
  };

  const stopListening = async () => {
    try {
      await stop();
      setIsListening(false);
      stopPulseAnimation();
    } catch (error: any) {
      console.error('Erreur lors de l\'arrêt de la reconnaissance vocale:', error);
    }
  };

  const handlePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isEnabled}
        style={styles.buttonWrapper}
      >
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim }],
              opacity: isListening ? 0.6 : 0,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={isListening ? ['#FF4444', '#CC0000'] : ['#4CAF50', '#2E7D32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <MaterialIcons
              name={isListening ? 'mic' : 'mic-none'}
              size={64}
              color="white"
            />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
      
      <Text style={styles.label}>
        {isListening ? '🎤 Écoute en cours...' : '🎤 Appuie pour parler'}
      </Text>
      
      {transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>Tu as dit:</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 24,
  },
  buttonWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF4444',
  },
  buttonContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  label: {
    marginTop: 16,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  transcriptContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    maxWidth: width - 64,
  },
  transcriptLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  transcriptText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
