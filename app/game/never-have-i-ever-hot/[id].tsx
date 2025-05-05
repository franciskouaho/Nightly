import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Player } from '@/types/gameTypes';
import RoundedButton from '@/components/RoundedButton';
import { router } from 'expo-router';
import { useGame } from '@/hooks/useGame';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { GamePhase } from '@/types/gameTypes';

function ModeSelector({ onSelect, isTarget }: { onSelect: (mode: 'never' | 'ever' | null) => void, isTarget: boolean }) {
  if (!isTarget) {
    return (
      <LinearGradient colors={["#0E1117", "#661A59"]} style={styles.modeSelectorContainer}>
        <View style={styles.waitingCard}>
          <ActivityIndicator size="large" color="#D81B60" style={styles.loadingIndicator} />
          <Text style={styles.waitingText}>En attente du choix du joueur cible...</Text>
          <Text style={styles.waitingSubtext}>Préparez-vous à répondre !</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0E1117", "#661A59"]} style={styles.modeSelectorContainer}>
      <View style={styles.modeSelectorColumn}>
        <Pressable
          style={({ pressed }) => [
            styles.modeCardWrapper,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 }
          ]}
          onPress={() => onSelect('never')}
        >
          <LinearGradient colors={["#D81B60", "#F44336", "#E040FB"]} style={styles.modeCard}>
            <Text style={styles.emoji}>❤️‍🔥</Text>
            <Text style={styles.modeLabel}>Je n'ai jamais</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.modeCardWrapper,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 }
          ]}
          onPress={() => onSelect('ever')}
        >
          <LinearGradient colors={["#8e0038", "#661A59", "#D81B60"]} style={styles.modeCard}>
            <Text style={styles.emoji}>💋</Text>
            <Text style={styles.modeLabel}>J'ai déjà</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

