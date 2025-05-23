import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { GamePhase, Player } from '@/types/gameTypes';
import { useInAppReview } from '@/hooks/useInAppReview';
import { useGeniusOrLiarAnalytics } from '@/hooks/useGeniusOrLiarAnalytics';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRandomQuestions } from '@/hooks/useRandomQuestions';
import GameResults from '@/components/game/GameResults';

interface FirebaseQuestion {
  type: string;
  question: string;
  answer: string;
  id?: string;
  roundNumber?: number;
  theme?: string;
  text?: {
    type: string;
    question: string;
    answer: string;
  };
}

interface KnowOrDrinkGameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  targetPlayer: Player | null;
  currentQuestion: FirebaseQuestion | null;
  answers: any[];
  players: Player[];
  scores: Record<string, number>;
  theme: string;
  timer: number | null;
  currentUserState: {
    [key: string]: {
      isTargetPlayer: boolean;
      hasAnswered: boolean;
      hasVoted: boolean;
    };
  };
  game?: {
    currentPhase: string;
    currentRound: number;
    totalRounds: number;
    scores: Record<string, number>;
    gameMode: string;
    hostId?: string;
  };
  currentPlayerId: string;
  playerAnswers: {
    [playerId: string]: {
      knows: boolean;
      answer: string;
      isAccused: boolean;
      accusedBy: string[];
    };
  };
  gameMode: 'points' | 'gages';
  questions: FirebaseQuestion[];
  askedQuestions?: string[];
}

