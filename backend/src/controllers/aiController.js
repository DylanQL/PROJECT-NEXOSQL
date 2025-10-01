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
      const { connectionId, question, chatId = null, threadId = null } = req.body;
      const userId = req.user.id;

      console.log('🔄 processQuery called with:', { connectionId, chatId, threadId, hasQuestion: !!question });

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

      // Usar el thread ID del frontend o generar uno nuevo
      const hiloConversacion = threadId || require('crypto').randomUUID();
      console.log('🧵 Using thread ID:', hiloConversacion);

      // Guardar el mensaje del usuario
      const userMessage = await ChatMessage.create({
        chatId: chat.id,
        type: 'user',
        content: question,
        hilo_conversacion: hiloConversacion,
      });

      console.log('💾 User message saved with thread ID:', hiloConversacion);

      // Process the query with the AI service
      console.log('Processing AI query:', {
        chatId: chat.id,
        connectionId,
        question: question.substring(0, 100) + (question.length > 100 ? '...' : ''),
        motorType: connection.motor.nombre,
        userId,
        hiloConversacion
      });

      const result = await aiService.processQuery(connection, question, hiloConversacion);

      console.log('AI processing completed:', {
        success: !!result.answer,
        hasMetadata: !!result.metadata,
        iterations: result.metadata?.iterations,
        queriesExecuted: result.metadata?.queriesExecuted
      });

      // ANTES de guardar la respuesta, verificar si el mensaje fue cancelado
      await userMessage.reload();
      
      if (userMessage.cancelado) {
        console.log('⏭️  Query was cancelled - not saving assistant response or counting query');
        
        // Guardar respuesta indicando que fue cancelada, pero NO incrementar contador
        const assistantMessage = await ChatMessage.create({
          chatId: chat.id,
          type: 'assistant',
          content: 'Consulta cancelada por el usuario',
          metadata: { cancelled: true },
          isError: false,
          cancelado: true,
          hilo_conversacion: hiloConversacion,
        });

        return res.json({
          success: true,
          cancelled: true,
          message: 'Consulta cancelada',
          chatId: chat.id,
          userMessage: {
            id: userMessage.id,
            type: 'user',
            content: question,
            hilo_conversacion: hiloConversacion,
            timestamp: userMessage.timestamp,
            cancelado: true,
          },
          assistantMessage: {
            id: assistantMessage.id,
            type: 'assistant',
            content: 'Consulta cancelada por el usuario',
            metadata: { cancelled: true },
            error: false,
            hilo_conversacion: hiloConversacion,
            timestamp: assistantMessage.timestamp,
            cancelado: true,
          }
        });
      }

      // Si NO fue cancelado, continuar normalmente
      // Guardar la respuesta del asistente
      const assistantMessage = await ChatMessage.create({
        chatId: chat.id,
        type: 'assistant',
        content: result.answer,
        metadata: result.metadata,
        isError: !result.answer || result.metadata?.error ? true : false,
        hilo_conversacion: hiloConversacion,
      });

      // Actualizar el timestamp del chat
      await chat.update({ updatedAt: new Date() });

      // Increment query counter ONLY for successful, non-cancelled queries
      if (req.userWithLimit) {
        await req.userWithLimit.incrementQueryCount();
        console.log('✅ Query counted for user:', req.userWithLimit.id);
      }

      return res.json({
        success: true,
        answer: result.answer,
        metadata: result.metadata,
        chatId: chat.id,
        userMessage: {
          id: userMessage.id,
          type: 'user',
          content: question,
          hilo_conversacion: hiloConversacion,
          timestamp: userMessage.timestamp,
        },
        assistantMessage: {
          id: assistantMessage.id,
          type: 'assistant',
          content: result.answer,
          metadata: result.metadata,
          error: assistantMessage.isError,
          hilo_conversacion: hiloConversacion,
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

  /**
   * Cancel a processing message by thread ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async cancelMessage(req, res) {
    try {
      const { hiloConversacion } = req.params;
      const userId = req.user.id;

      console.log(`🚫 Cancel request received for thread: ${hiloConversacion}, user: ${userId}`);

      if (!hiloConversacion) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un ID de hilo de conversación'
        });
      }

      // Buscar mensajes en el hilo que pertenezcan al usuario
      const messages = await ChatMessage.findAll({
        include: [{
          model: Chat,
          as: 'chat',
          where: { userId },
          attributes: ['id', 'userId']
        }],
        where: { hilo_conversacion: hiloConversacion }
      });

      console.log(`🔍 Found ${messages.length} messages for thread: ${hiloConversacion}`);

      if (messages.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Hilo de conversación no encontrado'
        });
      }

      // Obtener los IDs de los mensajes que pertenecen al usuario
      const messageIds = messages.map(msg => msg.id);
      console.log(`📝 Message IDs to cancel: ${messageIds.join(', ')}`);

      // Marcar los mensajes como cancelados usando los IDs
      const updatedCount = await ChatMessage.update(
        { cancelado: true },
        {
          where: { 
            id: messageIds,
            hilo_conversacion: hiloConversacion 
          }
        }
      );

      console.log(`✅ Successfully marked ${updatedCount[0]} messages as cancelled (cancelado=1) for thread: ${hiloConversacion}`);
      
      // Verificar que efectivamente se marcaron como cancelados
      const verification = await ChatMessage.findAll({
        where: { 
          id: messageIds,
          hilo_conversacion: hiloConversacion,
          cancelado: true 
        }
      });
      
      console.log(`🔍 Verification: Found ${verification.length} messages with cancelado=true for thread: ${hiloConversacion}`);

      return res.json({
        success: true,
        message: 'Mensajes cancelados exitosamente',
        messagesUpdated: updatedCount[0],
        messageIds: messageIds,
        hiloConversacion: hiloConversacion
      });
    } catch (error) {
      console.error('Error cancelling message:', error);
      return res.status(500).json({
        success: false,
        error: `Error al cancelar el mensaje: ${error.message}`
      });
    }
  }
}

module.exports = new AIController();