const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const MotorDB = require('./MotorDB');

// Define ConexionDB model
const ConexionDB = sequelize.define('ConexionDB', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  host: {
    type: DataTypes.STRING,
    allowNull: false
  },
  port: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  database_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo',
    allowNull: false
  },
  ultima_conexion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'conexiones_db',
  timestamps: true
});

// Define associations
ConexionDB.belongsTo(User, { foreignKey: 'usuarios_id', as: 'usuario' });
ConexionDB.belongsTo(MotorDB, { foreignKey: 'motores_db_id', as: 'motor' });

// These will create the foreign keys in the Conexiones_db table
User.hasMany(ConexionDB, { foreignKey: 'usuarios_id', as: 'conexiones' });
MotorDB.hasMany(ConexionDB, { foreignKey: 'motores_db_id', as: 'conexiones' });

module.exports = ConexionDB;
