import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfLbY4O9lEBGj-2l5CoSwD8h1uciJuGgk",
  authDomain: "nexosql.firebaseapp.com",
  projectId: "nexosql",
  storageBucket: "nexosql.firebasestorage.app",
  messagingSenderId: "637353041006",
  appId: "1:637353041006:web:6ae5fcde1b2a941ca89a7f",
  measurementId: "G-K3W1J997V0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize analytics but don't use the variable
getAnalytics(app);
const auth = getAuth(app);

// Function to check auth state and verify persistence
const checkAuthState = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      console.log(
        "Initial auth state check:",
        user ? "Logged in" : "Not logged in",
      );
      resolve(user);
    });
  });
};

// Initialize auth check
checkAuthState();

const googleProvider = new GoogleAuthProvider();

// Sign in with email and password
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    // Check auth state before login
    await checkAuthState();

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Store in localStorage with timestamp for additional persistence
    localStorage.setItem(
      "authUser",
      JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        timestamp: Date.now(),
        refreshToken: userCredential.user.refreshToken || null,
      }),
    );

    console.log("User logged in successfully:", userCredential.user.email);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    return { user: null, error: error.message };
  }
};

// Sign up with email and password
export const registerWithEmailAndPassword = async (email, password) => {
  try {
    // Check auth state before registration
    await checkAuthState();

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Store in localStorage with timestamp for additional persistence
    localStorage.setItem(
      "authUser",
      JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        timestamp: Date.now(),
        refreshToken: userCredential.user.refreshToken || null,
      }),
    );

    console.log("User registered successfully:", userCredential.user.email);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("Registration error:", error.code, error.message);
    return { user: null, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Check auth state before Google sign-in
    await checkAuthState();

    const userCredential = await signInWithPopup(auth, googleProvider);

    // Store in localStorage with timestamp for additional persistence
    localStorage.setItem(
      "authUser",
      JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        timestamp: Date.now(),
        refreshToken: userCredential.user.refreshToken || null,
      }),
    );

    console.log(
      "User signed in with Google successfully:",
      userCredential.user.email,
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("Google sign-in error:", error.code, error.message);
    return { user: null, error: error.message };
  }
};

// Sign out
export const logOut = async () => {
  try {
    console.log("Logging out user");
    await signOut(auth);

    // Clear all auth-related data from localStorage
    localStorage.removeItem("authUser");

    // Clear any other cached auth data that might exist
    const authCacheKeys = Object.keys(localStorage).filter(
      (key) =>
        key.startsWith("firebase:") ||
        key.includes("auth") ||
        key.includes("user"),
    );

    authCacheKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log("User logged out successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
};

// Get current user with fallback to localStorage
export const getCurrentUser = () => {
  const firebaseUser = auth.currentUser;

  // If Firebase has the user, use it
  if (firebaseUser) {
    return firebaseUser;
  }

  // Fallback to localStorage if Firebase doesn't have the user
  const storedUser = localStorage.getItem("authUser");
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    const now = Date.now();
    const timeElapsed = now - (parsedUser.timestamp || 0);

    // If stored within last 24 hours, return a simplified user object
    if (timeElapsed < 24 * 60 * 60 * 1000) {
      console.log("Using localStorage fallback for current user");
      return {
        uid: parsedUser.uid,
        email: parsedUser.email,
        isStoredUser: true, // Flag to indicate this is from localStorage
      };
    }
  }

  return null;
};

// Get auth instance
export const getAuthInstance = () => {
  // Check auth state when auth instance is requested
  checkAuthState();
  return auth;
};

export default auth;
