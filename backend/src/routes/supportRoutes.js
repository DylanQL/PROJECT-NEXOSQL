const express = require("express");
const router = express.Router();
const { verifyToken, requireUser } = require("../middleware/auth");
const { requireActiveSubscription } = require("../middleware/subscription");
const { createSupportTicket } = require("../controllers/supportController");

router.post(
  "/",
  verifyToken,
  requireUser,
  requireActiveSubscription,
  createSupportTicket,
);

module.exports = router;
