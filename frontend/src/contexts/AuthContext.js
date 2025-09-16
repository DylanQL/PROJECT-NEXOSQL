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
  const [profileLoading, setProfileLoading] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed, user:", user?.email);
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // We'll fetch the profile in a separate effect
      } else {
        setUserProfile(null);
      }
    });

    return unsubscribe;
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
      setUserProfile(null);
      return result;
    } catch (error) {
      console.error("Error during logout:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading: loading || profileLoading,
    profileLoading,
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
