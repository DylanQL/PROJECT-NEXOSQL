const aiService = require('../services/aiService');
const conexionDBModel = require('../models/conexionDBModel');

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
      const { connectionId, question } = req.body;
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

      // Process the query with the AI service
      console.log('Processing AI query:', {
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

      return res.json({
        success: true,
        answer: result.answer,
        metadata: result.metadata
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
