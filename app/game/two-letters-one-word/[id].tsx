import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyWord } from './utils/wordVerification';
import { doc, getFirestore, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import GameResults from '@/components/game/GameResults';

// Liste des thèmes possibles
const THEMES = [
  'une marque',
  'une ville',
  'un prénom',
  'un pays',
  'un animal',
  'un métier',
  'un sport',
  'un fruit',
  'un légume',
  'un objet'
] as const;

// Génère deux lettres aléatoires
const generateRandomLetters = (): [string, string] => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let firstLetter = alphabet[Math.floor(Math.random() * alphabet.length)] as string;
  let secondLetter: string;
  do {
    secondLetter = alphabet[Math.floor(Math.random() * alphabet.length)] as string;
  } while (secondLetter === firstLetter);
  return [firstLetter, secondLetter];
};

export default function TwoLettersOneWord() {
  const [letters, setLetters] = useState<[string, string]>(['A', 'B']);
  const [theme, setTheme] = useState<string>(THEMES[0]);
  const [word, setWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [players, setPlayers] = useState<any[]>([]);
  const { t } = useTranslation();
  const [gamePhase, setGamePhase] = useState<'playing' | 'results'>('playing');

  const { id } = useLocalSearchParams();
  const gameDocId = typeof id === 'string' ? id : Array.isArray(id) ? id[id.length - 1] : '';

  useEffect(() => {
    if (!gameDocId) return;

    const db = getFirestore();
    const gameRef = doc(db, 'games', gameDocId);

    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const gameData = doc.data() as any;
        setLetters(gameData.currentLetters || ['A', 'B']);
        setTheme(gameData.currentTheme || THEMES[0]);
        const updatedPlayers = Object.entries(gameData.scores || {}).map(([playerId, score]) => ({
          id: playerId,
          score: score as number,
        }));
        setPlayers(updatedPlayers);
        const currentUserScore = updatedPlayers.find(p => p.id === 'some-user-id')?.score || 0;
        setScore(currentUserScore);

        if (gameData.status === 'finished') {
           setGamePhase('results');
        }

      } else {
        Alert.alert('Erreur', 'Partie introuvable ou terminée');
      }
    });

    return () => unsubscribe();
  }, [gameDocId]);

  const handleSubmit = async () => {
    if (!word.trim()) {
      Alert.alert(t('game.error'), t('home.games.two-letters-one-word.noWordError'));
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await verifyWord({
        word: word.trim(),
        firstLetter: letters[0],
        secondLetter: letters[1],
        theme
      });

      if (isValid) {
        const db = getFirestore();
        const gameRef = doc(db, 'games', gameDocId as string);
        const currentUserId = 'some-user-id';
        const currentScore = players.find(p => p.id === currentUserId)?.score || 0;
        await updateDoc(gameRef, {
          [`scores.${currentUserId}`]: currentScore + 1,
          currentWord: word.trim(),
        });

        Alert.alert(t('home.games.two-letters-one-word.validWord'), t('home.games.two-letters-one-word.validWordMessage'));
        setWord('');
      } else {
        Alert.alert(t('home.games.two-letters-one-word.invalidWord'), t('home.games.two-letters-one-word.invalidWordMessage'));
      }
    } catch (error) {
      console.error('Erreur lors de la vérification ou de la mise à jour du mot:', error);
      Alert.alert(t('game.error'), t('game.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      {gamePhase === 'playing' ? (
        <View style={styles.content}>
          <Text style={styles.score}>{t('home.games.two-letters-one-word.score', { score })}</Text>
          
          <View style={styles.lettersContainer}>
            <Text style={styles.letters}>{letters.join(' - ')}</Text>
          </View>

          <Text style={styles.theme}>{t('home.games.two-letters-one-word.theme', { theme })}</Text>

          <TextInput
            style={styles.input}
            value={word}
            onChangeText={setWord}
            placeholder={t('home.games.two-letters-one-word.inputPlaceholder')}
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? t('home.games.two-letters-one-word.verifyingButton') : t('home.games.two-letters-one-word.verifyButton')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <GameResults
           players={players}
           scores={players.reduce((acc, player) => ({ ...acc, [player.id]: player.score }), {})}
           userId={'some-user-id'}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 40,
  },
  lettersContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  letters: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  theme: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 