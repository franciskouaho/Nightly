import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Question, Answer } from '@/types/gameTypes';
import RoundedButton from '@/components/RoundedButton';

interface VotePhaseProps {
  answers: Answer[];
  question: Question | null;
  onVote: (answerId: string) => void;
  timer: number | null;
  isTargetPlayer: boolean;
  hasVoted: boolean;
  allPlayersVoted: boolean;
}

export default function VotePhase({
  answers,
  question,
  onVote,
  timer,
  isTargetPlayer,
  hasVoted,
  allPlayersVoted
}: VotePhaseProps) {
  if (!question) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Chargement des réponses...</Text>
      </View>
    );
  }

  if (hasVoted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Votre vote a été enregistré. En attente des autres joueurs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.questionText}>
          {question.text}
        </Text>
        {timer !== null && (
          <Text style={styles.timerText}>{timer}s</Text>
        )}
      </View>

      <ScrollView style={styles.answersContainer}>
        {answers.map((answer) => (
          <RoundedButton
            key={answer.id}
            title={answer.text}
            onPress={() => onVote(answer.id)}
            disabled={!isTargetPlayer || hasVoted || allPlayersVoted}
            style={styles.answerButton}
            textStyle={styles.answerText}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  timerText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  answersContainer: {
    flex: 1,
  },
  answerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  answerText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
  },
  message: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
}); 