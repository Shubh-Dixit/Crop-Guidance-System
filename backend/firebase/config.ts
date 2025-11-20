import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAn0fn56spQL0vs8bgiYk4L7XWR4eEQ3Nw",
  authDomain: "crop-5c028.firebaseapp.com",
  projectId: "crop-5c028",
  storageBucket: "crop-5c028.firebasestorage.app",
  messagingSenderId: "1070480402126",
  appId: "1:1070480402126:web:449cb856b00886c84b529f",
  measurementId: "G-Q31KELVDWP"
};
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;