export default function NeverHaveIEverHotGame() {
  const { id } = useLocalSearchParams();
  const { gameState, updateGameState } = useGame(id as string);
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isInverted, setIsInverted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [mode, setMode] = useState<'never' | 'ever' | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const TOTAL_ROUNDS = 4;

  useEffect(() => {
    if (gameState?.currentQuestion) {
      setCurrentQuestion(gameState.currentQuestion);
      setIsInverted(false);
      const initialAnswers: Record<string, boolean | null> = {};
      gameState.players.forEach((p: Player) => {
        if (p.id !== gameState.targetPlayer?.id) initialAnswers[p.id] = null;
      });
      setAnswers(initialAnswers);
    }
  }, [gameState?.currentQuestion, gameState?.targetPlayer?.id]);

  const getQuestionText = () => {
    if (!currentQuestion?.text?.text) return '';
    if (mode === 'ever') {
      return currentQuestion.text.text.replace("Je n'ai jamais", "J'ai déjà");
    }
    return isInverted
      ? currentQuestion.text.text.replace("Je n'ai jamais", "J'ai déjà")
      : currentQuestion.text.text;
  };

  const handleAnswer = (playerId: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [playerId]: value }));
  };

  const handleNextRound = () => {
    if (!gameState) return;
    const players = gameState.players;
    const currentIdx = players.findIndex((p: Player) => p.id === gameState.targetPlayer?.id);
    const nextIdx = (currentIdx + 1) % players.length;
    
    if (currentRound >= TOTAL_ROUNDS) {
      // Fin du jeu
      updateGameState({
        ...gameState,
        phase: GamePhase.END,
        currentRound: 0,
        targetPlayer: null,
      });
      return;
    }

    setCurrentRound(prev => prev + 1);
    setMode(null); // Réinitialiser le mode pour le nouveau joueur
    updateGameState({
      ...gameState,
      currentRound: currentRound + 1,
      phase: GamePhase.QUESTION,
      targetPlayer: players[nextIdx],
    });
  };

  if (!gameState) {
    return (
      <LinearGradient 
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        style={styles.container}
      >
        <Text style={styles.loadingText}>Chargement...</Text>
      </LinearGradient>
    );
  }

  // Écran de fin de partie
  if (gameState.phase === GamePhase.END) {
    return (
      <LinearGradient
        colors={["#D81B60", "#661A59", "#21101C"]}
        style={styles.endContainer}
      >
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text style={styles.endTitle}>Félicitations à tous !</Text>
        <Text style={styles.endSubtitle}>Vous avez terminé la partie Je n'ai jamais 🔥</Text>
        <RoundedButton
          title="Retour à l'accueil"
          onPress={() => { 
            router.replace('/');
          }}
          style={styles.endButton}
          textStyle={styles.endButtonText}
        />
      </LinearGradient>
    );
  }

  const userId = user?.uid;
  const isTarget = userId === gameState.targetPlayer?.id;

  if (!mode) {
    return <ModeSelector onSelect={setMode} isTarget={isTarget} />;
  }

  return (
    <LinearGradient 
      colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>JEU DE CARTES : JE N'AI JAMAIS {mode === 'ever' && 'OU J\'AI DÉJÀ'} 🔞</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${(currentRound / TOTAL_ROUNDS) * 100}%` }]} />
          </View>
          <Text style={styles.progressTextRight}>{`${currentRound}/${TOTAL_ROUNDS}`}</Text>
        </View>
        {isTarget ? (
          <Text style={styles.subtitle}>
            Lisez la question à voix haute !
          </Text>
        ) : (
          <Text style={styles.subtitle}>
            {gameState.targetPlayer?.name} va lire la question à voix haute !
          </Text>
        )}
      </View>

      <View style={styles.cardStack}>
        <View style={[styles.card, styles.cardBack, { transform: [{ rotate: '-6deg' }, { translateY: 16 }] }]} />
        <View style={[styles.card, styles.cardBack, { transform: [{ rotate: '6deg' }, { translateY: 8 }] }]} />
        <LinearGradient colors={['#D81B60', '#661A59', '#21101C']} style={styles.card}>
          <Text style={styles.cardText}>{getQuestionText()}</Text>
        </LinearGradient>
      </View>

      {isTarget && (
        <RoundedButton
          title={currentRound === TOTAL_ROUNDS ? "Terminer le jeu" : "Tour suivant"}
          onPress={handleNextRound}
          style={styles.nextButton}
          textStyle={styles.nextButtonText}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    marginBottom: 10,
    marginTop: 0,
  },
  title: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  cardStack: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
    minHeight: 220,
  },
  card: {
    width: 300,
    height: 180,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    position: 'absolute',
  },
  cardBack: {
    backgroundColor: '#18192b',
    opacity: 0.7,
  },
  cardText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    zIndex: 2,
  },
  invertButton: {
    backgroundColor: '#D81B60',
    padding: 12,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#D81B60',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginTop: 10,
  },
  invertButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  answersContainer: {
    marginBottom: 20,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
    fontWeight: '500',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  answerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 25,
    minWidth: 70,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: '#D81B60',
    shadowColor: '#D81B60',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  answerResult: {
    fontSize: 20,
    marginLeft: 10,
  },
  waitingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#D81B60',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingIndicator: {
    marginBottom: 24,
  },
  waitingText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  waitingSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat_500Medium',
  },
  nextButton: {
    width: '100%',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#D81B60',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modeSelectorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modeSelectorColumn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingVertical: 32,
    gap: 32,
  },
  modeCardWrapper: {
    width: '100%',
    flex: 1,
    marginBottom: 0,
  },
  modeCard: {
    borderRadius: 24,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minWidth: 260,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  modeLabel: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
    gap: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#D81B60',
    borderRadius: 8,
  },
  progressTextRight: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
    opacity: 0.8,
  },
  endContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  celebrationEmoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  endTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: '#D81B60',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  endSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 32,
  },
  endButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
}); 
