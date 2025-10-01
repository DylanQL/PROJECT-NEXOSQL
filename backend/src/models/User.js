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
    monthly_queries_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Número de consultas utilizadas en el mes actual',
    },
    queries_reset_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha del último reseteo del contador de consultas',
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

// Instance method to reset monthly queries if needed
User.prototype.resetMonthlyQueriesIfNeeded = async function () {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format
  
  // If no reset date or different month, reset the counter
  if (!this.queries_reset_date || 
      this.queries_reset_date.toString().slice(0, 7) !== currentMonth) {
    await this.update({
      monthly_queries_used: 0,
      queries_reset_date: now,
    });
  }
};

// Instance method to check if user has reached query limit
User.prototype.hasReachedQueryLimit = async function () {
  await this.resetMonthlyQueriesIfNeeded();
  
  const activeSubscription = await this.getActiveSubscription();
  if (!activeSubscription) {
    return true; // No subscription means no queries allowed
  }
  
  const Subscription = require('./Subscription');
  const planDetails = Subscription.getPlanDetails(activeSubscription.planType);
  const maxQueries = planDetails?.maxQueries || 0;
  
  return this.monthly_queries_used >= maxQueries;
};

// Instance method to increment query counter
User.prototype.incrementQueryCount = async function () {
  await this.resetMonthlyQueriesIfNeeded();
  await this.increment('monthly_queries_used');
};

// Instance method to get remaining queries
User.prototype.getRemainingQueries = async function () {
  await this.resetMonthlyQueriesIfNeeded();
  
  const activeSubscription = await this.getActiveSubscription();
  if (!activeSubscription) {
    return 0;
  }
  
  const Subscription = require('./Subscription');
  const planDetails = Subscription.getPlanDetails(activeSubscription.planType);
  const maxQueries = planDetails?.maxQueries || 0;
  
  return Math.max(0, maxQueries - this.monthly_queries_used);
};

module.exports = User;
