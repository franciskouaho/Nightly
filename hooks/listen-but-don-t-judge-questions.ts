import { Question } from "@/types/gameTypes";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Fonction simple pour transformer les données de Firebase en format Question
export const transformQuestion = (questionData: any, index: number): Question => {
  // Si c'est une chaîne simple
  if (typeof questionData === "string") {
    return {
      id: `q_${index}`,
      text: questionData,
      theme: "general",
      roundNumber: index + 1,
    };
  }

  // Si c'est un objet
  if (typeof questionData === "object" && questionData !== null) {
    let text = "";
    
    // Vérifier si c'est un objet avec des clés numériques (caractères stockés individuellement)
    const keys = Object.keys(questionData);
    const numericKeys = keys.filter(key => !isNaN(Number(key)));
    
    if (numericKeys.length > 0) {
      // Reconstruire le texte à partir des caractères
      text = numericKeys
        .sort((a, b) => Number(a) - Number(b))
        .map(key => questionData[key])
        .join('');
    } else if (questionData.text) {
      text = questionData.text;
    } else {
      text = "Question non disponible";
    }
    
    return {
      id: questionData.id || `q_${index}`,
      text: text,
      theme: questionData.theme || questionData.type || "general",
      roundNumber: questionData.roundNumber || index + 1,
    };
  }

  // Fallback
  return {
    id: `q_${index}`,
    text: "Question non disponible",
    theme: "error",
    roundNumber: index + 1,
  };
};

// Hook personnalisé pour les questions de Listen But Don't Judge
export function useListenButDontJudgeQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const { getGameContent, language } = useLanguage();

  // Charger les questions via getGameContent du LanguageContext
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const gameContent = await getGameContent('listen-but-don-t-judge');
        const rawQuestions = gameContent.questions;

        if (Array.isArray(rawQuestions)) {
          const transformedQuestions = rawQuestions.map(
            (q: any, index: number) => transformQuestion(q, index),
          );
          console.log(`[DEBUG useListenButDontJudgeQuestions] Transformed ${transformedQuestions.length} questions with IDs:`, transformedQuestions.map(q => q.id));
          setQuestions(transformedQuestions);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
      }
    };

    fetchQuestions();
  }, [getGameContent, language]);

  // Obtenir une question aléatoire qui n'a pas encore été posée
  const getRandomQuestion = useCallback((): Question | null => {
    if (questions.length === 0) {
      return null;
    }

    // Filtrer les questions non encore posées
    const availableQuestions = questions.filter(q => !askedQuestions.has(q.id));
    
    // Si toutes les questions ont été posées, réinitialiser
    if (availableQuestions.length === 0) {
      setAskedQuestions(new Set());
      const randomIndex = Math.floor(Math.random() * questions.length);
      const selectedQuestion = questions[randomIndex];
      if (selectedQuestion) {
        setAskedQuestions(new Set([selectedQuestion.id]));
        return selectedQuestion;
      }
      return null;
    }

    // Sélectionner une question aléatoire parmi les disponibles
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    if (selectedQuestion) {
      // Marquer comme posée
      setAskedQuestions(prev => new Set([...prev, selectedQuestion.id]));
      return selectedQuestion;
    }
    
    return null;
  }, [questions, askedQuestions]);

  // Réinitialiser l'historique des questions posées
  const resetAskedQuestions = () => {
    setAskedQuestions(new Set());
  };

  return {
    questions,
    getRandomQuestion,
    resetAskedQuestions,
    askedQuestions: Array.from(askedQuestions),
  };
}

// Fonction de compatibilité pour le code existant
export const getQuestions = async (
  currentLanguage: string = "fr",
): Promise<Question[]> => {
  // Cette fonction n'est plus utilisée, mais on la garde pour la compatibilité
  // Le hook useListenButDontJudgeQuestions utilise maintenant getGameContent
  return [];
};