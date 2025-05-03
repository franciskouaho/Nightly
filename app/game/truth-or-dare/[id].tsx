import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot, updateDoc, getDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { GameState } from '@/types/gameTypes';
import { LinearGradient } from 'expo-linear-gradient';
import RoundedButton from '@/components/RoundedButton';

interface TruthOrDareQuestion { text: string; type: string; }

// Ajout du type local pour ce mode de jeu
interface TruthOrDareGameState extends Omit<GameState, 'phase'> {
  currentPlayerId: string;
  currentChoice: 'verite' | 'action' | null;
  phase: string;
  votes?: { [playerId: string]: 'yes' | 'no' };
  spectatorVotes?: { [playerId: string]: 'yes' | 'no' };
}

export default function TruthOrDareGameScreen() {
  const { id: idParam } = useLocalSearchParams();
  const id = Array.isArray(idParam) ? idParam[0] : idParam || '';
  const { user } = useAuth();
  const router = useRouter();
  const [game, setGame] = useState<TruthOrDareGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TruthOrDareQuestion[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [voteTimer, setVoteTimer] = useState(10);
  const [canValidateVote, setCanValidateVote] = useState(false);
  const [voteHandled, setVoteHandled] = useState(false);

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) setGame(docSnap.data() as TruthOrDareGameState);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const db = getFirestore();
        const docRef = doc(db, 'gameQuestions', 'truth-or-dare');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.questions) {
            // S'assurer que chaque question a la bonne structure
            const formattedQuestions = data.questions.map((q: any) => ({
              text: typeof q === 'string' ? q : (q.text || ''),
              type: typeof q === 'string' ? 'verite' : (q.type || 'verite')
            }));
            setQuestions(formattedQuestions);
          }
        }
      } catch (e) {}
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (game && game.currentRound > game.totalRounds) {
      setIsGameOver(true);
      const timeout = setTimeout(() => {
        router.replace(`/game/results/${id}`);
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      setIsGameOver(false);
    }
  }, [game, id, router]);

  if (loading || !game || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Chargement de la partie...</Text>
      </View>
    );
  }

  if (isGameOver) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.questionText}>Partie terminée !</Text>
        <Text style={styles.questionText}>Redirection vers les résultats...</Text>
      </View>
    );
  }

  const isCurrentPlayer = game.currentPlayerId === user.uid;

  // PHASE 1 : Choix Action/Vérité
  if (game.phase === 'choix') {
    if (isCurrentPlayer) {
      const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
      return (
        <LinearGradient
          colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={styles.gradientBg}
        >
          <StatusBar style="light" />
          <Text style={styles.playerText}>{player?.name || 'Joueur'}</Text>
          <Text style={styles.chooseTaskText}>Choisis une action</Text>
          <View style={styles.choiceButtonsRow}>
            <TouchableOpacity style={[styles.truthButton, styles.skewLeft]} onPress={() => handleChoice('verite')}>
              <Text style={[styles.choiceButtonText, styles.skewTextLeft]}>Truth</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dareButton, styles.skewRight]} onPress={() => handleChoice('action')}>
              <Text style={[styles.choiceButtonText, styles.skewTextRight]}>Dare</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      );
    } else {
      const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <Text style={styles.questionText}>{player?.name || 'Le joueur'} doit choisir : Action ou Vérité...</Text>
        </View>
      );
    }
  }

  // PHASE 2 : Question ou Action
  if (game.phase === 'question' || game.phase === 'action') {
    const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
    const playerName = player?.name || 'Le joueur';
    // On s'assure que c'est bien une string
    let questionText = '';
    if (game.currentQuestion && typeof (game.currentQuestion as any).text === 'string') {
      questionText = (game.currentQuestion as any).text;
    } else if (game.currentQuestion && typeof (game.currentQuestion as any).text === 'object' && (game.currentQuestion as any).text && 'text' in (game.currentQuestion as any).text) {
      questionText = (game.currentQuestion as any).text.text;
    } else {
      questionText = "Aucune question disponible pour ce choix.";
    }
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.questionText}>Tour {game.currentRound} / {game.totalRounds}</Text>
        <Text style={styles.questionText}>{playerName} a choisi {game.currentChoice === 'verite' ? 'Vérité' : 'Action'}</Text>
        <Text style={styles.questionText}>{questionText}</Text>
        {isCurrentPlayer && (
          <>
            <RoundedButton
              title="J'ai répondu / fait l'action"
              onPress={handleValidate}
              style={styles.nextButton}
              textStyle={styles.nextButtonText}
            />
            <RoundedButton
              title="Je refuse"
              onPress={handleRefuse}
              style={styles.nextButton}
              textStyle={styles.nextButtonText}
            />
          </>
        )}
      </View>
    );
  }

  // PHASE 2.5 : Vote des autres joueurs
  if (game.phase === 'vote') {
    const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
    const playerName = player?.name || 'Le joueur';
    const totalVoters = game.players.length - 1;
    const votes = game.votes || {};
    const votesCount = Object.keys(votes).length;
    const hasVoted = !!votes[user.uid];
    const isCurrentPlayer = game.currentPlayerId === user.uid;
    if (isCurrentPlayer) {
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <Text style={styles.questionText}>Tour {game.currentRound} / {game.totalRounds}</Text>
          <Text style={styles.questionText}>Les autres joueurs votent...</Text>
          <Text style={styles.questionText}>{votesCount} / {totalVoters} votes</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.questionText}>Tour {game.currentRound} / {game.totalRounds}</Text>
        <Text style={styles.questionText}>Est-ce que {playerName} a bien joué le jeu ?</Text>
        <View style={styles.voteButtons}>
          <RoundedButton
            title="✅ Oui"
            onPress={() => handleVote('yes')}
            disabled={hasVoted}
            style={styles.voteButton}
            textStyle={styles.voteButtonText}
          />
          <RoundedButton
            title="❌ Non"
            onPress={() => handleVote('no')}
            disabled={hasVoted}
            style={styles.voteButton}
            textStyle={styles.voteButtonText}
          />
        </View>
        {hasVoted && <Text style={styles.questionText}>Merci pour ton vote !</Text>}
        <Text style={styles.questionText}>{votesCount} / {totalVoters} votes</Text>
      </View>
    );
  }

  // PHASE 3 : Résultat
  if (game.phase === 'resultat') {
    const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
    const playerName = player?.name || 'Le joueur';
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.questionText}>Tour {game.currentRound} / {game.totalRounds}</Text>
        <Text style={styles.questionText}>Tour terminé pour {playerName}</Text>
        <RoundedButton
          title="Tour suivant"
          onPress={handleNextRound}
          style={styles.nextButton}
          textStyle={styles.nextButtonText}
        />
      </View>
    );
  }

  // Fonction utilitaire pour vérifier si l'utilisateur est un spectateur
  const isSpectator = game && user && !game.players.some((p: any) => String(p.id) === String(user.uid));

  // Fonction utilitaire pour obtenir le score d'un joueur
  const getPlayerScore = (playerId: string) => {
    return game?.scores?.[playerId] || 0;
  };

  // Fonction pour valider le vote
  const handleValidateVote = async () => {
    if (!game || !user) return;
    
    const db = getFirestore();
    const totalVoters = game.players.length - 1;
    const votes = game.votes || {};
    const yes = Object.values(votes).filter(v => v === 'yes').length;
    const no = Object.values(votes).filter(v => v === 'no').length;
    
    let points = 0;
    if (yes > no) points = 1;
    else if (no > yes) points = 0;
    
    const scores = { ...game.scores };
    scores[game.currentPlayerId] = (scores[game.currentPlayerId] || 0) + points;

    // Sélectionne le prochain joueur
    const currentIndex = game.players.findIndex((p: any) => String(p.id) === String(game.currentPlayerId));
    const nextIndex = (currentIndex + 1) % game.players.length;
    const nextPlayer = game.players[nextIndex];
    
    console.log('[DEBUG] handleValidateVote', {
      currentPlayerId: game.currentPlayerId,
      currentIndex,
      nextIndex,
      nextPlayer,
      scores,
      points
    });

    if (!nextPlayer) {
      console.error('Erreur: Impossible de trouver le prochain joueur');
      return;
    }

    // Met à jour le jeu avec les nouveaux scores et passe au tour suivant
    await updateDoc(doc(db, 'games', String(id)), {
      scores,
      currentPlayerId: nextPlayer.id,
      phase: 'choix',
      currentChoice: null,
      currentQuestion: null,
      currentRound: game.currentRound + 1,
      votes: {}
    });
  };

  // Timer pour le vote
  useEffect(() => {
    if (game?.phase === 'vote') {
      setVoteTimer(10);
      setCanValidateVote(false);
      
      const interval = setInterval(() => {
        setVoteTimer((t) => {
          if (t <= 1) {
            setCanValidateVote(true);
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [game?.phase]);

  // Vérification si tous ont voté
  useEffect(() => {
    if (
      game?.phase === 'vote' &&
      !voteHandled
    ) {
      const totalVoters = game.players.length - 1;
      const votes = game.votes || {};
      console.log('[DEBUG] PHASE VOTE', {
        totalVoters,
        votes,
        votesCount: Object.keys(votes).length,
        voteHandled
      });
      if (Object.keys(votes).length === totalVoters && totalVoters > 0) {
        console.log('[DEBUG] Tous les votes sont là, on passe au tour suivant');
        setVoteHandled(true);
        handleValidateVote();
      }
      // Cas 1 joueur : on passe direct au tour suivant
      if (totalVoters === 0) {
        console.log('[DEBUG] Cas 1 joueur, on passe direct au tour suivant');
        setVoteHandled(true);
        handleValidateVote();
      }
    }
    // On reset le flag à chaque nouveau tour
    if (game?.phase !== 'vote' && voteHandled) {
      console.log('[DEBUG] Reset voteHandled');
      setVoteHandled(false);
    }
  }, [game?.votes, game?.phase]);

  // Composant d'affichage des scores
  const ScoreBoard = () => (
    <View style={styles.scoreBoard}>
      <Text style={styles.scoreBoardTitle}>Scores</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {game?.players.map((player: any) => (
          <View key={player.id} style={styles.scoreItem}>
            <Text style={styles.scoreName}>{player.name}</Text>
            <Text style={styles.scoreValue}>{getPlayerScore(player.id)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Modification de la phase de vote pour inclure les spectateurs
  if (game?.phase === 'vote') {
    const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
    const playerName = player?.name || 'Le joueur';
    const totalVoters = game.players.length - 1;
    const votes = game.votes || {};
    const votesCount = Object.keys(votes).length;
    const hasVoted = user && !!votes[user.uid];
    const isCurrentPlayer = game.currentPlayerId === user?.uid;

    if (isCurrentPlayer) {
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <ScoreBoard />
          <Text style={styles.questionText}>Tour {game.currentRound} / {game.totalRounds}</Text>
          <Text style={styles.questionText}>Les autres joueurs votent...</Text>
          <Text style={styles.questionText}>{votesCount} / {totalVoters} votes</Text>
          {canValidateVote && (
            <RoundedButton
              title="Valider le vote"
              onPress={handleValidateVote}
              style={styles.nextButton}
              textStyle={styles.nextButtonText}
            />
          )}
          {!canValidateVote && (
            <Text style={styles.timerText}>Temps restant : {voteTimer}s</Text>
          )}
        </View>
      );
    }

    if (isSpectator) {
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <ScoreBoard />
          <Text style={styles.questionText}>Tour {game.currentRound} / {game.totalRounds}</Text>
          <Text style={styles.questionText}>Vote spectateur</Text>
          <Text style={styles.questionText}>Est-ce que {playerName} a bien joué le jeu ?</Text>
          <View style={styles.voteButtons}>
            <RoundedButton
              title="Oui"
              onPress={() => handleVote('yes')}
              style={styles.voteButton}
              textStyle={styles.voteButtonText}
            />
            <RoundedButton
              title="Non"
              onPress={() => handleVote('no')}
              style={styles.voteButton}
              textStyle={styles.voteButtonText}
            />
          </View>
          <Text style={styles.spectatorText}>Votre vote n'affecte pas le score</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScoreBoard />
        <Text style={styles.questionText}>Tour {game.currentRound} / {game.totalRounds}</Text>
        <Text style={styles.questionText}>Est-ce que {playerName} a bien joué le jeu ?</Text>
        <View style={styles.voteButtons}>
          <RoundedButton
            title="Oui"
            onPress={() => handleVote('yes')}
            disabled={hasVoted}
            style={styles.voteButton}
            textStyle={styles.voteButtonText}
          />
          <RoundedButton
            title="Non"
            onPress={() => handleVote('no')}
            disabled={hasVoted}
            style={styles.voteButton}
            textStyle={styles.voteButtonText}
          />
        </View>
        {hasVoted && <Text style={styles.questionText}>Merci pour ton vote !</Text>}
        <Text style={styles.questionText}>{votesCount} / {totalVoters} votes</Text>
        {canValidateVote && (
          <RoundedButton
            title="Valider le vote"
            onPress={handleValidateVote}
            style={styles.nextButton}
            textStyle={styles.nextButtonText}
          />
        )}
        {!canValidateVote && (
          <Text style={styles.timerText}>Temps restant : {voteTimer}s</Text>
        )}
      </View>
    );
  }

  // --- Handlers synchronisés ---
  async function handleChoice(choice: 'verite' | 'action') {
    const db = getFirestore();
    const filtered = questions.filter(q => q.type === choice);
    let questionText = '';
    if (filtered.length > 0) {
      const randomQuestion = filtered[Math.floor(Math.random() * filtered.length)] as any;
      questionText = typeof randomQuestion.text === 'string'
        ? randomQuestion.text
        : (randomQuestion.text && typeof randomQuestion.text === 'object' && 'text' in randomQuestion.text ? randomQuestion.text.text : '');
    }
    await updateDoc(doc(db, 'games', String(id)), {
      currentChoice: choice,
      currentQuestion: {
        id: String(Math.random()),
        text: questionText,
        theme: choice,
        roundNumber: game?.currentRound || 1
      },
      phase: choice === 'verite' ? 'question' : 'action'
    });
  }

  async function handleValidate() {
    const db = getFirestore();
    await updateDoc(doc(db, 'games', String(id)), {
      phase: 'vote',
      votes: {}
    });
  }

  async function handleRefuse() {
    const db = getFirestore();
    await updateDoc(doc(db, 'games', String(id)), {
      phase: 'vote',
      votes: {}
    });
  }

  async function handleVote(vote: 'yes' | 'no') {
    if (!user) return;
    const db = getFirestore();
    await updateDoc(doc(db, 'games', String(id)), {
      [`votes.${user.uid}`]: vote
    });

    // Vérifier si tous les joueurs ont voté
    const gameDoc = await getDoc(doc(db, 'games', String(id)));
    if (gameDoc.exists()) {
      const gameData = gameDoc.data() as TruthOrDareGameState;
      if (!gameData) return;

      const totalVoters = gameData.players.length - 1;
      const votes = gameData.votes || {};
      
      if (Object.keys(votes).length === totalVoters) {
        // Tous les joueurs ont voté, on passe à la phase suivante
        const yes = Object.values(votes).filter(v => v === 'yes').length;
        const no = Object.values(votes).filter(v => v === 'no').length;
        
        let points = 0;
        if (yes > no) points = 1;
        else if (no > yes) points = 0;
        
        const scores = { ...gameData.scores };
        scores[gameData.currentPlayerId] = (scores[gameData.currentPlayerId] || 0) + points;

        // Sélectionne le prochain joueur
        const currentIndex = gameData.players.findIndex((p: any) => String(p.id) === String(gameData.currentPlayerId));
        const nextIndex = (currentIndex + 1) % gameData.players.length;
        const nextPlayer = gameData.players[nextIndex];

        if (nextPlayer) {
          await updateDoc(doc(db, 'games', String(id)), {
            scores,
            currentPlayerId: nextPlayer.id,
            phase: 'choix',
            currentChoice: null,
            currentQuestion: null,
            currentRound: gameData.currentRound + 1,
            votes: {}
          });
        }
      }
    }
  }

  async function handleNextRound() {
    const db = getFirestore();
    if (!game) return;
    // Sélectionne le prochain joueur (séquentiel)
    const currentIndex = game.players.findIndex((p: any) => p.id === game.currentPlayerId);
    const nextIndex = (currentIndex + 1) % game.players.length;
    const nextPlayer = game.players[nextIndex];
    if (!nextPlayer) return;
    await updateDoc(doc(db, 'games', String(id)), {
      currentPlayerId: nextPlayer.id,
      phase: 'choix',
      currentChoice: null,
      currentQuestion: null,
      currentRound: game.currentRound + 1
    });
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d1b4e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4b277d',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  questionText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  nextButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreBoard: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    zIndex: 1,
  },
  scoreBoardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  scoreItem: {
    backgroundColor: 'rgba(108, 92, 231, 0.8)',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  scoreName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  voteButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 20,
  },
  voteButton: {
    paddingVertical: 5,
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
  spectatorText: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
  },
  playerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  chooseTaskText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  choiceButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  truthButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 28,
    paddingHorizontal: 36,
    borderRadius: 18,
    marginRight: 14,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
  dareButton: {
    backgroundColor: '#f59e42',
    paddingVertical: 28,
    paddingHorizontal: 36,
    borderRadius: 18,
    marginLeft: 14,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
  skewLeft: {
    transform: [{ skewX: '-2deg' }],
  },
  skewRight: {
    transform: [{ skewX: '2deg' }],
  },
  choiceButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  skewTextLeft: {
    transform: [{ skewX: '2deg' }],
  },
  skewTextRight: {
    transform: [{ skewX: '-2deg' }],
  },
  gradientBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
}); 