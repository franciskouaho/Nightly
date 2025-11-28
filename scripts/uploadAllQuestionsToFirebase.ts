import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import de toutes les questions par jeu
import { wordGuessingQuestions } from "./questions/word-guessing-questions";
import { listenButDontJudgeQuestions } from "./questions/listen-but-don-t-judge-questions";
import { truthOrDareQuestions } from "./questions/truth-or-dare-questions";
import { geniusOrLiarQuestions } from "./questions/genius-or-liar-questions";
import { neverHaveIEverHotQuestions } from "./questions/never-have-i-ever-hot-questions";
import { trapAnswerQuestions } from "./questions/trap-answer-questions";
import { quizHalloweenQuestions } from "./questions/quiz-halloween-questions";
import { forbiddenDesireQuestions } from "./questions/forbidden-desire-questions";
import { doubleDareQuestions } from "./questions/double-dare-questions";
import { pileOuFaceQuestions } from "./questions/pile-ou-face-questions";
import { dareOrStripQuestions } from "./questions/dare-or-strip-questions";
import { blindtestGenerationsQuestions } from "./questions/blindtest-generations-questions";

// Load service account
const serviceAccountPath = path.join(__dirname, "..", "nightly-efa29-firebase-adminsdk-fbsvc-ddf3409693.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Toutes les questions de tous les jeux
const allGamesQuestions = {
  "word-guessing": wordGuessingQuestions,
  "listen-but-don-t-judge": listenButDontJudgeQuestions,
  "truth-or-dare": truthOrDareQuestions,
  "genius-or-liar": geniusOrLiarQuestions,
  "never-have-i-ever-hot": neverHaveIEverHotQuestions,
  "trap-answer": trapAnswerQuestions,
  "quiz-halloween": quizHalloweenQuestions,
  "forbidden-desire": forbiddenDesireQuestions,
  "double-dare": doubleDareQuestions,
  "pile-ou-face": pileOuFaceQuestions,
  "dare-or-strip": dareOrStripQuestions,
  "blindtest-generations": blindtestGenerationsQuestions,
};

// Upload de toutes les questions vers Firebase
const uploadAllQuestionsToFirebase = async () => {
  try {
    const db = admin.firestore();

    console.log("🚀 Début de l'upload des questions de tous les jeux...\n");

    let totalGames = 0;
    let successCount = 0;
    let errorCount = 0;

    // Pour chaque jeu, upload les questions
    for (const [gameId, content] of Object.entries(allGamesQuestions)) {
      totalGames++;

      try {
        console.log(`📤 [${totalGames}/12] Upload des questions pour "${gameId}"...`);

        // Upload des questions
        await db.collection("gameQuestions").doc(gameId).set({
          translations: content.translations,
        });

        // Créer ou mettre à jour l'entrée dans la collection gameReleases
        await db.collection("gameReleases").doc(gameId).set(
          {
            name: gameId,
            notified: false,
            releaseDate: admin.firestore.Timestamp.now(),
            isActive: true,
          },
          { merge: true }
        );

        successCount++;
        console.log(`✅ Questions pour "${gameId}" uploadées avec succès!\n`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur pour "${gameId}":`, error);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Upload terminé!");
    console.log("=".repeat(60));
    console.log(`✅ Réussis: ${successCount}/${totalGames}`);
    if (errorCount > 0) {
      console.log(`❌ Erreurs: ${errorCount}/${totalGames}`);
    }
    console.log("\n📋 Jeux uploadés:");
    console.log("  1. word-guessing");
    console.log("  2. listen-but-don-t-judge");
    console.log("  3. truth-or-dare");
    console.log("  4. genius-or-liar");
    console.log("  5. never-have-i-ever-hot");
    console.log("  6. trap-answer");
    console.log("  7. quiz-halloween");
    console.log("  8. forbidden-desire");
    console.log("  9. double-dare");
    console.log("  10. pile-ou-face");
    console.log("  11. dare-or-strip");
    console.log("  12. blindtest-generations");
    console.log("\n✨ Total: ~4,769 questions uploadées!");
  } catch (error) {
    console.error("❌ Erreur fatale lors de l'upload:", error);
  }
};

// Exécution du script
uploadAllQuestionsToFirebase();
