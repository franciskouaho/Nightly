import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/types/game';

interface QuestionDisplayProps {
  question: string;
  theme?: Theme;
  roundNumber?: number;
  targetPlayer?: string;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  theme = 'standard',
  roundNumber,
  targetPlayer,
}) => {
  return (
    <View style={styles.container}>
      {roundNumber && (
        <Text style={styles.roundNumber}>Round {roundNumber}</Text>
      )}
      <View style={[styles.questionBox, styles[theme]]}>
        <Text style={styles.questionText}>{question}</Text>
        {targetPlayer && (
          <Text style={styles.targetPlayer}>Pour: {targetPlayer}</Text>
        )}
      </View>
      <Text style={styles.theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  questionBox: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    width: '100%',
    minHeight: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
  roundNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  targetPlayer: {
    marginTop: 8,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  theme: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  standard: {
    backgroundColor: '#4A90E2',
  },
  crazy: {
    backgroundColor: '#E74C3C',
  },
  fun: {
    backgroundColor: '#2ECC71',
  },
  dark: {
    backgroundColor: '#34495E',
  },
  personal: {
    backgroundColor: '#9B59B6',
  },
}); 