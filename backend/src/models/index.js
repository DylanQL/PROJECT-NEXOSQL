const { sequelize } = require("../config/database");
const User = require("./User");
const MotorDB = require("./MotorDB");
const ConexionDB = require("./ConexionDB");
const Subscription = require("./Subscription");
const Chat = require("./Chat");
const ChatMessage = require("./ChatMessage");
const AdminUser = require("./AdminUser");
const SupportTicket = require("./SupportTicket");

// Initialize associations
const models = {
  User,
  MotorDB,
  ConexionDB,
  Subscription,
  Chat,
  ChatMessage,
  AdminUser,
  SupportTicket,
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
    await initializeDefaultAdmins();
  } catch (error) {
    console.error("Error synchronizing models:", error);
    throw error;
  }
};

// Initialize default database engines
const initializeDefaultEngines = async () => {
  try {
    const engines = [
      { nombre: "MySQL" },
      { nombre: "PostgreSQL" },
      { nombre: "SQL Server" },
      { nombre: "Oracle" },
      { nombre: "MariaDB" },
      { nombre: "MongoDB" },
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

const initializeDefaultAdmins = async () => {
  try {
    const defaultAdminEmail = process.env.ADMIN_EMAIL || process.env.DEFAULT_ADMIN_EMAIL;

    if (!defaultAdminEmail) {
      return;
    }

    await AdminUser.findOrCreate({
      where: { email: defaultAdminEmail.toLowerCase() },
      defaults: {
        name: "Administrador principal",
        isActive: true,
      },
    });
  } catch (error) {
    console.error("Error initializing default admin users:", error);
  }
};

module.exports = {
  User,
  MotorDB,
  ConexionDB,
  Subscription,
  Chat,
  ChatMessage,
  AdminUser,
  SupportTicket,
  initializeModels,
};
