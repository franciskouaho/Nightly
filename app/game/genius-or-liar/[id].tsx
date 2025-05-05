import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot, updateDoc, getDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { GamePhase, Player } from '@/types/gameTypes';

interface FirebaseQuestion {
  type: string;
  question: string;
  answer: string;
  id?: string;
  roundNumber?: number;
  theme?: string;
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
  currentUserState?: {
    isTargetPlayer: boolean;
    hasAnswered: boolean;
    hasVoted: boolean;
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
}

export default function KnowOrDrinkGame() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<KnowOrDrinkGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));

    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as KnowOrDrinkGameState;
        console.log('📝 Données du jeu:', JSON.stringify(data, null, 2));
        console.log('❓ Question actuelle:', JSON.stringify(data.currentQuestion, null, 2));
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
      Alert.alert('Erreur', 'Impossible de soumettre votre réponse');
    }
  };

  const handleDontKnow = async () => {
    if (!gameState || !user) return;
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
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
      Alert.alert('Erreur', 'Impossible de soumettre votre réponse');
    }
  };

  const handleAccuse = async (targetPlayerId: string) => {
    if (!gameState || !user) return;
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      await updateDoc(gameRef, {
        [`playerAnswers.${targetPlayerId}.isAccused`]: true,
        [`playerAnswers.${targetPlayerId}.accusedBy`]: [...(gameState.playerAnswers[targetPlayerId]?.accusedBy || []), user.uid],
        [`currentUserState.${user.uid}.hasVoted`]: true
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre l\'accusation');
    }
  };

  const handleSkipAccuse = async () => {
    if (!gameState || !user) return;
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      await updateDoc(gameRef, {
        [`currentUserState.${user.uid}.hasVoted`]: true
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de valider votre choix');
    }
  };

  const calculateScore = (playerId: string) => {
    if (!gameState || !gameState.gameMode) return 0;
    const playerAnswer = gameState?.playerAnswers?.[playerId];
    if (!playerAnswer) return 0;

    if (gameState.gameMode === 'points') {
      if (playerAnswer.knows) {
        if (playerAnswer.isAccused) {
          return -1; // Perd 1 point si accusé à raison
        }
        return 1; // Gagne 1 point si sait la réponse
      } else {
        return 0; // 0 point si ne sait pas
      }
    } else { // Mode gages
      if (playerAnswer.knows) {
        if (playerAnswer.isAccused) {
          return 2; // Reçoit 2 gages si accusé à raison
        }
        return 0; // Pas de gage si sait la réponse
      } else {
        return 1; // Reçoit 1 gage si ne sait pas
      }
    }
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
              {gameState?.currentQuestion?.question || 'Aucune question disponible'}
            </Text>
          </View>
          {gameState?.currentUserState?.[user?.uid]?.hasAnswered && gameState.phase === 'question' ? (
            <Text style={styles.waitingText}>En attente des autres joueurs...</Text>
          ) : showAnswerInput ? (
            <View style={styles.answerContainer}>
              <TextInput
                style={styles.answerInput}
                placeholder="Ta réponse..."
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
                  <Text style={styles.buttonText}>VALIDER</Text>
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
                  <Text style={styles.buttonText}>JE SAIS</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleDontKnow}>
                <LinearGradient
                  colors={['#FF5252', '#FF7676']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>JE NE SAIS PAS</Text>
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
        <Text style={styles.phaseTitle}>Accuse quelqu'un de mentir !</Text>
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
              disabled={player.id === user?.uid || gameState.currentUserState?.[user?.uid]?.hasVoted}
            >
              <Text style={styles.playerName}>{player.name}</Text>
              {gameState.playerAnswers[player.id]?.knows && (
                <Text style={styles.playerStatus}>Prétend savoir</Text>
              )}
              {gameState.playerAnswers[player.id]?.isAccused && gameState.playerAnswers[player.id]?.accusedBy && (
                <Text style={styles.accusationCount}>
                  Accusé par {gameState.playerAnswers[player.id]?.accusedBy?.length ?? 0} joueur(s)
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        {!gameState.currentUserState?.[user?.uid]?.hasVoted && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipAccuse}>
            <LinearGradient colors={["#3D2956", "#A259FF"]} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Je ne veux accuser personne</Text>
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
      return { label: 'Ne savait pas', icon: '❌', color: '#FF5252' };
    }
    if (isCorrect) {
      if (!wasAccused) {
        return { label: 'Bonne réponse', icon: '✅', color: '#4CAF50' };
      } else {
        return { label: 'Bonne réponse mais accusé', icon: '⚠️', color: '#FF9800' };
      }
    } else {
      if (!wasAccused) {
        return { label: 'A menti sans être accusé', icon: '😏', color: '#A259FF' };
      } else {
        return { label: 'A menti et accusé', icon: '🚨', color: '#FF5252' };
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
      return { label: 'Bonne accusation', icon: '⚡️', color: '#4CAF50', target: targetId };
    } else {
      // L'accusation était fausse
      return { label: 'Accusation à tort', icon: '❌', color: '#FF5252', target: targetId };
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
      // Récupère les questions depuis gameQuestions/know-or-drink
      const questionsRef = doc(db, 'gameQuestions', 'know-or-drink');
      const questionsDoc = await getDoc(questionsRef);
      let questionsArr = [];
      if (questionsDoc.exists()) {
        const data = questionsDoc.data();
        if (Array.isArray(data)) {
          questionsArr = data.filter(Boolean);
        } else if (data && Array.isArray(data.questions)) {
          questionsArr = data.questions.filter(Boolean);
        } else if (data && typeof data === 'object') {
          questionsArr = Object.values(data).filter(Boolean);
        }
      }
      if (questionsArr.length === 0) {
        Alert.alert('Erreur', 'Aucune question disponible dans la base de données.');
        return;
      }
      const nextQuestion = questionsArr[Math.floor(Math.random() * questionsArr.length)];
      await updateDoc(gameRef, {
        currentRound: gameState.currentRound + 1,
        phase: 'question',
        currentUserState: {},
        playerAnswers: {},
        currentQuestion: nextQuestion,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de passer au tour suivant');
    }
  };

  // Affichage de la fin de partie
  const renderEndScreen = () => (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.phaseTitle}>Fin de la partie !</Text>
        <Text style={styles.correctAnswer}>Merci d'avoir joué 🎉</Text>
        {/* On peut afficher ici le classement final, les scores, etc. */}
        {gameState?.players.map((player) => (
          <View key={player.id} style={styles.resultCard}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.scoreText}>{gameState.scores[player.id] || 0} points</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderResultsPhase = () => (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.phaseTitle}>Résultats</Text>
        <Text style={styles.correctAnswer}>
          Réponse correcte : {gameState?.currentQuestion?.answer}
        </Text>
        {gameState?.players.map((player) => {
          const playerAnswer = gameState?.playerAnswers?.[player.id];
          const score = calculateScore(player.id);
          const status = getPlayerStatus(player.id);
          const accuser = getAccuserStatus(player.id);
          return (
            <View key={player.id} style={styles.resultCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[styles.statusIcon, { color: status.color }]}>{status.icon}</Text>
                <Text style={styles.playerName}>{player.name}</Text>
              </View>
              <Text style={styles.resultText}>
                {playerAnswer?.knows ? `A répondu : ${playerAnswer.answer}` : 'Ne savait pas'}
              </Text>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              {accuser && (
                <Text style={[styles.accuserText, { color: accuser.color }]}> 
                  {accuser.icon} {accuser.label} {accuser.target && `(contre ${gameState.players.find(p => p.id === accuser.target)?.name})`}
                </Text>
              )}
              {gameState?.gameMode === 'points' ? (
                <Text style={[styles.scoreText, score > 0 ? styles.positiveScore : score < 0 ? styles.negativeScore : null]}>
                  {score > 0 ? `+${score}` : score} point{score !== 1 ? 's' : ''}
                </Text>
              ) : (
                <Text style={styles.drinksText}>
                  {score} gorgée{score !== 1 ? 's' : ''} à boire
                </Text>
              )}
            </View>
          );
        })}
        <TouchableOpacity style={styles.nextButton} onPress={handleNextRound}>
          <LinearGradient colors={["#A259FF", "#C471F5"]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>
              {(gameState?.currentRound ?? 0) >= (gameState?.totalRounds ?? 0) ? 'Voir le classement final' : 'Tour suivant'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

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
    if (
      gameState &&
      gameState.phase === 'results' &&
      gameState.currentRound >= gameState.totalRounds &&
      id
    ) {
      router.replace(`/game/results/${id}`);
    }
  }, [gameState?.phase, gameState?.currentRound, gameState?.totalRounds, id]);

  // Fonction pour calculer les scores de tous les joueurs (variante points complète)
  const computeScores = () => {
    if (!gameState) return {};
    let newScores: Record<string, number> = { ...gameState.scores };
    const correctAnswer = gameState.currentQuestion?.answer?.toLowerCase().trim();

    // 1. Initialisation : chaque joueur garde son score précédent
    gameState.players.forEach((player) => {
      newScores[player.id] = newScores[player.id] || 0;
    });

    // 2. Points pour les réponses
    gameState.players.forEach((player) => {
      const answer = gameState.playerAnswers[player.id];
      if (!answer) return;
      const playerResponse = answer.answer?.toLowerCase().trim();
      const isCorrect = answer.knows && playerResponse === correctAnswer;
      const wasAccused = answer.isAccused;
      // Cas : ne sait pas
      if (!answer.knows) {
        // 0 point
        return;
      }
      // Cas : sait et pas accusé
      if (isCorrect && !wasAccused) {
        newScores[player.id] += 1;
        return;
      }
      // Cas : sait et accusé à raison
      if (isCorrect && wasAccused) {
        newScores[player.id] -= 1;
        return;
      }
      // Cas : ment sans être accusé
      if (!isCorrect && !wasAccused) {
        newScores[player.id] += 1;
        return;
      }
      // Cas : ment et accusé
      // (pas de point, mais l'accusateur gère le transfert)
    });

    // 3. Points pour les accusateurs
    gameState.players.forEach((accuser) => {
      // Cherche qui il a accusé
      const accusedEntry = Object.entries(gameState.playerAnswers).find(
        ([, answer]) => answer.accusedBy && answer.accusedBy.includes(accuser.id)
      );
      if (!accusedEntry) return;
      const [accusedId, accusedAnswer] = accusedEntry;
      const accusedResponse = accusedAnswer.answer?.toLowerCase().trim();
      const accusedIsCorrect = accusedAnswer.knows && accusedResponse === correctAnswer;
      // Si l'accusé mentait (accusation juste)
      if (!accusedAnswer.knows || !accusedIsCorrect) {
        newScores[accuser.id] += 1;
        newScores[accusedId] -= 1;
      } else {
        // Accusation à tort
        newScores[accuser.id] -= 1;
        newScores[accusedId] += 1;
      }
    });

    return newScores;
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
    <View style={styles.container}>
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={styles.background}
      >
        {gameState.phase === GamePhase.QUESTION && renderQuestionPhase()}
        {gameState.phase === GamePhase.VOTE && renderAccusationPhase()}
        {gameState.phase === GamePhase.RESULTS && renderResultsPhase()}
      </LinearGradient>
    </View>
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
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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