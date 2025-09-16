const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const sql = require('mssql');
const oracledb = require('oracledb');

/**
 * Test connection to different database engines
 * @param {Object} config - Connection configuration
 * @param {string} config.type - Database type (MySQL, PostgreSQL, SQL Server, Oracle, MongoDB, MariaDB)
 * @param {string} config.host - Database host
 * @param {string} config.port - Database port
 * @param {string} config.username - Database username
 * @param {string} config.password - Database password
 * @param {string} config.database - Database name
 * @returns {Promise<Object>} Result of the connection test
 */
const testConnection = async (config) => {
  try {
    const type = config.type.toLowerCase();

    // Test connection based on database type
    if (type === 'mysql' || type === 'mariadb') {
      return await testMySQLConnection(config);
    } else if (type === 'postgresql') {
      return await testPostgreSQLConnection(config);
    } else if (type === 'sql server') {
      return await testSQLServerConnection(config);
    } else if (type === 'oracle') {
      return await testOracleConnection(config);
    } else if (type === 'mongodb') {
      return await testMongoDBConnection(config);
    } else {
      return {
        success: false,
        error: `Tipo de base de datos no soportado: ${config.type}`
      };
    }
  } catch (error) {
    console.error('Error testing connection:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al probar la conexión'
    };
  }
};

/**
 * Test MySQL/MariaDB connection
 */
const testMySQLConnection = async (config) => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      connectTimeout: 10000 // 10 seconds
    });

    await connection.query('SELECT 1');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Error de conexión a MySQL/MariaDB: ${error.message}`
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

/**
 * Test PostgreSQL connection
 */
const testPostgreSQLConnection = async (config) => {
  const pool = new Pool({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database,
    connectionTimeoutMillis: 10000 // 10 seconds
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();
    return { success: true };
  } catch (error) {
    await pool.end();
    return {
      success: false,
      error: `Error de conexión a PostgreSQL: ${error.message}`
    };
  }
};

/**
 * Test SQL Server connection
 */
const testSQLServerConnection = async (config) => {
  try {
    await sql.connect({
      server: config.host,
      port: parseInt(config.port),
      user: config.username,
      password: config.password,
      database: config.database,
      options: {
        trustServerCertificate: true,
        connectTimeout: 10000 // 10 seconds
      }
    });

    await sql.query`SELECT 1`;
    sql.close();
    return { success: true };
  } catch (error) {
    sql.close();
    return {
      success: false,
      error: `Error de conexión a SQL Server: ${error.message}`
    };
  }
};

/**
 * Test Oracle connection
 */
const testOracleConnection = async (config) => {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: config.username,
      password: config.password,
      connectString: `${config.host}:${config.port}/${config.database}`
    });

    await connection.execute('SELECT 1 FROM DUAL');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Error de conexión a Oracle: ${error.message}`
    };
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

/**
 * Test MongoDB connection
 */
const testMongoDBConnection = async (config) => {
  let client;
  try {
    const uri = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000 // 10 seconds
    });

    await client.connect();
    await client.db().admin().ping();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Error de conexión a MongoDB: ${error.message}`
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = {
  testConnection
};
