import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCaXTVinkd4OIMqhGAXENme4tVvDUG4CzA",
  authDomain: "drink-dare.firebaseapp.com",
  projectId: "drink-dare",
  storageBucket: "drink-dare.firebasestorage.app",
  messagingSenderId: "464468295776",
  appId: "1:464468295776:web:b6b4c14e174d7b6e434305",
  measurementId: "G-78CP3RMLLH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app; 