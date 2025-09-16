/**
 * Middleware to ensure user has a complete profile in the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const profileMiddleware = (req, res, next) => {
  // Check if the user object exists in the request
  // This should be set by the authMiddleware
  if (!req.user) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: User profile not found. Please complete registration.'
    });
  }

  // Verify that user has all required profile fields
  const { nombres, apellidos, email } = req.user;

  if (!nombres || !apellidos || !email) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Incomplete user profile. Please complete your profile information.'
    });
  }

  // User has a complete profile, proceed to the next middleware/route handler
  next();
};

module.exports = profileMiddleware;
