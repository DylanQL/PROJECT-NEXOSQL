const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SupportTicket = sequelize.define(
  "SupportTicket",
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
    incidentType: {
      type: DataTypes.ENUM(
        "connection_error",
        "billing",
        "assistant_ai",
        "other",
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
      allowNull: false,
      defaultValue: "open",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "support_tickets",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["incidentType"],
      },
      {
        fields: ["status"],
      },
    ],
  },
);

SupportTicket.associate = function (models) {
  SupportTicket.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
  });
};

module.exports = SupportTicket;
