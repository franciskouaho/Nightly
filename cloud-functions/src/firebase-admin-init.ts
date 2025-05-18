import * as admin from 'firebase-admin';

let adminConfig = {};
try {
  // En local ou en dev, on charge le fichier de credentials
  if (process.env.FUNCTIONS_EMULATOR || process.env.NODE_ENV === 'development') {
    // @ts-ignore
    const serviceAccount = require('../serviceAccountKey.json');
    adminConfig = {
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    };
  }
} catch (e) {
  // Ignore si le fichier n'existe pas (ex: sur le cloud)
}

if (!admin.apps.length) {
  admin.initializeApp(adminConfig);
}

export { admin }; 