import { Question } from '@/types/gameTypes';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Fonction pour transformer les données de Firebase en format Question
export const transformQuestion = (question: any, index: number): Question => ({
  id: (index + 1).toString(),
  text: question.text,
  theme: question.type || 'verite',
  roundNumber: index + 1,
  intensity: question.intensity || 'soft'
});

// Hook personnalisé pour les questions de Désir Interdit
export function useForbiddenDesireQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const { isRTL, language } = useLanguage();

  // Charger les questions depuis Firebase
  useEffect(() => {
    const currentLanguageCode = isRTL ? 'ar' : (language || 'fr');
    if (!currentLanguageCode) {
      setIsLoadingQuestions(false);
      return;
    }

    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const db = getFirestore();
        const questionsRef = doc(db, 'gameQuestions', 'forbidden-desire');
        const questionsDoc = await getDoc(questionsRef);

        if (questionsDoc.exists()) {
          const questionsData = questionsDoc.data();
          const rawQuestions = questionsData?.translations?.[currentLanguageCode] || [];

          const transformedQuestions = rawQuestions.map(transformQuestion);
          setQuestions(transformedQuestions);
        } else {
          console.warn('No questions document found for forbidden-desire in Firebase.');
          setQuestions([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [isRTL, language]);

  // Obtenir une question aléatoire qui n'a pas encore été posée, filtrée par intensité
  const getRandomQuestion = (intensity?: 'soft' | 'tension' | 'extreme'): Question | null => {
    // Filtrer toutes les questions par intensité
    const allQuestionsOfIntensity = intensity
      ? questions.filter(q => q.intensity === intensity)
      : questions;

    if (allQuestionsOfIntensity.length === 0) {
      console.warn(`Aucune question d'intensité ${intensity || 'any'} disponible.`);
      return null;
    }

    // Filtrer celles qui n'ont PAS encore été posées
    const availableOfIntensity = allQuestionsOfIntensity.filter(q => !askedQuestions.includes(q.id));

    // Si toutes les questions de cette intensité ont été posées, réinitialiser
    let questionsToChooseFrom = availableOfIntensity;
    if (availableOfIntensity.length === 0) {
      console.log(`Toutes les questions d'intensité ${intensity} ont été posées. Réinitialisation.`);
      const otherIntensityAskedQuestions = askedQuestions.filter(id => {
        const question = questions.find(q => q.id === id);
        return question && (!intensity || question.intensity !== intensity);
      });
      setAskedQuestions(otherIntensityAskedQuestions);
      questionsToChooseFrom = allQuestionsOfIntensity;
    }

    if (questionsToChooseFrom.length === 0) {
      console.warn(`Aucune question d'intensité ${intensity || 'any'} disponible après réinitialisation.`);
      return null;
    }

    // Sélectionner une question aléatoire
    const randomIndex = Math.floor(Math.random() * questionsToChooseFrom.length);
    const selectedQuestion = questionsToChooseFrom[randomIndex];

    if (!selectedQuestion) {
      console.error(`Échec de la sélection aléatoire d'une question d'intensité ${intensity || 'any'}.`);
      return null;
    }

    // Ajouter la question sélectionnée à la liste des questions posées
    setAskedQuestions((prev: string[]) => [...prev, selectedQuestion.id]);

    return selectedQuestion;
  };

  // Réinitialiser l'historique des questions posées
  const resetAskedQuestions = () => {
    setAskedQuestions([]);
  };

  return {
    questions,
    getRandomQuestion,
    resetAskedQuestions,
    askedQuestions,
    isLoadingQuestions,
  };
}

// Fonction de compatibilité pour le code existant
export const getQuestions = async (currentLanguage: string = 'fr'): Promise<Question[]> => {
  try {
    const db = getFirestore();
    const questionsRef = doc(db, 'gameQuestions', 'forbidden-desire');
    const questionsDoc = await getDoc(questionsRef);

    if (questionsDoc.exists()) {
      const questionsData = questionsDoc.data();
      const rawQuestions = questionsData?.translations?.[currentLanguage] || [];
      return rawQuestions.map(transformQuestion);
    } else {
      console.error("No questions found in Firebase");
      return [];
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};
