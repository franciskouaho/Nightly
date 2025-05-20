import { TrapQuestion } from './types';

export const questions: TrapQuestion[] = [
  {
    id: '1',
    text: 'Où a été inventé le croissant ?',
    theme: 'culture',
    roundNumber: 1,
    question: 'Où a été inventé le croissant ?',
    answers: [
      { text: 'Autriche', isCorrect: true, isTrap: false },
      { text: 'France', isCorrect: false, isTrap: true },
      { text: 'Italie', isCorrect: false, isTrap: false },
      { text: 'Belgique', isCorrect: false, isTrap: false }
    ]
  },
  {
    id: '2',
    text: 'Quel est l\'animal le plus rapide sur terre ?',
    theme: 'nature',
    roundNumber: 1,
    question: 'Quel est l\'animal le plus rapide sur terre ?',
    answers: [
      { text: 'Guepard', isCorrect: true, isTrap: false },
      { text: 'Aigle royal', isCorrect: false, isTrap: true },
      { text: 'Lièvre', isCorrect: false, isTrap: false },
      { text: 'Zèbre', isCorrect: false, isTrap: false }
    ]
  },
  {
    id: '3',
    text: 'Qui a peint la Joconde ?',
    theme: 'art',
    roundNumber: 1,
    question: 'Qui a peint la Joconde ?',
    answers: [
      { text: 'Léonard de Vinci', isCorrect: true, isTrap: false },
      { text: 'Michel-Ange', isCorrect: false, isTrap: true },
      { text: 'Raphaël', isCorrect: false, isTrap: false },
      { text: 'Botticelli', isCorrect: false, isTrap: false }
    ]
  },
  {
    id: '4',
    text: 'Quelle est la capitale de l\'Australie ?',
    theme: 'geographie',
    roundNumber: 1,
    question: 'Quelle est la capitale de l\'Australie ?',
    answers: [
      { text: 'Canberra', isCorrect: true, isTrap: false },
      { text: 'Sydney', isCorrect: false, isTrap: true },
      { text: 'Melbourne', isCorrect: false, isTrap: false },
      { text: 'Brisbane', isCorrect: false, isTrap: false }
    ]
  },
  {
    id: '5',
    text: 'Quel est le plus grand océan du monde ?',
    theme: 'geographie',
    roundNumber: 1,
    question: 'Quel est le plus grand océan du monde ?',
    answers: [
      { text: 'Océan Pacifique', isCorrect: true, isTrap: false },
      { text: 'Océan Atlantique', isCorrect: false, isTrap: true },
      { text: 'Océan Indien', isCorrect: false, isTrap: false },
      { text: 'Océan Arctique', isCorrect: false, isTrap: false }
    ]
  }
]; 