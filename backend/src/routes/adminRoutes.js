const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getDashboardMetrics,
  listAdminUsers,
} = require("../controllers/adminController");

router.get("/allowed-users", authMiddleware, listAdminUsers);
router.get("/dashboard", authMiddleware, adminMiddleware, getDashboardMetrics);

module.exports = router;
