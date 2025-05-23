import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface PointsDisplayProps {
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  customPoints?: number;
}

export default function PointsDisplay({ 
  size = 'medium',
  showIcon = true,
  customPoints
}: PointsDisplayProps) {
  const { user } = useAuth();
  const router = useRouter();
  const points = customPoints ?? user?.points ?? 0;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/settings/buy-assets');
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 20;
      default: return 16;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { horizontal: 8, vertical: 4 };
      case 'large': return { horizontal: 16, vertical: 8 };
      default: return { horizontal: 12, vertical: 6 };
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        {
          paddingHorizontal: getPadding().horizontal,
          paddingVertical: getPadding().vertical,
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {showIcon && (
        <MaterialCommunityIcons 
          name="currency-btc" 
          size={getIconSize()} 
          color="#FFD700" 
        />
      )}
      <Text style={[
        styles.pointsText,
        { fontSize: getTextSize() }
      ]}>
        {points}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  pointsText: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 4,
  }
}); 