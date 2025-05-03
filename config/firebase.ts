import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB_2C6ldfZgDgDgJdWVidGu0F0GTu8mE6c",
  authDomain: "drink-dare.firebaseapp.com",
  projectId: "drink-dare",
  storageBucket: "drink-dare.firebasestorage.app",
  messagingSenderId: "464468295776",
  appId: "1:464468295776:ios:4ec80d99c2d9cf78434305"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app; 