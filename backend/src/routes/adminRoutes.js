const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { getDashboardMetrics } = require("../controllers/adminController");

router.get("/dashboard", authMiddleware, adminMiddleware, getDashboardMetrics);

module.exports = router;
