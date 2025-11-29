import { useLanguage } from '@/contexts/LanguageContext';
import { Question } from '@/types/gameTypes';
import { doc, getDoc, getFirestore } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

export type BlindTestCategory = string; // Les catégories sont maintenant dynamiques depuis Firebase

export interface BlindTestQuestion extends Question {
  category: BlindTestCategory;
  audioUrl?: string; // URL de l'extrait audio (optionnel pour l'instant)
  answer: string; // La réponse correcte
}

// Fonction pour transformer les données de Firebase en format BlindTestQuestion
export const transformQuestion = (question: any, index: number): BlindTestQuestion => ({
  id: (index + 1).toString(),
  text: question.text || question.title || '',
  theme: question.category || 'noel',
  roundNumber: index + 1,
  category: question.category || 'noel',
  audioUrl: question.audioUrl,
  answer: question.answer || '',
});

// Hook personnalisé pour les questions de Blind Test Générations
export function useBlindTestGenerationsQuestions() {
  const [questions, setQuestions] = useState<BlindTestQuestion[]>([]);
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
        const questionsRef = doc(db, 'gameQuestions', 'blindtest-generations');
        const questionsDoc = await getDoc(questionsRef);

        if (questionsDoc.exists()) {
          const questionsData = questionsDoc.data();
          const rawQuestions = questionsData?.translations?.[currentLanguageCode] || [];

          const transformedQuestions = rawQuestions.map(transformQuestion);
          setQuestions(transformedQuestions);
        } else {
          console.warn('No questions document found for blindtest-generations in Firebase.');
          // Questions par défaut si Firebase n'a pas de données
          const defaultQuestions: BlindTestQuestion[] = [
            { id: '1', text: 'Jingle Bells', theme: 'noel', roundNumber: 1, category: 'noel', answer: 'Jingle Bells' },
            { id: '2', text: 'Vive le vent', theme: 'noel', roundNumber: 2, category: 'noel', answer: 'Vive le vent' },
            { id: '3', text: 'Friends', theme: 'generiques', roundNumber: 3, category: 'generiques', answer: 'Friends' },
            { id: '4', text: 'Game of Thrones', theme: 'generiques', roundNumber: 4, category: 'generiques', answer: 'Game of Thrones' },
            { id: '5', text: 'Billie Jean', theme: 'tubes-80s-90s-2000s', roundNumber: 5, category: 'tubes-80s-90s-2000s', answer: 'Billie Jean' },
          ];
          setQuestions(defaultQuestions);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
        // Questions par défaut en cas d'erreur
        const defaultQuestions: BlindTestQuestion[] = [
          { id: '1', text: 'Jingle Bells', theme: 'noel', roundNumber: 1, category: 'noel', answer: 'Jingle Bells' },
          { id: '2', text: 'Vive le vent', theme: 'noel', roundNumber: 2, category: 'noel', answer: 'Vive le vent' },
          { id: '3', text: 'Friends', theme: 'generiques', roundNumber: 3, category: 'generiques', answer: 'Friends' },
          { id: '4', text: 'Game of Thrones', theme: 'generiques', roundNumber: 4, category: 'generiques', answer: 'Game of Thrones' },
          { id: '5', text: 'Billie Jean', theme: 'tubes-80s-90s-2000s', roundNumber: 5, category: 'tubes-80s-90s-2000s', answer: 'Billie Jean' },
        ];
        setQuestions(defaultQuestions);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [isRTL, language]);

  // Obtenir une question aléatoire d'une catégorie spécifique qui n'a pas encore été posée
  const getRandomQuestion = (category?: BlindTestCategory): BlindTestQuestion | null => {
    // Filtrer toutes les questions par catégorie si spécifiée
    const allQuestionsOfCategory = category
      ? questions.filter(q => q.category === category)
      : questions;

    if (allQuestionsOfCategory.length === 0) {
      console.warn(`Aucune question de catégorie ${category || 'any'} disponible.`);
      return null;
    }

    // Filtrer celles qui n'ont PAS encore été posées
    const availableOfCategory = allQuestionsOfCategory.filter(q => !askedQuestions.includes(q.id));

    // Si toutes les questions de cette catégorie ont été posées, réinitialiser
    let questionsToChooseFrom = availableOfCategory;
    if (availableOfCategory.length === 0) {
      console.log(`Toutes les questions de catégorie ${category || 'any'} ont été posées. Réinitialisation.`);
      const otherCategoryAskedQuestions = askedQuestions.filter(id => {
        const question = questions.find(q => q.id === id);
        return question && (!category || question.category !== category);
      });
      setAskedQuestions(otherCategoryAskedQuestions);
      questionsToChooseFrom = allQuestionsOfCategory;
    }

    if (questionsToChooseFrom.length === 0) {
      console.warn(`Aucune question de catégorie ${category || 'any'} disponible après réinitialisation.`);
      return null;
    }

    // Sélectionner une question aléatoire
    const randomIndex = Math.floor(Math.random() * questionsToChooseFrom.length);
    const selectedQuestion = questionsToChooseFrom[randomIndex];

    if (!selectedQuestion) {
      console.error(`Échec de la sélection aléatoire d'une question de catégorie ${category || 'any'}.`);
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
export const getQuestions = async (currentLanguage: string = 'fr'): Promise<BlindTestQuestion[]> => {
  try {
    const db = getFirestore();
    const questionsRef = doc(db, 'gameQuestions', 'blindtest-generations');
    const questionsDoc = await getDoc(questionsRef);

    if (questionsDoc.exists()) {
      const questionsData = questionsDoc.data();
      const rawQuestions = questionsData?.translations?.[currentLanguage] || [];
      return rawQuestions.map((q: any, i: number) => transformQuestion(q, i));
    } else {
      console.error("No questions found in Firebase");
      return [];
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

