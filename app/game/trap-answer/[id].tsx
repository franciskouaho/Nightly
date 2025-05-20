import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GamePhase, GameState, Player } from '@/types/gameTypes';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { TrapAnswer, TrapQuestion, TrapGameState, TrapPlayerAnswer } from './types';
import { questions as initialQuestions } from './questions';

export default function TrapAnswerGame() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { gameState: genericGameState, updateGameState } = useGame('trap-answer');

  const [localState, setLocalState] = useState<TrapGameState>({
    phase: genericGameState?.phase || GamePhase.LOADING,
    currentRound: genericGameState?.currentRound || 0,
    totalRounds: genericGameState?.totalRounds || 0,
    targetPlayer: genericGameState?.targetPlayer || null,
    currentQuestion: null,
    answers: genericGameState?.answers || [],
    players: genericGameState?.players || [],
    scores: genericGameState?.scores || {},
    theme: genericGameState?.theme || '',
    timer: genericGameState?.timer || null,
    questions: initialQuestions,
    playerAnswers: {},
    askedQuestionIds: [],
  });

  useEffect(() => {
    if (genericGameState) {
      setLocalState(prev => ({
          ...prev,
          phase: genericGameState.phase as GamePhase || prev.phase,
          currentRound: genericGameState.currentRound || prev.currentRound,
          totalRounds: genericGameState.totalRounds || prev.totalRounds,
          targetPlayer: genericGameState.targetPlayer || prev.targetPlayer,
          answers: genericGameState.answers || prev.answers,
          players: genericGameState.players || prev.players,
          scores: genericGameState.scores || prev.scores,
          theme: genericGameState.theme || prev.theme,
          timer: genericGameState.timer || prev.timer,
          playerAnswers: prev.playerAnswers || {},
          askedQuestionIds: prev.askedQuestionIds || [],
          currentQuestion: prev.currentQuestion || null,
      }));

      if (initialQuestions.length > 0 && !localState.currentQuestion && localState.askedQuestionIds.length === 0) {
          const firstQuestion = getRandomQuestion(initialQuestions, []);
          if (firstQuestion) {
              setLocalState(prev => ({
                  ...prev,
                  currentQuestion: firstQuestion,
                  askedQuestionIds: [firstQuestion.id],
              }));
          } else {
              updateGameState({
                  phase: GamePhase.END
              });
          }
      }
    }

  }, [genericGameState, initialQuestions]);

  const calculateScore = (answer: TrapAnswer): number => {
    if (answer.isCorrect) return 1;
    if (answer.isTrap) return -1;
    return 0;
  };

  const getRandomQuestion = (allQuestions: TrapQuestion[], askedIds: string[]): TrapQuestion | null => {
    const availableQuestions = allQuestions.filter(q => !askedIds.includes(q.id));
    if (availableQuestions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex] || null;
  };

  const nextQuestion = () => {
    const nextQ = getRandomQuestion(localState.questions, localState.askedQuestionIds);
    if (nextQ) {
      const updatedAskedQuestionIds = [...localState.askedQuestionIds, nextQ.id];
      setLocalState(prev => ({
        ...prev,
        currentQuestion: nextQ,
        askedQuestionIds: updatedAskedQuestionIds,
        playerAnswers: {}
      }));
      updateGameState({
        currentQuestion: nextQ as any,
      });

    } else {
      updateGameState({
        phase: GamePhase.END
      });
    }
  };

  const handleAnswer = (answer: TrapAnswer) => {
    if (!user || !localState.currentQuestion) return;

    if (localState.playerAnswers[user.uid]) {
        return;
    }

    const newPlayerAnswer: TrapPlayerAnswer = {
        answer: answer.text,
        isCorrect: answer.isCorrect,
        isTrap: answer.isTrap
    };

    const newPlayerAnswers: { [playerId: string]: TrapPlayerAnswer } = {
      ...localState.playerAnswers,
      [user.uid]: newPlayerAnswer,
    };

    const score = calculateScore(answer);
    const newScores = {
      ...localState.scores,
      [user.uid]: (localState.scores[user.uid] || 0) + score
    };

    setLocalState(prev => ({
      ...prev,
      playerAnswers: newPlayerAnswers,
      scores: newScores
    }));

    updateGameState({
      scores: newScores,
    });

    // setTimeout(nextQuestion, 2000);
  };

  const renderQuestion = () => {
    if (!localState.currentQuestion) return null;

    return (
      <View style={styles.questionContainer}>
        <View style={styles.themeContainer}>
          <Text style={styles.themeText}>{localState.currentQuestion.theme}</Text>
        </View>
        <Text style={styles.questionText}>{localState.currentQuestion.question}</Text>
        <View style={styles.answersContainer}>
          {localState.currentQuestion.answers.map((answer, index) => {
            const hasAnswered = !!localState.playerAnswers[user?.uid || ''];
            const isAnswered = localState.playerAnswers[user?.uid || '']?.answer === answer.text;

            return (
              <TouchableOpacity
                key={index}
                style={[styles.answerButton, hasAnswered && isAnswered && styles.answeredButton]}
                onPress={() => handleAnswer(answer)}
                disabled={hasAnswered}
              >
                <Text style={[styles.answerText, hasAnswered && isAnswered && styles.answeredText]}>{answer.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderPlayers = () => {
    const players = localState.players || [];
    return (
      <View style={styles.playersContainer}>
        {players.map(player => (
          <View key={player.id} style={styles.playerInfo}>
            <View style={styles.playerAvatarPlaceholder} />
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerScore}>{localState.scores[player.id] || 0}</Text>
          </View>
        ))}
      </View>
    );
  };

  const isContinueButtonEnabled = localState.players.length > 0 && Object.keys(localState.playerAnswers).length === localState.players.length;

  return (
    <LinearGradient
      colors={["rgba(40, 40, 40, 0.8)", "rgba(60, 60, 60, 0.9)"]}
      style={styles.container}
    >
      {renderPlayers()}
      <ScrollView style={styles.scrollView}>
        {renderQuestion()}
      </ScrollView>
       <TouchableOpacity
         style={[styles.continueButton, !isContinueButtonEnabled && styles.continueButtonDisabled]}
         onPress={nextQuestion}
         disabled={!isContinueButtonEnabled}
       >
        <Text style={styles.continueButtonText}>{t('game.continue')}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
    marginVertical: 20,
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  playerInfo: {
    alignItems: 'center',
  },
  playerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginBottom: 5,
  },
  playerName: {
    color: 'white',
    fontSize: 14,
  },
  playerScore: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  themeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: 'center',
    marginBottom: 15,
  },
  themeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  answersContainer: {
    gap: 10,
  },
  answerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  answeredButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4CAF50',
  },
  answerText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  answeredText: {
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 