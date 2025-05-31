import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyWord } from './utils/wordVerification';

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

  // Initialisation du jeu
  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    setLetters(generateRandomLetters());
    setTheme(THEMES[Math.floor(Math.random() * THEMES.length)] as string);
    setWord('');
  };

  const handleSubmit = async () => {
    if (!word.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un mot');
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
        setScore(prev => prev + 1);
        Alert.alert('Bravo !', 'Votre mot est valide !');
        startNewRound();
      } else {
        Alert.alert('Dommage !', 'Votre mot ne correspond pas aux critères.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la vérification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.score}>Score: {score}</Text>
        
        <View style={styles.lettersContainer}>
          <Text style={styles.letters}>{letters.join(' - ')}</Text>
        </View>

        <Text style={styles.theme}>Thème: {theme}</Text>

        <TextInput
          style={styles.input}
          value={word}
          onChangeText={setWord}
          placeholder="Entrez votre mot..."
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
            {isLoading ? 'Vérification...' : 'Vérifier'}
          </Text>
        </TouchableOpacity>
      </View>
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