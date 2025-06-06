import { Question } from '@/types/gameTypes';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Fonction pour transformer les données de Firebase en format Question
const transformQuestion = (question: any, index: number): Question => ({
  id: (index + 1).toString(),
  text: question.text,
  theme: question.type,
  roundNumber: index + 1
});

// Hook personnalisé pour les questions de Truth or Dare
export function useTruthOrDareQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const { isRTL, language } = useLanguage();

  // Charger les questions depuis Firebase
  useEffect(() => {
    // Ajouter une condition pour s'assurer que la langue est prête.
    // Ici, on vérifie simplement si 'language' a une valeur non nulle ou non vide.
    // Si useLanguage a un état 'isLoadingLanguage', il serait préférable de l'utiliser.
    const currentLanguageCode = isRTL ? 'ar' : (language || 'fr');
    if (!currentLanguageCode) {
      setIsLoadingQuestions(false); // Ne pas charger et indiquer non chargé si langue indéfinie
      return;
    }

    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const db = getFirestore();
        const questionsRef = doc(db, 'gameQuestions', 'truth-or-dare');
        const questionsDoc = await getDoc(questionsRef);

        if (questionsDoc.exists()) {
          const questionsData = questionsDoc.data();
          // Utiliser le currentLanguageCode déjà déterminé
          const rawQuestions = questionsData?.translations?.[currentLanguageCode] || [];

          const transformedQuestions = rawQuestions.map(transformQuestion);
          setQuestions(transformedQuestions);
          setAvailableQuestions(transformedQuestions);
        } else {
           console.warn('No questions document found for truth-or-dare in Firebase.');
           setQuestions([]);
           setAvailableQuestions([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
    // Ajouter currentLanguageCode aux dépendances si la logique de langue le justifie
  }, [isRTL, language]); // Maintenir les dépendances actuelles pour réagir aux changements

  // Obtenir une question aléatoire qui n'a pas encore été posée, filtrée par type si spécifié
  const getRandomQuestion = (type?: 'verite' | 'action'): Question | null => {
    // Filtrer toutes les questions originales par le type demandé
    const allQuestionsOfType = type 
      ? questions.filter(q => q.theme.toLowerCase() === type.toLowerCase())
      : questions; // Si pas de type, considérer toutes les questions

    if (allQuestionsOfType.length === 0) {
        console.warn(`Aucune question de type ${type || 'any'} disponible dans la liste originale.`);
        return null; // Aucune question de ce type n'existe du tout dans la liste originale
    }

    // Filtrer celles qui n'ont PAS encore été posées PARMI CE TYPE
    const availableOfType = allQuestionsOfType.filter(q => !askedQuestions.includes(q.id));

    // Si toutes les questions de ce type ont été posées, réinitialiser l'historique des questions posées pour CE TYPE
    let questionsToChooseFrom = availableOfType;
    if (availableOfType.length === 0) {
        console.log(`Toutes les questions de type ${type} ont été posées. Réinitialisation de l'historique pour ce type.`);
        // Réinitialiser askedQuestions en retirant uniquement celles de ce type
        const otherTypeAskedQuestions = askedQuestions.filter(id => {
            const question = questions.find(q => q.id === id);
            return question && (!type || question.theme.toLowerCase() !== type.toLowerCase());
        });
        setAskedQuestions(otherTypeAskedQuestions);

        // Maintenant, toutes les questions de ce type sont à nouveau disponibles pour être choisies
        questionsToChooseFrom = allQuestionsOfType; 
    }

    // Si même après réinitialisation il n'y a pas de questions (ce cas devrait être couvert par la première vérification, mais sécurité)
     if (questionsToChooseFrom.length === 0) {
        console.warn(`Aucune question de type ${type || 'any'} disponible après réinitialisation.`);
        return null;
    }

    // Sélectionner une question aléatoire parmi les questions disponibles de ce type (après potentielle réinitialisation)
    const randomIndex = Math.floor(Math.random() * questionsToChooseFrom.length);
    const selectedQuestion = questionsToChooseFrom[randomIndex];

    if (!selectedQuestion) {
        console.error(`Échec de la sélection aléatoire d'une question de type ${type || 'any'}.`);
        return null; // Vérification de sécurité supplémentaire
    }

    // Ajouter la question sélectionnée à la liste des questions posées
    setAskedQuestions((prev: string[]) => [...prev, selectedQuestion.id]);

    return selectedQuestion;
  };

  // Réinitialiser l'historique des questions posées complètement (cette fonction est une réinitialisation globale)
  const resetAskedQuestions = () => {
    setAskedQuestions([]);
    // Note: availableQuestions n'est plus utilisé comme état séparé géré ici
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
    const questionsRef = doc(db, 'gameQuestions', 'truth-or-dare');
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