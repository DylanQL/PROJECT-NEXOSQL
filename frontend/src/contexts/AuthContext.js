import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  getAuthInstance,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  signInWithGoogle,
  logOut,
} from "../services/firebase";
import { userApi } from "../services/api";

const ADMIN_EMAIL =
  (process.env.REACT_APP_ADMIN_EMAIL || "angelo.quispe.l@tecsup.edu.pe").toLowerCase();

const getStoredAuthEmail = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) {
      return null;
    }
    const parsed = JSON.parse(storedUser);
    return parsed?.email || null;
  } catch (error) {
    console.warn("Failed to parse stored auth user", error);
    return null;
  }
};

// Create the AuthContext
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const authStateChecked = useRef(false);
  const authUnsubscribe = useRef(null);

  // Configure Firebase persistence and listen for auth state changes
  useEffect(() => {
    const initAuth = async () => {
      try {
        const auth = getAuthInstance();

        // Check localStorage for existing user
        const localStorageUser = localStorage.getItem("authUser");
        if (localStorageUser) {
          console.log(
            "Found user in localStorage, waiting for Firebase to confirm",
          );
          // We don't immediately set currentUser here - we wait for Firebase to confirm
        }

        // Set up auth state listener
        authUnsubscribe.current = auth.onAuthStateChanged((user) => {
          console.log("Auth state changed, user:", user?.email);

          if (user) {
            setCurrentUser(user);
            // Store user in localStorage for backup persistence
            localStorage.setItem(
              "authUser",
              JSON.stringify({
                uid: user.uid,
                email: user.email,
                timestamp: Date.now(),
              }),
            );
          } else {
            // Check if we have a stored user that hasn't expired (within last 24 hours)
            const storedUser = localStorage.getItem("authUser");
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              const now = Date.now();
              const timeElapsed = now - (parsedUser.timestamp || 0);

              // If less than 24 hours, try to keep using this user
              if (timeElapsed < 24 * 60 * 60 * 1000) {
                console.log(
                  "Using stored user from localStorage during auth check",
                );
                // We don't set currentUser here - wait for Firebase to confirm
              } else {
                console.log("Stored user expired, clearing");
                localStorage.removeItem("authUser");
                setCurrentUser(null);
                setUserProfile(null);
              }
            } else {
              setCurrentUser(null);
              setUserProfile(null);
            }
          }

          // Mark auth as checked - this helps prevent flashing of login screens
          authStateChecked.current = true;
          setAuthChecked(true);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initAuth();

    // Cleanup function
    return () => {
      if (authUnsubscribe.current) {
        authUnsubscribe.current();
      }
    };
  }, []);

  // Fetch user profile when currentUser changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;

      setProfileLoading(true);
      try {
        console.log("Fetching profile for user:", currentUser.uid);
        const { data, error } = await userApi.getUserProfile();

        if (error) {
          console.error("Error fetching profile:", error);
          setUserProfile(null);
        } else {
          console.log("Profile loaded:", data);
          setUserProfile(data);
        }
      } catch (error) {
        console.error("Exception fetching profile:", error);
        setUserProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  // Sign up with email and password
  const signup = async (email, password) => {
    return registerWithEmailAndPassword(email, password);
  };

  // Login with email and password
  const login = async (email, password) => {
    return loginWithEmailAndPassword(email, password);
  };

  // Login with Google
  const loginWithGoogle = async () => {
    return signInWithGoogle();
  };

  // Create user profile
  const createProfile = async (userData) => {
    try {
      console.log("Creating profile with data:", userData);
      const result = await userApi.createUser(userData);

      if (result.data && !result.error) {
        console.log("Profile created successfully:", result.data.user);
        setUserProfile(result.data.user);
      } else if (result.error) {
        console.error("Error creating profile:", result.error);
      }

      return result;
    } catch (error) {
      console.error("Exception creating profile:", error);
      return { data: null, error: error.message };
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      console.log("Updating profile with data:", userData);
      const result = await userApi.updateUserProfile(userData);

      if (result.data && !result.error) {
        console.log("Profile updated successfully:", result.data.user);
        setUserProfile(result.data.user);
      } else if (result.error) {
        console.error("Error updating profile:", result.error);
      }

      return result;
    } catch (error) {
      console.error("Exception updating profile:", error);
      return { data: null, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log("Logging out user");
      const result = await logOut();
      // Limpiar todos los estados de autenticación inmediatamente
      setCurrentUser(null);
      setUserProfile(null);
      // Limpiar cualquier dato de usuario almacenado en localStorage
      localStorage.removeItem("authUser");
      // Asegurar que isAuthenticated sea false inmediatamente
      setAuthChecked(true);
      return result;
    } catch (error) {
      console.error("Error during logout:", error);
      return { success: false, error: error.message };
    }
  };

  // Function to check if session is valid without waiting for Firebase
  const getQuickAuthStatus = () => {
    if (currentUser) return true;

    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const now = Date.now();
        const timeElapsed = now - (parsedUser.timestamp || 0);

        // If less than 24 hours, consider valid
        if (timeElapsed < 24 * 60 * 60 * 1000) {
          return true;
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("authUser");
        return false;
      }
    }

    return false;
  };

  const currentEmail = (currentUser?.email || getStoredAuthEmail() || "").toLowerCase();

  const value = {
    currentUser,
    userProfile,
    loading: loading || profileLoading,
    profileLoading,
    authChecked,
    isAuthenticated: getQuickAuthStatus(),
    isAdmin: currentEmail === ADMIN_EMAIL,
    adminEmail: ADMIN_EMAIL,
    signup,
    login,
    loginWithGoogle,
    logout,
    createProfile,
    updateProfile,
    getQuickAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
