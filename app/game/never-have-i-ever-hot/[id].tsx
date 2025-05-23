import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {  Question as GameQuestion, GamePhase, Player } from '@/types/gameTypes';
import RoundedButton from '@/components/RoundedButton';
import { router } from 'expo-router';
import { useGame } from '@/hooks/useGame';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useInAppReview } from '@/hooks/useInAppReview';
import { useNeverHaveIEverHotAnalytics } from '@/hooks/useNeverHaveIEverHotAnalytics';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import GameResults from '@/components/game/GameResults';
import { usePoints } from '@/hooks/usePoints';

interface NeverHaveIEverHotGameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  currentQuestion: GameQuestion | null;
  targetPlayer: Player | null;
  players: Player[];
  scores: Record<string, number>;
  answers: Array<{
    id: string;
    text: string;
    playerId: string;
    playerName: string;
  }>;
  theme: string;
  timer: number | null;
  gameMode: 'never-have-i-ever-hot';
}

function ModeSelector({ onSelect, isTarget }: { onSelect: (mode: 'never' | 'ever' | null) => void, isTarget: boolean }) {
  const { t } = useTranslation();
  if (!isTarget) {
    return (
      <LinearGradient colors={["#0E1117", "#661A59"]} style={styles.modeSelectorContainer}>
        <View style={styles.waitingCard}>
          <ActivityIndicator size="large" color="#D81B60" style={styles.loadingIndicator} />
          <Text style={styles.waitingText}>{t('game.neverHaveIEverHot.waiting')}</Text>
          <Text style={styles.waitingSubtext}>{t('game.neverHaveIEverHot.prepare')}</Text>
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
            <Text style={styles.modeLabel}>{t('game.neverHaveIEverHot.never')}</Text>
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
            <Text style={styles.modeLabel}>{t('game.neverHaveIEverHot.ever')}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

export default function NeverHaveIEverHotGame() {
  // Hooks pour les paramètres et les contextes - Toujours dans le même ordre
  const { id } = useLocalSearchParams();
  const gameId = typeof id === 'string' ? id : id?.[0] || '';
  const { t } = useTranslation();
  const { getGameContent } = useLanguage();
  const { gameState, updateGameState } = useGame(gameId);
  const { user } = useAuth();
  const { requestReview } = useInAppReview();
  const gameAnalytics = useNeverHaveIEverHotAnalytics();
  const { awardGamePoints } = usePoints();
  
  // State hooks - Garder un ordre constant
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [isInverted, setIsInverted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [mode, setMode] = useState<'never' | 'ever' | null>(null);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [isQuestionTracked, setIsQuestionTracked] = useState(false);
  
  // Refs - Après tous les useState
  const gameStartTime = useRef(Date.now());
  const previousQuestionId = useRef<string | null>(null);
  const questionUpdateInProgress = useRef(false);
  const initialAnswersRef = useRef<Record<string, boolean | null>>({});
  
  // Constantes
  const TOTAL_ROUNDS = 4;
  const userId = user?.uid;
  const isTarget = userId === gameState?.targetPlayer?.id;

  console.log("[DEBUG NeverHaveIEverHotGame] Component rendered. Game State:", gameState);
  console.log("[DEBUG NeverHaveIEverHotGame] User ID:", userId);
  console.log("[DEBUG NeverHaveIEverHotGame] Is Target Player:", isTarget);

  // Mémoriser les joueurs qui ne sont pas la cible
  const nonTargetPlayers = useMemo(() => {
    if (!gameState?.players || !gameState?.targetPlayer) return [];
    return gameState.players.filter(p => p.id !== gameState.targetPlayer?.id);
  }, [gameState?.players, gameState?.targetPlayer]);

  // Extraire la logique du texte de la question - sans useCallback pour l'instant
  function getQuestionText() {
    if (!currentQuestion) return '';

    let questionText = '';
    if (typeof currentQuestion.text === 'string') {
      questionText = currentQuestion.text;
    } else if (
      currentQuestion.text &&
      typeof currentQuestion.text === 'object' &&
      (currentQuestion.text as { text?: string }).text
    ) {
      questionText = (currentQuestion.text as { text: string }).text;
    }

    if (!questionText) return '';

    if (mode === 'ever') {
      return questionText.replace("Je n'ai jamais", "J'ai déjà");
    }
    return isInverted
      ? questionText.replace("Je n'ai jamais", "J'ai déjà")
      : questionText;
  }

  // Initialiser les réponses
  const initializeAnswers = useCallback(() => {
    if (questionUpdateInProgress.current) return;
    
    const initialAnswers: Record<string, boolean | null> = {};
    nonTargetPlayers.forEach((p) => {
      initialAnswers[p.id] = null;
    });
    
    initialAnswersRef.current = initialAnswers;
    return initialAnswers;
  }, [nonTargetPlayers]);

  // Tracker le début d'une question
  const trackQuestionStart = useCallback((questionId: string) => {
    if (!isQuestionTracked && questionId && questionId !== previousQuestionId.current) {
      gameAnalytics.trackQuestionStart(String(gameId), questionId);
      setIsQuestionTracked(true);
      previousQuestionId.current = questionId;
    }
  }, [gameId, gameAnalytics, isQuestionTracked]);

  // Gérer les réponses aux questions
  const handleAnswer = useCallback((playerId: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [playerId]: value }));
    gameAnalytics.trackPlayerResponse(String(gameId), playerId, value ? 'yes' : 'no');
  }, [gameId, gameAnalytics]);

  // Mettre à jour l'état du jeu avec une nouvelle question
  const updateGameStateWithNewQuestion = useCallback((nextQuestion: GameQuestion) => {
    if (!gameState) {
      console.log('[DEBUG] updateGameStateWithNewQuestion: gameState est null');
      return;
    }
    
    // Éviter les mises à jour multiples
    if (questionUpdateInProgress.current) {
      console.log('[DEBUG] updateGameStateWithNewQuestion: verrou actif, mise à jour ignorée');
      return;
    }
    
    console.log('[DEBUG] updateGameStateWithNewQuestion: Changement de joueur et de question');
    
    const nextPlayerIndex = (gameState.players.findIndex(p => p.id === gameState.targetPlayer?.id) + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextPlayerIndex];
    
    if (nextPlayer) {
      setMode(null);
      setIsQuestionTracked(false);
      previousQuestionId.current = null;
      
      // Créer un nouvel objet gameState pour éviter les références partagées
      const newGameState = {
        ...gameState,
        currentQuestion: {...nextQuestion},
        targetPlayer: {...nextPlayer},
        currentRound: gameState.currentRound + 1,
        phase: GamePhase.QUESTION,
        gameMode: 'never-have-i-ever-hot'
      };
      
      console.log('[DEBUG] Mise à jour avec nouvelle question:', nextQuestion.id);
      updateGameState(newGameState);
    } else {
      console.log('[DEBUG] Joueur suivant non trouvé');
    }
  }, [gameState, updateGameState]);

  // Passer au round suivant
  const handleNextRound = useCallback(async () => {
    console.log('[DEBUG] handleNextRound appelé');
    
    if (!gameState) {
      console.log('[DEBUG] handleNextRound: gameState est null');
      return;
    }
    
    if (questionUpdateInProgress.current) {
      console.log('[DEBUG] handleNextRound: verrou actif, action ignorée');
      return;
    }

    // Activer le verrou pour empêcher les mises à jour multiples
    questionUpdateInProgress.current = true;
    console.log('[DEBUG] handleNextRound: verrou activé');

    try {
      // Track la fin du round
      const responseCounts = Object.values(answers).reduce((acc, val) => {
        if (val === true) acc.yes++;
        if (val === false) acc.no++;
        return acc;
      }, { yes: 0, no: 0 });
      
      console.log('[DEBUG] Tracking fin de round:', {
        gameId,
        round: gameState.currentRound,
        totalRounds: TOTAL_ROUNDS,
        responses: responseCounts
      });
      
      try {
        await gameAnalytics.trackRoundComplete(
          String(gameId),
          gameState.currentRound,
          TOTAL_ROUNDS,
          responseCounts
        );
        console.log('[DEBUG] Analytics pour fin de round envoyé');
      } catch (analyticsError) {
        console.error('[DEBUG] Erreur analytics:', analyticsError);
        // Continue même si l'analytics échoue
      }

      // Vérifier si c'est le dernier round
      if (gameState.currentRound >= TOTAL_ROUNDS) {
        console.log('[DEBUG] Dernier round atteint, fin du jeu');
        // C'est le dernier round, passer en phase de fin
        const endGameState = {
          ...gameState,
          phase: GamePhase.END
        };
        await updateGameState(endGameState);
        questionUpdateInProgress.current = false;
        return;
      }

      // Récupérer une nouvelle question aléatoire dans la langue actuelle
      console.log('[DEBUG] Récupération du contenu du jeu');
      let gameContent;
      try {
        gameContent = await getGameContent('never-have-i-ever-hot');
        console.log("[DEBUG NeverHaveIEverHotGame] getGameContent result:", gameContent);
      } catch (error) {
        console.error('[DEBUG] Erreur lors de la récupération du contenu du jeu:', error);
        Alert.alert(t('game.error'), t('game.neverHaveIEver.errorNext'));
        questionUpdateInProgress.current = false;
        return;
      }
      
      const questionsArr = gameContent.questions;
      
      if (!questionsArr || !Array.isArray(questionsArr) || questionsArr.length === 0) {
        console.log('[DEBUG] Aucune question disponible');
        Alert.alert(t('game.error'), t('game.neverHaveIEver.noQuestions'));
        questionUpdateInProgress.current = false;
        return;
      }
      
      console.log('[DEBUG] Filtrage des questions déjà posées');
      // Filtrer les questions déjà posées
      const availableQuestions = questionsArr.filter(q => {
        const questionText = typeof q.text === 'string' 
          ? q.text 
          : (q.text && typeof q.text === 'object' && 'text' in q.text)
            ? q.text.text
            : '';
        return !askedQuestions.includes(questionText);
      });
      
      console.log('[DEBUG] Questions disponibles:', availableQuestions.length);
      let nextQuestion: GameQuestion;
      
      if (availableQuestions.length === 0) {
        // Si toutes les questions ont été posées, réinitialiser la liste
        console.log('[DEBUG] Toutes les questions ont été posées, réinitialisation de la liste');
        setAskedQuestions([]);
        const randomQuestion = questionsArr[Math.floor(Math.random() * questionsArr.length)];
        if (!randomQuestion) {
          console.log('[DEBUG] Aucune question aléatoire trouvée');
          questionUpdateInProgress.current = false;
          return;
        }
        
        const questionText = typeof randomQuestion.text === 'string' 
          ? randomQuestion.text 
          : (randomQuestion.text && typeof randomQuestion.text === 'object' && 'text' in randomQuestion.text)
            ? randomQuestion.text.text
            : '';
        
        nextQuestion = {
          id: String(Math.random()),
          text: questionText,
          theme: 'hot',
          roundNumber: gameState.currentRound + 1
        };
      } else {
        console.log('[DEBUG] Sélection d\'une question disponible');
        const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        if (!randomQuestion) {
          console.log('[DEBUG] Aucune question aléatoire disponible trouvée');
          questionUpdateInProgress.current = false;
          return;
        }
        
        const questionText = typeof randomQuestion.text === 'string' 
          ? randomQuestion.text 
          : (randomQuestion.text && typeof randomQuestion.text === 'object' && 'text' in randomQuestion.text)
            ? randomQuestion.text.text
            : '';
        
        nextQuestion = {
          id: String(Math.random()),
          text: questionText,
          theme: 'hot',
          roundNumber: gameState.currentRound + 1
        };
      }
      
      console.log('[DEBUG] Nouvelle question sélectionnée:', nextQuestion.id);
      // Mise à jour directe de Firestore ici plutôt que d'utiliser updateGameStateWithNewQuestion
      const nextPlayerIndex = (gameState.players.findIndex(p => p.id === gameState.targetPlayer?.id) + 1) % gameState.players.length;
      const nextPlayer = gameState.players[nextPlayerIndex];
      
      if (nextPlayer) {
        console.log('[DEBUG] Mise à jour directe de Firestore');
        const newGameState = {
          ...gameState,
          currentQuestion: nextQuestion,
          targetPlayer: nextPlayer,
          currentRound: gameState.currentRound + 1,
          phase: GamePhase.QUESTION
        };
        
        setMode(null);
        setIsQuestionTracked(false);
        previousQuestionId.current = null;
        
        await updateGameState(newGameState);
        console.log('[DEBUG] État du jeu mis à jour avec succès');
      } else {
        console.log('[DEBUG] Joueur suivant non trouvé');
      }
    } catch (error) {
      console.error('[DEBUG] Erreur globale lors du passage au round suivant:', error);
      Alert.alert(t('game.error'), t('game.neverHaveIEver.errorNext'));
    } finally {
      // Réinitialiser le verrou avec un léger délai pour éviter les mises à jour cycliques
      console.log('[DEBUG] Réinitialisation du verrou');
      setTimeout(() => {
        questionUpdateInProgress.current = false;
        console.log('[DEBUG] Verrou désactivé');
      }, 500);
    }
  }, [gameState, updateGameState, gameAnalytics, gameId, getGameContent, t, askedQuestions, answers, TOTAL_ROUNDS]);

  // Gestion du changement de question - avec protection contre les mises à jour cycliques
  useEffect(() => {
    if (!gameState?.currentQuestion || questionUpdateInProgress.current) {
      return;
    }

    const question = gameState.currentQuestion;
    const questionId = question.id;

    // Si la question n'a pas changé, ne rien faire
    if (questionId === previousQuestionId.current && currentQuestion?.id === questionId) {
      return;
    }

    // Prévenir les mises à jour cycliques
    questionUpdateInProgress.current = true;

    try {
      // Mise à jour du state avec la nouvelle question
      setCurrentQuestion(question);
      setIsInverted(false);

      // Initialiser les réponses
      const newAnswers = initializeAnswers();
      if (newAnswers) {
        setAnswers(newAnswers);
      }

      // Ajouter la question à la liste des questions posées
      if (question.text) {
        const questionText = typeof question.text === 'string' ? question.text : '';
        if (questionText && !askedQuestions.includes(questionText)) {
          setAskedQuestions(prev => [...prev, questionText]);
        }
      }

      // Tracker le début de la question
      if (questionId) {
        trackQuestionStart(questionId);
      }
    } finally {
      // Réinitialiser le verrou
      setTimeout(() => {
        questionUpdateInProgress.current = false;
      }, 0);
    }
  }, [gameState?.currentQuestion?.id, initializeAnswers, trackQuestionStart, askedQuestions, currentQuestion?.id]);

  // Écran de fin de jeu
  useEffect(() => {
    if (gameState && gameState.phase === GamePhase.END) {
      const timeout = setTimeout(async () => {
        await requestReview();
        router.replace(`/game/results/${gameId}`);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [gameState?.phase, gameId, requestReview]);

  // Gestion des rendus conditionnels
  if (!gameState) {
    return (
      <LinearGradient 
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        style={styles.container}
      >
        <Text style={styles.loadingText}>{t('game.loading')}</Text>
      </LinearGradient>
    );
  }

  if (gameState.phase === GamePhase.END) {
    // Attribuer les points avant d'afficher les résultats
    if (gameState.gameMode) {
      awardGamePoints(
        gameId,
        gameState.gameMode,
        gameState.players,
        gameState.scores
      );
    }

    return (
      <GameResults
        players={gameState.players || []}
        scores={gameState.scores || {}}
        userId={user?.uid || ''}
        pointsConfig={{
          firstPlace: 30,
          secondPlace: 20,
          thirdPlace: 10
        }}
      />
    );
  }

  if (!mode) {
    return <ModeSelector onSelect={setMode} isTarget={isTarget} />;
  }

  return (
    <LinearGradient 
      colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>JEU DE CARTES : {t('game.neverHaveIEverHot.never').toUpperCase()} {mode === 'ever' ? t('game.neverHaveIEverHot.ever').toUpperCase() : ''} 🔞</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${(gameState.currentRound / TOTAL_ROUNDS) * 100}%` }]} />
          </View>
          <Text style={styles.progressTextRight}>{`${gameState.currentRound}/${TOTAL_ROUNDS}`}</Text>
        </View>
        {isTarget ? (
          <Text style={styles.subtitle}>{t('game.neverHaveIEverHot.readAloud')}</Text>
        ) : (
          <Text style={styles.subtitle}>{t('game.neverHaveIEverHot.targetReads', { name: gameState.targetPlayer?.name || t('game.player') })}</Text>
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
          title={gameState.currentRound === TOTAL_ROUNDS ? t('game.neverHaveIEverHot.endGame') : t('game.neverHaveIEverHot.next')}
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
