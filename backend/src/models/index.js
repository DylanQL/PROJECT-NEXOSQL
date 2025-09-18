const { sequelize } = require("../config/database");
const User = require("./User");
const MotorDB = require("./MotorDB");
const ConexionDB = require("./ConexionDB");
const Subscription = require("./Subscription");

// Initialize associations
const models = {
  User,
  MotorDB,
  ConexionDB,
  Subscription,
};

// Set up associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Initialize models
const initializeModels = async () => {
  try {
    // Determine sync options based on environment
    const syncOptions =
      process.env.NODE_ENV === "production" ? { alter: true } : { force: true }; // Force recreation in development

    console.log(`Synchronizing database models with options:`, syncOptions);

    // Sync all models with the database
    await sequelize.sync(syncOptions);
    console.log("All models were synchronized successfully.");

    // Initialize default database engines if they don't exist
    await initializeDefaultEngines();
  } catch (error) {
    console.error("Error synchronizing models:", error);
    throw error;
  }
};

// Initialize default database engines
const initializeDefaultEngines = async () => {
  try {
    const engines = [
      { nombre: "MySQL", icono: "mysql.png" },
      { nombre: "PostgreSQL", icono: "postgresql.png" },
      { nombre: "SQL Server", icono: "sqlserver.png" },
      { nombre: "Oracle", icono: "oracle.png" },
      { nombre: "MariaDB", icono: "mariadb.png" },
      { nombre: "MongoDB", icono: "mongodb.png" },
    ];

    for (const engine of engines) {
      await MotorDB.findOrCreate({
        where: { nombre: engine.nombre },
        defaults: engine,
      });
    }
    console.log("Default database engines initialized successfully.");
  } catch (error) {
    console.error("Error initializing default database engines:", error);
  }
};

module.exports = {
  User,
  MotorDB,
  ConexionDB,
  Subscription,
  initializeModels,
};
