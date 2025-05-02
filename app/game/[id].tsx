import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';

export default function GameScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [gameState, setGameState] = useState({
    phase: 'loading',
    currentRound: 1,
    totalRounds: 5,
    targetPlayer: null,
    currentQuestion: null,
    answers: [],
    players: [],
    scores: {},
    theme: 'standard',
    timer: null,
  });
  
  const [isHost, setIsHost] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    // TODO: Implement Firebase subscription
    setIsReady(true);
  }, [id, user]);

  const handleSubmitAnswer = async (answer: string) => {
    if (!user || !gameState.currentQuestion) return;
    
    if (gameState.currentUserState?.isTargetPlayer) {
      Alert.alert(
        "Action impossible", 
        "Vous êtes la cible de cette question et ne pouvez pas y répondre."
      );
      return;
    }
    
    try {
      setIsSubmitting(true);
      // TODO: Implement Firebase answer submission
      Alert.alert("Réponse envoyée", "En attente des autres joueurs...");
    } catch (error) {
      console.error("Erreur lors de la soumission de la réponse:", error);
      Alert.alert("Erreur", "Impossible d'envoyer votre réponse. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVote = async (answerId: string) => {
    if (!gameState.currentQuestion) {
      Alert.alert("Erreur", "Question non disponible");
      return;
    }
    
    try {
      setIsSubmitting(true);
      // TODO: Implement Firebase vote submission
      Alert.alert("Vote enregistré", "En attente des résultats...");
    } catch (error) {
      console.error("Erreur lors du vote:", error);
      Alert.alert("Erreur", "Impossible d'enregistrer votre vote. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleNextRound = async () => {
    if (gameState.currentRound >= gameState.totalRounds) {
      router.push(`/game/results/${id}`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      // TODO: Implement Firebase phase transition
      Alert.alert("Succès", "Passage au tour suivant effectué!");
    } catch (error) {
      console.error("Erreur lors du passage au tour suivant:", error);
      Alert.alert("Erreur", "Impossible de passer au tour suivant. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleQuitGame = () => {
    Alert.alert(
      'Quitter la partie',
      'Êtes-vous sûr de vouloir quitter cette partie ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: () => router.push('/'),
        },
      ]
    );
  };

  const renderGamePhase = () => {
    if (!gameState || !gameState.phase) {
      return (
        <View style={styles.waitingContainer}>
          <Text style={styles.messageTitle}>Chargement de la partie...</Text>
        </View>
      );
    }

    switch (gameState.phase) {
      case 'loading':
        return (
          <View style={styles.waitingContainer}>
            <Text style={styles.messageTitle}>Préparation de la partie</Text>
          </View>
        );
          
      case 'question':
        if (gameState.currentUserState?.isTargetPlayer) {
          return (
            <View style={styles.waitingContainer}>
              <Text style={styles.messageTitle}>Cette question vous concerne !</Text>
              <Text style={styles.messageText}>
                Vous ne pouvez pas répondre car la question parle de vous. 
                Attendez que les autres joueurs répondent.
              </Text>
            </View>
          );
        }

        return (
          <View style={styles.waitingContainer}>
            <Text style={styles.messageTitle}>Phase Question</Text>
            <Text style={styles.messageText}>
              TODO: Implement QuestionPhase component
            </Text>
          </View>
        );
          
      case 'waiting':
        return (
          <View style={styles.waitingContainer}>
            <Text style={styles.messageTitle}>Attente des autres joueurs...</Text>
          </View>
        );
          
      case 'vote':
        if (!gameState.currentQuestion) {
          return (
            <View style={styles.waitingContainer}>
              <Text style={styles.messageTitle}>Chargement des données de vote...</Text>
            </View>
          );
        }
        
        const isTargetPlayer = Boolean(gameState.currentUserState?.isTargetPlayer);
        const hasVoted = Boolean(gameState.currentUserState?.hasVoted);
        const allPlayersVoted = gameState.allPlayersVoted || false;
        
        if (allPlayersVoted) {
          return (
            <View style={styles.waitingContainer}>
              <Text style={styles.messageTitle}>Tous les votes sont enregistrés</Text>
              <Text style={styles.messageText}>
                TODO: Implement ResultsPhase component
              </Text>
            </View>
          );
        }
        
        if (isTargetPlayer) {
          if (hasVoted) {
            return (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingTitle}>Votre vote a été enregistré !</Text>
                <Text style={styles.waitingText}>
                  En attente des autres joueurs...
                </Text>
              </View>
            );
          }
          
          return (
            <View style={styles.waitingContainer}>
              <Text style={styles.messageTitle}>C'est votre tour de voter!</Text>
              <Text style={styles.messageText}>
                TODO: Implement VotePhase component
              </Text>
            </View>
          );
        }
        
        return (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingTitle}>C'est au tour de {gameState.targetPlayer?.name} de voter !</Text>
            <Text style={styles.waitingText}>
              {gameState.targetPlayer?.name} est en train de choisir sa réponse préférée.
            </Text>
          </View>
        );
          
      case 'waiting_for_vote':
        return (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingTitle}>C'est au tour de {gameState.targetPlayer?.name} de voter !</Text>
            <Text style={styles.waitingText}>
              {gameState.targetPlayer?.name} est en train de choisir sa réponse préférée.
            </Text>
          </View>
        );
      
      case 'results':
        return (
          <View style={styles.waitingContainer}>
            <Text style={styles.messageTitle}>Résultats</Text>
            <Text style={styles.messageText}>
              TODO: Implement ResultsPhase component
            </Text>
          </View>
        );
      
      default:
        return <Text>Erreur: Phase de jeu inconnue</Text>;
    }
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a0933', '#321a5e']}
          style={styles.background}
        />
        <View style={styles.waitingContainer}>
          <Text style={styles.messageTitle}>{loadingError || "Chargement de la partie..."}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1a0933', '#321a5e']}
        style={styles.background}
      />
      <View style={styles.content}>
        {renderGamePhase()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 20,
  },
});
