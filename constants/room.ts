// Liste des thèmes possibles pour 2 Lettres 1 Mot
export const TWO_LETTERS_ONE_WORD_THEMES = [
  "une marque",
  "une ville",
  "un prénom",
  "un pays",
  "un animal",
  "un métier",
  "un sport",
  "un fruit",
  "un légume",
  "un objet",
] as const;

// Configuration des jeux avec le nombre minimum de joueurs requis
export const GAME_CONFIG = {
  "truth-or-dare": { minPlayers: 2 },
  "listen-but-don-t-judge": { minPlayers: 2 },
  "trap-answer": { minPlayers: 1 },
  "never-have-i-ever-hot": { minPlayers: 2 },
  "genius-or-liar": { minPlayers: 2 },
  "two-letters-one-word": { minPlayers: 1 },
  "word-guessing": { minPlayers: 2 },
  "quiz-halloween": { minPlayers: 1 },
  "forbidden-desire": { minPlayers: 2 },
  "double-dare": { minPlayers: 2 },
  "pile-ou-face": { minPlayers: 2 },
};

// Génère deux lettres aléatoires pour 2 Lettres 1 Mot
export const generateTwoLettersOneWordRandomLetters = (): [string, string] => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let firstLetter = alphabet[
    Math.floor(Math.random() * alphabet.length)
  ] as string;
  let secondLetter: string;
  do {
    secondLetter = alphabet[
      Math.floor(Math.random() * alphabet.length)
    ] as string;
  } while (secondLetter === firstLetter);
  return [firstLetter, secondLetter];
};
