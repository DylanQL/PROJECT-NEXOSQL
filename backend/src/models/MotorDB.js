const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Define MotorDB model
const MotorDB = sequelize.define('MotorDB', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  icono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'motores_db',
  timestamps: true
});

module.exports = MotorDB;
