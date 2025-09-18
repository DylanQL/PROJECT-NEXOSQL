const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Define User model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pais: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firebaseUid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    // Other model options
    tableName: "usuarios",
    timestamps: true, // Creates createdAt and updatedAt fields
  },
);

// Define associations after model creation
User.associate = function (models) {
  User.hasMany(models.Subscription, {
    foreignKey: "userId",
    as: "subscriptions",
  });
};

// Instance method to get active subscription
User.prototype.getActiveSubscription = async function () {
  const Subscription = require("./Subscription");
  return await Subscription.findOne({
    where: {
      userId: this.id,
      status: "active",
    },
    order: [["createdAt", "DESC"]],
  });
};

// Instance method to check if user has active subscription
User.prototype.hasActiveSubscription = async function () {
  const activeSubscription = await this.getActiveSubscription();
  return activeSubscription && activeSubscription.isActive();
};

module.exports = User;
