import React from 'react';
import { TouchableOpacity, Text, Image, View, StyleSheet, TextStyle } from 'react-native';

interface SkewedButtonProps {
  text: string;
  iconSource?: any; // Source de l'icône (require(...))
  backgroundColor: string;
  skewDirection: 'left' | 'right';
  onPress: () => void;
  disabled?: boolean;
  textStyle?: TextStyle; // Style personnalisé pour le texte (optionnel)
  style?: any; // Style personnalisé pour le TouchableOpacity (optionnel)
}

const SkewedButton: React.FC<SkewedButtonProps> = ({
  text,
  iconSource,
  backgroundColor,
  skewDirection,
  onPress,
  disabled = false,
  textStyle,
  style
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        { backgroundColor },
        skewDirection === 'left' ? styles.skewLeft : styles.skewRight,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.buttonContent}>
        {iconSource && (
          <Image source={iconSource} style={styles.buttonIcon} resizeMode="contain" />
        )}
        <Text
          style={[
            styles.buttonText,
            skewDirection === 'left' ? styles.skewTextLeft : styles.skewTextRight,
            textStyle,
          ]}
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flex: 0.5,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // Styles de bordure appliqués dans le composant parent
  },
  skewLeft: {
    transform: [{ skewX: '-2deg' }],
  },
  skewRight: {
    transform: [{ skewX: '2deg' }],
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 90,
    height: 90,
    marginBottom: 8, // Ajout d'une marge sous l'icône si présente
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  skewTextLeft: {
    transform: [{ skewX: '2deg' }],
  },
  skewTextRight: {
    transform: [{ skewX: '-2deg' }],
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default SkewedButton;