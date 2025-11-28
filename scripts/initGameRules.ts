import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
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

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account
const serviceAccountPath = path.join(__dirname, "..", "nightly-efa29-firebase-adminsdk-fbsvc-ddf3409693.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
    const db = admin.firestore();

    // Sauvegarde la configuration des langues
    await db.collection("config").doc("languages").set({
      supportedLanguages,
    });

    // Sauvegarde les règles du jeu pour chaque mode
    for (const [gameId, content] of Object.entries(gameRules)) {
      await db.collection("rules").doc(gameId).set(content);
      console.log(`✅ Règles du jeu pour "${gameId}" ajoutées avec succès!`);
    }

    console.log("\n🎉 Initialisation des règles terminée!");
    console.log(`📋 ${Object.keys(gameRules).length} jeux initialisés`);
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation des règles:", error);
    process.exit(1);
  }
};

// Lance l'initialisation
initGameRules();
