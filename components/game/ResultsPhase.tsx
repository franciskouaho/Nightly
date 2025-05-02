import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Question, Player, Answer } from '@/types/gameTypes';

interface ResultsPhaseProps {
  answers: Answer[];
  scores: Record<string, number>;
  players: Player[];
  question: Question | null;
  targetPlayer: Player | null;
  onNextRound: () => void;
  isLastRound: boolean;
  timer: number | null;
  gameId: string;
}

export default function ResultsPhase({
  answers,
  scores,
  players,
  question,
  targetPlayer,
  onNextRound,
  isLastRound,
  timer,
  gameId
}: ResultsPhaseProps) {
  const sortedPlayers = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Résultats</Text>
        {timer !== null && (
          <Text style={styles.timerText}>{timer}s</Text>
        )}
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {question?.text.replace('{player}', targetPlayer?.name || 'le joueur')}
        </Text>
      </View>

      <ScrollView style={styles.answersContainer}>
        {answers.map((answer) => (
          <View key={answer.id} style={styles.answerContainer}>
            <Text style={styles.answerText}>{answer.text}</Text>
            <Text style={styles.playerName}>- {answer.playerName}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.scoresContainer}>
        <Text style={styles.scoresTitle}>Scores</Text>
        {sortedPlayers.map((player) => (
          <View key={player.id} style={styles.scoreRow}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.scoreText}>{scores[player.id] || 0} points</Text>
          </View>
        ))}
      </View>

      {!isLastRound && (
        <TouchableOpacity style={styles.nextButton} onPress={onNextRound}>
          <Text style={styles.nextButtonText}>Tour suivant</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
  },
  answersContainer: {
    flex: 1,
    marginBottom: 20,
  },
  answerContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  answerText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  playerName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  scoresContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  scoresTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  scoreText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#5d6dff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 