import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import subscriptionService from "../services/subscriptionService";

const SubscriptionContext = createContext();

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
}

export function SubscriptionProvider({ children }) {
  const { currentUser, userProfile } = useAuth();

  // Subscription state
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [plans, setPlans] = useState({});
  const [subscriptionStats, setSubscriptionStats] = useState(null);
  const [error, setError] = useState("");
  const [autoSyncActive, setAutoSyncActive] = useState(false);
  const [autoSyncSuccess, setAutoSyncSuccess] = useState("");

  // Load subscription data when user changes
  useEffect(() => {
    if (currentUser && userProfile) {
      loadSubscriptionData();
    } else {
      resetSubscriptionState();
    }
  }, [currentUser, userProfile]);

  // Auto-sync pending subscriptions effect
  useEffect(() => {
    if (
      currentSubscription &&
      currentSubscription.status === "pending" &&
      !autoSyncActive
    ) {
      console.log("Detected pending subscription, starting auto-sync...");
      startAutoSync();
    } else if (
      (!currentSubscription || currentSubscription.status !== "pending") &&
      autoSyncActive
    ) {
      console.log("No pending subscription, stopping auto-sync...");
      stopAutoSync();
    }
  }, [currentSubscription, autoSyncActive]);

  // Cleanup auto-sync on unmount
  useEffect(() => {
    return () => {
      stopAutoSync();
    };
  }, []);

  // Reset subscription state when user logs out
  const resetSubscriptionState = () => {
    setCurrentSubscription(null);
    setHasActiveSubscription(false);
    setSubscriptionStats(null);
    setSubscriptionLoading(false);
    setError("");
  };

  // Load all subscription related data
  const loadSubscriptionData = async () => {
    try {
      setSubscriptionLoading(true);
      setError("");

      // Load plans and current subscription in parallel
      const [plansResult, subscriptionResult] = await Promise.allSettled([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentSubscription(),
      ]);

      // Handle plans result
      if (plansResult.status === "fulfilled" && plansResult.value.success) {
        setPlans(plansResult.value.data);
      }

      // Handle subscription result
      if (
        subscriptionResult.status === "fulfilled" &&
        subscriptionResult.value.success
      ) {
        setCurrentSubscription(subscriptionResult.value.data);
        setHasActiveSubscription(
          subscriptionResult.value.hasActiveSubscription,
        );
      } else {
        setCurrentSubscription(null);
        setHasActiveSubscription(false);
      }

      // Load subscription stats if user has subscription history
      if (
        subscriptionResult.status === "fulfilled" &&
        subscriptionResult.value.data
      ) {
        try {
          const statsResult = await subscriptionService.getSubscriptionStats();
          if (statsResult.success) {
            setSubscriptionStats(statsResult.data);
          }
        } catch (statsError) {
          console.warn("Could not load subscription stats:", statsError);
        }
      }
    } catch (err) {
      console.error("Error loading subscription data:", err);
      setError("Error al cargar información de suscripción");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Auto-sync functionality for pending subscriptions
  const syncPendingSubscription = async () => {
    if (!currentSubscription?.subscriptionId) return false;

    try {
      console.log(
        `Auto-syncing subscription ${currentSubscription.subscriptionId}...`,
      );
      const result = await subscriptionService.syncSubscription(
        currentSubscription.subscriptionId,
      );

      if (result.success && result.data.data.subscription.status === "active") {
        console.log("Auto-sync successful: subscription is now active");
        setAutoSyncSuccess(
          "¡Suscripción activada automáticamente! Ya puedes acceder a todas las funciones.",
        );
        await refreshSubscription();

        // Clear success message after 5 seconds
        setTimeout(() => setAutoSyncSuccess(""), 5000);

        return true;
      }
      return false;
    } catch (err) {
      console.warn("Auto-sync failed:", err.message);
      return false;
    }
  };

  // Start auto-sync interval
  const startAutoSync = () => {
    if (autoSyncActive) return;

    setAutoSyncActive(true);
    console.log("Starting auto-sync for pending subscription...");

    // Try sync immediately
    syncPendingSubscription();

    // Then check every 30 seconds
    const interval = setInterval(async () => {
      const syncSuccess = await syncPendingSubscription();
      if (syncSuccess) {
        stopAutoSync();
      }
    }, 30000); // 30 seconds

    // Store interval ID for cleanup
    window.subscriptionAutoSyncInterval = interval;

    // Stop after 10 minutes to avoid infinite loops
    setTimeout(() => {
      if (autoSyncActive) {
        console.log("Auto-sync timeout reached, stopping...");
        stopAutoSync();
      }
    }, 600000); // 10 minutes
  };

  // Stop auto-sync interval
  const stopAutoSync = () => {
    if (!autoSyncActive) return;

    setAutoSyncActive(false);
    console.log("Stopping auto-sync...");

    if (window.subscriptionAutoSyncInterval) {
      clearInterval(window.subscriptionAutoSyncInterval);
      delete window.subscriptionAutoSyncInterval;
    }
  };

  // Refresh subscription data
  const refreshSubscription = async () => {
    if (currentUser && userProfile) {
      await loadSubscriptionData();
    }
  };

  // Create new subscription
  const createSubscription = async (planType) => {
    try {
      setError("");
      const result = await subscriptionService.createSubscription(planType);

      if (result.success) {
        // Refresh subscription data after creation
        await refreshSubscription();
        return result;
      } else {
        throw new Error(result.error || "Error al crear suscripción");
      }
    } catch (err) {
      const errorMessage = subscriptionService.getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  };

  // Confirm subscription after PayPal approval
  const confirmSubscription = async (
    subscriptionId,
    token = null,
    payerId = null,
  ) => {
    try {
      setError("");
      const result = await subscriptionService.confirmSubscription(
        subscriptionId,
        token,
        payerId,
      );

      if (result.success) {
        // Refresh subscription data after confirmation
        await refreshSubscription();
        return result;
      } else {
        throw new Error(result.error || "Error al confirmar suscripción");
      }
    } catch (err) {
      const errorMessage = subscriptionService.getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  };

  // Update subscription plan
  const updateSubscription = async (newPlanType) => {
    try {
      setError("");
      const result = await subscriptionService.updateSubscription(newPlanType);

      if (result.success) {
        // Refresh subscription data after update
        await refreshSubscription();
        return result;
      } else {
        throw new Error(result.error || "Error al actualizar suscripción");
      }
    } catch (err) {
      const errorMessage = subscriptionService.getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  };

  // Cancel subscription
  const cancelSubscription = async (
    reason = "Usuario solicitó cancelación",
  ) => {
    try {
      setError("");
      const result = await subscriptionService.cancelSubscription(reason);

      if (result.success) {
        // Refresh subscription data after cancellation
        await refreshSubscription();
        return result;
      } else {
        throw new Error(result.error || "Error al cancelar suscripción");
      }
    } catch (err) {
      const errorMessage = subscriptionService.getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  };

  // Check if user can access a specific feature
  const canAccessFeature = (feature) => {
    return subscriptionService.canAccessFeature(currentSubscription, feature);
  };

  // Check if current plan is higher than specified plan
  const isPlanHigherThan = (planType) => {
    if (!currentSubscription || !hasActiveSubscription) return false;
    return subscriptionService.isPlanHigher(
      currentSubscription.planType,
      planType,
    );
  };

  // Check if current plan is lower than specified plan
  const isPlanLowerThan = (planType) => {
    if (!currentSubscription || !hasActiveSubscription) return true;
    return subscriptionService.isPlanLower(
      currentSubscription.planType,
      planType,
    );
  };

  // Get connection limit for current subscription
  const getConnectionLimit = () => {
    return subscriptionService.getConnectionLimit(currentSubscription);
  };

  // Check if user can create more connections
  const canCreateConnection = (currentConnectionCount) => {
    if (!hasActiveSubscription) return false;

    const limit = getConnectionLimit();
    if (limit === -1) return true; // unlimited

    return currentConnectionCount < limit;
  };

  // Get plan details
  const getPlanDetails = (planType) => {
    return subscriptionService.getPlanDetails(planType);
  };

  // Format price for display
  const formatPrice = (price, currency = "USD") => {
    return subscriptionService.formatPrice(price, currency);
  };

  // Format date for display
  const formatDate = (date) => {
    return subscriptionService.formatDate(date);
  };

  // Get status badge configuration
  const getStatusBadge = (status) => {
    return subscriptionService.getStatusBadge(status);
  };

  // Clear error
  const clearError = () => {
    setError("");
  };

  // Clear success notification
  const clearAutoSyncSuccess = () => {
    setAutoSyncSuccess("");
  };

  // Check if subscription is active and valid
  const isSubscriptionActive = () => {
    if (!currentSubscription) return false;

    return (
      currentSubscription.status === "active" &&
      hasActiveSubscription &&
      (!currentSubscription.endDate ||
        new Date() <= new Date(currentSubscription.endDate))
    );
  };

  // Get subscription status info
  const getSubscriptionStatusInfo = () => {
    if (!currentSubscription) {
      return {
        status: "none",
        message: "No tienes una suscripción activa",
        variant: "warning",
        canAccess: false,
      };
    }

    switch (currentSubscription.status) {
      case "active":
        return {
          status: "active",
          message: "Tu suscripción está activa",
          variant: "success",
          canAccess: true,
        };
      case "pending":
        return {
          status: "pending",
          message: "Tu suscripción está pendiente de activación",
          variant: "warning",
          canAccess: false,
        };
      case "cancelled":
        return {
          status: "cancelled",
          message: "Tu suscripción ha sido cancelada",
          variant: "danger",
          canAccess: false,
        };
      case "suspended":
        return {
          status: "suspended",
          message: "Tu suscripción está suspendida",
          variant: "danger",
          canAccess: false,
        };
      case "expired":
        return {
          status: "expired",
          message: "Tu suscripción ha expirado",
          variant: "danger",
          canAccess: false,
        };
      default:
        return {
          status: "unknown",
          message: "Estado de suscripción desconocido",
          variant: "secondary",
          canAccess: false,
        };
    }
  };

  // Get subscription expiry info
  const getExpiryInfo = () => {
    if (!currentSubscription || !currentSubscription.nextBillingDate) {
      return null;
    }

    const nextBilling = new Date(currentSubscription.nextBillingDate);
    const now = new Date();
    const daysUntilBilling = Math.ceil(
      (nextBilling - now) / (1000 * 60 * 60 * 24),
    );

    return {
      nextBillingDate: nextBilling,
      daysUntilBilling,
      isNearExpiry: daysUntilBilling <= 7,
      formatted: formatDate(nextBilling),
    };
  };

  const value = {
    // State
    currentSubscription,
    hasActiveSubscription,
    subscriptionLoading,
    plans,
    subscriptionStats,
    error,
    autoSyncActive,
    autoSyncSuccess,

    // Actions
    createSubscription,
    confirmSubscription,
    updateSubscription,
    cancelSubscription,
    refreshSubscription,
    clearError,
    clearAutoSyncSuccess,
    syncPendingSubscription,
    startAutoSync,
    stopAutoSync,

    // Helpers
    canAccessFeature,
    isPlanHigherThan,
    isPlanLowerThan,
    getConnectionLimit,
    canCreateConnection,
    getPlanDetails,
    formatPrice,
    formatDate,
    getStatusBadge,
    isSubscriptionActive,
    getSubscriptionStatusInfo,
    getExpiryInfo,

    // Service access
    subscriptionService,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
