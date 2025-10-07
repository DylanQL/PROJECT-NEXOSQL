const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getDashboardMetrics,
  listAdminUsers,
  listSupportTickets,
  updateSupportTicketStatus,
} = require("../controllers/adminController");

router.get("/allowed-users", authMiddleware, listAdminUsers);
router.get("/dashboard", authMiddleware, adminMiddleware, getDashboardMetrics);
router.get(
  "/support-tickets",
  authMiddleware,
  adminMiddleware,
  listSupportTickets,
);
router.patch(
  "/support-tickets/:ticketId/status",
  authMiddleware,
  adminMiddleware,
  updateSupportTicketStatus,
);

module.exports = router;
