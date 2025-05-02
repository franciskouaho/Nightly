import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Question, Player } from '@/types/gameTypes';

interface QuestionPhaseProps {
  question: Question | null;
  targetPlayer: Player | null;
  onSubmit: (answer: string) => void;
  round: number;
  totalRounds: number;
  timer: number | null;
  isSubmitting: boolean;
  hasAnswered: boolean;
}

export default function QuestionPhase({
  question,
  targetPlayer,
  onSubmit,
  round,
  totalRounds,
  timer,
  isSubmitting,
  hasAnswered
}: QuestionPhaseProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (!answer.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une réponse');
      return;
    }
    onSubmit(answer.trim());
  };

  if (!question) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Chargement de la question...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roundText}>Tour {round}/{totalRounds}</Text>
        {timer !== null && (
          <Text style={styles.timerText}>{timer}s</Text>
        )}
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {question.text.replace('{player}', targetPlayer?.name || 'le joueur')}
        </Text>
      </View>

      {!hasAnswered ? (
        <View style={styles.answerContainer}>
          <TextInput
            style={styles.input}
            placeholder="Votre réponse..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={answer}
            onChangeText={setAnswer}
            multiline
            maxLength={200}
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>
            Votre réponse a été envoyée. En attente des autres joueurs...
          </Text>
        </View>
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
  roundText: {
    fontSize: 18,
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
  answerContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#5d6dff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
}); 