const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { verifyToken, requireUser } = require("../middleware/auth");
const { checkSubscription } = require("../middleware/subscription");

// GET /api/subscriptions/plans - Get available subscription plans (public)
router.get("/plans", subscriptionController.getPlans);

// GET /api/subscriptions/current - Get user's current subscription
router.get(
  "/current",
  verifyToken,
  requireUser,
  subscriptionController.getUserSubscription,
);

// POST /api/subscriptions/create - Create a new subscription
router.post(
  "/create",
  verifyToken,
  requireUser,
  subscriptionController.createSubscription,
);

// POST /api/subscriptions/confirm/:subscriptionId - Confirm subscription after PayPal approval
router.post(
  "/confirm/:subscriptionId",
  verifyToken,
  requireUser,
  subscriptionController.confirmSubscription,
);

// POST /api/subscriptions/cancel - Cancel user's subscription
router.post(
  "/cancel",
  verifyToken,
  requireUser,
  subscriptionController.cancelSubscription,
);

// POST /api/subscriptions/update - Update/Change user's subscription plan
router.post(
  "/update",
  verifyToken,
  requireUser,
  subscriptionController.updateSubscription,
);

// GET /api/subscriptions/stats - Get subscription statistics
router.get(
  "/stats",
  verifyToken,
  requireUser,
  subscriptionController.getSubscriptionStats,
);

// POST /api/subscriptions/verify-pending - Verify and update pending subscriptions
router.post(
  "/verify-pending",
  verifyToken,
  requireUser,
  subscriptionController.verifyPendingSubscriptions,
);

// POST /api/subscriptions/sync/:subscriptionId - Sync specific subscription with PayPal
router.post(
  "/sync/:subscriptionId",
  verifyToken,
  requireUser,
  subscriptionController.syncSubscription,
);

// POST /api/subscriptions/webhook - Handle PayPal webhooks (no auth required)
router.post("/webhook", subscriptionController.handleWebhook);

module.exports = router;
