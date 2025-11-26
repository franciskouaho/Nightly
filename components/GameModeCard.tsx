import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ImageStyle, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface GameModeCardProps {
  id: string;
  name: string;
  image: any;
  colors: string[];
  borderColor: string;
  shadowColor: string;
  fontFamily?: string;
  premium: boolean;
  onPress: () => void;
  disabled?: boolean;
  comingSoon?: boolean; // ⚠️ FIX: Indique si le jeu est bientôt disponible
  isNew?: boolean; // Badge "NEW" pour les nouveaux jeux
}

interface GameModeCardStyles {
  container: ViewStyle;
  gradient: ViewStyle;
  content: ViewStyle;
  premiumBadge: ViewStyle;
  premiumBadgeText: TextStyle;
  ageRestrictionContainer: ViewStyle;
  ageRestrictionCircle: ViewStyle;
  ageRestrictionLine: ViewStyle;
  ageRestrictionText: TextStyle;
  characterImage: ImageStyle;
  titleContainer: ViewStyle;
  title: TextStyle;
}

/**
 * Carte de mode de jeu avec le design amélioré
 */
export default function GameModeCard({
  id,
  name,
  image,
  colors,
  borderColor,
  shadowColor,
  fontFamily,
  premium,
  onPress,
  disabled = false,
  comingSoon = false,
  isNew = false
}: GameModeCardProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.container, comingSoon && styles.comingSoonContainer]}
      onPress={comingSoon ? undefined : onPress}
      activeOpacity={comingSoon ? 1 : 0.8}
      disabled={disabled || comingSoon}
      testID={`game-mode-${id}`}
    >
      <LinearGradient
        colors={comingSoon 
          ? ['rgba(100, 100, 100, 0.6)', 'rgba(80, 80, 80, 0.7)'] 
          : (colors.length >= 2 ? (colors as [string, string, ...string[]]) : ['#C41E3A', '#8B1538'])
        }
        style={[
          styles.gradient,
          {
            borderColor: comingSoon ? '#666' : borderColor,
            shadowColor: comingSoon ? '#666' : shadowColor,
            opacity: comingSoon ? 0.6 : 1,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Image du personnage au centre */}
          <Image
            source={image}
            style={[styles.characterImage, comingSoon && styles.comingSoonImage]}
            resizeMode="cover"
          />

          {/* Badge "Bientôt disponible" */}
          {comingSoon && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonBadgeText}>Bientôt disponible</Text>
            </View>
          )}

          {/* Badge "NEW" pour les nouveaux jeux */}
          {isNew && !comingSoon && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{t('common.newBadge')}</Text>
            </View>
          )}

          {/* Badge "FREE" pour les jeux gratuits */}
          {!premium && !comingSoon && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>{t('common.free')}</Text>
            </View>
          )}

          {/* Titre du jeu en bas */}
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                fontFamily && { fontFamily },
                comingSoon && styles.comingSoonTitle
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {name}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create<GameModeCardStyles>({
  container: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    marginBottom: 16,
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 18,
  },
  // Image du personnage
  characterImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 18,
    zIndex: 1,
  },
  // Titre du jeu
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 15,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 20,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ageRestrictionContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  ageRestrictionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  ageRestrictionLine: {
    width: 2,
    height: 16,
    backgroundColor: '#FF4444',
  },
  ageRestrictionText: {
    color: '#FF4444',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // ⚠️ FIX: Styles pour les jeux "Bientôt disponible"
  comingSoonContainer: {
    opacity: 0.7,
  },
  comingSoonImage: {
    opacity: 0.5,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  comingSoonBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  comingSoonTitle: {
    opacity: 0.7,
  },
  // Badge "NEW"
  newBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Badge "FREE"
  freeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  freeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
