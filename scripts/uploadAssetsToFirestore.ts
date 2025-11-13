import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account
const serviceAccountPath = path.join(__dirname, "..", "nightly-efa29-640f690f50d3.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "nightly-efa29.firebasestorage.app",
});

const db = admin.firestore();

// Liste des assets avec leurs métadonnées
const assets = [
  {
    id: "panda",
    name: "panda",
    cost: 100,
    image:
      "https://storage.googleapis.com/nightly-efa29.firebasestorage.app/buy-assets/panda.png",
    type: "avatar",
    rarity: "common",
    description: "Un adorable panda",
  },
  {
    id: "chat-rare",
    name: "chatRare",
    cost: 150,
    image:
      "https://storage.googleapis.com/nightly-efa29.firebasestorage.app/buy-assets/chatRare.png",
    type: "avatar",
    rarity: "rare",
    description: "Un chat mystérieux et rare",
  },
  {
    id: "chat-rare-2",
    name: "chatRare2",
    cost: 150,
    image:
      "https://storage.googleapis.com/nightly-efa29.firebasestorage.app/buy-assets/chatRare2.png",
    type: "avatar",
    rarity: "rare",
    description: "Un autre chat rare",
  },
  {
    id: "crocodile",
    name: "crocodile",
    cost: 120,
    image:
      "https://storage.googleapis.com/nightly-efa29.firebasestorage.app/buy-assets/crocodile.png",
    type: "avatar",
    rarity: "common",
    description: "Un crocodile féroce",
  },
  {
    id: "dragon",
    name: "dragon",
    cost: 200,
    image:
      "https://storage.googleapis.com/nightly-efa29.firebasestorage.app/buy-assets/dragon.png",
    type: "avatar",
    rarity: "epic",
    description: "Un dragon majestueux",
  },
  {
    id: "hibou",
    name: "hibou",
    cost: 100,
    image:
      "https://storage.googleapis.com/nightly-efa29.firebasestorage.app/buy-assets/hibou.png",
    type: "avatar",
    rarity: "common",
    description: "Un hibou sage",
  },
  {
    id: "licorne",
    name: "licorne",
    cost: 180,
    image:
      "https://storage.googleapis.com/nightly-efa29.firebasestorage.app/buy-assets/licorne.png",
    type: "avatar",
    rarity: "rare",
    description: "Une licorne magique",
  },
  {
    id: "loup-rare",
    name: "loup-rare",
    cost: 170,
    image:
      "https://storage.googleapis.com/nightly-efa29.firebasestorage.app/buy-assets/loup-rare.png",
    type: "avatar",
    rarity: "rare",
    description: "Un loup rare et puissant",
  },
  {
    id: "ourse",
    name: "ourse",
    cost: 110,
    image:
      "https://storage.googleapis.com/nightly-efa29.firebasestorage.app/buy-assets/ourse.png",
    type: "avatar",
    rarity: "common",
    description: "Une ourse protectrice",
  },
  {
    id: "phoenix",
    name: "phoenix",
    cost: 250,
    image:
      "https://storage.googleapis.com/nightly-efa29.firebasestorage.app/buy-assets/phoenix.png",
    type: "avatar",
    rarity: "legendary",
    description: "Un phoenix légendaire",
  },
  {
    id: "avatar-dragon-rare",
    name: "avart-dragon-rare",
    cost: 220,
    image:
      "https://storage.googleapis.com/nightly-efa29.firebasestorage.app/buy-assets/avart-dragon-rare.png",
    type: "avatar",
    rarity: "epic",
    description: "Un dragon rare et puissant",
  },
];

async function uploadAssets() {
  console.log("🔥 Initialisation de Firebase Admin...");
  console.log("📦 Upload des assets vers Firestore...\n");

  let successCount = 0;
  let errorCount = 0;

  for (const asset of assets) {
    try {
      await db.collection("assets").doc(asset.id).set(asset);
      console.log(`✅ ${asset.name} (${asset.rarity}) - ${asset.cost} points`);
      successCount++;
    } catch (error) {
      console.error(`❌ Erreur pour ${asset.name}:`, error);
      errorCount++;
    }
  }

  console.log("\n📊 Résumé:");
  console.log(`   ✅ Succès: ${successCount}`);
  console.log(`   ❌ Échecs: ${errorCount}`);
  console.log("\n🎉 Terminé !");
}

uploadAssets()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
