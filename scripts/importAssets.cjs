const admin = require('firebase-admin');
const serviceAccount = require('../nightly-efa29-firebase-adminsdk-fbsvc-b77f14c08c.json');

// Initialiser Firebase Admin avec un databaseURL
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

// Désactiver les vérifications SSL pour les connexions admin (ne pas utiliser en production)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Liste des assets
const assets = [
  {
    id: 'panda',
    name: 'panda',
    cost: 100,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fpanda.png?alt=media',
    type: 'avatar',
    rarity: 'common',
    description: 'Un adorable panda'
  },
  {
    id: 'chat-rare',
    name: 'chatRare',
    cost: 150,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2FchatRare.png?alt=media',
    type: 'avatar',
    rarity: 'rare',
    description: 'Un chat mystérieux et rare'
  },
  {
    id: 'chat-rare-2',
    name: 'chatRare2',
    cost: 150,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2FchatRare2.png?alt=media',
    type: 'avatar',
    rarity: 'rare',
    description: 'Un autre chat rare'
  },
  {
    id: 'crocodile',
    name: 'crocodile',
    cost: 120,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fcrocodile.png?alt=media',
    type: 'avatar',
    rarity: 'common',
    description: 'Un crocodile féroce'
  },
  {
    id: 'dragon',
    name: 'dragon',
    cost: 200,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fdragon.png?alt=media',
    type: 'avatar',
    rarity: 'epic',
    description: 'Un dragon majestueux'
  },
  {
    id: 'hibou',
    name: 'hibou',
    cost: 100,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fhibou.png?alt=media',
    type: 'avatar',
    rarity: 'common',
    description: 'Un hibou sage'
  },
  {
    id: 'licorne',
    name: 'licorne',
    cost: 180,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Flicorne.png?alt=media',
    type: 'avatar',
    rarity: 'rare',
    description: 'Une licorne magique'
  },
  {
    id: 'loup-rare',
    name: 'loup-rare',
    cost: 170,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Floup-rare.png?alt=media',
    type: 'avatar',
    rarity: 'rare',
    description: 'Un loup rare et puissant'
  },
  {
    id: 'ourse',
    name: 'ourse',
    cost: 110,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fourse.png?alt=media',
    type: 'avatar',
    rarity: 'common',
    description: 'Une ourse protectrice'
  },
  {
    id: 'phoenix',
    name: 'phoenix',
    cost: 250,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Fphoenix.png?alt=media',
    type: 'avatar',
    rarity: 'legendary',
    description: 'Un phoenix légendaire'
  },
  {
    id: 'avatar-dragon-rare',
    name: 'avart-dragon-rare',
    cost: 220,
    image: 'https://firebasestorage.googleapis.com/v0/b/nightly-efa29.firebasestorage.app/o/buy-assets%2Favart-dragon-rare.png?alt=media',
    type: 'avatar',
    rarity: 'epic',
    description: 'Un dragon rare et puissant'
  }
];

async function importAssets() {
  console.log('🔥 Importation des assets dans Firestore...\n');

  let successCount = 0;
  let errorCount = 0;

  const batch = db.batch();

  for (const asset of assets) {
    try {
      const assetRef = db.collection('assets').doc(asset.id);
      batch.set(assetRef, asset);
      console.log(`✅ ${asset.name} (${asset.rarity}) - ${asset.cost} points`);
      successCount++;
    } catch (error) {
      console.error(`❌ Erreur pour ${asset.name}:`, error.message);
      errorCount++;
    }
  }

  try {
    await batch.commit();
    console.log('\n📊 Résumé:');
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ❌ Échecs: ${errorCount}`);
    console.log('\n🎉 Importation terminée !');
  } catch (error) {
    console.error('\n❌ Erreur lors du commit:', error.message);
  }

  process.exit(0);
}

importAssets().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
