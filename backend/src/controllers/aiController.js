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
      const result = await aiService.processQuery(connection, question);

      return res.json({
        success: true,
        answer: result.answer,
        metadata: result.metadata
      });
    } catch (error) {
      console.error('Error in AI controller:', error);
      return res.status(500).json({
        success: false,
        error: `Error al procesar la consulta: ${error.message}`
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
