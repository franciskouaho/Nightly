import { useLanguage } from '@/contexts/LanguageContext';
import { Question } from '@/types/gameTypes';
import { doc, getDoc, getFirestore } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

// Fonction pour transformer les données de Firebase en format Question
export const transformQuestion = (question: any, index: number): Question => ({
  id: (index + 1).toString(),
  text: question.text,
  theme: question.theme || 'dare',
  roundNumber: index + 1,
});

// Hook personnalisé pour les questions de Dare or Strip
export function useDareOrStripQuestions() {
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
        const questionsRef = doc(db, 'gameQuestions', 'dare-or-strip');
        const questionsDoc = await getDoc(questionsRef);

        if (questionsDoc.exists()) {
          const questionsData = questionsDoc.data();
          const rawQuestions = questionsData?.translations?.[currentLanguageCode] || [];

          const transformedQuestions = rawQuestions.map(transformQuestion);
          setQuestions(transformedQuestions);
        } else {
          console.warn('No questions document found for dare-or-strip in Firebase.');
          // Questions par défaut si Firebase n'a pas de données
          const defaultQuestions: Question[] = [
            { id: '1', text: 'Fais un massage dans le dos de ton/ta partenaire', theme: 'dare', roundNumber: 1 },
            { id: '2', text: 'Lis un message sexy dans un ton sérieux', theme: 'dare', roundNumber: 2 },
            { id: '3', text: 'Décris une scène qui te fait fantasmer', theme: 'dare', roundNumber: 3 },
            { id: '4', text: 'Fais un mini strip-tease de 10 secondes', theme: 'dare', roundNumber: 4 },
            { id: '5', text: 'Chuchote quelque chose de coquin à l\'oreille de ton/ta partenaire', theme: 'dare', roundNumber: 5 },
          ];
          setQuestions(defaultQuestions);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
        // Questions par défaut en cas d'erreur
        const defaultQuestions: Question[] = [
          { id: '1', text: 'Fais un massage dans le dos de ton/ta partenaire', theme: 'dare', roundNumber: 1 },
          { id: '2', text: 'Lis un message sexy dans un ton sérieux', theme: 'dare', roundNumber: 2 },
          { id: '3', text: 'Décris une scène qui te fait fantasmer', theme: 'dare', roundNumber: 3 },
          { id: '4', text: 'Fais un mini strip-tease de 10 secondes', theme: 'dare', roundNumber: 4 },
          { id: '5', text: 'Chuchote quelque chose de coquin à l\'oreille de ton/ta partenaire', theme: 'dare', roundNumber: 5 },
        ];
        setQuestions(defaultQuestions);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [isRTL, language]);

  // Obtenir une question aléatoire qui n'a pas encore été posée
  const getRandomQuestion = (): Question | null => {
    if (questions.length === 0) {
      console.warn('Aucune question disponible.');
      return null;
    }

    // Filtrer celles qui n'ont PAS encore été posées
    const availableQuestions = questions.filter(q => !askedQuestions.includes(q.id));

    // Si toutes les questions ont été posées, réinitialiser
    let questionsToChooseFrom = availableQuestions;
    if (availableQuestions.length === 0) {
      console.log('Toutes les questions ont été posées. Réinitialisation.');
      setAskedQuestions([]);
      questionsToChooseFrom = questions;
    }

    if (questionsToChooseFrom.length === 0) {
      console.warn('Aucune question disponible après réinitialisation.');
      return null;
    }

    // Sélectionner une question aléatoire
    const randomIndex = Math.floor(Math.random() * questionsToChooseFrom.length);
    const selectedQuestion = questionsToChooseFrom[randomIndex];

    if (!selectedQuestion) {
      console.error('Échec de la sélection aléatoire d\'une question.');
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
    const questionsRef = doc(db, 'gameQuestions', 'dare-or-strip');
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

