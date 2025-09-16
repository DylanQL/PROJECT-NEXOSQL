import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// This component checks if the user is authenticated
// If authenticated, it renders the child components
// If not, it redirects to the login page
const PrivateRoute = ({ requireProfile = false }) => {
  const { currentUser, userProfile, loading } = useAuth();

  // If still loading, we could show a loading spinner
  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  // If we require a complete profile, check both authentication and profile existence
  if (requireProfile) {
    return currentUser && userProfile ? <Outlet /> : <Navigate to="/login" />;
  }

  // Otherwise just check if the user is logged in
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
