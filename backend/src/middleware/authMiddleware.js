const { admin, initializeFirebaseAdmin } = require("../config/firebase");
const User = require("../models/User");

// Initialize Firebase Admin
initializeFirebaseAdmin();

/**
 * Middleware to verify Firebase token and attach user to the request
 */
const authMiddleware = async (req, res, next) => {
  // For development mode, we can have simplified authentication
  if (process.env.NODE_ENV !== "production") {
    console.log("Development mode: Using simplified auth verification");

    // Still require the x-firebase-uid header in development
    // This ensures each user gets their own profile
    const devFirebaseUid = req.headers["x-firebase-uid"];

    if (!devFirebaseUid) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No Firebase UID provided in headers" });
    }

    req.firebaseUid = devFirebaseUid;

    // Try to find the user in our database
    try {
      let user = await User.findOne({
        where: { firebaseUid: devFirebaseUid },
      });

      // If user doesn't exist, create a temporary one for development
      if (!user) {
        const headerEmail = (req.headers["x-user-email"] || "").toLowerCase();

        console.log(
          "Development mode: Creating temporary user for",
          devFirebaseUid,
        );
        user = await User.create({
          nombres: "",
          apellidos: "",
          email: headerEmail || `dev-${devFirebaseUid}@example.com`,
          telefono: null,
          pais: null,
          firebaseUid: devFirebaseUid,
        });
      }

      req.user = user;
    } catch (err) {
      console.error("Development mode: User lookup/creation failed:", err);
      return res.status(500).json({ error: "Internal server error during authentication" });
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

module.exports = authMiddleware;
