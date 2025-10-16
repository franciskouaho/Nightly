import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface OnboardingSlideProps {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  colors: string[];
}

export default function OnboardingSlide({
  title,
  description,
  icon,
  colors,
}: OnboardingSlideProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={colors}
          style={styles.iconGradient}
        >
          <MaterialCommunityIcons
            name={icon}
            size={80}
            color="#fff"
          />
        </LinearGradient>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
