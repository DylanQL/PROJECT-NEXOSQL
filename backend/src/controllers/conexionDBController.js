const { ConexionDB, MotorDB, User } = require("../models");
const { testConnection } = require("../utils/databaseTester");

/**
 * Get all connections for the current user
 */
const getUserConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const conexiones = await ConexionDB.findAll({
      where: { usuarios_id: userId },
      include: [
        {
          model: MotorDB,
          as: "motor",
          attributes: ["id", "nombre", "icono"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Don't return password in the response
    const conexionesSinPassword = conexiones.map((conexion) => {
      const conexionObj = conexion.toJSON();
      delete conexionObj.password;
      return conexionObj;
    });

    return res.status(200).json({
      success: true,
      data: conexionesSinPassword,
    });
  } catch (error) {
    console.error("Error fetching user connections:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener las conexiones del usuario",
    });
  }
};

/**
 * Get a specific connection by ID
 */
const getConnectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conexion = await ConexionDB.findOne({
      where: {
        id: id,
        usuarios_id: userId, // Ensure user only accesses their own connections
      },
      include: [
        {
          model: MotorDB,
          as: "motor",
          attributes: ["id", "nombre", "icono"],
        },
      ],
    });

    if (!conexion) {
      return res.status(404).json({ error: "Conexión no encontrada" });
    }

    // Don't return password in the response
    const conexionSinPassword = conexion.toJSON();
    delete conexionSinPassword.password;

    return res.status(200).json(conexionSinPassword);
  } catch (error) {
    console.error("Error fetching connection:", error);
    return res.status(500).json({ error: "Error al obtener la conexión" });
  }
};

/**
 * Create a new database connection
 */
const createConnection = async (req, res) => {
  try {
    const {
      nombre,
      motores_db_id,
      host,
      port,
      username,
      password,
      database_name,
    } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (
      !nombre ||
      !motores_db_id ||
      !host ||
      !port ||
      !username ||
      !password ||
      !database_name
    ) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Check if motor exists
    const motor = await MotorDB.findByPk(motores_db_id);
    if (!motor) {
      return res
        .status(404)
        .json({ error: "Motor de base de datos no encontrado" });
    }

    // Create the connection
    const nuevaConexion = await ConexionDB.create({
      nombre,
      motores_db_id,
      usuarios_id: userId,
      host,
      port,
      username,
      password,
      database_name,
      estado: "activo",
    });

    // Return the created connection without password
    const conexionSinPassword = nuevaConexion.toJSON();
    delete conexionSinPassword.password;

    return res.status(201).json({
      message: "Conexión creada exitosamente",
      conexion: conexionSinPassword,
    });
  } catch (error) {
    console.error("Error creating connection:", error);
    return res.status(500).json({ error: "Error al crear la conexión" });
  }
};

/**
 * Update an existing connection
 */
const updateConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      motores_db_id,
      host,
      port,
      username,
      password,
      database_name,
      estado,
    } = req.body;
    const userId = req.user.id;

    // Find the connection and ensure it belongs to the user
    const conexion = await ConexionDB.findOne({
      where: {
        id: id,
        usuarios_id: userId,
      },
    });

    if (!conexion) {
      return res.status(404).json({ error: "Conexión no encontrada" });
    }

    // Update fields if provided
    if (nombre) conexion.nombre = nombre;
    if (motores_db_id) {
      // Check if motor exists
      const motor = await MotorDB.findByPk(motores_db_id);
      if (!motor) {
        return res
          .status(404)
          .json({ error: "Motor de base de datos no encontrado" });
      }
      conexion.motores_db_id = motores_db_id;
    }
    if (host) conexion.host = host;
    if (port) conexion.port = port;
    if (username) conexion.username = username;
    // Solo actualizar contraseña si se proporciona una (no vacía)
    if (password !== undefined && password !== "") conexion.password = password;
    if (database_name) conexion.database_name = database_name;
    if (estado) conexion.estado = estado;

    await conexion.save();

    // Return updated connection without password
    const conexionSinPassword = conexion.toJSON();
    delete conexionSinPassword.password;

    return res.status(200).json({
      message: "Conexión actualizada exitosamente",
      conexion: conexionSinPassword,
    });
  } catch (error) {
    console.error("Error updating connection:", error);
    return res.status(500).json({ error: "Error al actualizar la conexión" });
  }
};

/**
 * Delete a connection
 */
const deleteConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the connection and ensure it belongs to the user
    const conexion = await ConexionDB.findOne({
      where: {
        id: id,
        usuarios_id: userId,
      },
    });

    if (!conexion) {
      return res.status(404).json({ error: "Conexión no encontrada" });
    }

    // Delete the connection
    await conexion.destroy();

    return res.status(200).json({ message: "Conexión eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting connection:", error);
    return res.status(500).json({ error: "Error al eliminar la conexión" });
  }
};

/**
 * Test a database connection
 */
const testDatabaseConnection = async (req, res) => {
  try {
    const {
      motores_db_id,
      host,
      port,
      username,
      password,
      database_name,
      connectionId,
    } = req.body;

    // Check if motor exists
    const motor = await MotorDB.findByPk(motores_db_id);
    if (!motor) {
      return res
        .status(404)
        .json({ error: "Motor de base de datos no encontrado" });
    }

    // Si estamos editando una conexión existente y no se proporcionó contraseña,
    // obtener la contraseña almacenada de la conexión existente
    let testPassword = password;
    if ((password === "" || !password) && connectionId) {
      const existingConnection = await ConexionDB.findByPk(connectionId);
      if (existingConnection) {
        testPassword = existingConnection.password;
      }
    }

    // Test the connection
    const result = await testConnection({
      type: motor.nombre,
      host,
      port,
      username,
      password: testPassword,
      database: database_name,
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Conexión exitosa a la base de datos",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || "Error al conectar a la base de datos",
      });
    }
  } catch (error) {
    console.error("Error testing database connection:", error);
    return res.status(500).json({
      success: false,
      error: "Error al probar la conexión a la base de datos",
    });
  }
};

module.exports = {
  getUserConnections,
  getConnectionById,
  createConnection,
  updateConnection,
  deleteConnection,
  testDatabaseConnection,
};
