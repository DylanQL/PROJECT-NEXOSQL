const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireUser } = require('../middleware/auth');

// POST /api/users - Create a new user
// Requires authentication but not an existing user in our database
router.post('/', verifyToken, userController.createUser);

// GET /api/users/profile - Get current user profile
// Requires authentication and an existing user in our database
router.get('/profile', verifyToken, requireUser, userController.getUserProfile);

// PUT /api/users/profile - Update current user profile
// Requires authentication and an existing user in our database
router.put('/profile', verifyToken, requireUser, userController.updateUserProfile);

// DELETE /api/users - Delete current user
// Requires authentication and an existing user in our database
router.delete('/', verifyToken, requireUser, userController.deleteUser);

// GET /api/users/query-stats - Get query usage statistics
// Requires authentication and an existing user in our database
router.get('/query-stats', verifyToken, requireUser, userController.getQueryStats);

module.exports = router;

// GET /api/users/query-stats - Get current user's query usage statistics
// Requires authentication and an existing user in our database
router.get('/query-stats', verifyToken, requireUser, userController.getQueryStats);

module.exports = router;
