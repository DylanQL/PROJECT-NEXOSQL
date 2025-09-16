const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');
const ConexionDB = require('./ConexionDB');
const MotorDB = require('./MotorDB');

/**
 * Model for database connection operations
 */
class ConexionDBModel {
  /**
   * Get all connections for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of connections
   */
  async getUserConnections(userId) {
    try {
      const connections = await ConexionDB.findAll({
        where: { user_id: userId },
        include: [
          {
            model: MotorDB,
            as: 'motor',
            attributes: ['id', 'nombre']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return connections;
    } catch (error) {
      console.error('Error in getUserConnections:', error);
      throw error;
    }
  }

  /**
   * Get a specific connection by ID for a user
   * @param {number} connectionId - Connection ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Connection object
   */
  async getConnectionById(connectionId, userId) {
    try {
      const connection = await ConexionDB.findOne({
        where: {
          id: connectionId,
          user_id: userId
        },
        include: [
          {
            model: MotorDB,
            as: 'motor',
            attributes: ['id', 'nombre']
          }
        ]
      });

      return connection;
    } catch (error) {
      console.error('Error in getConnectionById:', error);
      throw error;
    }
  }

  /**
   * Create a new connection for a user
   * @param {Object} connectionData - Connection data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created connection
   */
  async createConnection(connectionData, userId) {
    try {
      const newConnection = await ConexionDB.create({
        ...connectionData,
        user_id: userId
      });

      // Get the connection with motor information
      const connection = await this.getConnectionById(newConnection.id, userId);

      return connection;
    } catch (error) {
      console.error('Error in createConnection:', error);
      throw error;
    }
  }

  /**
   * Update a connection
   * @param {number} connectionId - Connection ID
   * @param {Object} connectionData - Updated connection data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated connection
   */
  async updateConnection(connectionId, connectionData, userId) {
    try {
      const connection = await ConexionDB.findOne({
        where: {
          id: connectionId,
          user_id: userId
        }
      });

      if (!connection) {
        throw new Error('Connection not found');
      }

      // Update connection
      await connection.update(connectionData);

      // Get the updated connection with motor information
      const updatedConnection = await this.getConnectionById(connectionId, userId);

      return updatedConnection;
    } catch (error) {
      console.error('Error in updateConnection:', error);
      throw error;
    }
  }

  /**
   * Delete a connection
   * @param {number} connectionId - Connection ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  async deleteConnection(connectionId, userId) {
    try {
      const result = await ConexionDB.destroy({
        where: {
          id: connectionId,
          user_id: userId
        }
      });

      return result > 0;
    } catch (error) {
      console.error('Error in deleteConnection:', error);
      throw error;
    }
  }

  /**
   * Search for connections by name
   * @param {string} searchTerm - Search term
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of matching connections
   */
  async searchConnections(searchTerm, userId) {
    try {
      const connections = await ConexionDB.findAll({
        where: {
          user_id: userId,
          nombre: {
            [Op.like]: `%${searchTerm}%`
          }
        },
        include: [
          {
            model: MotorDB,
            as: 'motor',
            attributes: ['id', 'nombre']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return connections;
    } catch (error) {
      console.error('Error in searchConnections:', error);
      throw error;
    }
  }
}

module.exports = new ConexionDBModel();
