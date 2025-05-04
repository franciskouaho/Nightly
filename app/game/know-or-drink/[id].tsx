import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GameState, GamePhase, Player, Question, Answer } from '@/types/gameTypes';

interface KnowOrDrinkGameState extends GameState {
  currentPlayerId: string;
  playerAnswers: {
    [playerId: string]: {
      knows: boolean;
      answer: string;
      isAccused: boolean;
      accusedBy: string[];
    };
  };
  gameMode: 'points' | 'drinks';
}

export default function KnowOrDrinkGame() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<KnowOrDrinkGameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));

    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        setGameState(doc.data() as KnowOrDrinkGameState);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, user]);

  const handleKnow = async () => {
    if (!gameState || !user) return;
    
    try {
      const db = getFirestore();
      const gameRef = doc(db, 'games', String(id));
      
      await updateDoc(gameRef, {
        [`playerAnswers.${user.uid}`]: {
          knows: true,
          answer: '',
          isAccused: false,
          accusedBy: []
        }
      });
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
        }
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
        [`playerAnswers.${targetPlayerId}.accusedBy`]: [...(gameState.playerAnswers[targetPlayerId]?.accusedBy || []), user.uid]
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre l\'accusation');
    }
  };

  const renderQuestionPhase = () => (
    <View style={styles.container}>
      <Text style={styles.questionText}>{gameState?.currentQuestion?.text}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleKnow}>
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>JE SAIS</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDontKnow}>
          <LinearGradient
            colors={['#F44336', '#E53935']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>JE NE SAIS PAS</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAccusationPhase = () => (
    <View style={styles.container}>
      <Text style={styles.phaseTitle}>Accuse quelqu'un de mentir !</Text>
      <View style={styles.playersList}>
        {gameState?.players.map((player) => (
          <TouchableOpacity
            key={player.id}
            style={styles.playerCard}
            onPress={() => handleAccuse(player.id)}
            disabled={player.id === user?.uid}
          >
            <Text style={styles.playerName}>{player.name}</Text>
            {gameState.playerAnswers[player.id]?.knows && (
              <Text style={styles.playerStatus}>Prétend savoir</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderResultsPhase = () => (
    <View style={styles.container}>
      <Text style={styles.phaseTitle}>Résultats</Text>
      {gameState?.players.map((player) => {
        const playerAnswer = gameState.playerAnswers[player.id];
        return (
          <View key={player.id} style={styles.resultCard}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.resultText}>
              {playerAnswer?.knows ? 'Savait la réponse' : 'Ne savait pas'}
            </Text>
            {playerAnswer?.isAccused && (
              <Text style={styles.accusationText}>
                Accusé par {playerAnswer.accusedBy.length} joueurs
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement du jeu...</Text>
      </View>
    );
  }

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Jeu non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {gameState.phase === GamePhase.QUESTION && renderQuestionPhase()}
      {gameState.phase === GamePhase.VOTE && renderAccusationPhase()}
      {gameState.phase === GamePhase.RESULTS && renderResultsPhase()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1A1A1A',
  },
  questionText: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 20,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  phaseTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  playersList: {
    gap: 15,
  },
  playerCard: {
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 12,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerStatus: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 5,
  },
  resultCard: {
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 5,
  },
  accusationText: {
    color: '#FF9800',
    fontSize: 14,
    marginTop: 5,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 18,
    textAlign: 'center',
  },
}); 