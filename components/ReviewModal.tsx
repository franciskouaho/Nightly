import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

interface ReviewModalProps {
  visible: boolean;
  onRateNow: () => void;
  onMaybeLater: () => void;
  onClose: () => void;
}

export default function ReviewModal({
  visible,
  onRateNow,
  onMaybeLater,
  onClose,
}: ReviewModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const starsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Animation des étoiles (séquentielle)
      const starAnimations = starsAnim.map((star, index) =>
        Animated.timing(star, {
          toValue: 1,
          duration: 200,
          delay: index * 100,
          useNativeDriver: true,
        })
      );
      Animated.sequence(starAnimations).start();
    } else {
      // Réinitialiser les animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      starsAnim.forEach((star) => star.setValue(0));
    }
  }, [visible]);

  const handleRateNow = () => {
    onRateNow();
    onClose();
  };

  const handleMaybeLater = () => {
    onMaybeLater();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Icône Nightly */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={60} color="#FFD700" />
            </View>

            {/* Titre */}
            <Text style={styles.title}>Vous aimez Nightly ? ⭐</Text>
            
            {/* Sous-titre */}
            <Text style={styles.subtitle}>
              Votre avis nous aide énormément à améliorer l'expérience pour tous !
            </Text>

            {/* Étoiles animées */}
            <View style={styles.starsContainer}>
              {starsAnim.map((star, index) => (
                <Animated.View
                  key={index}
                  style={{
                    opacity: star,
                    transform: [
                      {
                        scale: star.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1.2, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <MaterialCommunityIcons
                    name="star"
                    size={40}
                    color="#FFD700"
                  />
                </Animated.View>
              ))}
            </View>

            {/* Boutons */}
            <View style={styles.buttonsContainer}>
              {/* Bouton principal "Noter maintenant" */}
              <TouchableOpacity
                onPress={handleRateNow}
                activeOpacity={0.8}
                style={styles.rateButton}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500', '#FF8C00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.rateButtonGradient}
                >
                  <MaterialCommunityIcons name="star" size={24} color="#000" />
                  <Text style={styles.rateButtonText}>Noter maintenant</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Bouton secondaire "Plus tard" */}
              <TouchableOpacity
                onPress={handleMaybeLater}
                activeOpacity={0.7}
                style={styles.laterButton}
              >
                <Text style={styles.laterButtonText}>Peut-être plus tard</Text>
              </TouchableOpacity>
            </View>

            {/* Message de remerciement subtil */}
            <Text style={styles.thankYouText}>
              Merci de votre soutien ! 💙
            </Text>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
    transform: [{ rotate: '-15deg' }],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  rateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  rateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  rateButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  laterButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  laterButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
  thankYouText: {
    marginTop: 24,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
});

