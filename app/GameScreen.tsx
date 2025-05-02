import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Question } from '@/types/gameTypes';

type GameScreenProps = {
  question: Question;
};

const GameScreen: React.FC<GameScreenProps> = ({ question }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{question.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default GameScreen;