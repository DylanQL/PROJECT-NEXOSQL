const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const AdminUser = sequelize.define(
  "AdminUser",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "admin_users",
    timestamps: true,
    hooks: {
      beforeValidate: (adminUser) => {
        if (adminUser.email) {
          adminUser.email = adminUser.email.toLowerCase();
        }
      },
      beforeUpdate: (adminUser) => {
        if (adminUser.email) {
          adminUser.email = adminUser.email.toLowerCase();
        }
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
      {
        fields: ["isActive"],
      },
    ],
  },
);

module.exports = AdminUser;
