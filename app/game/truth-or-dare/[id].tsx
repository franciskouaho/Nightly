import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

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
        const db = getFirestore(getApp());
        const docRef = doc(db, 'gameQuestions', 'action-verite');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuestions(docSnap.data().questions);
        } else {
          Alert.alert('Error', 'No questions found in Firestore');
        }
      } catch (e) {
        Alert.alert('Error', 'Could not load questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Filter questions by selected type
  const filteredQuestions = questions.filter(q => q.type === selectedType);
  const currentQuestion = filteredQuestions[currentIndex] || null;

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      Alert.alert('Done', 'You have finished all the questions!', [
        { text: 'Home', onPress: () => router.push('/') }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a0933', '#321a5e']} style={styles.background} />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 20 }}>Loading questions...</Text>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a0933', '#321a5e']} style={styles.background} />
        <Text style={{ color: '#fff', marginTop: 20 }}>No questions of this type.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#1a0933', '#321a5e']} style={styles.background} />
      <View style={styles.content}>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === 'verite' && styles.typeButtonSelected
            ]}
            onPress={() => { setSelectedType('verite'); setCurrentIndex(0); }}
          >
            <Text style={styles.typeButtonText}>Truth</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === 'action' && styles.typeButtonSelected
            ]}
            onPress={() => { setSelectedType('action'); setCurrentIndex(0); }}
          >
            <Text style={styles.typeButtonText}>Dare</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.messageTitle}>
          {selectedType === 'verite' ? 'TRUTH' : 'DARE'} {currentIndex + 1}/{filteredQuestions.length}
        </Text>
        <Text style={styles.messageText}>{currentQuestion.text}</Text>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex < filteredQuestions.length - 1 ? 'Next question' : 'Finish'}
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
  typeButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  typeButtonSelected: {
    backgroundColor: '#5D6DFF',
  },
  typeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
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