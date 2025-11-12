const admin = require('firebase-admin');
const serviceAccount = require('../nightly-efa29-640f690f50d3.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'nightly-efa29.firebasestorage.app'
});

const bucket = admin.storage().bucket();

const assets = [
  'panda.png',
  'chatRare.png',
  'chatRare2.png',
  'crocodile.png',
  'dragon.png',
  'hibou.png',
  'licorne.png',
  'loup-rare.png',
  'ourse.png',
  'phoenix.png',
  'avart-dragon-rare.png'
];

async function generateUrls() {
  console.log('Génération des URLs pour les assets...\n');
  
  for (const asset of assets) {
    try {
      const file = bucket.file(`buy-assets/${asset}`);
      
      // Rendre le fichier public
      await file.makePublic();
      
      // Obtenir l'URL publique
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/buy-assets/${asset}`;
      
      console.log(`✅ ${asset}:`);
      console.log(`   ${publicUrl}\n`);
      
    } catch (error) {
      console.error(`❌ Erreur pour ${asset}:`, error.message);
    }
  }
}

generateUrls().then(() => {
  console.log('✅ Terminé !');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});

