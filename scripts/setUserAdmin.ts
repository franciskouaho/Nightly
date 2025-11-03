import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpkwiOl19wTGqD4YO0HEcTuqWyqaXnU5w",
  authDomain: "nightly-efa29.firebaseapp.com",
  projectId: "nightly-efa29",
};

// Utilisation: node scripts/setUserAdmin.js <USER_UID>
// Exemple: node scripts/setUserAdmin.js abc123def456

async function setUserAdmin(userId: string) {
  console.log("\n🔧 Configuration de l'admin Firebase...\n");

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    const userRef = doc(db, "users", userId);

    // Vérifier si l'utilisateur existe
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error("❌ Erreur: Utilisateur non trouvé avec UID:", userId);
      console.log("\n💡 Assure-toi que l'utilisateur existe dans Firestore.");
      console.log("   Tu peux vérifier sur: https://console.firebase.google.com\n");
      return;
    }

    const userData = userDoc.data();
    console.log("✅ Utilisateur trouvé:");
    console.log("   - Pseudo:", userData.pseudo);
    console.log("   - UID:", userId);

    // Mettre à jour isAdmin à true
    await updateDoc(userRef, {
      isAdmin: true
    });

    console.log("\n🎉 Succès! L'utilisateur est maintenant admin.");
    console.log("   isAdmin: true\n");

    console.log("📱 L'utilisateur verra le panneau admin dans l'onglet Profil.\n");

  } catch (error: any) {
    console.error("\n❌ Erreur lors de la mise à jour:", error.message);
    console.log("\n💡 Vérifications:");
    console.log("   1. Le UID est-il correct?");
    console.log("   2. L'utilisateur existe-t-il dans Firestore?");
    console.log("   3. Les permissions Firebase sont-elles correctes?\n");
  }
}

// Récupérer l'UID depuis les arguments de ligne de commande
const userId = process.argv[2];

if (!userId) {
  console.error("\n❌ Erreur: Aucun UID fourni\n");
  console.log("Usage: node scripts/setUserAdmin.js <USER_UID>");
  console.log("\nExemple:");
  console.log("  node scripts/setUserAdmin.js abc123def456ghi789\n");
  console.log("Pour obtenir ton UID:");
  console.log("  1. Lance l'app en mode dev");
  console.log("  2. Va dans l'onglet Profil");
  console.log("  3. Ton UID s'affiche en bas (🔑 UID Firebase)\n");
  process.exit(1);
}

setUserAdmin(userId);
