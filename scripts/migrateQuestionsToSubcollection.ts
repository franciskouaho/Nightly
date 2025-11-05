import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  writeBatch
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpkwiOl19wTGqD4YO0HEcTuqWyqaXnU5w",
  authDomain: "nightly-efa29.firebaseapp.com",
  projectId: "nightly-efa29",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Script de migration des questions de tableau vers sous-collection
 *
 * AVANT:
 * gameQuestions/word-guessing/translations/fr = [question1, question2, ...]
 *
 * APRÈS:
 * gameQuestions/word-guessing/questions/{autoId1} = question1
 * gameQuestions/word-guessing/questions/{autoId2} = question2
 */

const GAME_MODES = [
  'word-guessing',
  'trap-answer',
  'never-have-i-ever-hot',
  'listen-but-dont-judge',
  'truth-or-dare',
  'genius-or-liar',
  'quiz-halloween',
  'forbidden-desire',
  'double-dare',
];

const LANGUAGES = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar'];

async function migrateGameMode(gameMode: string) {
  console.log(`\n🔄 Migration de ${gameMode}...`);

  try {
    // Lire le document actuel
    const oldDocRef = doc(db, 'gameQuestions', gameMode);
    const oldDoc = await getDoc(oldDocRef);

    if (!oldDoc.exists()) {
      console.log(`⚠️  Aucune donnée trouvée pour ${gameMode}`);
      return;
    }

    const data = oldDoc.data();
    const translations = data?.translations || {};

    let totalMigrated = 0;

    // Pour chaque langue
    for (const lang of LANGUAGES) {
      const questions = translations[lang] || [];

      if (questions.length === 0) {
        console.log(`   ℹ️  Pas de questions en ${lang}`);
        continue;
      }

      console.log(`   📝 Migration de ${questions.length} questions en ${lang}...`);

      // Utiliser batch pour les performances
      const batch = writeBatch(db);
      let batchCount = 0;

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        // Créer un ID unique basé sur le gameMode, langue et index
        const questionId = `${gameMode}_${lang}_${String(i).padStart(4, '0')}`;

        // Référence vers la sous-collection
        const questionRef = doc(db, 'gameQuestions', gameMode, 'questions', questionId);

        // Ajouter les métadonnées
        const questionData = {
          ...question,
          id: questionId,
          language: lang,
          originalIndex: i,
          gameMode: gameMode,
          createdAt: new Date().toISOString(),
        };

        batch.set(questionRef, questionData);
        batchCount++;

        // Firestore limite à 500 opérations par batch
        if (batchCount >= 500) {
          await batch.commit();
          console.log(`   ✅ ${batchCount} questions sauvegardées`);
          batchCount = 0;
        }
      }

      // Commit le reste
      if (batchCount > 0) {
        await batch.commit();
        console.log(`   ✅ ${batchCount} questions sauvegardées`);
      }

      totalMigrated += questions.length;
    }

    // Marquer le document comme migré (garder l'ancien format pour rollback)
    await setDoc(oldDocRef, {
      ...data,
      migrated: true,
      migratedAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`✅ ${gameMode}: ${totalMigrated} questions migrées avec succès`);

  } catch (error) {
    console.error(`❌ Erreur lors de la migration de ${gameMode}:`, error);
    throw error;
  }
}

async function migrateAllQuestions() {
  console.log('🚀 Début de la migration des questions vers sous-collections\n');
  console.log('Cette opération va:');
  console.log('1. Lire les questions depuis le format tableau actuel');
  console.log('2. Créer des sous-collections avec IDs auto-générés');
  console.log('3. Conserver l\'ancien format pour rollback si nécessaire\n');

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  for (const gameMode of GAME_MODES) {
    try {
      await migrateGameMode(gameMode);
      successCount++;
    } catch (error) {
      console.error(`❌ Échec de migration pour ${gameMode}`);
      errorCount++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DE LA MIGRATION');
  console.log('='.repeat(60));
  console.log(`✅ Réussis: ${successCount}/${GAME_MODES.length}`);
  console.log(`❌ Échecs: ${errorCount}/${GAME_MODES.length}`);
  console.log(`⏱️  Durée: ${duration}s`);
  console.log('='.repeat(60));

  if (errorCount === 0) {
    console.log('\n🎉 Migration complétée avec succès !');
    console.log('\nProchaines étapes:');
    console.log('1. Tester l\'application pour vérifier que tout fonctionne');
    console.log('2. Si OK, vous pouvez supprimer les anciennes données (translations)');
    console.log('3. Si problème, les anciennes données sont toujours disponibles pour rollback');
  } else {
    console.log('\n⚠️  Migration complétée avec des erreurs');
    console.log('Vérifiez les logs ci-dessus pour plus de détails');
  }
}

// Exécuter la migration
migrateAllQuestions()
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
