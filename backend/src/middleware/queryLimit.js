const User = require('../models/User');
const Subscription = require('../models/Subscription');

/**
 * Middleware to check if user has reached their monthly query limit
 */
const checkQueryLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get the user with fresh data
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    // Check if user has an active subscription
    const activeSubscription = await user.getActiveSubscription();
    
    if (!activeSubscription) {
      return res.status(403).json({
        success: false,
        error: 'Necesitas una suscripción activa para realizar consultas',
        code: 'NO_SUBSCRIPTION'
      });
    }
    
    // Reset counter if needed and check limit
    await user.resetMonthlyQueriesIfNeeded();
    await user.reload(); // Reload to get updated values
    
    const planDetails = Subscription.getPlanDetails(activeSubscription.planType);
    const maxQueries = planDetails?.maxQueries || 0;
    
    if (user.monthly_queries_used >= maxQueries) {
      return res.status(429).json({
        success: false,
        error: `Has alcanzado el límite de ${maxQueries} consultas mensuales para tu plan ${activeSubscription.planType}`,
        code: 'QUERY_LIMIT_REACHED',
        data: {
          used: user.monthly_queries_used,
          limit: maxQueries,
          planType: activeSubscription.planType
        }
      });
    }
    
    // Attach user to request for later use
    req.userWithLimit = user;
    
    next();
  } catch (error) {
    console.error('Error checking query limit:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al verificar el límite de consultas'
    });
  }
};

module.exports = { checkQueryLimit };
