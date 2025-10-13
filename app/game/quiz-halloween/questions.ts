import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { TrapQuestion } from "@/types/types";
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

// Fonction pour mélanger un tableau (algorithme de Fisher-Yates)
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Fonction pour transformer les données de Firebase en format TrapQuestion pour Halloween
export const transformHalloweenQuestion = (question: any, index: number): TrapQuestion => ({
  id: `halloween_q_${index}`,
  text: question.question,
  theme: 'Halloween',
  roundNumber: 1,
  question: question.question,
  answers: shuffleArray([
    { text: question.answer, isCorrect: true, isTrap: false },
    ...question.traps.map((trap: string) => ({
      text: trap,
      isCorrect: false,
      isTrap: true
    })),
  ]), // Vrai mélange aléatoire
});

// Hook personnalisé pour les questions de Quiz Halloween
export function useQuizHalloweenQuestions(askedQuestionIdsFromGame: string[]) {
  const [questions, setQuestions] = useState<TrapQuestion[]>(getDefaultHalloweenQuestions());
  const { isRTL, language } = useLanguage();

  // Fonction pour obtenir une question aléatoire non posée
  const getRandomQuestion = (): TrapQuestion | null => {
    const availableQuestions = questions.filter(q => !askedQuestionIdsFromGame.includes(q.id));
    
    if (availableQuestions.length === 0) {
      return null; // Plus de questions disponibles
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex] || null;
  };

  // Charger les questions depuis Firebase
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const db = getFirestore();
        const questionsRef = doc(db, 'gameRules', 'quiz-halloween');
        const questionsDoc = await getDoc(questionsRef);
        
        if (questionsDoc.exists()) {
          const data = questionsDoc.data();
          if (!data) return;
          
          const translations = data.translations;
          
          // Utiliser la langue actuelle ou français par défaut
          const currentLang = language || 'fr';
          const langData = translations[currentLang] || translations['fr'];
          
          if (langData && langData.questions) {
            const transformedQuestions = langData.questions.map((q: any, index: number) => 
              transformHalloweenQuestion(q, index)
            );
            // Mélanger les questions pour éviter le même ordre
            setQuestions(shuffleArray(transformedQuestions));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des questions Halloween:', error);
        // Questions par défaut si Firebase échoue
        setQuestions(shuffleArray(getDefaultHalloweenQuestions()));
      }
    };

    loadQuestions();
  }, [language]);

  return { questions, getRandomQuestion };
}

