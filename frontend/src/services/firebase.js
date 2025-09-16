import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfLbY4O9lEBGj-2l5CoSwD8h1uciJuGgk",
  authDomain: "nexosql.firebaseapp.com",
  projectId: "nexosql",
  storageBucket: "nexosql.firebasestorage.app",
  messagingSenderId: "637353041006",
  appId: "1:637353041006:web:6ae5fcde1b2a941ca89a7f",
  measurementId: "G-K3W1J997V0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Sign in with email and password
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign up with email and password
export const registerWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Get auth instance
export const getAuthInstance = () => {
  return auth;
};

export default auth;
