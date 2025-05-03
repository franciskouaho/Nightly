import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot, updateDoc, getDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { GameState, Question } from '@/types/gameTypes';
import ResultsPhase from '@/components/game/ResultsPhase';

interface TruthOrDareQuestion { text: string; type: string; }

// Ajout du type local pour ce mode de jeu
interface TruthOrDareGameState extends Omit<GameState, 'phase'> {
  currentPlayerId: string;
  currentChoice: 'verite' | 'action' | null;
  phase: string;
}

export default function TruthOrDareGameScreen() {
  const { id: idParam } = useLocalSearchParams();
  const id = Array.isArray(idParam) ? idParam[0] : idParam || '';
  const { user } = useAuth();
  const router = useRouter();
  const [game, setGame] = useState<TruthOrDareGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TruthOrDareQuestion[]>([]);

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

  if (loading || !game || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Chargement de la partie...</Text>
      </View>
    );
  }

  const isCurrentPlayer = game.currentPlayerId === user.uid;

  // PHASE 1 : Choix Action/Vérité
  if (game.phase === 'choix') {
    if (isCurrentPlayer) {
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <Text style={styles.questionText}>Action ou Vérité ?</Text>
          <TouchableOpacity style={styles.nextButton} onPress={() => handleChoice('verite')}>
            <Text style={styles.nextButtonText}>Vérité</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={() => handleChoice('action')}>
            <Text style={styles.nextButtonText}>Action</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      const player = game.players?.find((p: any) => p.id === game.currentPlayerId);
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <Text style={styles.questionText}>{player?.name} doit choisir : Action ou Vérité...</Text>
        </View>
      );
    }
  }

  // PHASE 2 : Question ou Action
  if (game.phase === 'question' || game.phase === 'action') {
    console.log('currentPlayerId:', game.currentPlayerId);
    console.log('players:', game.players);
    const player = game.players?.find((p: any) => String(p.id) === String(game.currentPlayerId));
    console.log('player trouvé:', player);
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
        <Text style={styles.questionText}>{playerName} a choisi {game.currentChoice === 'verite' ? 'Vérité' : 'Action'}</Text>
        <Text style={styles.questionText}>{questionText}</Text>
        {isCurrentPlayer && (
          <>
            <TouchableOpacity style={styles.nextButton} onPress={handleValidate}>
              <Text style={styles.nextButtonText}>J'ai répondu / fait l'action</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleRefuse}>
              <Text style={styles.nextButtonText}>Je refuse</Text>
            </TouchableOpacity>
          </>
        )}
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
        <Text style={styles.questionText}>Tour terminé pour {playerName}</Text>
        <TouchableOpacity style={styles.nextButton} onPress={handleNextRound}>
          <Text style={styles.nextButtonText}>Tour suivant</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;

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
      phase: 'resultat'
    });
  }

  async function handleRefuse() {
    const db = getFirestore();
    await updateDoc(doc(db, 'games', String(id)), {
      phase: 'resultat'
    });
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
      currentRound: game.currentRound + 1 > game.totalRounds ? game.currentRound : game.currentRound + 1
    });
  }
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
    backgroundColor: '#6c5ce7',
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
}); 