const { sequelize } = require('../config/database');
const User = require('./User');

// Initialize models
const initializeModels = async () => {
  try {
    // Sync all models with the database
    // In production, you might want to use { alter: true } or migrations instead of force
    await sequelize.sync({ force: false });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models:', error);
    throw error;
  }
};

module.exports = {
  User,
  initializeModels
};
