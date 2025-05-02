import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCaXTVinkd4OIMqhGAXENme4tVvDUG4CzA",
  authDomain: "drink-dare.firebaseapp.com",
  projectId: "drink-dare",
  storageBucket: "drink-dare.firebasestorage.app",
  messagingSenderId: "464468295776",
  appId: "1:464468295776:web:b6b4c14e174d7b6e434305",
  measurementId: "G-78CP3RMLLH"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}

export { auth };
export default app;