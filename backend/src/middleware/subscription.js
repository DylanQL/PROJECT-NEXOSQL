const { User, Subscription } = require("../models");

/**
 * Middleware to check if user has an active subscription
 */
const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Usuario no autenticado",
        code: "UNAUTHORIZED",
      });
    }

    const hasActiveSubscription = await req.user.hasActiveSubscription();

    if (!hasActiveSubscription) {
      return res.status(403).json({
        success: false,
        error: "Se requiere una suscripción activa para acceder a esta función",
        message:
          "Para continuar usando NexoSQL, necesitas una suscripción activa. Ve a tu perfil para suscribirte.",
        code: "SUBSCRIPTION_REQUIRED",
        redirectTo: "/subscriptions",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking subscription access:", error);
    res.status(500).json({
      success: false,
      error: "Error al verificar la suscripción",
      code: "SUBSCRIPTION_CHECK_ERROR",
    });
  }
};

/**
 * Middleware to check subscription and add subscription info to request
 */
const checkSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const activeSubscription = await req.user.getActiveSubscription();

    req.subscription = {
      hasActive: !!activeSubscription,
      current: activeSubscription,
      planType: activeSubscription?.planType || null,
      status: activeSubscription?.status || null,
    };

    next();
  } catch (error) {
    console.error("Error checking subscription:", error);
    // Don't fail the request, just continue without subscription info
    req.subscription = {
      hasActive: false,
      current: null,
      planType: null,
      status: null,
    };
    next();
  }
};

/**
 * Middleware to check if user can access based on plan type
 */
const requirePlan = (minPlanType) => {
  const planHierarchy = {
    bronce: 1,
    plata: 2,
    oro: 3,
  };

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
          code: "UNAUTHORIZED",
        });
      }

      const activeSubscription = await req.user.getActiveSubscription();

      if (!activeSubscription || !activeSubscription.isActive()) {
        return res.status(403).json({
          success: false,
          error: "Se requiere una suscripción activa",
          code: "SUBSCRIPTION_REQUIRED",
          redirectTo: "/subscriptions",
        });
      }

      const userPlanLevel = planHierarchy[activeSubscription.planType] || 0;
      const requiredPlanLevel = planHierarchy[minPlanType] || 999;

      if (userPlanLevel < requiredPlanLevel) {
        return res.status(403).json({
          success: false,
          error: `Se requiere al menos el plan ${minPlanType.charAt(0).toUpperCase() + minPlanType.slice(1)} para acceder a esta función`,
          message: `Tu plan actual (${activeSubscription.planType.charAt(0).toUpperCase() + activeSubscription.planType.slice(1)}) no incluye esta característica.`,
          code: "INSUFFICIENT_PLAN",
          currentPlan: activeSubscription.planType,
          requiredPlan: minPlanType,
          redirectTo: "/subscriptions",
        });
      }

      next();
    } catch (error) {
      console.error("Error checking plan access:", error);
      res.status(500).json({
        success: false,
        error: "Error al verificar el plan de suscripción",
        code: "PLAN_CHECK_ERROR",
      });
    }
  };
};

/**
 * Middleware to check connection limits based on plan
 */
const checkConnectionLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Usuario no autenticado",
        code: "UNAUTHORIZED",
      });
    }

    const activeSubscription = await req.user.getActiveSubscription();

    if (!activeSubscription || !activeSubscription.isActive()) {
      return res.status(403).json({
        success: false,
        error: "Se requiere una suscripción activa",
        code: "SUBSCRIPTION_REQUIRED",
        redirectTo: "/subscriptions",
      });
    }

    // Define connection limits per plan
    const connectionLimits = {
      bronce: 5,
      plata: 10,
      oro: 20,
    };

    const limit = connectionLimits[activeSubscription.planType];

    // Check current connection count
    const { ConexionDB } = require("../models");
    const currentConnections = await ConexionDB.count({
      where: { usuarios_id: req.user.id },
    });

    if (currentConnections >= limit) {
      return res.status(403).json({
        success: false,
        error: `Has alcanzado el límite de conexiones para tu plan ${activeSubscription.planType.charAt(0).toUpperCase() + activeSubscription.planType.slice(1)}`,
        message: `Tu plan permite máximo ${limit} conexiones. Considera actualizar tu plan para tener más conexiones.`,
        code: "CONNECTION_LIMIT_EXCEEDED",
        currentPlan: activeSubscription.planType,
        limit: limit,
        currentCount: currentConnections,
        redirectTo: "/subscriptions",
      });
    }

    // Add connection info to request for use in controllers
    req.connectionInfo = {
      limit: limit,
      current: currentConnections,
      remaining: limit - currentConnections,
    };

    next();
  } catch (error) {
    console.error("Error checking connection limit:", error);
    res.status(500).json({
      success: false,
      error: "Error al verificar el límite de conexiones",
      code: "CONNECTION_LIMIT_CHECK_ERROR",
    });
  }
};

module.exports = {
  requireActiveSubscription,
  checkSubscription,
  requirePlan,
  checkConnectionLimit,
};
