require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const { initializeModels } = require('./models');
const { initializeFirebaseAdmin } = require('./config/firebase');

// Set up the port
const PORT = process.env.PORT || 3001;

// Initialize the application
const initializeApp = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize models
    await initializeModels();

    // Initialize Firebase Admin SDK
    initializeFirebaseAdmin();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // In production, you might want to gracefully shut down here
  // server.close(() => process.exit(1));
});
