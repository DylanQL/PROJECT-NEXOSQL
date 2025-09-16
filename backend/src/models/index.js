const { sequelize } = require('../config/database');
const User = require('./User');
const MotorDB = require('./MotorDB');
const ConexionDB = require('./ConexionDB');

// Initialize models
const initializeModels = async () => {
  try {
    // Sync all models with the database
    // In production, you might want to use { alter: true } or migrations instead of force
    await sequelize.sync({ force: false });
    console.log('All models were synchronized successfully.');

    // Initialize default database engines if they don't exist
    await initializeDefaultEngines();
  } catch (error) {
    console.error('Error synchronizing models:', error);
    throw error;
  }
};

// Initialize default database engines
const initializeDefaultEngines = async () => {
  try {
    const engines = [
      { nombre: 'MySQL', icono: 'mysql.png' },
      { nombre: 'PostgreSQL', icono: 'postgresql.png' },
      { nombre: 'SQL Server', icono: 'sqlserver.png' },
      { nombre: 'Oracle', icono: 'oracle.png' },
      { nombre: 'MariaDB', icono: 'mariadb.png' },
      { nombre: 'MongoDB', icono: 'mongodb.png' }
    ];

    for (const engine of engines) {
      await MotorDB.findOrCreate({
        where: { nombre: engine.nombre },
        defaults: engine
      });
    }
    console.log('Default database engines initialized successfully.');
  } catch (error) {
    console.error('Error initializing default database engines:', error);
  }
};

module.exports = {
  User,
  MotorDB,
  ConexionDB,
  initializeModels
};
