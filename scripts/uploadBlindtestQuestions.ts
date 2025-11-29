import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import des questions blindtest-generations
import { blindtestGenerationsQuestions } from "./questions/blindtest-generations-questions.js";

// Load service account
const serviceAccountPath = path.join(__dirname, "..", "nightly-efa29-firebase-adminsdk-fbsvc-df0552458c.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Fichier de clé de service Firebase non trouvé!");
  console.error("   Chemin recherché:", serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Upload des questions vers Firebase
const uploadBlindtestQuestions = async () => {
  try {
    const db = admin.firestore();

    console.log("🚀 Upload des questions blindtest-generations...\n");

    const gameId = "blindtest-generations";

    // Upload des questions
    await db.collection("gameQuestions").doc(gameId).set({
      translations: blindtestGenerationsQuestions.translations,
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

    console.log("✅ Questions blindtest-generations uploadées avec succès!\n");
    console.log(`📊 Total: ${blindtestGenerationsQuestions.translations.fr.length} questions en français`);
    if (blindtestGenerationsQuestions.translations.en) {
      console.log(`📊 Total: ${blindtestGenerationsQuestions.translations.en.length} questions en anglais`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'upload:", error);
    process.exit(1);
  }
};

// Exécution du script
uploadBlindtestQuestions()
  .then(() => {
    console.log("🎉 Upload terminé avec succès!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });

