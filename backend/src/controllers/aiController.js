const aiService = require('../services/aiService');
const conexionDBModel = require('../models/conexionDBModel');
const { Chat, ChatMessage } = require('../models');

/**
 * AI Controller for handling natural language queries to databases
 */
class AIController {
  /**
   * Process a natural language query against a database
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processQuery(req, res) {
    try {
      const { connectionId, question, chatId = null } = req.body;
      const userId = req.user.id;

      if (!connectionId) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un ID de conexión'
        });
      }

      if (!question || typeof question !== 'string' || question.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Se requiere una pregunta válida'
        });
      }

      // Get the connection details
      const connection = await conexionDBModel.getConnectionById(connectionId, userId);

      if (!connection) {
        return res.status(404).json({
          success: false,
          error: 'Conexión no encontrada'
        });
      }

      // Si se proporciona un chatId, verificar que pertenece al usuario
      let chat = null;
      if (chatId) {
        chat = await Chat.findOne({
          where: { id: chatId, userId, conexionId: connectionId },
        });

        if (!chat) {
          return res.status(404).json({
            success: false,
            error: 'Chat no encontrado o no tienes permisos para acceder a él'
          });
        }
      } else {
        // Si no se proporciona chatId, crear un nuevo chat
        chat = await Chat.create({
          userId,
          conexionId: connectionId,
          title: this.generateChatTitle(question),
        });
      }

      // Guardar el mensaje del usuario
      const userMessage = await ChatMessage.create({
        chatId: chat.id,
        type: 'user',
        content: question,
      });

      // Process the query with the AI service
      console.log('Processing AI query:', {
        chatId: chat.id,
        connectionId,
        question: question.substring(0, 100) + (question.length > 100 ? '...' : ''),
        motorType: connection.motor.nombre,
        userId
      });

      const result = await aiService.processQuery(connection, question);

      console.log('AI processing completed:', {
        success: !!result.answer,
        hasMetadata: !!result.metadata,
        iterations: result.metadata?.iterations,
        queriesExecuted: result.metadata?.queriesExecuted
      });

      // Guardar la respuesta del asistente
      const assistantMessage = await ChatMessage.create({
        chatId: chat.id,
        type: 'assistant',
        content: result.answer,
        metadata: result.metadata,
        isError: !result.answer || result.metadata?.error ? true : false,
      });

      // Actualizar el timestamp del chat
      await chat.update({ updatedAt: new Date() });

      return res.json({
        success: true,
        answer: result.answer,
        metadata: result.metadata,
        chatId: chat.id,
        userMessage: {
          id: userMessage.id,
          type: 'user',
          content: question,
          timestamp: userMessage.timestamp,
        },
        assistantMessage: {
          id: assistantMessage.id,
          type: 'assistant',
          content: result.answer,
          metadata: result.metadata,
          error: assistantMessage.isError,
          timestamp: assistantMessage.timestamp,
        }
      });
    } catch (error) {
      console.error('Error in AI controller:', {
        message: error.message,
        stack: error.stack,
        connectionId: req.body.connectionId,
        question: req.body.question?.substring(0, 100),
        userId: req.user?.id
      });

      // Provide more specific error messages
      let userFriendlyMessage = error.message;
      if (error.message.includes('formato esperado')) {
        userFriendlyMessage = 'La IA no pudo interpretar la consulta correctamente. Por favor, intenta reformular tu pregunta de manera más específica.';
      }

      return res.status(500).json({
        success: false,
        error: `Error al procesar la consulta: ${userFriendlyMessage}`
      });
    }
  }

  /**
   * Generate a chat title based on the user's question
   * @param {string} question - The user's question
   * @returns {string} - Generated title
   */
  generateChatTitle(question) {
    // Truncate to 50 characters and add ellipsis if needed
    const maxLength = 50;
    if (question.length <= maxLength) {
      return question;
    }
    return question.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get schema information for a database connection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSchemaInfo(req, res) {
    try {
      const { connectionId } = req.params;
      const userId = req.user.id;

      if (!connectionId) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un ID de conexión'
        });
      }

      // Get the connection details
      const connection = await conexionDBModel.getConnectionById(connectionId, userId);

      if (!connection) {
        return res.status(404).json({
          success: false,
          error: 'Conexión no encontrada'
        });
      }

      // Create a database client
      const dbClient = await aiService.createDatabaseClient(connection);

      try {
        // Get the schema information
        const schemaInfo = await aiService.getSchemaInfo(dbClient, connection);

        return res.json({
          success: true,
          schema: schemaInfo
        });
      } finally {
        // Close the database connection
        await aiService.closeDatabaseClient(dbClient, connection.motor.nombre);
      }
    } catch (error) {
      console.error('Error getting schema info:', error);
      return res.status(500).json({
        success: false,
        error: `Error al obtener información del esquema: ${error.message}`
      });
    }
  }
}

module.exports = new AIController();
