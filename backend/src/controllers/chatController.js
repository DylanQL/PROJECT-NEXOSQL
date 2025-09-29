const { Chat, ChatMessage, ConexionDB } = require("../models");
const { Op } = require("sequelize");

// Helper function to safely parse metadata JSON
const parseMetadata = (metadata) => {
  if (!metadata) return null;
  if (typeof metadata === 'object') return metadata;
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch (error) {
      console.error('Error parsing metadata JSON:', error);
      return null;
    }
  }
  return null;
};

class ChatController {
  // Obtener todos los chats de un usuario para una conexión específica
  async getChatsByConnection(req, res) {
    try {
      const { conexionId } = req.params;
      const userId = req.user.id;

      // Verificar que la conexión pertenece al usuario
      const conexion = await ConexionDB.findOne({
        where: { id: conexionId, usuarios_id: userId },
      });

      if (!conexion) {
        return res.status(404).json({
          error: "Conexión no encontrada o no tienes permisos para acceder a ella",
        });
      }

      // Obtener los chats con sus mensajes
      const chats = await Chat.findAll({
        where: { userId, conexionId },
        include: [
          {
            model: ChatMessage,
            as: "messages",
            order: [["timestamp", "ASC"]],
          },
        ],
        order: [["updatedAt", "DESC"]],
      });

      // Formatear los datos para el frontend
      const formattedChats = chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chat.messages.map((message) => ({
          id: message.id,
          type: message.type,
          content: message.content,
          metadata: parseMetadata(message.metadata),
          error: message.isError,
          cancelado: message.cancelado,
          hilo_conversacion: message.hilo_conversacion,
          timestamp: message.timestamp,
        })),
      }));

      res.json({ success: true, chats: formattedChats });
    } catch (error) {
      console.error("Error getting chats:", error);
      res.status(500).json({
        error: "Error interno del servidor al obtener los chats",
      });
    }
  }

  // Crear un nuevo chat
  async createChat(req, res) {
    try {
      const { conexionId } = req.params;
      const { title = "Nueva consulta" } = req.body;
      const userId = req.user.id;

      console.log('Creating chat:', { conexionId, title, userId });

      // Verificar que la conexión pertenece al usuario
      const conexion = await ConexionDB.findOne({
        where: { id: conexionId, usuarios_id: userId },
      });

      console.log('Found connection:', conexion ? 'Yes' : 'No');

      if (!conexion) {
        return res.status(404).json({
          error: "Conexión no encontrada o no tienes permisos para acceder a ella",
        });
      }

      // Crear el nuevo chat
      const chat = await Chat.create({
        userId,
        conexionId,
        title,
      });

      console.log('Chat created successfully:', chat);
      console.log('Chat id:', chat ? chat.id : 'No id available');
      console.log('Chat object keys:', Object.keys(chat));

      res.status(201).json({
        success: true,
        chat: {
          id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          messages: [],
        },
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(500).json({
        error: "Error interno del servidor al crear el chat",
      });
    }
  }

  // Obtener un chat específico con sus mensajes
  async getChatById(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      const chat = await Chat.findOne({
        where: { id: chatId, userId },
        include: [
          {
            model: ChatMessage,
            as: "messages",
            order: [["timestamp", "ASC"]],
          },
        ],
      });

      if (!chat) {
        return res.status(404).json({
          error: "Chat no encontrado o no tienes permisos para acceder a él",
        });
      }

      const formattedChat = {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chat.messages.map((message) => ({
          id: message.id,
          type: message.type,
          content: message.content,
          metadata: parseMetadata(message.metadata),
          error: message.isError,
          cancelado: message.cancelado,
          hilo_conversacion: message.hilo_conversacion,
          timestamp: message.timestamp,
        })),
      };

      res.json({ success: true, chat: formattedChat });
    } catch (error) {
      console.error("Error getting chat:", error);
      res.status(500).json({
        error: "Error interno del servidor al obtener el chat",
      });
    }
  }

  // Actualizar el título de un chat
  async updateChatTitle(req, res) {
    try {
      const { chatId } = req.params;
      const { title } = req.body;
      const userId = req.user.id;

      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          error: "El título del chat es requerido",
        });
      }

      const chat = await Chat.findOne({
        where: { id: chatId, userId },
      });

      if (!chat) {
        return res.status(404).json({
          error: "Chat no encontrado o no tienes permisos para editarlo",
        });
      }

      await chat.update({ title: title.trim() });

      res.json({
        success: true,
        chat: {
          id: chat.id,
          title: chat.title,
          updatedAt: chat.updatedAt,
        },
      });
    } catch (error) {
      console.error("Error updating chat title:", error);
      res.status(500).json({
        error: "Error interno del servidor al actualizar el chat",
      });
    }
  }

  // Eliminar un chat
  async deleteChat(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      const chat = await Chat.findOne({
        where: { id: chatId, userId },
      });

      if (!chat) {
        return res.status(404).json({
          error: "Chat no encontrado o no tienes permisos para eliminarlo",
        });
      }

      await chat.destroy();

      res.json({ success: true, message: "Chat eliminado exitosamente" });
    } catch (error) {
      console.error("Error deleting chat:", error);
      res.status(500).json({
        error: "Error interno del servidor al eliminar el chat",
      });
    }
  }

  // Agregar un mensaje a un chat
  async addMessage(req, res) {
    try {
      const { chatId } = req.params;
      const { type, content, metadata = null, isError = false, hilo_conversacion = null } = req.body;
      const userId = req.user.id;

      // Validar datos requeridos
      if (!type || !content) {
        return res.status(400).json({
          error: "El tipo y contenido del mensaje son requeridos",
        });
      }

      if (!["user", "assistant"].includes(type)) {
        return res.status(400).json({
          error: "El tipo de mensaje debe ser 'user' o 'assistant'",
        });
      }

      // Verificar que el chat pertenece al usuario
      const chat = await Chat.findOne({
        where: { id: chatId, userId },
      });

      if (!chat) {
        return res.status(404).json({
          error: "Chat no encontrado o no tienes permisos para acceder a él",
        });
      }

      // Crear el mensaje
      const message = await ChatMessage.create({
        chatId,
        type,
        content,
        metadata,
        isError,
        hilo_conversacion,
      });

      // Actualizar la fecha de modificación del chat
      await chat.update({ updatedAt: new Date() });

      res.status(201).json({
        success: true,
        message: {
          id: message.id,
          type: message.type,
          content: message.content,
          metadata: parseMetadata(message.metadata),
          error: message.isError,
          cancelado: message.cancelado,
          hilo_conversacion: message.hilo_conversacion,
          timestamp: message.timestamp,
        },
      });
    } catch (error) {
      console.error("Error adding message:", error);
      res.status(500).json({
        error: "Error interno del servidor al agregar el mensaje",
      });
    }
  }

  // Migrar chats desde localStorage (función auxiliar para migración de datos existentes)
  async migrateLocalStorageChats(req, res) {
    try {
      const { chatsData } = req.body; // Datos de localStorage del frontend
      const userId = req.user.id;

      if (!chatsData || typeof chatsData !== "object") {
        return res.status(400).json({
          error: "Datos de chats inválidos",
        });
      }

      const migratedChats = [];

      for (const [conexionId, localChats] of Object.entries(chatsData)) {
        // Verificar que la conexión existe y pertenece al usuario
        const conexion = await ConexionDB.findOne({
          where: { id: conexionId, userId },
        });

        if (!conexion) {
          continue; // Saltar conexiones que no existen o no pertenecen al usuario
        }

        for (const localChat of localChats) {
          // Crear el chat en la base de datos
          const chat = await Chat.create({
            userId,
            conexionId,
            title: localChat.title || "Nueva consulta",
            createdAt: localChat.createdAt || new Date(),
            updatedAt: localChat.updatedAt || new Date(),
          });

          // Crear los mensajes del chat
          if (localChat.messages && Array.isArray(localChat.messages)) {
            for (const message of localChat.messages) {
              await ChatMessage.create({
                chatId: chat.id,
                type: message.type,
                content: message.content,
                metadata: message.metadata || null,
                isError: message.error || false,
                timestamp: message.timestamp || new Date(),
              });
            }
          }

          migratedChats.push(chat.id);
        }
      }

      res.json({
        success: true,
        message: `Se migraron exitosamente ${migratedChats.length} chats`,
        migratedChatIds: migratedChats,
      });
    } catch (error) {
      console.error("Error migrating chats:", error);
      res.status(500).json({
        error: "Error interno del servidor durante la migración",
      });
    }
  }
}

module.exports = new ChatController();