import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAuthInstance,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  signInWithGoogle,
  logOut,
} from "../services/firebase";
import { userApi } from "../services/api";

// Create the AuthContext
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(true);

      if (user) {
        // Try to fetch user profile from our database
        try {
          const { data, error } = await userApi.getUserProfile();
          if (!error) {
            setUserProfile(data);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // If we can't get the profile, it might not exist yet
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
    const result = await userApi.createUser(userData);
    if (result.data && !result.error) {
      setUserProfile(result.data.user);
    }
    return result;
  };

  // Update user profile
  const updateProfile = async (userData) => {
    const result = await userApi.updateUserProfile(userData);
    if (result.data && !result.error) {
      setUserProfile(result.data.user);
    }
    return result;
  };

  // Logout
  const logout = async () => {
    const result = await logOut();
    setUserProfile(null);
    return result;
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    createProfile,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
