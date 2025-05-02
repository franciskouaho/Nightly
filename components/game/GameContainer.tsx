import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuestion } from '@/hooks/useQuestion';
import { QuestionDisplay } from '@/components/game/QuestionDisplay';
import { GameType, Theme } from '@/types/game';

interface GameContainerProps {
  gameType: GameType;
  theme?: Theme;
  onGameEnd?: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  gameType,
  theme = 'standard',
  onGameEnd,
}) => {
  const {
    currentQuestion,
    loading,
    error,
    fetchQuestion,
    skipQuestion,
  } = useQuestion({ gameType, theme });

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchQuestion}>
          <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentQuestion && (
        <>
          <QuestionDisplay
            question={currentQuestion.text}
            theme={currentQuestion.theme}
            roundNumber={currentQuestion.roundNumber}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={skipQuestion}>
              <Text style={styles.buttonText}>Question suivante</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.endButton]} 
              onPress={onGameEnd}
            >
              <Text style={styles.buttonText}>Terminer le jeu</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
}); 