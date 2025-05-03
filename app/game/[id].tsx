import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

export default function GameScreen() {
  const router = useRouter();
  const { id, gameId } = useLocalSearchParams(); // id = id du game, gameId = mode de jeu
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Charger le gameId depuis Firestore si non passé en paramètre
  useEffect(() => {
    const fetchGameIdAndQuestions = async () => {
      setLoading(true);
      try {
        let mode = gameId;
        if (!mode) {
          // Charger le doc de la partie pour récupérer le gameId
          const db = getFirestore(getApp());
          const gameDoc = await getDoc(doc(db, 'games', String(id)));
          if (gameDoc.exists()) {
            mode = gameDoc.data().gameId;
          }
        }
        if (mode === 'action-verite') {
          router.replace(`/game/truth-or-dare/${id}`);
          return;
        }
        if (!mode) {
          Alert.alert('Erreur', 'Aucun mode de jeu trouvé');
          return;
        }
        // Charger les questions du bon mode
        const db = getFirestore(getApp());
        const docRef = doc(db, 'gameQuestions', String(mode));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuestions(docSnap.data().questions);
        } else {
          Alert.alert('Erreur', 'Aucune question trouvée pour ce mode');
        }
      } catch (e) {
        Alert.alert('Erreur', 'Impossible de charger les questions');
      } finally {
        setLoading(false);
      }
    };
    fetchGameIdAndQuestions();
  }, [id, gameId, router]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      Alert.alert('Fin', 'Tu as terminé toutes les questions !', [
        { text: 'Accueil', onPress: () => router.push('/') }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a0933', '#321a5e']} style={styles.background} />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 20 }}>Chargement des questions...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a0933', '#321a5e']} style={styles.background} />
        <Text style={{ color: '#fff', marginTop: 20 }}>Aucune question pour ce mode.</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#1a0933', '#321a5e']} style={styles.background} />
      <View style={styles.content}>
        <Text style={styles.messageTitle}>
          Question {currentIndex + 1}/{questions.length}
        </Text>
        <Text style={styles.messageText}>{currentQuestion.text || currentQuestion}</Text>
        {Array.isArray(currentQuestion.choices) && currentQuestion.choices.length > 0 && (
          <View style={{ width: '100%' }}>
            {currentQuestion.choices.map((choice: string) => (
              <TouchableOpacity
                key={choice}
                style={styles.choiceButton}
                onPress={handleNext}
              >
                <Text style={styles.choiceText}>{choice}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex < questions.length - 1 ? 'Question suivante' : 'Terminer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, paddingTop: 40 },
  messageTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  messageText: { fontSize: 18, color: '#e0e0e0', textAlign: 'center', lineHeight: 28, marginBottom: 30 },
  choiceButton: {
    backgroundColor: '#5D6DFF', padding: 15, borderRadius: 12, marginVertical: 8, width: '100%', alignItems: 'center'
  },
  choiceText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  nextButton: {
    backgroundColor: '#5D6DFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 30,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  }
});
