import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs, getFirestore } from '@react-native-firebase/firestore';

export default function TruthOrDareScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [questions, setQuestions] = useState<{ text: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedType, setSelectedType] = useState<'verite' | 'action'>('verite');

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const questionsRef = collection(db, 'gameQuestions');
        const q = query(questionsRef, where('id', '==', 'action-verite'));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setQuestions(doc.data().questions);
        } else {
          Alert.alert('Erreur', 'Aucune question trouvée dans Firestore');
        }
      } catch (e) {
        Alert.alert('Erreur', 'Impossible de charger les questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Filtrer les questions par type sélectionné
  const filteredQuestions = questions.filter(q => q.type === selectedType);
  const currentQuestion = filteredQuestions[currentIndex] || null;

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      Alert.alert('Terminé', 'Vous avez terminé toutes les questions !', [
        { text: 'Accueil', onPress: () => router.push('/') }
      ]);
    }
  };

  const handleTypeChange = (type: 'verite' | 'action') => {
    setSelectedType(type);
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Chargement des questions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4b277d', '#2d1b4e']}
        style={styles.gradient}
      >
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === 'verite' && styles.selectedType
            ]}
            onPress={() => handleTypeChange('verite')}
          >
            <Text style={[
              styles.typeButtonText,
              selectedType === 'verite' && styles.selectedTypeText
            ]}>Vérité</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === 'action' && styles.selectedType
            ]}
            onPress={() => handleTypeChange('action')}
          >
            <Text style={[
              styles.typeButtonText,
              selectedType === 'action' && styles.selectedTypeText
            ]}>Action</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.questionContainer}>
          {currentQuestion ? (
            <>
              <Text style={styles.questionText}>{currentQuestion.text}</Text>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>Question suivante</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.noQuestionsText}>
              Aucune question disponible pour ce type
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
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
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginHorizontal: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedType: {
    backgroundColor: '#6c5ce7',
  },
  typeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedTypeText: {
    fontWeight: 'bold',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noQuestionsText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
}); 