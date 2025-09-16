const express = require('express');
const router = express.Router();
const conexionDBController = require('../controllers/conexionDBController');
const { verifyToken, requireUser } = require('../middleware/auth');

// GET /api/conexiones - Get all user's connections
router.get('/', verifyToken, requireUser, conexionDBController.getUserConnections);

// GET /api/conexiones/:id - Get a specific connection
router.get('/:id', verifyToken, requireUser, conexionDBController.getConnectionById);

// POST /api/conexiones - Create a new connection
router.post('/', verifyToken, requireUser, conexionDBController.createConnection);

// PUT /api/conexiones/:id - Update a connection
router.put('/:id', verifyToken, requireUser, conexionDBController.updateConnection);

// DELETE /api/conexiones/:id - Delete a connection
router.delete('/:id', verifyToken, requireUser, conexionDBController.deleteConnection);

// POST /api/conexiones/test - Test a database connection
router.post('/test', verifyToken, requireUser, conexionDBController.testDatabaseConnection);

module.exports = router;
