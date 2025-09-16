const { admin } = require('../config/firebase');
const User = require('../models/User');

/**
 * Creates a new user in the database
 */
const createUser = async (req, res) => {
  try {
    const { nombres, apellidos, email, telefono, pais } = req.body;

    // Check if all required fields are provided
    if (!nombres || !apellidos || !email) {
      return res.status(400).json({ error: 'Nombres, apellidos y email son campos requeridos' });
    }

    // Get Firebase UID from authenticated request
    const firebaseUid = req.firebaseUid;

    // Check if user already exists in our database
    const existingUser = await User.findOne({ where: { firebaseUid } });
    if (existingUser) {
      return res.status(409).json({ error: 'El usuario ya existe en nuestra base de datos' });
    }

    // Create the user in our database
    const newUser = await User.create({
      nombres,
      apellidos,
      email,
      telefono,
      pais,
      firebaseUid
    });

    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        nombres: newUser.nombres,
        apellidos: newUser.apellidos,
        email: newUser.email,
        telefono: newUser.telefono,
        pais: newUser.pais
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

/**
 * Gets the current user's profile
 */
const getUserProfile = async (req, res) => {
  try {
    // User is already attached to request by auth middleware
    const user = req.user;

    return res.status(200).json({
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      email: user.email,
      telefono: user.telefono,
      pais: user.pais,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Error al obtener el perfil del usuario' });
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
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        telefono: user.telefono,
        pais: user.pais,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Error al actualizar el perfil del usuario' });
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
      console.error('Warning: Could not delete user from Firebase:', firebaseError);
      // Continue with local deletion even if Firebase deletion fails
    }

    return res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

module.exports = {
  createUser,
  getUserProfile,
  updateUserProfile,
  deleteUser
};
