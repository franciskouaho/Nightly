import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getFirestore, updateDoc, arrayUnion } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useBlindTestCategories } from '@/hooks/useBlindTestCategories';

export default function AdminBlindTestMusicPanel() {
  const { categories, loading: loadingCategories } = useBlindTestCategories();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questionText, setQuestionText] = useState('');
  const [answer, setAnswer] = useState('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setSelectedCategory('');
    setQuestionText('');
    setAnswer('');
    setAudioUrl('');
  };


  const saveQuestionToFirebase = async () => {
    if (!selectedCategory || !questionText.trim() || !answer.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs (catégorie, texte, réponse)');
      return;
    }

    if (!audioUrl.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une URL audio');
      return;
    }

    try {
      setIsSaving(true);

      // 2. Construire la question
      const question = {
        category: selectedCategory,
        text: questionText,
        answer: answer,
        audioUrl: audioUrl.trim(),
      };

      // 3. Sauvegarder dans Firebase
      const firestore = getFirestore();
      const gameDocRef = doc(firestore, 'gameQuestions', 'blindtest-generations');

      // Ajouter la question dans la langue française
      await updateDoc(gameDocRef, {
        [`translations.fr`]: arrayUnion(question),
      });

      Alert.alert('Succès ! 🎉', 'Musique ajoutée avec succès au blind test !');
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la question dans Firebase.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingCategories) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#FFD700" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <MaterialCommunityIcons name="music-note-plus" size={24} color="#FFD700" />
        <Text style={styles.headerText}>🎵 AJOUTER DE LA MUSIQUE (BLIND TEST)</Text>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#FFD700"
        />
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView style={styles.content} nestedScrollEnabled>
          {/* Sélecteur de catégorie */}
          <Text style={styles.label}>Catégorie *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.categoryChipTextSelected,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Champ texte (titre de la chanson) */}
          <Text style={styles.label}>Titre de la chanson *</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: Jingle Bells, Friends Theme..."
            placeholderTextColor="#888"
            value={questionText}
            onChangeText={setQuestionText}
          />

          {/* Champ réponse */}
          <Text style={styles.label}>Réponse correcte *</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: Jingle Bells, Friends..."
            placeholderTextColor="#888"
            value={answer}
            onChangeText={setAnswer}
          />

          {/* URL audio */}
          <Text style={styles.label}>URL audio *</Text>
          <TextInput
            style={styles.input}
            placeholder="https://firebasestorage.googleapis.com/v0/b/..."
            placeholderTextColor="#888"
            value={audioUrl}
            onChangeText={setAudioUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.infoText}>
            💡 Vous pouvez uploader le fichier via Firebase Console ou utiliser une URL existante
          </Text>

          {/* Bouton de sauvegarde */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isSaving ||
                !selectedCategory ||
                !questionText.trim() ||
                !answer.trim() ||
                !audioUrl.trim()) &&
                styles.saveButtonDisabled,
            ]}
            onPress={saveQuestionToFirebase}
            disabled={
              isSaving ||
              !selectedCategory ||
              !questionText.trim() ||
              !answer.trim() ||
              !audioUrl.trim()
            }
          >
            <LinearGradient
              colors={
                isSaving ||
                !selectedCategory ||
                !questionText.trim() ||
                !answer.trim() ||
                !audioUrl.trim()
                  ? ['#555', '#333']
                  : ['#00C853', '#00897B']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButtonGradient}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.saveButtonText}> Sauvegarde...</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}> Sauvegarder</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.infoText}>
            💡 Entrez l'URL complète du fichier audio depuis Firebase Storage. Vous pouvez uploader le fichier via Firebase Console.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(196, 30, 58, 0.3)',
  },
  headerText: {
    flex: 1,
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    maxHeight: 600,
    padding: 16,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categorySelector: {
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#C41E3A',
    borderColor: '#FFD700',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: '#FFD700',
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    gap: 12,
  },
  filePickerText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00C853',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

