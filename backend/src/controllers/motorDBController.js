const { MotorDB } = require("../models");

/**
 * Get all database engines
 */
const getAllMotores = async (req, res) => {
  try {
    const motores = await MotorDB.findAll({
      order: [["nombre", "ASC"]],
    });

    return res.status(200).json(motores);
  } catch (error) {
    console.error("Error fetching database engines:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener los motores de base de datos" });
  }
};

/**
 * Get a specific database engine by ID
 */
const getMotorById = async (req, res) => {
  try {
    const { id } = req.params;

    const motor = await MotorDB.findByPk(id);

    if (!motor) {
      return res
        .status(404)
        .json({ error: "Motor de base de datos no encontrado" });
    }

    return res.status(200).json(motor);
  } catch (error) {
    console.error("Error fetching database engine:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener el motor de base de datos" });
  }
};

/**
 * Create a new database engine (Admin only)
 */
const createMotor = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ error: "El nombre del motor es requerido" });
    }

    // Check if engine already exists
    const existingMotor = await MotorDB.findOne({ where: { nombre } });
    if (existingMotor) {
      return res
        .status(409)
        .json({ error: "Ya existe un motor con ese nombre" });
    }

    const nuevoMotor = await MotorDB.create({
      nombre,
    });

    return res.status(201).json({
      message: "Motor de base de datos creado exitosamente",
      motor: nuevoMotor,
    });
  } catch (error) {
    console.error("Error creating database engine:", error);
    return res
      .status(500)
      .json({ error: "Error al crear el motor de base de datos" });
  }
};

/**
 * Update a database engine (Admin only)
 */
const updateMotor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, activo } = req.body;

    const motor = await MotorDB.findByPk(id);

    if (!motor) {
      return res
        .status(404)
        .json({ error: "Motor de base de datos no encontrado" });
    }

    // Update fields if provided
    if (nombre !== undefined) motor.nombre = nombre;

    await motor.save();

    return res.status(200).json({
      message: "Motor de base de datos actualizado exitosamente",
      motor,
    });
  } catch (error) {
    console.error("Error updating database engine:", error);
    return res
      .status(500)
      .json({ error: "Error al actualizar el motor de base de datos" });
  }
};

/**
 * Delete a database engine (Admin only)
 * Note: This is a soft delete that sets activo to false
 */
const deleteMotor = async (req, res) => {
  try {
    const { id } = req.params;

    const motor = await MotorDB.findByPk(id);

    if (!motor) {
      return res
        .status(404)
        .json({ error: "Motor de base de datos no encontrado" });
    }

    // Hard delete since we don't have activo field anymore
    await motor.destroy();

    return res
      .status(200)
      .json({ message: "Motor de base de datos eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting database engine:", error);
    return res
      .status(500)
      .json({ error: "Error al eliminar el motor de base de datos" });
  }
};

module.exports = {
  getAllMotores,
  getMotorById,
  createMotor,
  updateMotor,
  deleteMotor,
};
