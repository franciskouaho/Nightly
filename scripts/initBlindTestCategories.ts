import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const db = admin.firestore();

const categories = [
  {
    id: 'noel',
    label: 'Noël',
    emoji: '🎄',
    gradient: ['#C62828', '#E53935'],
    description: 'Chants de Noël',
    order: 1,
    active: true,
  },
  {
    id: 'generiques',
    label: 'Génériques TV',
    emoji: '📺',
    gradient: ['#6A1B9A', '#9C27B0'],
    description: 'Séries cultes',
    order: 2,
    active: true,
  },
  {
    id: 'tubes-80s-90s-2000s',
    label: 'Tubes 80s/90s/2000s',
    emoji: '🎶',
    gradient: ['#0277BD', '#0288D1'],
    description: 'Hits inoubliables',
    order: 3,
    active: true,
  },
  {
    id: 'tiktok',
    label: 'Sons TikTok',
    emoji: '📱',
    gradient: ['#FF6F00', '#FFA000'],
    description: 'Tendances actuelles',
    order: 4,
    active: true,
  },
  {
    id: 'films',
    label: 'Musiques de films',
    emoji: '🎬',
    gradient: ['#1B5E20', '#388E3C'],
    description: 'Bandes originales',
    order: 5,
    active: true,
  },
];

async function initCategories() {
  console.log("🚀 Initialisation des catégories Blind Test...");

  const batch = db.batch();
  const categoriesRef = db.collection("blindtest-categories");

  for (const category of categories) {
    const categoryRef = categoriesRef.doc(category.id);
    batch.set(categoryRef, category, { merge: true });
    console.log(`✅ Catégorie "${category.label}" ajoutée`);
  }

  await batch.commit();
  console.log("✅ Toutes les catégories ont été initialisées avec succès!");
}

initCategories()
  .then(() => {
    console.log("✨ Terminé!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  });

