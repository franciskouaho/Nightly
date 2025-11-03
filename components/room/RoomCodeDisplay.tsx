import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface RoomCodeDisplayProps {
  code: string;
  onCopy: () => void;
}

interface RoomCodeDisplayStyles {
  container: ViewStyle;
  label: TextStyle;
  codeBox: ViewStyle;
  codeText: TextStyle;
}

/**
 * Affichage du code de la room avec bouton copier
 */
export default function RoomCodeDisplay({ code, onCopy }: RoomCodeDisplayProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('room.codeLabel')}</Text>
      <TouchableOpacity style={styles.codeBox} onPress={onCopy}>
        <Text style={styles.codeText}>{code}</Text>
        <Ionicons name="copy-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create<RoomCodeDisplayStyles>({
  container: {
    alignItems: 'center',
    marginBottom: 30,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  codeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    letterSpacing: 2,
  },
});
