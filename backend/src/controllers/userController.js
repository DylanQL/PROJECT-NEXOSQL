const { admin } = require("../config/firebase");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

/**
 * Creates a new user in the database
 */
const createUser = async (req, res) => {
  try {
    const { nombres, apellidos, email, telefono, pais } = req.body;

    // Check if all required fields are provided
    if (!nombres || !apellidos || !email) {
      return res
        .status(400)
        .json({ error: "Nombres, apellidos y email son campos requeridos" });
    }

    // Get Firebase UID from authenticated request
    const firebaseUid = req.firebaseUid;

    // Check if user already exists in our database
    const existingUser = await User.findOne({ where: { firebaseUid } });
    if (existingUser) {
      return res.status(409).json({
        error: "El usuario ya existe en nuestra base de datos",
        message: `Usuario con UID ${firebaseUid} ya está registrado`,
      });
    }

    // Check if email is already registered
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res
        .status(409)
        .json({
          error: "Este correo electrónico ya está registrado en el sistema",
        });
    }

    // Create the user in our database
    const newUser = await User.create({
      nombres,
      apellidos,
      email,
      telefono,
      pais,
      firebaseUid,
    });

    return res.status(201).json({
      message: "Usuario creado exitosamente",
      user: {
        id: newUser.id,
        nombres: newUser.nombres,
        apellidos: newUser.apellidos,
        email: newUser.email,
        telefono: newUser.telefono,
        pais: newUser.pais,
        firebaseUid: newUser.firebaseUid,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Error al crear el usuario" });
  }
};

/**
 * Gets the current user's profile
 */
const getUserProfile = async (req, res) => {
  try {
    // User is already attached to request by auth middleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        error: "Perfil no encontrado",
        message: `No se encontró un perfil para el usuario con UID ${req.firebaseUid}`,
      });
    }

    console.log(`Returning profile for user with UID: ${req.firebaseUid}`);

    return res.status(200).json({
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      email: user.email,
      telefono: user.telefono,
      pais: user.pais,
      firebaseUid: user.firebaseUid,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener el perfil del usuario" });
  }
};

/**
 * Updates the current user's profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const { nombres, apellidos, telefono, pais } = req.body;

    // Get the user from the request (set by auth middleware)
    const user = req.user;

    // Update user fields if they are provided
    if (nombres) user.nombres = nombres;
    if (apellidos) user.apellidos = apellidos;
    if (telefono) user.telefono = telefono;
    if (pais) user.pais = pais;

    // Save the updated user
    await user.save();

    return res.status(200).json({
      message: "Perfil actualizado exitosamente",
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        telefono: user.telefono,
        pais: user.pais,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res
      .status(500)
      .json({ error: "Error al actualizar el perfil del usuario" });
  }
};

/**
 * Deletes the current user
 */
const deleteUser = async (req, res) => {
  try {
    const user = req.user;
    const firebaseUid = req.firebaseUid;

    // Delete user from our database
    await user.destroy();

    // Optionally delete user from Firebase
    // This might be handled differently in a production app
    try {
      await admin.auth().deleteUser(firebaseUid);
    } catch (firebaseError) {
      console.error(
        "Warning: Could not delete user from Firebase:",
        firebaseError,
      );
      // Continue with local deletion even if Firebase deletion fails
    }

    return res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};

/**
 * Gets the current user's query usage statistics
 */
const getQueryStats = async (req, res) => {
  try {
    const user = req.user;

    // Reset counter if needed
    await user.resetMonthlyQueriesIfNeeded();
    await user.reload();

    // Get active subscription
    const activeSubscription = await user.getActiveSubscription();
    
    if (!activeSubscription) {
      return res.json({
        success: true,
        data: {
          used: 0,
          limit: 0,
          remaining: 0,
          planType: null,
          hasActiveSubscription: false
        }
      });
    }

    const planDetails = Subscription.getPlanDetails(activeSubscription.planType);
    const maxQueries = planDetails?.maxQueries || 0;
    const remaining = Math.max(0, maxQueries - user.monthly_queries_used);

    return res.json({
      success: true,
      data: {
        used: user.monthly_queries_used,
        limit: maxQueries,
        remaining: remaining,
        planType: activeSubscription.planType,
        resetDate: user.queries_reset_date,
        hasActiveSubscription: true
      }
    });
  } catch (error) {
    console.error("Error getting query stats:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener las estadísticas de consultas"
    });
  }
};

module.exports = {
  createUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getQueryStats,
};
