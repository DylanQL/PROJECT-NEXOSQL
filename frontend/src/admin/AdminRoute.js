import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminRoute = () => {
  const { loading, authChecked, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading || !authChecked) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Preparando panel administrativo...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default AdminRoute;
