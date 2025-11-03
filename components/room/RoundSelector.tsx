import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import HalloweenTheme from '@/constants/themes/Halloween';
import ChristmasTheme from '@/constants/themes/Christmas';

interface RoundSelectorProps {
  selectedRounds: number;
  showOptions: boolean;
  onToggle: () => void;
  onSelect: (rounds: number) => void;
  isHalloweenGame?: boolean;
}

interface RoundSelectorStyles {
  container: ViewStyle;
  button: ViewStyle;
  gradient: ViewStyle;
  text: TextStyle;
  iconContainer: ViewStyle;
  starIcon: TextStyle;
  smallStarIcon: TextStyle;
  optionsContainer: ViewStyle;
  optionsRow: ViewStyle;
  option: ViewStyle;
  optionText: TextStyle;
  selectedOption: ViewStyle;
  selectedOptionText: TextStyle;
}

const ROUND_OPTIONS = [
  [5, 10, 15],
  [20, 25]
];

const SELECTED_OPTION_COLOR = ChristmasTheme.light.primary;

/**
 * Sélecteur de nombre de rounds pour la partie
 */
export default function RoundSelector({
  selectedRounds,
  showOptions,
  onToggle,
  onSelect,
  isHalloweenGame = false
}: RoundSelectorProps) {
  const { t } = useTranslation();

  const gradientColors = (isHalloweenGame
    ? [HalloweenTheme.light.primary, HalloweenTheme.light.error]
    : [ChristmasTheme.light.primary, ChristmasTheme.light.secondary]) as [string, string];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onToggle}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.text}>{selectedRounds} {t('room.rounds')}</Text>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="star-four-points" size={18} color="white" style={styles.starIcon} />
              <MaterialCommunityIcons name="star-four-points" size={12} color="white" style={styles.smallStarIcon} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {showOptions && (
        <View style={styles.optionsContainer}>
          {ROUND_OPTIONS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.optionsRow}>
              {row.map((rounds) => (
                <TouchableOpacity
                  key={rounds}
                  style={[
                    styles.option,
                    selectedRounds === rounds && styles.selectedOption
                  ]}
                  onPress={() => onSelect(rounds)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedRounds === rounds && styles.selectedOptionText
                  ]}>
                    {rounds}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create<RoundSelectorStyles>({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 15,
    position: 'relative',
    zIndex: 100,
  },
  button: {
    width: 'auto',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  starIcon: {
    marginLeft: 2,
  },
  smallStarIcon: {
    marginLeft: -4,
    marginTop: -8,
  },
  optionsContainer: {
    position: 'absolute',
    bottom: '120%',
    left: 0,
    backgroundColor: 'rgba(20, 20, 30, 0.8)',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'space-around',
    zIndex: 1000,
    width: 220,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  option: {
    padding: 16,
    margin: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(80, 80, 100, 0.3)',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectedOption: {
    backgroundColor: SELECTED_OPTION_COLOR,
  },
  selectedOptionText: {
    color: '#fff',
  },
});
