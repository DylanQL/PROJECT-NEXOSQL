import api from "./api";

class SubscriptionService {
  constructor() {
    this.baseURL = "/subscriptions";
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  /**
   * Get available subscription plans
   */
  async getPlans() {
    try {
      const response = await api.get(`${this.baseURL}/plans`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error getting plans:", error);
      throw error;
    }
  }

  /**
   * Get user's current subscription
   */
  async getCurrentSubscription() {
    try {
      const response = await api.get(`${this.baseURL}/current`);
      return {
        success: true,
        data: response.data.data,
        hasActiveSubscription: response.data.hasActiveSubscription,
        isInGracePeriod: response.data.isInGracePeriod,
      };
    } catch (error) {
      console.error("Error getting current subscription:", error);
      throw error;
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(planType) {
    try {
      const response = await api.post(`${this.baseURL}/create`, { planType });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  }

  /**
   * Confirm subscription after PayPal approval
   */
  async confirmSubscription(subscriptionId, token = null, payerId = null) {
    try {
      const response = await api.post(
        `${this.baseURL}/confirm/${subscriptionId}`,
        { token, payerId },
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error confirming subscription:", error);
      throw error;
    }
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(reason = "Usuario solicitó cancelación") {
    try {
      const response = await api.post(`${this.baseURL}/cancel`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  }

  /**
   * Update/Change user's subscription plan
   */
  async updateSubscription(newPlanType) {
    try {
      const response = await api.post(`${this.baseURL}/update`, {
        newPlanType,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats() {
    try {
      const response = await api.get(`${this.baseURL}/stats`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error getting subscription stats:", error);
      throw error;
    }
  }

  /**
   * Check if user has an active subscription
   */
  async hasActiveSubscription() {
    try {
      const result = await this.getCurrentSubscription();
      return result.success && result.hasActiveSubscription;
    } catch (error) {
      console.error("Error checking active subscription:", error);
      return false;
    }
  }

  /**
   * Get plan details by type
   */
  getPlanDetails(planType) {
    const plans = {
      bronce: {
        name: "Plan Bronce",
        price: 5.0,
        currency: "USD",
        description:
          "Para profesionales o micro-equipos que quieren comenzar a consultar sus bases de datos sin complicaciones.",
        features: [
          "Hasta 5 conexiones de bases de datos",
          "500 consultas mensuales con IA",
          "Consultas en lenguaje natural con IA",
          "Reportes y estadísticas en tiempo real",
          "Compatibilidad SQL/NoSQL",
        ],
        connectionLimit: 5,
        maxQueries: 500,
        color: "secondary",
      },
      plata: {
        name: "Plan Plata",
        price: 10.0,
        currency: "USD",
        description:
          "Para profesionales o micro-equipos que quieren comenzar a consultar sus bases de datos sin complicaciones.",
        features: [
          "Hasta 10 conexiones de bases de datos",
          "1,000 consultas mensuales con IA",
          "Consultas en lenguaje natural con IA",
          "Reportes y estadísticas en tiempo real",
          "Compatibilidad SQL/NoSQL",
        ],
        connectionLimit: 10,
        maxQueries: 1000,
        color: "info",
      },
      oro: {
        name: "Plan Oro",
        price: 20.0,
        currency: "USD",
        description:
          "Para profesionales o micro-equipos que quieren comenzar a consultar sus bases de datos sin complicaciones.",
        features: [
          "Hasta 20 conexiones de bases de datos",
          "2,000 consultas mensuales con IA",
          "Consultas en lenguaje natural con IA",
          "Reportes y estadísticas en tiempo real",
          "Compatibilidad SQL/NoSQL",
          "Soporte técnico prioritario para resolver dudas y consultas",
        ],
        connectionLimit: 20,
        maxQueries: 2000,
        color: "warning",
      },
    };

    return plans[planType] || null;
  }

  /**
   * Format price for display
   */
  formatPrice(price, currency = "USD") {
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  }

  /**
   * Format date for display
   */
  formatDate(date, locale = "es-ES") {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Get status badge configuration
   */
  getStatusBadge(status) {
    const statusConfig = {
      active: { variant: "success", text: "Activa" },
      pending: { variant: "warning", text: "Pendiente" },
      cancelled: { variant: "danger", text: "Cancelada" },
      suspended: { variant: "secondary", text: "Suspendida" },
      expired: { variant: "dark", text: "Expirada" },
    };

    return statusConfig[status] || { variant: "secondary", text: status };
  }

  /**
   * Get plan hierarchy level (for comparison)
   */
  getPlanLevel(planType) {
    const hierarchy = {
      bronce: 1,
      plata: 2,
      oro: 3,
    };
    return hierarchy[planType] || 0;
  }

  /**
   * Check if plan A is higher than plan B
   */
  isPlanHigher(planA, planB) {
    return this.getPlanLevel(planA) > this.getPlanLevel(planB);
  }

  /**
   * Check if plan A is lower than plan B
   */
  isPlanLower(planA, planB) {
    return this.getPlanLevel(planA) < this.getPlanLevel(planB);
  }

  /**
   * Generate PayPal return URL
   */
  getReturnUrl() {
    const baseUrl = window.location.origin;
    return `${baseUrl}/subscription/success`;
  }

  /**
   * Generate PayPal cancel URL
   */
  getCancelUrl() {
    const baseUrl = window.location.origin;
    return `${baseUrl}/subscription/cancel`;
  }

  /**
   * Handle subscription errors with user-friendly messages
   */
  getErrorMessage(error) {
    const errorMessages = {
      SUBSCRIPTION_REQUIRED:
        "Se requiere una suscripción activa para acceder a esta función.",
      INSUFFICIENT_PLAN:
        "Tu plan actual no incluye esta característica. Considera actualizar tu plan.",
      CONNECTION_LIMIT_EXCEEDED:
        "Has alcanzado el límite de conexiones para tu plan actual.",
      UNAUTHORIZED: "No tienes autorización para realizar esta acción.",
      SUBSCRIPTION_NOT_FOUND: "No se encontró la suscripción especificada.",
      INVALID_PLAN: "El plan seleccionado no es válido.",
      PAYMENT_FAILED:
        "El pago no pudo ser procesado. Verifica tu información de pago.",
    };

    if (typeof error === "string") {
      return errorMessages[error] || error;
    }

    if (error.code && errorMessages[error.code]) {
      return errorMessages[error.code];
    }

    if (error.message) {
      return error.message;
    }

    return "Ha ocurrido un error inesperado. Por favor, intenta nuevamente.";
  }

  /**
   * Check if subscription allows certain features
   */
  canAccessFeature(subscription, feature) {
    if (!subscription || subscription.status !== "active") {
      return false;
    }

    const planLevel = this.getPlanLevel(subscription.planType);

    const featureRequirements = {
      basic_connections: 1, // bronce and above
      advanced_queries: 2, // plata and above
      ai_optimization: 2, // plata and above
      unlimited_connections: 3, // oro only
      premium_support: 3, // oro only
      analytics: 3, // oro only
    };

    const requiredLevel = featureRequirements[feature];
    return requiredLevel ? planLevel >= requiredLevel : false;
  }

  /**
   * Get connection limit for current subscription
   */
  getConnectionLimit(subscription) {
    if (!subscription || subscription.status !== "active") {
      return 0; // No connections allowed without active subscription
    }

    const planDetails = this.getPlanDetails(subscription.planType);
    return planDetails ? planDetails.connectionLimit : 0;
  }

  /**
   * Verify and update pending subscriptions
   */
  async verifyPendingSubscriptions() {
    try {
      const response = await api.post(`${this.baseURL}/verify-pending`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error verifying pending subscriptions:", error);
      throw error;
    }
  }

  /**
   * Sync specific subscription with PayPal
   */
  async syncSubscription(subscriptionId) {
    try {
      const response = await api.post(`${this.baseURL}/sync/${subscriptionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error syncing subscription:", error);
      throw error;
    }
  }
}

// Export singleton instance
const subscriptionService = new SubscriptionService();
export default subscriptionService;
