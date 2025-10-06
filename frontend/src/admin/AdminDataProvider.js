import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { adminApi } from "../services/api";

const AdminDataContext = createContext();

export const AdminDataProvider = ({ children }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await adminApi.getDashboardMetrics();
    if (result.error) {
      setError(result.error);
      setMetrics(null);
    } else {
      setMetrics(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return (
    <AdminDataContext.Provider value={{ metrics, loading, error, refresh: loadMetrics }}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => useContext(AdminDataContext);
