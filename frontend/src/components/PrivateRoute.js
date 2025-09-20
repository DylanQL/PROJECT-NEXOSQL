import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// This component checks if the user is authenticated
// If authenticated, it renders the child components
// If not, it redirects to the login page
const PrivateRoute = ({ requireProfile = false }) => {
  const {
    currentUser,
    userProfile,
    loading,
    isAuthenticated,
    getQuickAuthStatus,
  } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);
  const location = useLocation();

  // On component mount, check if we need to prevent immediate redirects
  useEffect(() => {
    // Check localStorage first for immediate rendering decision
    const quickAuthCheck = getQuickAuthStatus();

    if (quickAuthCheck) {
      // User has a valid session stored, don't redirect
      setInitialLoad(false);
    } else {
      // Wait a bit to ensure Firebase has time to restore the session
      const timer = setTimeout(() => {
        setInitialLoad(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [getQuickAuthStatus]);

  // During initial load or while auth is checking, show loading
  if (loading || initialLoad) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Verificando sesión...</p>
      </div>
    );
  }

  // Store the current location to redirect back after login
  const currentPath = location.pathname;

  // Use the enhanced authentication check
  const userIsAuthenticated = isAuthenticated || currentUser;

  // If we require a complete profile, check both authentication and profile existence
  if (requireProfile) {
    return userIsAuthenticated && userProfile ? (
      <Outlet />
    ) : (
      <Navigate to="/login" state={{ from: currentPath }} />
    );
  }

  // Otherwise just check if the user is logged in
  return userIsAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: currentPath }} />
  );
};

export default PrivateRoute;
