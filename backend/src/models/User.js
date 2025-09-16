const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  nombres: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pais: {
    type: DataTypes.STRING,
    allowNull: true
  },
  firebaseUid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  // Other model options
  tableName: 'usuarios',
  timestamps: true, // Creates createdAt and updatedAt fields
});

module.exports = User;
