import { initializeApp } from "firebase/app";
import { collection, doc, getDocs, getFirestore, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpkwiOl19wTGqD4YO0HEcTuqWyqaXnU5w",
  authDomain: "nightly-efa29.firebaseapp.com",
  projectId: "nightly-efa29",
};

async function resetLeaderboard() {
  console.log("🚀 Démarrage de la réinitialisation du leaderboard...\n");

  try {
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Récupérer tous les utilisateurs
    console.log("📥 Récupération de tous les utilisateurs...");
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    console.log(`✅ ${querySnapshot.size} utilisateurs trouvés\n`);

    // Compteurs pour les statistiques
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Parcourir tous les utilisateurs
    for (const userDoc of querySnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const username = userData.pseudo || userData.displayName || "Utilisateur";

      try {
        // Vérifier si l'utilisateur a des stats à réinitialiser
        const hasStats =
          (userData.gamePoints && userData.gamePoints > 0) ||
          (userData.gamesPlayed && userData.gamesPlayed > 0) ||
          (userData.gamesWon && userData.gamesWon > 0);

        if (!hasStats) {
          console.log(`⏭️  ${username} (${userId}): Aucune stat à réinitialiser`);
          skippedCount++;
          continue;
        }

        // Afficher les stats actuelles
        console.log(`\n👤 ${username} (${userId})`);
        console.log(`   Points actuels: ${userData.gamePoints || 0}`);
        console.log(`   Parties jouées: ${userData.gamesPlayed || 0}`);
        console.log(`   Parties gagnées: ${userData.gamesWon || 0}`);

        // Réinitialiser les stats
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          gamePoints: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          lastGamePlayed: null,
        });

        console.log(`   ✅ Stats réinitialisées avec succès!`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Erreur pour ${username}:`, error);
        errorCount++;
      }
    }

    // Afficher le résumé
    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ DE LA RÉINITIALISATION");
    console.log("=".repeat(60));
    console.log(`✅ Utilisateurs réinitialisés: ${successCount}`);
    console.log(`⏭️  Utilisateurs ignorés (pas de stats): ${skippedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📝 Total: ${querySnapshot.size}`);
    console.log("=".repeat(60));
    console.log("\n🎉 Réinitialisation terminée!");
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation:", error);
    process.exit(1);
  }
}

// Demander confirmation avant d'exécuter
console.log("⚠️  ATTENTION: Ce script va réinitialiser TOUS les points et parties de TOUS les utilisateurs!");
console.log("⚠️  Cette action est IRRÉVERSIBLE!\n");

// En mode développement, exécuter directement
// En production, vous pouvez ajouter une confirmation
if (process.env.CONFIRM_RESET === "yes") {
  resetLeaderboard();
} else {
  console.log("ℹ️  Pour exécuter ce script, utilisez:");
  console.log("   CONFIRM_RESET=yes bun scripts/resetLeaderboard.ts");
  console.log("   OU");
  console.log("   CONFIRM_RESET=yes node scripts/resetLeaderboard.js");
}
