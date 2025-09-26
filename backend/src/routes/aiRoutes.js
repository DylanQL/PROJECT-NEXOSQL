const express = require('express');
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const profileMiddleware = require('../middleware/profileMiddleware');

const router = express.Router();

// Apply middleware to all routes
router.use(authMiddleware);
router.use(profileMiddleware);

// Process a natural language query
router.post('/query', aiController.processQuery);

// Cancel a message by thread ID
router.post('/cancel/:hiloConversacion', aiController.cancelMessage);

// Get schema information for a connection
router.get('/schema/:connectionId', aiController.getSchemaInfo);

module.exports = router;
