/**
 * Firebase Configuration
 * Spurz.ai - Development Setup for Expo Go
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCThNe8EX33Rh9ZNoP7LKh3K0hfKKsjjow",
  authDomain: "spurz-ai.firebaseapp.com",
  projectId: "spurz-ai",
  storageBucket: "spurz-ai.firebasestorage.app",
  messagingSenderId: "366879447090",
  appId: "1:366879447090:web:5db4f6eb123eb3744e842b",
  measurementId: "G-B2Y0R8MRSK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
export default app;
