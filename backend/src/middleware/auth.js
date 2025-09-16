const { admin, initializeFirebaseAdmin } = require("../config/firebase");
const User = require("../models/User");

// Initialize Firebase Admin
initializeFirebaseAdmin();

/**
 * Middleware to verify Firebase token and attach user to the request
 */
const verifyToken = async (req, res, next) => {
  // For development mode, we can bypass authentication
  if (process.env.NODE_ENV !== "production") {
    console.log("Development mode: Auth verification bypassed");
    // In development, we'll simulate a Firebase UID if one is provided in headers
    // This allows testing without actual Firebase tokens
    const devFirebaseUid =
      req.headers["x-firebase-uid"] || "dev-firebase-uid-123";
    req.firebaseUid = devFirebaseUid;

    // Try to find the user in our database
    try {
      const user = await User.findOne({
        where: { firebaseUid: devFirebaseUid },
      });
      if (user) {
        req.user = user;
      }
    } catch (err) {
      console.log("Development mode: User lookup failed, continuing anyway");
    }

    return next();
  }

  // Production mode - verify actual token
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach the Firebase user ID to the request
    req.firebaseUid = decodedToken.uid;

    // Find the user in our database
    const user = await User.findOne({
      where: { firebaseUid: decodedToken.uid },
    });

    // If user exists in our database, attach it to the request
    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

/**
 * Middleware to ensure user exists in our database
 * Should be used after verifyToken middleware
 */
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      error: "Forbidden: User profile not found. Please complete registration.",
    });
  }
  next();
};

module.exports = {
  verifyToken,
  requireUser,
};
