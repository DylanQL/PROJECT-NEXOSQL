const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para chats por conexión
router.get("/connection/:conexionId", chatController.getChatsByConnection);
router.post("/connection/:conexionId", chatController.createChat);

// Rutas para chats específicos
router.get("/:chatId", chatController.getChatById);
router.put("/:chatId/title", chatController.updateChatTitle);
router.delete("/:chatId", chatController.deleteChat);

// Rutas para mensajes
router.post("/:chatId/messages", chatController.addMessage);

// Ruta especial para migración de datos de localStorage
router.post("/migrate", chatController.migrateLocalStorageChats);

module.exports = router;