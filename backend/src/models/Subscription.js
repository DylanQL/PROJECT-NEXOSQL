const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Define Subscription model
const Subscription = sequelize.define(
  "Subscription",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    planType: {
      type: DataTypes.ENUM("bronce", "plata", "oro"),
      allowNull: false,
    },
    planId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "PayPal Plan ID",
    },
    subscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: "PayPal Subscription ID",
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "active",
        "cancelled",
        "suspended",
        "expired",
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "USD",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextBillingDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paypalData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional PayPal subscription data",
    },
  },
  {
    tableName: "subscriptions",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["subscriptionId"],
      },
      {
        fields: ["status"],
      },
    ],
  },
);

// Static method to get plan details
Subscription.getPlanDetails = function (planType) {
  const plans = {
    bronce: {
      planId: "P-6C599257RD4194644NDFFPGI",
      name: "Plan Bronce",
      description: "Acceso básico a NexoSQL",
      price: 5.0,
    },
    plata: {
      planId: "P-74918607K53020936NDFFQFI",
      name: "Plan Plata",
      description: "Acceso estándar a NexoSQL",
      price: 10.0,
    },
    oro: {
      planId: "P-54096226PF034844GNDFFQTI",
      name: "Plan Oro",
      description: "Acceso completo a NexoSQL",
      price: 20.0,
    },
  };
  return plans[planType] || null;
};

// Define associations
Subscription.associate = function (models) {
  Subscription.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
};

// Instance method to check if subscription is active
Subscription.prototype.isActive = function () {
  return (
    this.status === "active" &&
    (!this.endDate || new Date() <= new Date(this.endDate))
  );
};

module.exports = Subscription;
