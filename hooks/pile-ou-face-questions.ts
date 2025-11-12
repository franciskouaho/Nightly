import { useLanguage } from '@/contexts/LanguageContext';
import { PileOuFaceQuestion } from '@/types/types';
import { doc, getDoc, getFirestore } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

// Fonction pour transformer les données de Firebase en format PileOuFaceQuestion
export const transformQuestion = (question: any, index: number): PileOuFaceQuestion => ({
  id: (index + 1).toString(),
  text: question.text,
  theme: question.type || 'general',
  roundNumber: index + 1,
  type: question.type || 'sympa'
});

// Hook personnalisé pour les questions de Pile ou Face
export function usePileOuFaceQuestions() {
  const [questions, setQuestions] = useState<PileOuFaceQuestion[]>([]);
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
        const questionsRef = doc(db, 'gameQuestions', 'pile-ou-face');
        const questionsDoc = await getDoc(questionsRef);

        if (questionsDoc.exists()) {
          const questionsData = questionsDoc.data();
          const rawQuestions = questionsData?.translations?.[currentLanguageCode] || [];

          const transformedQuestions = rawQuestions.map(transformQuestion);
          setQuestions(transformedQuestions);
        } else {
          console.warn('No questions document found for pile-ou-face in Firebase.');
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

  // Obtenir une question aléatoire qui n'a pas encore été posée
  const getRandomQuestion = (type?: 'sympa' | 'trash' | 'mechant'): PileOuFaceQuestion | null => {
    // Filtrer toutes les questions par type si spécifié
    const allQuestionsOfType = type
      ? questions.filter(q => q.type === type)
      : questions;

    if (allQuestionsOfType.length === 0) {
      console.warn(`Aucune question de type ${type || 'any'} disponible.`);
      return null;
    }

    // Filtrer celles qui n'ont PAS encore été posées
    const availableOfType = allQuestionsOfType.filter(q => !askedQuestions.includes(q.id));

    // Si toutes les questions de ce type ont été posées, réinitialiser
    let questionsToChooseFrom = availableOfType;
    if (availableOfType.length === 0) {
      console.log(`Toutes les questions de type ${type || 'any'} ont été posées. Réinitialisation.`);
      const otherTypeAskedQuestions = askedQuestions.filter(id => {
        const question = questions.find(q => q.id === id);
        return question && (!type || question.type !== type);
      });
      setAskedQuestions(otherTypeAskedQuestions);
      questionsToChooseFrom = allQuestionsOfType;
    }

    if (questionsToChooseFrom.length === 0) {
      console.warn(`Aucune question de type ${type || 'any'} disponible après réinitialisation.`);
      return null;
    }

    // Sélectionner une question aléatoire
    const randomIndex = Math.floor(Math.random() * questionsToChooseFrom.length);
    const selectedQuestion = questionsToChooseFrom[randomIndex];

    if (!selectedQuestion) {
      console.error(`Échec de la sélection aléatoire d'une question de type ${type || 'any'}.`);
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
export const getQuestions = async (currentLanguage: string = 'fr'): Promise<PileOuFaceQuestion[]> => {
  try {
    const db = getFirestore();
    const questionsRef = doc(db, 'gameQuestions', 'pile-ou-face');
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
