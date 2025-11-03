import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface GameOptionsProps {
    gameId: string;
    selectedLevel?: 'hot' | 'extreme' | 'chaos' | null;
    selectedMode?: 'versus' | 'fusion' | null;
    selectedIntensity?: 'soft' | 'tension' | 'extreme' | null;
    onLevelChange?: (level: 'hot' | 'extreme' | 'chaos') => void;
    onModeChange?: (mode: 'versus' | 'fusion') => void;
    onIntensityChange?: (intensity: 'soft' | 'tension' | 'extreme') => void;
    isHalloweenGame?: boolean;
}

interface GameOptionsStyles {
    container: ViewStyle;
    optionLabel: TextStyle;
    optionsRow: ViewStyle;
    optionButton: ViewStyle;
    selectedOptionButton: ViewStyle;
    optionButtonText: TextStyle;
    selectedOptionButtonText: TextStyle;
}

/**
 * Composant pour afficher les options spécifiques à chaque jeu
 */
export default function GameOptions({
    gameId,
    selectedLevel,
    selectedMode,
    selectedIntensity,
    onLevelChange,
    onModeChange,
    onIntensityChange,
    isHalloweenGame = false,
}: GameOptionsProps) {
    // Options pour Double Dare
    if (gameId === 'double-dare') {
        return (
            <View style={styles.container}>
                <Text style={styles.optionLabel}>Niveau :</Text>
                <View style={styles.optionsRow}>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            selectedLevel === 'hot' && styles.selectedOptionButton
                        ]}
                        onPress={() => onLevelChange?.('hot')}
                    >
                        <Text style={[
                            styles.optionButtonText,
                            selectedLevel === 'hot' && styles.selectedOptionButtonText
                        ]}>🔥 HOT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            selectedLevel === 'extreme' && styles.selectedOptionButton
                        ]}
                        onPress={() => onLevelChange?.('extreme')}
                    >
                        <Text style={[
                            styles.optionButtonText,
                            selectedLevel === 'extreme' && styles.selectedOptionButtonText
                        ]}>😳 EXTREME</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            selectedLevel === 'chaos' && styles.selectedOptionButton
                        ]}
                        onPress={() => onLevelChange?.('chaos')}
                    >
                        <Text style={[
                            styles.optionButtonText,
                            selectedLevel === 'chaos' && styles.selectedOptionButtonText
                        ]}>😈 CHAOS</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.optionLabel}>Mode :</Text>
                <View style={styles.optionsRow}>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            selectedMode === 'versus' && styles.selectedOptionButton
                        ]}
                        onPress={() => onModeChange?.('versus')}
                    >
                        <Text style={[
                            styles.optionButtonText,
                            selectedMode === 'versus' && styles.selectedOptionButtonText
                        ]}>⚔️ VERSUS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            selectedMode === 'fusion' && styles.selectedOptionButton
                        ]}
                        onPress={() => onModeChange?.('fusion')}
                    >
                        <Text style={[
                            styles.optionButtonText,
                            selectedMode === 'fusion' && styles.selectedOptionButtonText
                        ]}>💫 FUSION</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Options pour Forbidden Desire
    if (gameId === 'forbidden-desire') {
        return (
            <View style={styles.container}>
                <Text style={styles.optionLabel}>Intensité :</Text>
                <View style={styles.optionsRow}>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            selectedIntensity === 'soft' && styles.selectedOptionButton
                        ]}
                        onPress={() => onIntensityChange?.('soft')}
                    >
                        <Text style={[
                            styles.optionButtonText,
                            selectedIntensity === 'soft' && styles.selectedOptionButtonText
                        ]}>🔥 SOFT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            selectedIntensity === 'tension' && styles.selectedOptionButton
                        ]}
                        onPress={() => onIntensityChange?.('tension')}
                    >
                        <Text style={[
                            styles.optionButtonText,
                            selectedIntensity === 'tension' && styles.selectedOptionButtonText
                        ]}>😳 TENSION</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            selectedIntensity === 'extreme' && styles.selectedOptionButton
                        ]}
                        onPress={() => onIntensityChange?.('extreme')}
                    >
                        <Text style={[
                            styles.optionButtonText,
                            selectedIntensity === 'extreme' && styles.selectedOptionButtonText
                        ]}>😈 EXTRÊME</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Aucune option pour les autres jeux
    return null;
}

const styles = StyleSheet.create<GameOptionsStyles>({
    container: {
        width: '100%',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    optionLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 5,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 10,
    },
    optionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(80, 80, 100, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedOptionButton: {
        backgroundColor: '#C41E3A',
        borderColor: '#E8B4B8',
    },
    optionButtonText: {
        color: '#ccc',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    selectedOptionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
