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
      get() {
        const value = this.getDataValue("paypalData");
        // If it's a string, parse it; if it's already an object, return as is
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch (e) {
            return null;
          }
        }
        return value;
      },
      set(value) {
        // If it's an object, stringify it; if it's already a string, keep as is
        if (typeof value === "object" && value !== null) {
          this.setDataValue("paypalData", JSON.stringify(value));
        } else {
          this.setDataValue("paypalData", value);
        }
      },
    },
    replacingSubscriptionId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment:
        "ID of the subscription that will be replaced when this one is confirmed",
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
      maxQueries: 500,
    },
    plata: {
      planId: "P-74918607K53020936NDFFQFI",
      name: "Plan Plata",
      description: "Acceso estándar a NexoSQL",
      price: 10.0,
      maxQueries: 1000,
    },
    oro: {
      planId: "P-54096226PF034844GNDFFQTI",
      name: "Plan Oro",
      description: "Acceso completo a NexoSQL",
      price: 20.0,
      maxQueries: 2000,
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

// Instance method to check if subscription is in grace period (cancelled but still has access)
Subscription.prototype.isInGracePeriod = function () {
  // Parse paypalData if it's a string
  let paypalData = this.paypalData;
  if (typeof paypalData === "string") {
    try {
      paypalData = JSON.parse(paypalData);
    } catch (e) {
      paypalData = null;
    }
  }

  return (
    this.status === "active" &&
    this.endDate &&
    new Date() <= new Date(this.endDate) &&
    // If there's paypal data indicating cancellation
    paypalData &&
    (paypalData.status === "CANCELLED" || paypalData.status === "CANCELED")
  );
};

module.exports = Subscription;
