const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Chat extends Model {
  static associate(models) {
    // Un chat pertenece a un usuario
    this.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });

    // Un chat pertenece a una conexión
    this.belongsTo(models.ConexionDB, {
      foreignKey: "conexionId",
      as: "conexion",
      onDelete: "CASCADE",
    });

    // Un chat tiene muchos mensajes
    this.hasMany(models.ChatMessage, {
      foreignKey: "chatId",
      as: "messages",
      onDelete: "CASCADE",
    });
  }
}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    conexionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "conexiones_db",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Nueva consulta",
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
    modelName: "Chat",
    tableName: "chats",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["conexionId"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

module.exports = Chat;