import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

interface RoundedButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  isLoading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
  icon?: React.ReactNode;
  gradientColors?: string[];
}

const RoundedButton: React.FC<RoundedButtonProps> = ({
  title,
  onPress,
  color = '#5D6DFF',
  textColor = 'white',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  gradientColors = ['#D80B96', '#B707A7', '#A90BB2', '#8E08C1']
}) => {
  return (
    <TouchableOpacity
      style={[disabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <View style={styles.contentContainer}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.buttonText, { color: textColor }, textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
    alignSelf: 'center',
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  }
});

export default RoundedButton; 