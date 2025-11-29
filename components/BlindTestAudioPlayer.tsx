import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Image, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import storage from '@react-native-firebase/storage';
import VoiceRecognitionButton from './VoiceRecognitionButton';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CircularProgress from './CircularProgress';

const { width } = Dimensions.get('window');

interface BlindTestAudioPlayerProps {
  audioUrl?: string;
  title: string;
  category?: string;
  categoryEmoji?: string;
  currentRound: number;
  totalRounds: number;
  onPlayStateChange?: (isPlaying: boolean) => void;
  correctAnswer?: string;
  onVoiceAnswer?: (isCorrect: boolean) => void;
  gameId?: string;
  currentUserId?: string;
  isCurrentPlayer?: boolean;
  onStopAudioForAll?: () => Promise<void>;
  audioPaused?: boolean;
  listeningUserId?: string | null;
}

export default function BlindTestAudioPlayer({
  audioUrl,
  title,
  category,
  categoryEmoji,
  currentRound,
  totalRounds,
  onPlayStateChange,
  correctAnswer,
  onVoiceAnswer,
  gameId,
  currentUserId,
  isCurrentPlayer,
  onStopAudioForAll,
  audioPaused,
  listeningUserId,
}: BlindTestAudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Animation pour la rotation de la cassette
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Animation pour le pulse du bouton micro
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation pour les barres du visualiseur
  const [barHeights] = useState(() =>
    Array.from({ length: 30 }, () => new Animated.Value(Math.random()))
  );

  // Animations pour les anneaux colorés
  const ring1Anim = useRef(new Animated.Value(1)).current;
  const ring2Anim = useRef(new Animated.Value(1)).current;
  const ring3Anim = useRef(new Animated.Value(1)).current;

  // Animation du pulse quand la musique joue
  useEffect(() => {
    if (isPlaying && !audioPaused) {
      // Anneau vert (intérieur)
      const pulse1 = Animated.loop(
        Animated.sequence([
          Animated.timing(ring1Anim, {
            toValue: 1.3,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(ring1Anim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

      // Anneau bleu (milieu)
      const pulse2 = Animated.loop(
        Animated.sequence([
          Animated.timing(ring2Anim, {
            toValue: 1.4,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(ring2Anim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      );

      // Anneau magenta (extérieur)
      const pulse3 = Animated.loop(
        Animated.sequence([
          Animated.timing(ring3Anim, {
            toValue: 1.5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(ring3Anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      pulse1.start();
      pulse2.start();
      pulse3.start();

      return () => {
        pulse1.stop();
        pulse2.stop();
        pulse3.stop();
      };
    } else {
      ring1Anim.setValue(1);
      ring2Anim.setValue(1);
      ring3Anim.setValue(1);
      return undefined;
    }
  }, [isPlaying, audioPaused, ring1Anim, ring2Anim, ring3Anim]);

  useEffect(() => {
    if (audioUrl) {
      loadSound();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUrl]);

  // Lancer la musique automatiquement quand elle est chargée
  useEffect(() => {
    if (sound && !isPlaying && !audioPaused && audioUrl && !loadError) {
      sound.playAsync().catch((error) => {
        console.error('Erreur lors du démarrage automatique:', error);
      });
    }
  }, [sound, isPlaying, audioPaused, audioUrl, loadError]);

  useEffect(() => {
    if (isPlaying && !audioPaused) {
      startCassetteRotation();
      startAudioVisualization();
    } else {
      stopCassetteRotation();
      if (sound && audioPaused) {
        sound.pauseAsync();
      }
    }
    onPlayStateChange?.(isPlaying && !audioPaused);
  }, [isPlaying, audioPaused]);

  // Arrêter automatiquement si audioPaused change
  useEffect(() => {
    if (audioPaused && sound && isPlaying) {
      sound.pauseAsync();
    }
  }, [audioPaused]);

  // Fonction pour convertir une URL gs:// en URL HTTPS Firebase Storage
  const convertGsUrlToHttps = async (gsUrl: string): Promise<string> => {
    if (!gsUrl.startsWith('gs://')) {
      return gsUrl; // Retourne l'URL telle quelle si ce n'est pas une URL gs://
    }

    try {
      // Format: gs://bucket/path/to/file.mp3
      const match = gsUrl.match(/^gs:\/\/([^/]+)\/(.+)$/);
      if (!match) {
        console.warn('Format d\'URL gs:// invalide:', gsUrl);
        return gsUrl;
      }

      const filePath = match[2];

      // Utiliser Firebase Storage SDK pour obtenir l'URL de téléchargement avec token
      const storageRef = storage().ref(filePath);
      const downloadUrl = await storageRef.getDownloadURL();

      console.log('URL gs:// convertie en HTTPS avec token:', gsUrl, '→', downloadUrl);
      return downloadUrl;
    } catch (error: any) {
      console.error('Erreur lors de la conversion de l\'URL gs://:', error);
      // En cas d'erreur, essayer la conversion manuelle sans token
      try {
        const match = gsUrl.match(/^gs:\/\/([^/]+)\/(.+)$/);
        if (match && match[1] && match[2]) {
          const bucket = match[1];
          const filePath = match[2];
          const encodedPath = encodeURIComponent(filePath);
          const fallbackUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
          console.warn('Utilisation de l\'URL de fallback sans token:', fallbackUrl);
          return fallbackUrl;
        }
      } catch (fallbackError) {
        console.error('Erreur lors de la conversion de fallback:', fallbackError);
      }
      return gsUrl;
    }
  };

  const loadSound = async () => {
    if (!audioUrl) {
      setLoadError('Aucune URL audio fournie');
      return;
    }

    try {
      setLoadError(null);

      // Convertir les URLs gs:// en HTTPS (async)
      let convertedUrl = audioUrl;
      if (audioUrl.startsWith('gs://')) {
        convertedUrl = await convertGsUrlToHttps(audioUrl);
      }

      // Valider que l'URL est bien formée
      if (!convertedUrl.startsWith('http://') && !convertedUrl.startsWith('https://')) {
        setLoadError('URL audio invalide - doit commencer par http:// ou https://');
        console.error('Invalid audio URL:', convertedUrl);
        return;
      }

      // Nettoyer l'ancien son si existant
      if (sound) {
        await sound.unloadAsync();
      }

      console.log('Loading audio from URL:', convertedUrl);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: convertedUrl },
        { shouldPlay: true }, // Lancer automatiquement pour tous
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      console.log('Audio loaded and started automatically');
    } catch (error: any) {
      const errorMessage = error?.message || 'Erreur de chargement audio';
      console.error('Error loading sound:', error);
      setLoadError(errorMessage);
      setSound(null);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const startCassetteRotation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000, // Slower rotation for album art
        useNativeDriver: true,
      })
    ).start();
  };

  const stopCassetteRotation = () => {
    rotateAnim.stopAnimation();
  };

  const startAudioVisualization = () => {
    barHeights.forEach((height) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(height, {
            toValue: Math.random(),
            duration: 200 + Math.random() * 300,
            useNativeDriver: false,
          }),
          Animated.timing(height, {
            toValue: Math.random(),
            duration: 200 + Math.random() * 300,
            useNativeDriver: false,
          }),
        ])
      ).start();
    });
  };

  const togglePlayPause = async () => {
    if (!sound || !audioUrl) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header avec catégorie */}
      <View style={styles.header}>
        {category && (
          <View style={styles.categoryBadge}>
            {categoryEmoji && <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>}
            <Text style={styles.categoryLabel}>{category}</Text>
          </View>
        )}
        <Text style={styles.blindTestLabel}>🎵 BLIND TEST</Text>
      </View>

      {/* Interface moderne avec bouton micro central et anneaux colorés - visible pour tous quand musique joue */}
      {!audioPaused && (
        <View style={styles.playerContainer}>
          <View style={styles.albumArtContainer}>
            <CircularProgress
              size={280}
              strokeWidth={8}
              progress={duration > 0 ? position / duration : 0}
              color="#FFD700"
              backgroundColor="rgba(255, 255, 255, 0.1)"
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={async () => {
                  if (onStopAudioForAll) {
                    await onStopAudioForAll();
                  }
                }}
                style={styles.albumArtButton}
              >
                <Animated.View style={[styles.albumArtWrapper, { transform: [{ rotate: spin }] }]}>
                  <LinearGradient
                    colors={['#2C3E50', '#000000']}
                    style={styles.albumArt}
                  >
                    <Text style={styles.albumArtEmoji}>{categoryEmoji || '🎵'}</Text>
                    {!isPlaying && (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#FFD700" />
                      </View>
                    )}
                  </LinearGradient>
                </Animated.View>

                <View style={styles.tapOverlay}>
                  <MaterialIcons name="touch-app" size={32} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.tapText}>Tap to Answer</Text>
                </View>
              </TouchableOpacity>
            </CircularProgress>
          </View>

          <View style={styles.songInfo}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(position)} / {formatTime(duration)}
            </Text>
          </View>
        </View>
      )}

      {/* Interface de reconnaissance vocale quand audio est arrêté - visible pour le joueur qui a cliqué */}
      {audioPaused && listeningUserId === currentUserId && correctAnswer && onVoiceAnswer && (
        <View style={styles.modernMicContainer}>
          <Text style={styles.listeningText}>Listening</Text>

          {/* Activation automatique de la reconnaissance vocale */}
          <VoiceRecognitionButton
            correctAnswer={correctAnswer}
            onResult={(transcript) => {
              console.log('Réponse vocale reçue:', transcript);
              onVoiceAnswer(true);
            }}
            onError={(error) => {
              // Logger l'erreur mais ne pas perturber l'utilisateur
              // La reconnaissance vocale native nécessite un développement build
              console.warn('Reconnaissance vocale non disponible:', error);
              // Note: L'erreur n'est pas bloquante, le jeu peut continuer
            }}
            isEnabled={true}
          />
        </View>
      )}



      {/* Message d'erreur ou d'absence d'audio */}
      {(loadError || !audioUrl) && (
        <View style={styles.noAudioContainer}>
          <Text style={styles.noAudioText}>
            {loadError || 'Pas d\'extrait audio disponible'}
          </Text>
          {loadError && (
            <Text style={styles.errorHint}>
              Vérifiez que l'URL audio est valide et accessible
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#40B5D8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  blindTestLabel: {
    color: '#40B5D8',
    fontSize: 14,
    fontWeight: '600',
  },
  visualizer: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  visualizerBar: {
    width: 6,
    backgroundColor: '#40B5D8',
    borderRadius: 3,
    marginHorizontal: 0.5,
  },
  playerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  albumArtContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumArtButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  albumArtWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 120,
    overflow: 'hidden',
  },
  albumArt: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArtEmoji: {
    fontSize: 80,
  },
  tapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 120,
  },
  tapText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  songInfo: {
    alignItems: 'center',
    marginVertical: 12,
  },
  songTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  modernMicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 300,
    marginVertical: 32,
  },
  listeningText: {
    fontSize: 28,
    fontWeight: '300',
    color: 'white',
    marginBottom: 60,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  noAudioContainer: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.4)',
  },
  noAudioText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorHint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
