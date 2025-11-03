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

interface AdminQuestionPanelProps {
  isAdmin: boolean;
}

const AVAILABLE_GAMES = [
  { id: 'truth-or-dare', name: 'Action ou Vérité', needsType: true },
  { id: 'trap-answer', name: 'Question Piège', needsAnswer: true },
  { id: 'never-have-i-ever-hot', name: 'Hot or Not', needsType: true },
  { id: 'forbidden-desire', name: 'Désir Interdit', needsIntensity: true },
  { id: 'double-dare', name: 'Double Dare', needsLevel: true, needsMode: true },
  { id: 'genius-or-liar', name: 'Genius ou Menteur', needsAnswer: true },
  { id: 'listen-but-don-t-judge', name: "Écoute mais ne juge pas", needsType: false },
];

const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
];

export default function AdminQuestionPanel({ isAdmin }: AdminQuestionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedGame, setSelectedGame] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'action' | 'verite' | 'coquin' | 'sage'>('verite');
  const [intensity, setIntensity] = useState<'soft' | 'tension' | 'extreme'>('soft');
  const [level, setLevel] = useState<'hot' | 'extreme' | 'chaos'>('hot');
  const [mode, setMode] = useState<'versus' | 'fusion'>('versus');
  const [answer, setAnswer] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isAdmin) return null;

  const selectedGameConfig = AVAILABLE_GAMES.find(g => g.id === selectedGame);

  const translateWithChatGPT = async (text: string): Promise<Record<string, string>> => {
    try {
      setIsTranslating(true);

      // Utilisation de l'API OpenAI pour traduire
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Tu es un traducteur professionnel. Traduis le texte suivant dans les langues suivantes : ${SUPPORTED_LANGUAGES.map(l => l.name).join(', ')}.
              Retourne un JSON avec les codes de langue en clés (fr, en, es, de, it, pt) et les traductions en valeurs.
              Garde le même ton et la même intention du texte original.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      const translationsText = data.choices[0].message.content;

      // Parser le JSON retourné
      const translations = JSON.parse(translationsText);

      return translations;
    } catch (error) {
      console.error('Erreur lors de la traduction:', error);
      Alert.alert('Erreur', 'Impossible de traduire la question. Vérifiez votre clé API.');
      throw error;
    } finally {
      setIsTranslating(false);
    }
  };

  const saveQuestionToFirebase = async () => {
    if (!selectedGame || !questionText.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner un jeu et entrer une question.');
      return;
    }

    try {
      setIsSaving(true);

      // 1. Traduire la question dans toutes les langues
      const translations = await translateWithChatGPT(questionText);

      // 2. Construire l'objet question selon le jeu
      const baseQuestion: any = {
        text: questionText,
      };

      if (selectedGameConfig?.needsType) {
        baseQuestion.type = questionType;
      }

      if (selectedGameConfig?.needsIntensity) {
        baseQuestion.intensity = intensity;
      }

      if (selectedGameConfig?.needsLevel) {
        baseQuestion.level = level;
      }

      if (selectedGameConfig?.needsMode) {
        baseQuestion.mode = mode;
      }

      if (selectedGameConfig?.needsAnswer) {
        baseQuestion.answer = answer;
      }

      // 3. Sauvegarder dans Firebase pour chaque langue
      const firestore = getFirestore();
      const gameDocRef = doc(firestore, 'gameQuestions', selectedGame);

      // Créer un objet avec toutes les langues
      const updateData: any = {};

      for (const lang of SUPPORTED_LANGUAGES) {
        const translatedQuestion = {
          ...baseQuestion,
          text: translations[lang.code] || questionText,
        };

        updateData[`translations.${lang.code}`] = arrayUnion(translatedQuestion);
      }

      await updateDoc(gameDocRef, updateData);

      Alert.alert(
        'Succès ! 🎉',
        `Question ajoutée avec succès à "${selectedGameConfig?.name}" dans ${SUPPORTED_LANGUAGES.length} langues !`
      );

      // Reset le formulaire
      setQuestionText('');
      setAnswer('');

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la question dans Firebase.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <MaterialCommunityIcons name="shield-crown" size={24} color="#FFD700" />
        <Text style={styles.headerText}>🔧 PANNEAU ADMIN</Text>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#FFD700"
        />
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView style={styles.content} nestedScrollEnabled>
          <Text style={styles.sectionTitle}>Ajouter une question</Text>

          {/* Sélecteur de jeu */}
          <Text style={styles.label}>Jeu :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gameSelector}>
            {AVAILABLE_GAMES.map(game => (
              <TouchableOpacity
                key={game.id}
                style={[
                  styles.gameChip,
                  selectedGame === game.id && styles.gameChipSelected
                ]}
                onPress={() => setSelectedGame(game.id)}
              >
                <Text style={[
                  styles.gameChipText,
                  selectedGame === game.id && styles.gameChipTextSelected
                ]}>
                  {game.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Champ question */}
          <Text style={styles.label}>Question (en français) :</Text>
          <TextInput
            style={styles.input}
            placeholder="Écris ta question ici..."
            placeholderTextColor="#888"
            value={questionText}
            onChangeText={setQuestionText}
            multiline
            numberOfLines={3}
          />

          {/* Options selon le jeu */}
          {selectedGameConfig?.needsType && (
            <>
              <Text style={styles.label}>Type :</Text>
              <View style={styles.optionsRow}>
                {['action', 'verite'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionChip,
                      questionType === type && styles.optionChipSelected
                    ]}
                    onPress={() => setQuestionType(type as any)}
                  >
                    <Text style={styles.optionChipText}>
                      {type === 'action' ? 'Action' : 'Vérité'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {selectedGameConfig?.needsIntensity && (
            <>
              <Text style={styles.label}>Intensité :</Text>
              <View style={styles.optionsRow}>
                {['soft', 'tension', 'extreme'].map((int) => (
                  <TouchableOpacity
                    key={int}
                    style={[
                      styles.optionChip,
                      intensity === int && styles.optionChipSelected
                    ]}
                    onPress={() => setIntensity(int as any)}
                  >
                    <Text style={styles.optionChipText}>
                      {int === 'soft' ? '🔥 Soft' : int === 'tension' ? '😳 Tension' : '😈 Extrême'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {selectedGameConfig?.needsLevel && (
            <>
              <Text style={styles.label}>Niveau :</Text>
              <View style={styles.optionsRow}>
                {['hot', 'extreme', 'chaos'].map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.optionChip,
                      level === lvl && styles.optionChipSelected
                    ]}
                    onPress={() => setLevel(lvl as any)}
                  >
                    <Text style={styles.optionChipText}>
                      {lvl === 'hot' ? '🔥 Hot' : lvl === 'extreme' ? '😈 Extreme' : '💀 Chaos'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {selectedGameConfig?.needsMode && (
            <>
              <Text style={styles.label}>Mode :</Text>
              <View style={styles.optionsRow}>
                {['versus', 'fusion'].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.optionChip,
                      mode === m && styles.optionChipSelected
                    ]}
                    onPress={() => setMode(m as any)}
                  >
                    <Text style={styles.optionChipText}>
                      {m === 'versus' ? '⚔️ Versus' : '❤️ Fusion'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {selectedGameConfig?.needsAnswer && (
            <>
              <Text style={styles.label}>Réponse correcte :</Text>
              <TextInput
                style={styles.input}
                placeholder="Réponse..."
                placeholderTextColor="#888"
                value={answer}
                onChangeText={setAnswer}
              />
            </>
          )}

          {/* Bouton de sauvegarde */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isTranslating || isSaving || !selectedGame || !questionText.trim()) && styles.saveButtonDisabled
            ]}
            onPress={saveQuestionToFirebase}
            disabled={isTranslating || isSaving || !selectedGame || !questionText.trim()}
          >
            {isTranslating ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={styles.saveButtonText}>  Traduction en cours...</Text>
              </>
            ) : isSaving ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={styles.saveButtonText}>  Sauvegarde...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>  Traduire & Sauvegarder</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.infoText}>
            💡 La question sera automatiquement traduite en {SUPPORTED_LANGUAGES.length} langues et ajoutée à Firebase
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(139, 21, 56, 0.3)',
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 12,
  },
  content: {
    padding: 16,
    maxHeight: 500,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
  },
  gameSelector: {
    marginBottom: 12,
  },
  gameChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gameChipSelected: {
    backgroundColor: '#C41E3A',
    borderColor: '#FFD700',
  },
  gameChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  gameChipTextSelected: {
    color: '#FFD700',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  optionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionChipSelected: {
    backgroundColor: '#C41E3A',
    borderColor: '#FFD700',
  },
  optionChipText: {
    color: '#fff',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#00C853',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#555',
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
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
