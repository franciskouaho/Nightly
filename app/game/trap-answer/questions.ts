import firestore from '@react-native-firebase/firestore';
import { TrapQuestion } from "@/types/types";

export const getQuestions = async (): Promise<TrapQuestion[]> => {
  try {
    const docRef = firestore().collection('gameQuestions').doc('trap-answer');
    const docSnap = await docRef.get();

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Transform the data from Firebase format to TrapQuestion format
      return data?.translations.fr.map((question: any, index: number) => ({
        id: (index + 1).toString(),
        text: question.question,
        theme: question.type,
        roundNumber: 1,
        question: question.question,
        answers: [
          { text: question.answer, isCorrect: true, isTrap: false },
          ...question.traps.map((trap: string) => ({ 
            text: trap, 
            isCorrect: false, 
            isTrap: true 
          }))
        ]
      })) || [];
    } else {
      console.error("No questions found in Firebase");
      return [];
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}; 