export default function KnowOrDrinkGame() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { requestReview } = useInAppReview();
  const gameAnalytics = useGeniusOrLiarAnalytics();
  const [gameState, setGameState] = useState<KnowOrDrinkGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const gameStartTime = useRef(Date.now());
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const { getRandomQuestion } = useRandomQuestions('genius-or-liar');

  useEffect(() => {
    if (!id || !user) return;

    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));

    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as KnowOrDrinkGameState;
        console.log('📝 Données du jeu:', JSON.stringify(data, null, 2));
        console.log('❓ Question actuelle:', JSON.stringify(data.currentQuestion, null, 2));
        console.log('🎮 Phase du jeu:', data.phase);
        console.log('👥 Joueurs:', data.players);
        setGameState(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, user]);

  const handleKnow = async () => {
    if (!gameState || !user) return;
    setShowAnswerInput(true);
  };

  const handleSubmitAnswer = async () => {
    if (!gameState || !user || !answer.trim()) return;
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      // Track la réponse du joueur
      await gameAnalytics.trackAnswer(String(id), user.uid, answer.trim());

      await updateDoc(gameRef, {
        [`playerAnswers.${user.uid}`]: {
          knows: true,
          answer: answer.trim(),
          isAccused: false,
          accusedBy: []
        },
        [`currentUserState.${user.uid}.hasAnswered`]: true
      });
      setAnswer('');
      setShowAnswerInput(false);
    } catch (error) {
      Alert.alert(t('game.error'), t('game.geniusOrLiar.errorSubmit'));
    }
  };

  const handleDontKnow = async () => {
    if (!gameState || !user) return;
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      // Track la réponse du joueur (ne sait pas)
      await gameAnalytics.trackAnswer(String(id), user.uid, 'dont_know');

      await updateDoc(gameRef, {
        [`playerAnswers.${user.uid}`]: {
          knows: false,
          answer: '',
          isAccused: false,
          accusedBy: []
        },
        [`currentUserState.${user.uid}.hasAnswered`]: true
      });
    } catch (error) {
      Alert.alert(t('game.error'), t('game.geniusOrLiar.errorSubmit'));
    }
  };

  const handleAccuse = async (targetPlayerId: string) => {
    if (!gameState || !user) return;
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      // Track le vote du joueur
      await gameAnalytics.trackVote(String(id), user.uid, targetPlayerId, 'liar');

      await updateDoc(gameRef, {
        [`playerAnswers.${targetPlayerId}.isAccused`]: true,
        [`playerAnswers.${targetPlayerId}.accusedBy`]: [...(gameState.playerAnswers[targetPlayerId]?.accusedBy || []), user.uid],
        [`currentUserState.${user.uid}.hasVoted`]: true
      });
    } catch (error) {
      Alert.alert(t('game.error'), t('game.geniusOrLiar.errorSubmit'));
    }
  };

  const handleSkipAccuse = async () => {
    if (!gameState || !user) return;
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      // Track le vote du joueur (pas d'accusation)
      await gameAnalytics.trackVote(String(id), user.uid, 'none', 'genius');

      await updateDoc(gameRef, {
        [`currentUserState.${user.uid}.hasVoted`]: true
      });
    } catch (error) {
      Alert.alert(t('game.error'), t('game.geniusOrLiar.errorSubmit'));
    }
  };

  // Fonction pour normaliser les réponses (gérer les variations d'orthographe, articles, ponctuation)
  const normalizeAnswer = (answer: string): string => {
    return answer
      .toLowerCase()
      .trim()
      // Supprime les articles courants (le, la, les, un, une, des, the, a, an) et certains signes de ponctuation courants
      .replace(/^(le|la|les|un|une|des|the|a|an)\s+/, '') // Supprime les articles au début
      .replace(/[\.,!?;:]/g, '') // Supprime la ponctuation courante (garde les espaces)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Enlève les accents
  };

  const calculateScore = (playerId: string): number => {
    if (!gameState || !gameState.gameMode || !gameState.playerAnswers) return 0;
    const playerAnswer = gameState.playerAnswers[playerId];
    if (!playerAnswer) return 0;

    let score = 0;
    const correctAnswer = gameState.currentQuestion?.answer;
    const playerResponse = playerAnswer.answer;

    if (gameState.gameMode === 'points') {
      if (playerAnswer.knows) {
        // Vérifie si la réponse est correcte (en tenant compte des variations)
        const isCorrect = correctAnswer && playerResponse && 
          normalizeAnswer(playerResponse) === normalizeAnswer(correctAnswer);

        if (isCorrect) {
          if (playerAnswer.isAccused) {
            score = 3; // +2 pour bonne réponse +1 bonus pour accusation injuste
          } else {
            score = 2; // +2 pour bonne réponse
          }
        } else {
          score = -1; // -1 pour mauvaise réponse
        }
      } else {
        score = 0; // 0 pour "je ne sais pas"
      }
    } else { // Mode gages
      if (playerAnswer.knows) {
        if (playerAnswer.isAccused) {
          score = 2; // 2 gages si accusé à raison
        }
      } else {
        score = 1; // 1 gage si ne sait pas
      }
    }

    return score;
  };

  const renderProgressBar = () => {
    if (!gameState) return null;
    const progress = gameState.totalRounds > 0 ? gameState.currentRound / gameState.totalRounds : 0;
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { flex: progress }]} />
          <View style={{ flex: 1 - progress }} />
        </View>
        <Text style={styles.progressBarText}>
          {gameState.currentRound}/{gameState.totalRounds}
        </Text>
      </View>
    );
  };

  const renderQuestionPhase = () => {
    console.log('🎮 Rendu de la phase question');
    console.log('❓ Question actuelle dans le rendu:', JSON.stringify(gameState?.currentQuestion, null, 2));
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {gameState?.currentQuestion?.type && (
            <View style={{
              width: '100%',
              maxWidth: 200,
              alignSelf: 'center',
              marginBottom: 14,
              borderRadius: 16,
              backgroundColor: 'rgba(30, 20, 40, 0.55)',
              paddingVertical: 8,
              paddingHorizontal: 18,
              shadowColor: '#A259FF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 6,
              backdropFilter: 'blur(8px)',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#C471F5', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 }}>
                {getTypeLabel(gameState.currentQuestion.type)}
              </Text>
            </View>
          )}
          {renderProgressBar()}
          <View style={{
            width: '100%',
            maxWidth: 400,
            alignSelf: 'center',
            marginBottom: 24,
            borderRadius: 20,
            backgroundColor: 'rgba(30, 20, 40, 0.55)',
            padding: 20,
            shadowColor: '#A259FF',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.18,
            shadowRadius: 12,
            elevation: 8,
            backdropFilter: 'blur(8px)',
          }}>
            <Text style={{
              color: '#fff',
              fontSize: 22,
              fontWeight: '600',
              textAlign: 'center',
              lineHeight: 30,
              marginTop: 2,
              marginBottom: 2,
              textShadowColor: 'rgba(0,0,0,0.18)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}>
              {(() => {
                console.log('Current question:', gameState?.currentQuestion);
                if (gameState?.currentQuestion?.question) {
                  return gameState.currentQuestion.question;
                } else if (gameState?.currentQuestion?.text?.question) {
                  return gameState.currentQuestion.text.question;
                } else if (typeof gameState?.currentQuestion === 'string') {
                  return gameState.currentQuestion;
                }

                // Message plus explicite pour aider au débogage
                if (gameState?.currentQuestion && Object.keys(gameState.currentQuestion).length > 0) {
                  return `Erreur: Format de question incorrect. Veuillez récupérer des questions depuis Firebase (id: ${gameState.currentQuestion.id || 'inconnu'})`;
                }
                
                return 'Aucune question disponible';
              })()}
            </Text>
          </View>
          {gameState?.currentUserState && user?.uid && gameState.currentUserState[user.uid]?.hasAnswered && gameState.phase === 'question' ? (
            <Text style={styles.waitingText}>
              {t('game.geniusOrLiar.waitingForPlayers')}
            </Text>
          ) : showAnswerInput ? (
            <View style={styles.answerContainer}>
              <TextInput
                style={styles.answerInput}
                placeholder={t('game.geniusOrLiar.answerPlaceholder')}
                placeholderTextColor="#AAAAAA"
                value={answer}
                onChangeText={setAnswer}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity 
                style={[styles.button, !answer.trim() && styles.buttonDisabled]} 
                onPress={handleSubmitAnswer}
                disabled={!answer.trim()}
              >
                <LinearGradient
                  colors={['#A259FF', '#C471F5']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>{t('game.geniusOrLiar.validate')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleKnow}>
                <LinearGradient
                  colors={['#A259FF', '#C471F5']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>{t('game.geniusOrLiar.know')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleDontKnow}>
                <LinearGradient
                  colors={['#FF5252', '#FF7676']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>{t('game.geniusOrLiar.dontKnow')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAccusationPhase = () => (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.phaseTitle}>{t('game.geniusOrLiar.accuseTitle')}</Text>
        <View style={styles.playersList}>
          {gameState?.players.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.playerCard,
                gameState.playerAnswers[player.id]?.knows && styles.playerCardKnows,
                player.id === user?.uid && styles.currentUserCard
              ]}
              onPress={() => handleAccuse(player.id)}
              disabled={player.id === user?.uid || (user?.uid != null && gameState?.currentUserState?.[user.uid]?.hasVoted) }
            >
              <Text style={styles.playerName}>{player.name}</Text>
              {gameState.playerAnswers[player.id]?.knows && (
                <Text style={styles.playerStatus}>{t('game.geniusOrLiar.pretendKnows')}</Text>
              )}
              {gameState.playerAnswers[player.id]?.isAccused && gameState.playerAnswers[player.id]?.accusedBy && (
                <Text style={styles.accusationCount}>
                  {t('game.geniusOrLiar.accusedBy', { count: gameState.playerAnswers[player.id]?.accusedBy?.length ?? 0 })}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        {! (user?.uid != null && gameState?.currentUserState?.[user.uid]?.hasVoted) && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipAccuse}>
            <LinearGradient colors={["#3D2956", "#A259FF"]} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>{t('game.geniusOrLiar.accuseNoOne')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Détermine le statut d'un joueur à la fin du tour
  const getPlayerStatus = (playerId: string) => {
    if (!gameState) return { label: '', icon: '', color: '' };
    const playerAnswer = gameState.playerAnswers[playerId];
    if (!playerAnswer) return { label: '', icon: '', color: '' };
    const correctAnswer = gameState.currentQuestion?.answer?.toLowerCase().trim();
    const playerResponse = playerAnswer.answer?.toLowerCase().trim();
    const isCorrect = playerAnswer.knows && playerResponse === correctAnswer;
    const wasAccused = playerAnswer.isAccused;
    const wasAccusedBy = playerAnswer.accusedBy || [];
    // Cas pour le joueur
    if (!playerAnswer.knows) {
      return { label: t('game.geniusOrLiar.playerStatus.dontKnow'), icon: '❌', color: '#FF5252' };
    }
    if (isCorrect) {
      if (!wasAccused) {
        return { label: t('game.geniusOrLiar.playerStatus.correctAnswer'), icon: '✅', color: '#4CAF50' };
      } else {
        return { label: t('game.geniusOrLiar.playerStatus.correctButAccused'), icon: '⚠️', color: '#FF9800' };
      }
    } else {
      if (!wasAccused) {
        return { label: t('game.geniusOrLiar.playerStatus.liarNotAccused'), icon: '😏', color: '#A259FF' };
      } else {
        return { label: t('game.geniusOrLiar.playerStatus.liarAccused'), icon: '🚨', color: '#FF5252' };
      }
    }
  };

  // Détermine le statut d'accusateur pour chaque joueur
  const getAccuserStatus = (playerId: string) => {
    if (!gameState) return null;
    // On cherche si ce joueur a accusé quelqu'un
    const accused = Object.entries(gameState.playerAnswers).find(
      ([, answer]) => answer.accusedBy && answer.accusedBy.includes(playerId)
    );
    if (!accused) return null;
    const [targetId, targetAnswer] = accused;
    const correctAnswer = gameState.currentQuestion?.answer?.toLowerCase().trim();
    const targetResponse = targetAnswer.answer?.toLowerCase().trim();
    const isTargetCorrect = targetAnswer.knows && targetResponse === correctAnswer;
    if (!targetAnswer.knows || !isTargetCorrect) {
      // L'accusation était juste
      return { 
        label: t('game.geniusOrLiar.accuserStatus.correctAccusation'), 
        icon: '⚡️', 
        color: '#4CAF50', 
        target: targetId 
      };
    } else {
      // L'accusation était fausse
      return { 
        label: t('game.geniusOrLiar.accuserStatus.wrongAccusation'), 
        icon: '❌', 
        color: '#FF5252', 
        target: targetId 
      };
    }
  };

  // Passe au tour suivant ou termine la partie
  const handleNextRound = async () => {
    if (!gameState || !user) return;
    if (gameState.currentRound >= gameState.totalRounds) {
      setIsEnd(true);
      return;
    }
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      // Track la fin du round
      await gameAnalytics.trackRoundComplete(
        String(id),
        gameState.currentRound,
        gameState.totalRounds,
        gameState.playerAnswers[gameState.currentPlayerId]?.knows || false
      );

      // Obtenir une nouvelle question aléatoire
      const nextQuestion = getRandomQuestion();
      
      if (!nextQuestion) {
        Alert.alert(t('game.error'), t('game.geniusOrLiar.noQuestions'));
        return;
      }

      await updateDoc(gameRef, {
        currentRound: gameState.currentRound + 1,
        phase: 'question',
        currentUserState: {},
        playerAnswers: {},
        currentQuestion: nextQuestion,
      });
    } catch (error) {
      console.error('❌ Erreur lors du passage au tour suivant:', error);
      Alert.alert('Erreur', 'Impossible de passer au tour suivant');
    }
  };

  // Affichage de la fin de partie
  if (gameState?.phase === 'end') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#1A0A33", "#3A1A59"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
        />
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
      </View>
    );
  }

  const renderResultsPhase = () => {
    if (!gameState || !user) return null;

    // Calculer les scores finaux
    const finalScores: Record<string, number> = {};
    gameState.players.forEach(player => {
      finalScores[player.id] = calculateScore(player.id);
    });

    return (
      <GameResults
        players={gameState.players}
        scores={finalScores}
        userId={user.uid}
        pointsConfig={{
          firstPlace: 30,
          secondPlace: 20,
          thirdPlace: 10
        }}
      />
    );
  };

  // Vérifie si tous les joueurs ont répondu (phase question)
  const allPlayersAnswered = () => {
    if (!gameState || !gameState.players || !gameState.playerAnswers) return false;
    return gameState.players.every(
      (player) => !!gameState.playerAnswers[player.id] && typeof gameState.playerAnswers[player.id]?.knows === 'boolean'
    );
  };

  // Nouvelle fonction pour vérifier si tous les joueurs ont voté
  const allPlayersVoted = () => {
    if (!gameState || !gameState.players || !gameState.currentUserState) return false;
    // Supposons que chaque joueur a un état dans gameState.currentUserState sous la forme { [playerId]: { hasVoted: boolean } }
    return gameState.players.every(
      (player) => gameState.currentUserState && gameState.currentUserState[player.id]?.hasVoted === true
    );
  };

  // Dans useEffect, remplacer la logique d'accusation :
  useEffect(() => {
    if (!gameState || !user) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    if (gameState.phase === 'question' && allPlayersAnswered()) {
      updateDoc(gameRef, { phase: 'vote' });
    }
    if (gameState.phase === 'vote' && allPlayersVoted()) {
      updateDoc(gameRef, { phase: 'results' });
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState && gameState.currentRound >= gameState.totalRounds && gameState.phase === 'results') {
      const gameDuration = Date.now() - gameStartTime.current;
      const userScore = gameState.scores[user?.uid || ''] || 0;
      
      // Track la fin du jeu
      gameAnalytics.trackGameComplete(
        String(id),
        gameState.totalRounds,
        gameDuration,
        userScore
      );
      
      const timeout = setTimeout(async () => {
        await requestReview();
        const db = getFirestore();
        const gameRef = doc(db, 'games', String(id));
        await updateDoc(gameRef, { phase: 'end' });
      }, 2000);
      return () => clearTimeout(timeout);
    }
    return () => {}; // Retour par défaut pour les autres cas
  }, [gameState, id, requestReview, gameAnalytics, user]);

  // Fonction pour calculer les scores de tous les joueurs (variante points complète)
  const computeScores = (): Record<string, number> => {
    if (!gameState) return {};

    const scores: Record<string, number> = {};
    
    // Initialiser tous les scores à 0
    gameState.players.forEach(player => {
      scores[player.id] = 0;
    });

    // Calculer les scores pour chaque joueur
    gameState.players.forEach(player => {
      const score = calculateScore(player.id);
      scores[player.id] = score;
    });

    return scores;
  };

  // Effet pour mettre à jour les scores à la phase results
  useEffect(() => {
    if (!gameState || !user) return;
    if (gameState.phase === 'results') {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      const newScores = computeScores();
      updateDoc(gameRef, { scores: newScores });
    }
  }, [gameState?.phase]);

  // Ajoute la fonction utilitaire pour rendre le type plus user-friendly
  function getTypeLabel(type: string) {
    switch (type) {
      case 'cultureG': return 'Culture Générale';
      case 'cultureGHard': return 'Culture G (Difficile)';
      case 'culturePop': return 'Culture Pop';
      case 'cultureGeek': return 'Culture Geek';
      case 'cultureArt': return 'Art & Littérature';
      case 'hard': return 'Hardcore';
      case 'devinette': return 'Devinette';
      case 'verite': return 'Vérité';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }

  useEffect(() => {
    if (gameState && gameState.currentRound > gameState.totalRounds) {
      setIsEnd(true);
      const timeout = setTimeout(async () => {
        await requestReview();
        const db = getFirestore();
        const gameRef = doc(db, 'games', String(id));
        await updateDoc(gameRef, { phase: 'end' });
      }, 2000);
      return () => clearTimeout(timeout);
    }
    return () => {}; // Retour par défaut pour les autres cas
  }, [gameState, id, requestReview]);

  const renderChoicePhase = () => (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.phaseTitle}>{t('game.geniusOrLiar.chooseGameMode')}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => handleGameModeSelect('points')}>
            <LinearGradient
              colors={['#A259FF', '#C471F5']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>{t('game.geniusOrLiar.pointsMode')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleGameModeSelect('gages')}>
            <LinearGradient
              colors={['#FF5252', '#FF7676']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>{t('game.geniusOrLiar.gagesMode')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleGameModeSelect = async (mode: 'points' | 'gages') => {
    if (!gameState || !user) return;
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      await updateDoc(gameRef, {
        gameMode: mode,
        phase: 'question'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la sélection du mode:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le mode de jeu');
    }
  };

  useEffect(() => {
    if (gameState && gameState.currentRound >= gameState.totalRounds && gameState.phase === 'results') {
      const gameDuration = Date.now() - gameStartTime.current;
      const userScore = gameState.scores[user?.uid || ''] || 0;
      
      // Track la fin du jeu
      gameAnalytics.trackGameComplete(
        String(id),
        gameState.totalRounds,
        gameDuration,
        userScore
      );
      
      const timeout = setTimeout(async () => {
        await requestReview();
        const db = getFirestore();
        const gameRef = doc(db, 'games', String(id));
        await updateDoc(gameRef, { phase: 'end' });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [gameState, id, requestReview, gameAnalytics, user]);

  // Dans useEffect, ajoutons une vérification pour charger les questions depuis Firebase si nécessaire
  useEffect(() => {
    if (gameState && gameState.phase === 'question' &&
        (!gameState.currentQuestion?.question && !gameState.currentQuestion?.text?.question) &&
        gameState.currentQuestion) {

      console.log('[DEBUG GeniusOrLiarGame] Attempting to load initial random question.');
      const firstQuestion = getRandomQuestion();
      if (firstQuestion) {
        console.log('[DEBUG GeniusOrLiarGame] Initial random question selected:', firstQuestion.id);
        const db = getFirestore();
        const gameRef = doc(db, 'games', String(id));
        updateDoc(gameRef, { 
          currentQuestion: firstQuestion,
          askedQuestions: [firstQuestion.id] // Marquer la première question comme posée
        });
      } else {
        console.warn('[DEBUG GeniusOrLiarGame] No initial random question available.');
      }
    }
  }, [gameState, id, isRTL, i18n.language]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.loadingText}>Chargement du jeu...</Text>
        </View>
      </View>
    );
  }

  if (!gameState) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.errorText}>Jeu non trouvé</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
        {gameState.phase === 'choix' && renderChoicePhase()}
        {gameState.phase === 'question' && renderQuestionPhase()}
        {gameState.phase === 'vote' && renderAccusationPhase()}
        {gameState.phase === 'results' && renderResultsPhase()}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'System',
    fontWeight: '600',
    lineHeight: 32,
    paddingHorizontal: 20,
  },
  answerContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 20,
  },
  answerInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    width: '100%',
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonContainer: {
    gap: 20,
    width: '100%',
    maxWidth: 400,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  phaseTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'System',
    fontWeight: '600',
  },
  playersList: {
    gap: 15,
    width: '100%',
    maxWidth: 400,
  },
  playerCard: {
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playerCardKnows: {
    borderColor: '#A259FF',
    borderWidth: 2,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  playerStatus: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'System',
  },
  accusationCount: {
    color: '#FF9800',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'System',
  },
  resultCard: {
    backgroundColor: 'rgba(30, 20, 40, 0.45)',
    padding: 22,
    borderRadius: 22,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(162, 89, 255, 0.18)',
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 5,
    fontFamily: 'System',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: 'System',
  },
  positiveScore: {
    color: '#4CAF50',
  },
  negativeScore: {
    color: '#FF5252',
  },
  drinksText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FF9800',
    fontFamily: 'System',
  },
  correctAnswer: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'System',
  },
  waitingText: {
    color: '#AAAAAA',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'System',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'System',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'System',
  },
  progressBarContainer: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#3D2956',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    marginRight: 12,
  },
  progressBarFill: {
    backgroundColor: '#C471F5',
    borderRadius: 8,
    height: 8,
  },
  progressBarText: {
    color: '#E5DFFB',
    fontSize: 18,
    fontWeight: '500',
    minWidth: 48,
    textAlign: 'right',
    fontFamily: 'System',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
    fontFamily: 'System',
  },
  accuserText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'System',
  },
  nextButton: {
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  currentUserCard: {
    borderColor: '#C471F5',
    borderWidth: 2.5,
    shadowColor: '#C471F5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  skipButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#A259FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
}); 