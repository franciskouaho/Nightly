import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePaletteColor } from '../../hooks/usePaletteColor';
import { hapticFeedback } from '../../utils/haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type ActionVeritePhaseProps = {
  questionId: number;
  question: string;
  actionVeriteType: 'action' | 'verite' | null;
};

export const ActionVeritePhase: React.FC<ActionVeritePhaseProps> = ({
  questionId,
  question,
  actionVeriteType,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { gameData, submitVote, isLoading } = useGame();
  const accentColor = usePaletteColor('primary');

  // Format the question to remove the prefix
  const formattedQuestion = question
    .replace('ACTION: ', '')
    .replace('VÉRITÉ: ', '');

  const handleCompletedAction = () => {
    hapticFeedback('success');
    
    // Submit the vote to move the game forward
    // In Action or Truth, completing the action/answering the truth counts as a vote
    submitVote({
      questionId,
      answerId: null, // No answer ID needed for action-verite
      completed: true,
    });
  };

  const handleSkipAction = () => {
    hapticFeedback('warning');
    
    Alert.alert(
      'Passer cette question ?',
      'Es-tu sûr(e) de vouloir passer cette question ? Les autres joueurs sauront que tu as refusé de répondre/faire l\'action.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Passer',
          style: 'destructive',
          onPress: () => {
            submitVote({
              questionId,
              answerId: null,
              completed: false,
            });
          },
        },
      ]
    );
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(300)}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.typeContainer}>
            {actionVeriteType === 'action' ? (
              <Ionicons name="flash" size={24} color="#FF9500" />
            ) : (
              <Ionicons name="chatbubble" size={24} color="#007AFF" />
            )}
            <Text style={[styles.typeText, { 
              color: actionVeriteType === 'action' ? '#FF9500' : '#007AFF'
            }]}>
              {actionVeriteType === 'action' ? 'ACTION' : 'VÉRITÉ'}
            </Text>
          </View>
          
          <Text style={styles.question}>{formattedQuestion}</Text>
          
          <View style={styles.buttonsContainer}>
            <Button 
              mode="contained" 
              onPress={handleCompletedAction}
              style={[styles.button, { backgroundColor: accentColor }]}
              loading={isLoading}
              disabled={isLoading}
            >
              {actionVeriteType === 'action' 
                ? "J'ai fait l'action" 
                : "J'ai répondu"}
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={handleSkipAction}
              style={[styles.button, styles.skipButton]}
              disabled={isLoading}
            >
              Passer
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonsContainer: {
    marginTop: 16,
  },
  button: {
    marginVertical: 8,
    paddingVertical: 8,
  },
  skipButton: {
    borderColor: '#FF3B30',
  },
}); 