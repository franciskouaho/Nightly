import { initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { listen_but_don_t_judge_rules } from "./rules/listen-but-don-t-judge-rules";
import { truthOrDareRules } from "./rules/truth-or-dare-rules";
import { geniusOrLiarRules } from "./rules/genius-or-liar-rules";
import { neverHaveIEverHotRules } from "./rules/never-have-i-ever-hot-rules";
import { trapAnswerRules } from "./rules/trap-answer-rules";
import { twoLettersOneWordRules } from "./rules/two-letters-one-word-rules";
import { wordGuessingRules } from "./rules/word-guessing-rules";
import { quizHalloweenRules } from "./rules/quiz-halloween-rules";
import { forbiddenDesireRules } from "./rules/forbidden-desire-rules";
import { doubleDareRules } from "./rules/double-dare-rules";
import { pileOuFaceRules } from "./rules/pile-ou-face-rules";
import { dareOrStripRules } from "./rules/dare-or-strip-rules";
import { blindtestGenerationsRules } from "./rules/blindtest-generations-rules";

const firebaseConfig = {
  apiKey: "AIzaSyCpkwiOl19wTGqD4YO0HEcTuqWyqaXnU5w",
  authDomain: "nightly-efa29.firebaseapp.com",
  projectId: "nightly-efa29",
};

const supportedLanguages = [
  { id: "fr", name: "Français", countryCode: "FR", rtl: false },
  { id: "en", name: "English", countryCode: "US", rtl: false },
  { id: "es", name: "Español", countryCode: "ES", rtl: false },
  { id: "de", name: "Deutsch", countryCode: "DE", rtl: false },
  { id: "it", name: "Italiano", countryCode: "IT", rtl: false },
  { id: "pt", name: "Português", countryCode: "PT", rtl: false },
  { id: "ar", name: "العربية", countryCode: "SA", rtl: true },
];

// Structure des règles du jeu pour chaque langue
const gameRules = {
  "listen-but-don-t-judge": listen_but_don_t_judge_rules,
  "truth-or-dare": truthOrDareRules,
  "genius-or-liar": geniusOrLiarRules,
  "never-have-i-ever-hot": neverHaveIEverHotRules,
  "trap-answer": trapAnswerRules,
  "two-letters-one-word": twoLettersOneWordRules,
  "word-guessing": wordGuessingRules,
  "quiz-halloween": quizHalloweenRules,
  "forbidden-desire": forbiddenDesireRules,
  "double-dare": doubleDareRules,
  "pile-ou-face": pileOuFaceRules,
  "dare-or-strip": dareOrStripRules,
  "blindtest-generations": blindtestGenerationsRules,
};

// Initialise Firebase et insère les règles du jeu dans Firestore
const initGameRules = async () => {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Sauvegarde la configuration des langues
    await setDoc(doc(db, "config", "languages"), {
      supportedLanguages,
    });

    // Sauvegarde les règles du jeu pour chaque mode
    for (const [gameId, content] of Object.entries(gameRules)) {
      await setDoc(doc(db, "rules", gameId), content);
      console.log(`Règles du jeu pour ${gameId} ajoutées avec succès!`);
    }

    console.log("Initialisation des règles terminée!");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des règles:", error);
  }
};

// Lance l'initialisation
initGameRules();
