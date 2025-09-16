const express = require('express');
const router = express.Router();
const motorDBController = require('../controllers/motorDBController');
const { verifyToken, requireUser } = require('../middleware/auth');

// GET /api/motores - Get all database engines
router.get('/', verifyToken, requireUser, motorDBController.getAllMotores);

// GET /api/motores/:id - Get a specific database engine
router.get('/:id', verifyToken, requireUser, motorDBController.getMotorById);

// The following routes would typically require admin permissions
// For simplicity, we're just using the same authentication middleware

// POST /api/motores - Create a new database engine
router.post('/', verifyToken, requireUser, motorDBController.createMotor);

// PUT /api/motores/:id - Update a database engine
router.put('/:id', verifyToken, requireUser, motorDBController.updateMotor);

// DELETE /api/motores/:id - Delete a database engine (soft delete)
router.delete('/:id', verifyToken, requireUser, motorDBController.deleteMotor);

module.exports = router;