// Questions par défaut en cas d'erreur Firebase
function getDefaultHalloweenQuestions(): TrapQuestion[] {
  return [
    {
      id: 'halloween_default_1',
      text: 'Quel est le nom du personnage principal du film "Halloween" ?',
      theme: 'Halloween',
      roundNumber: 1,
      question: 'Quel est le nom du personnage principal du film "Halloween" ?',
      answers: shuffleArray([
        { text: 'Michael Myers', isCorrect: true, isTrap: false },
        { text: 'Jason Voorhees', isCorrect: false, isTrap: true },
        { text: 'Freddy Krueger', isCorrect: false, isTrap: true },
        { text: 'Chucky', isCorrect: false, isTrap: true },
      ])
    },
    {
      id: 'halloween_default_2',
      text: 'Dans quelle ville se déroule principalement le film "Halloween" ?',
      theme: 'Halloween',
      roundNumber: 1,
      question: 'Dans quelle ville se déroule principalement le film "Halloween" ?',
      answers: shuffleArray([
        { text: 'Haddonfield', isCorrect: true, isTrap: false },
        { text: 'Springfield', isCorrect: false, isTrap: true },
        { text: 'Crystal Lake', isCorrect: false, isTrap: true },
        { text: 'Elm Street', isCorrect: false, isTrap: true },
      ])
    },
    {
      id: 'halloween_default_3',
      text: 'Quel est l\'objet fétiche de Michael Myers ?',
      theme: 'Halloween',
      roundNumber: 1,
      question: 'Quel est l\'objet fétiche de Michael Myers ?',
      answers: shuffleArray([
        { text: 'Un couteau de cuisine', isCorrect: true, isTrap: false },
        { text: 'Une machette', isCorrect: false, isTrap: true },
        { text: 'Des griffes métalliques', isCorrect: false, isTrap: true },
        { text: 'Une hache', isCorrect: false, isTrap: true },
      ])
    },
    {
      id: 'halloween_default_4',
      text: 'Quel est le vrai nom de la fête d\'Halloween ?',
      theme: 'Halloween',
      roundNumber: 1,
      question: 'Quel est le vrai nom de la fête d\'Halloween ?',
      answers: shuffleArray([
        { text: 'Samhain', isCorrect: true, isTrap: false },
        { text: 'Beltane', isCorrect: false, isTrap: true },
        { text: 'Yule', isCorrect: false, isTrap: true },
        { text: 'Imbolc', isCorrect: false, isTrap: true },
      ])
    },
    {
      id: 'halloween_default_5',
      text: 'Quel légume était traditionnellement utilisé pour les lanternes avant la citrouille ?',
      theme: 'Halloween',
      roundNumber: 1,
      question: 'Quel légume était traditionnellement utilisé pour les lanternes avant la citrouille ?',
      answers: shuffleArray([
        { text: 'Le navet', isCorrect: true, isTrap: false },
        { text: 'Le potiron', isCorrect: false, isTrap: true },
        { text: 'Le chou', isCorrect: false, isTrap: true },
        { text: 'La courge', isCorrect: false, isTrap: true },
      ])
    },
    {
      id: 'halloween_default_6',
      text: 'Quel est le nom de la sorcière dans "Blanche-Neige" ?',
      theme: 'Halloween',
      roundNumber: 1,
      question: 'Quel est le nom de la sorcière dans "Blanche-Neige" ?',
      answers: shuffleArray([
        { text: 'La Reine Maléfique', isCorrect: true, isTrap: false },
        { text: 'Maléfique', isCorrect: false, isTrap: true },
        { text: 'La Sorcière Blanche', isCorrect: false, isTrap: true },
        { text: 'Cruella', isCorrect: false, isTrap: true },
      ])
    },
    {
      id: 'halloween_default_7',
      text: 'Dans quel pays est née la tradition d\'Halloween ?',
      theme: 'Halloween',
      roundNumber: 1,
      question: 'Dans quel pays est née la tradition d\'Halloween ?',
      answers: shuffleArray([
        { text: 'L\'Irlande', isCorrect: true, isTrap: false },
        { text: 'Les États-Unis', isCorrect: false, isTrap: true },
        { text: 'L\'Angleterre', isCorrect: false, isTrap: true },
        { text: 'L\'Écosse', isCorrect: false, isTrap: true },
      ])
    },
    {
      id: 'halloween_default_8',
      text: 'Quel animal est associé aux sorcières ?',
      theme: 'Halloween',
      roundNumber: 1,
      question: 'Quel animal est associé aux sorcières ?',
      answers: shuffleArray([
        { text: 'Le chat noir', isCorrect: true, isTrap: false },
        { text: 'La chouette', isCorrect: false, isTrap: true },
        { text: 'Le corbeau', isCorrect: false, isTrap: true },
        { text: 'Le hibou', isCorrect: false, isTrap: true },
      ])
    },
    {
      id: 'halloween_default_9',
      text: 'Quel est le nom du fantôme dans "Casper" ?',
      theme: 'Halloween',
      roundNumber: 1,
      question: 'Quel est le nom du fantôme dans "Casper" ?',
      answers: shuffleArray([
        { text: 'Casper', isCorrect: true, isTrap: false },
        { text: 'Slimer', isCorrect: false, isTrap: true },
        { text: 'Boo', isCorrect: false, isTrap: true },
        { text: 'Ghost', isCorrect: false, isTrap: true },
      ])
    },
    {
      id: 'halloween_default_10',
      text: 'Quelle couleur est traditionnellement associée à Halloween ?',
      theme: 'Halloween',
      roundNumber: 1,
      question: 'Quelle couleur est traditionnellement associée à Halloween ?',
      answers: shuffleArray([
        { text: 'Orange et noir', isCorrect: true, isTrap: false },
        { text: 'Rouge et noir', isCorrect: false, isTrap: true },
        { text: 'Violet et vert', isCorrect: false, isTrap: true },
        { text: 'Jaune et orange', isCorrect: false, isTrap: true },
      ])
    }
  ];
}
