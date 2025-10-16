import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function OnboardingButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'right',
  disabled = false,
  style,
  textStyle,
}: OnboardingButtonProps) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostButton);
        break;
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text];
    
    switch (variant) {
      case 'primary':
        baseTextStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseTextStyle.push(styles.secondaryText);
        break;
      case 'ghost':
        baseTextStyle.push(styles.ghostText);
        break;
    }
    
    if (disabled) {
      baseTextStyle.push(styles.disabledText);
    }
    
    if (textStyle) {
      baseTextStyle.push(textStyle);
    }
    
    return baseTextStyle;
  };

  const getIconColor = () => {
    if (disabled) return '#999';
    
    switch (variant) {
      case 'primary':
        return '#fff';
      case 'secondary':
        return '#fff';
      case 'ghost':
        return '#fff';
      default:
        return '#fff';
    }
  };

  const renderContent = () => {
    if (icon) {
      return (
        <>
          {iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={getIconColor()}
              style={styles.iconLeft}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={getIconColor()}
              style={styles.iconRight}
            />
          )}
        </>
      );
    }
    
    return <Text style={getTextStyle()}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: '#f093fb',
    shadowColor: '#f093fb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ghostButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  ghostText: {
    color: '#fff',
  },
  disabledText: {
    color: '#999',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
