const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class ChatMessage extends Model {
  static associate(models) {
    // Un mensaje pertenece a un chat
    this.belongsTo(models.Chat, {
      foreignKey: "chatId",
      as: "chat",
      onDelete: "CASCADE",
    });
  }
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "chats",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM("user", "assistant"),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Almacena metadatos como SQL generado, tiempos de ejecución, etc.",
    },
    isError: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ChatMessage",
    tableName: "chat_messages",
    timestamps: true,
    indexes: [
      {
        fields: ["chatId"],
      },
      {
        fields: ["timestamp"],
      },
      {
        fields: ["type"],
      },
    ],
  }
);

module.exports = ChatMessage;