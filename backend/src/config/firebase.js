require("dotenv").config();
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// Note: In production, use environment variables for all these values
const initializeFirebaseAdmin = () => {
  try {
    // Check if app is already initialized to prevent multiple initializations
    if (admin.apps.length === 0) {
      // For development/demo purposes, we'll use a non-credential setup
      // In production, you would use proper credentials
      if (
        process.env.NODE_ENV === "production" &&
        process.env.FIREBASE_PROJECT_ID
      ) {
        // For production, use environment variables
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
      } else {
        // For development, use a minimal config without real credentials
        admin.initializeApp({
          projectId: "nexosql",
        });
      }
      console.log("Firebase Admin SDK initialized successfully");
    }
    return admin;
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    // Don't throw the error for development, just return admin
    return admin;
  }
};

module.exports = {
  admin,
  initializeFirebaseAdmin,
};
