const User = require("../models/User");
const Subscription = require("../models/Subscription");
const paypalService = require("../services/paypalService");

class SubscriptionController {
  /**
   * Get available subscription plans
   */
  async getPlans(req, res) {
    try {
      const plans = paypalService.getAvailablePlans();
      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error("Error getting plans:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener los planes de suscripción",
      });
    }
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(req, res) {
    try {
      const userId = req.user.id;

      // First try to find an active subscription
      let subscription = await Subscription.findOne({
        where: {
          userId,
          status: "active",
        },
        order: [["createdAt", "DESC"]],
      });

      // If no active subscription found, look for the most recent one (excluding pending)
      if (!subscription) {
        subscription = await Subscription.findOne({
          where: {
            userId,
            status: { [require("sequelize").Op.ne]: "pending" }, // Exclude pending subscriptions
          },
          order: [["createdAt", "DESC"]],
        });
      }

      if (!subscription) {
        return res.json({
          success: true,
          data: null,
          hasActiveSubscription: false,
        });
      }

      res.json({
        success: true,
        data: subscription,
        hasActiveSubscription: subscription.isActive(),
        isInGracePeriod: subscription.isInGracePeriod(),
      });
    } catch (error) {
      console.error("Error getting user subscription:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener la suscripción del usuario",
      });
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(req, res) {
    try {
      const { planType } = req.body;
      const userId = req.user.id;

      if (!planType || !["bronce", "plata", "oro"].includes(planType)) {
        return res.status(400).json({
          success: false,
          error: "Tipo de plan inválido",
        });
      }

      // Check if user already has an active subscription
      const existingSubscription = await req.user.getActiveSubscription();
      if (existingSubscription) {
        return res.status(400).json({
          success: false,
          error: "Ya tienes una suscripción activa",
        });
      }

      const planDetails = Subscription.getPlanDetails(planType);
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      const returnUrl = `${baseUrl}/subscription/success`;
      const cancelUrl = `${baseUrl}/subscription/cancel`;

      // Create subscription with PayPal
      const paypalSubscription = await paypalService.createSubscription(
        planType,
        returnUrl,
        cancelUrl,
        {
          nombres: req.user.nombres,
          apellidos: req.user.apellidos,
          email: req.user.email,
        },
      );

      // Create subscription record in our database
      const subscription = await Subscription.create({
        userId: userId,
        planType: planType,
        planId: planDetails.planId,
        subscriptionId: paypalSubscription.subscriptionId,
        status: "pending",
        price: planDetails.price,
        currency: "USD",
        paypalData: paypalSubscription.fullResponse,
      });

      res.json({
        success: true,
        data: {
          subscription: subscription,
          approvalUrl: paypalSubscription.approvalUrl,
          subscriptionId: paypalSubscription.subscriptionId,
        },
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({
        success: false,
        error: "Error al crear la suscripción",
      });
    }
  }

  /**
   * Confirm subscription after PayPal approval
   */
  async confirmSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user.id;
      const { token, payerId } = req.body;

      console.log(
        `Confirming subscription ${subscriptionId} for user ${userId}`,
        {
          token,
          payerId,
        },
      );

      // Find subscription in our database
      const subscription = await Subscription.findOne({
        where: {
          subscriptionId: subscriptionId,
          userId: userId,
        },
      });

      if (!subscription) {
        console.error(
          `Subscription ${subscriptionId} not found for user ${userId}`,
        );
        return res.status(404).json({
          success: false,
          error: "Suscripción no encontrada",
        });
      }

      // Get subscription details from PayPal
      const paypalSubscription =
        await paypalService.getSubscription(subscriptionId);

      console.log(`PayPal subscription status for ${subscriptionId}:`, {
        status: paypalSubscription.status,
        currentDbStatus: subscription.status,
        startTime: paypalSubscription.start_time,
        createTime: paypalSubscription.create_time,
      });

      // Update subscription status based on PayPal response
      const updates = {
        paypalData: paypalSubscription,
      };

      let message = "Suscripción procesada";
      let shouldActivate = false;

      // Handle different PayPal statuses
      switch (paypalSubscription.status) {
        case "ACTIVE":
          updates.status = "active";
          updates.startDate = new Date(
            paypalSubscription.start_time || paypalSubscription.create_time,
          );
          shouldActivate = true;
          message = "Suscripción activada correctamente";
          break;

        case "APPROVED":
          // Sometimes PayPal returns APPROVED instead of ACTIVE for new subscriptions
          updates.status = "active";
          updates.startDate = new Date(paypalSubscription.create_time);
          shouldActivate = true;
          message = "Suscripción activada correctamente";
          break;

        case "PENDING":
          updates.status = "pending";
          message = "Suscripción está siendo procesada por PayPal";
          break;

        case "CANCELLED":
          updates.status = "cancelled";
          updates.endDate = new Date();
          message = "Suscripción cancelada";
          break;

        case "SUSPENDED":
          updates.status = "suspended";
          message = "Suscripción suspendida";
          break;

        case "EXPIRED":
          updates.status = "expired";
          updates.endDate = new Date();
          message = "Suscripción expirada";
          break;

        default:
          console.warn(`Unknown PayPal status: ${paypalSubscription.status}`);
          updates.status = paypalSubscription.status.toLowerCase();
          message = `Suscripción en estado: ${paypalSubscription.status}`;
      }

      // Set billing info if available and subscription is active
      if (shouldActivate && paypalSubscription.billing_info) {
        if (paypalSubscription.billing_info.next_billing_time) {
          updates.nextBillingDate = new Date(
            paypalSubscription.billing_info.next_billing_time,
          );
        }
      }

      await subscription.update(updates);

      // If this subscription is replacing another one and is now active, cancel the old one
      if (shouldActivate && subscription.replacingSubscriptionId) {
        console.log(
          `Subscription ${subscriptionId} is active and replacing subscription ${subscription.replacingSubscriptionId}`,
        );

        try {
          const oldSubscription = await Subscription.findByPk(
            subscription.replacingSubscriptionId,
          );

          if (oldSubscription && oldSubscription.status === "active") {
            console.log(
              `Cancelling old subscription ${oldSubscription.subscriptionId}...`,
            );

            // Cancel in PayPal
            const isInGracePeriod = oldSubscription.isInGracePeriod();
            if (!isInGracePeriod) {
              await paypalService.cancelSubscription(
                oldSubscription.subscriptionId,
                "Reemplazado por nueva suscripción",
              );
            }

            // Update old subscription status
            await oldSubscription.update({
              status: "cancelled",
              endDate: new Date(),
            });

            console.log(
              `Old subscription ${oldSubscription.subscriptionId} cancelled successfully`,
            );
          }

          // Clear the replacingSubscriptionId field since we've handled it
          await subscription.update({ replacingSubscriptionId: null });
          
          // Reset query counter when upgrading/changing plan
          console.log(`🔄 Resetting query counter for user ${userId} after plan change`);
          await req.user.update({
            monthly_queries_used: 0,
            queries_reset_date: new Date(),
          });
          console.log(`✅ Query counter reset to 0 for user ${userId}`);
        } catch (cancelError) {
          console.error(`Error cancelling old subscription:`, cancelError);
          // Don't fail the main operation if cancelling the old subscription fails
        }
      }

      // Also reset query counter for new subscriptions (first time subscribers)
      if (shouldActivate && !subscription.replacingSubscriptionId) {
        console.log(`🔄 Resetting query counter for user ${userId} on new subscription`);
        await req.user.update({
          monthly_queries_used: 0,
          queries_reset_date: new Date(),
        });
        console.log(`✅ Query counter reset to 0 for user ${userId}`);
      }

      console.log(`Subscription ${subscriptionId} updated:`, {
        oldStatus: subscription.status,
        newStatus: updates.status,
        startDate: updates.startDate,
        nextBillingDate: updates.nextBillingDate,
      });

      res.json({
        success: true,
        data: subscription,
        message,
        paypalStatus: paypalSubscription.status,
        isActive: shouldActivate,
      });
    } catch (error) {
      console.error("Error confirming subscription:", error);
      res.status(500).json({
        success: false,
        error: "Error al confirmar la suscripción",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(req, res) {
    try {
      const userId = req.user.id;
      const { reason } = req.body;

      const subscription = await Subscription.findOne({
        where: {
          userId: userId,
          status: "active",
        },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: "No se encontró una suscripción activa",
        });
      }

      console.log(
        `Attempting to cancel subscription ${subscription.subscriptionId} for user ${userId}`,
      );

      // Cancel subscription with PayPal
      const cancelled = await paypalService.cancelSubscription(
        subscription.subscriptionId,
        reason || "Usuario solicitó cancelación",
      );

      console.log(`PayPal cancellation result: ${cancelled}`);

      if (cancelled) {
        const updates = {};

        try {
          // Try to get the updated subscription details from PayPal
          console.log(`Getting subscription details from PayPal...`);
          const paypalSubscription = await paypalService.getSubscription(
            subscription.subscriptionId,
          );

          console.log(`PayPal subscription after cancellation:`, {
            status: paypalSubscription.status,
            billing_info: paypalSubscription.billing_info,
          });

          // Ensure we save the cancellation status in PayPal data
          const updatedPaypalData = {
            ...paypalSubscription,
            status: paypalSubscription.status || "CANCELLED", // Ensure status is saved
            cancelled_at: new Date().toISOString(), // Add cancellation timestamp
          };
          updates.paypalData = updatedPaypalData;

          // Set the end date to maintain access until the end of the billing period
          if (
            paypalSubscription.billing_info &&
            paypalSubscription.billing_info.next_billing_time
          ) {
            // Use the next billing time as the end date for access
            updates.endDate = new Date(
              paypalSubscription.billing_info.next_billing_time,
            );
            console.log(`Using PayPal next_billing_time: ${updates.endDate}`);
          } else if (subscription.nextBillingDate) {
            // If PayPal doesn't provide it, use our stored next billing date
            updates.endDate = subscription.nextBillingDate;
            console.log(`Using stored nextBillingDate: ${updates.endDate}`);
          } else {
            // Fallback: set end date to end of current month
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0); // Last day of current month
            updates.endDate = endDate;
            console.log(`Using fallback endDate: ${updates.endDate}`);
          }
        } catch (paypalError) {
          console.error(
            `Error getting PayPal subscription details after cancellation:`,
            paypalError.message,
          );

          // Use fallback logic if PayPal call fails
          if (subscription.nextBillingDate) {
            updates.endDate = subscription.nextBillingDate;
            console.log(
              `PayPal error - using stored nextBillingDate: ${updates.endDate}`,
            );
          } else {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
            updates.endDate = endDate;
            console.log(
              `PayPal error - using fallback endDate: ${updates.endDate}`,
            );
          }
        }

        // Keep status as "active" so user maintains access
        // The isActive() method will automatically return false after endDate
        console.log(`Updating subscription with:`, updates);

        await subscription.update(updates);

        res.json({
          success: true,
          message:
            "Suscripción cancelada correctamente. Mantendrás acceso hasta el final del período de facturación.",
          data: {
            subscription: subscription,
            accessUntil: updates.endDate,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Error al cancelar la suscripción",
        });
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({
        success: false,
        error: "Error al cancelar la suscripción",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * Update/Change user's subscription plan
   */
  async updateSubscription(req, res) {
    try {
      const { newPlanType } = req.body;
      const userId = req.user.id;

      console.log(`=== UpdateSubscription Debug ===`);
      console.log(`User ID: ${userId}`);
      console.log(`New Plan Type: ${newPlanType}`);

      if (!newPlanType || !["bronce", "plata", "oro"].includes(newPlanType)) {
        console.log(`Invalid plan type: ${newPlanType}`);
        return res.status(400).json({
          success: false,
          error: "Tipo de plan inválido",
        });
      }

      console.log(`Getting active subscription for user ${userId}...`);
      const currentSubscription = await req.user.getActiveSubscription();
      console.log(
        `Current subscription found:`,
        currentSubscription
          ? {
              id: currentSubscription.id,
              planType: currentSubscription.planType,
              status: currentSubscription.status,
              isInGracePeriod: currentSubscription.isInGracePeriod(),
            }
          : null,
      );

      if (!currentSubscription) {
        console.log(`No active subscription found for user ${userId}`);
        return res.status(400).json({
          success: false,
          error: "No tienes una suscripción activa para actualizar",
        });
      }

      if (currentSubscription.planType === newPlanType) {
        return res.status(400).json({
          success: false,
          error: "Ya tienes este plan activo",
        });
      }

      // Create new subscription first without cancelling the current one
      console.log(`Creating new subscription with plan: ${newPlanType}`);
      const planDetails = Subscription.getPlanDetails(newPlanType);
      console.log(`Plan details:`, planDetails);

      const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const returnUrl = `${baseUrl}/subscription/success`;
      const cancelUrl = `${baseUrl}/subscription/cancel`;

      console.log(`Creating PayPal subscription...`);
      const paypalSubscription = await paypalService.createSubscription(
        newPlanType,
        returnUrl,
        cancelUrl,
        {
          nombres: req.user.nombres,
          apellidos: req.user.apellidos,
          email: req.user.email,
        },
      );
      console.log(
        `PayPal subscription created:`,
        paypalSubscription.subscriptionId,
      );

      console.log(`Creating subscription record in database...`);
      const newSubscription = await Subscription.create({
        userId: userId,
        planType: newPlanType,
        planId: planDetails.planId,
        subscriptionId: paypalSubscription.subscriptionId,
        status: "pending",
        price: planDetails.price,
        currency: "USD",
        paypalData: paypalSubscription.fullResponse,
        // Store the ID of the subscription that will be replaced when this one is confirmed
        replacingSubscriptionId: currentSubscription.id,
      });
      console.log(`New subscription created with ID: ${newSubscription.id}`);

      res.json({
        success: true,
        data: {
          subscription: newSubscription,
          approvalUrl: paypalSubscription.approvalUrl,
          subscriptionId: paypalSubscription.subscriptionId,
        },
        message:
          "Suscripción actualizada. Completa el pago para activar el nuevo plan.",
      });
    } catch (error) {
      console.error("=== Error updating subscription ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Error details:", error);
      res.status(500).json({
        success: false,
        error: "Error al actualizar la suscripción",
      });
    }
  }

  /**
   * Handle PayPal webhooks
   */
  async handleWebhook(req, res) {
    try {
      const webhookEvent = req.body;
      const headers = req.headers;

      // Verify webhook signature (optional but recommended)
      const isValid = await paypalService.verifyWebhookSignature(
        headers,
        webhookEvent,
        process.env.PAYPAL_WEBHOOK_ID || "18R7482678791552E",
      );

      if (!isValid && process.env.NODE_ENV === "production") {
        console.warn("Invalid webhook signature");
        return res.status(400).json({ error: "Invalid webhook signature" });
      }

      // Process webhook event
      const processedEvent =
        await paypalService.processWebhookEvent(webhookEvent);

      if (processedEvent.subscriptionId) {
        // Find subscription in our database
        const subscription = await Subscription.findOne({
          where: { subscriptionId: processedEvent.subscriptionId },
        });

        if (subscription) {
          const updates = { paypalData: processedEvent.data };

          switch (processedEvent.type) {
            case "subscription_activated":
              updates.status = "active";
              updates.startDate = new Date();
              if (processedEvent.data.billing_info?.next_billing_time) {
                updates.nextBillingDate = new Date(
                  processedEvent.data.billing_info.next_billing_time,
                );
              }
              break;

            case "subscription_cancelled":
              updates.status = "cancelled";
              updates.endDate = new Date();
              break;

            case "subscription_suspended":
              updates.status = "suspended";
              break;

            case "payment_completed":
              // Update next billing date if available
              if (processedEvent.data.billing_info?.next_billing_time) {
                updates.nextBillingDate = new Date(
                  processedEvent.data.billing_info.next_billing_time,
                );
              }
              break;
          }

          await subscription.update(updates);
          console.log(
            `Subscription ${processedEvent.subscriptionId} updated:`,
            processedEvent.type,
          );
        }
      }

      // Respond to PayPal that webhook was received successfully
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }

  /**
   * Check if user can access a feature (middleware helper)
   */
  async checkSubscriptionAccess(req, res, next) {
    try {
      const hasActiveSubscription = await req.user.hasActiveSubscription();

      if (!hasActiveSubscription) {
        return res.status(403).json({
          success: false,
          error:
            "Se requiere una suscripción activa para acceder a esta función",
          code: "SUBSCRIPTION_REQUIRED",
        });
      }

      next();
    } catch (error) {
      console.error("Error checking subscription access:", error);
      res.status(500).json({
        success: false,
        error: "Error al verificar la suscripción",
      });
    }
  }

  /**
   * Get subscription statistics (for admin or user dashboard)
   */
  async getSubscriptionStats(req, res) {
    try {
      const userId = req.user.id;

      const subscriptions = await Subscription.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
      });

      const stats = {
        totalSubscriptions: subscriptions.length,
        currentSubscription: subscriptions.find((s) => s.isActive()) || null,
        subscriptionHistory: subscriptions.map((s) => ({
          id: s.id,
          planType: s.planType,
          status: s.status,
          price: s.price,
          startDate: s.startDate,
          endDate: s.endDate,
          createdAt: s.createdAt,
        })),
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error getting subscription stats:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener las estadísticas de suscripción",
      });
    }
  }

  /**
   * Verify and update pending subscriptions manually
   */
  async verifyPendingSubscriptions(req, res) {
    try {
      const userId = req.user.id;

      // Find pending subscriptions for this user
      const pendingSubscriptions = await Subscription.findAll({
        where: {
          userId: userId,
          status: "pending",
        },
        order: [["createdAt", "DESC"]],
      });

      if (pendingSubscriptions.length === 0) {
        return res.json({
          success: true,
          message: "No hay suscripciones pendientes",
          data: null,
        });
      }

      const results = [];

      for (const subscription of pendingSubscriptions) {
        try {
          // Get subscription status from PayPal
          const paypalSubscription = await paypalService.getSubscription(
            subscription.subscriptionId,
          );

          console.log(
            `PayPal subscription status for ${subscription.subscriptionId}:`,
            paypalSubscription.status,
          );

          // Update subscription based on PayPal status
          const updates = {
            paypalData: paypalSubscription,
          };

          if (paypalSubscription.status === "ACTIVE") {
            updates.status = "active";
            updates.startDate = new Date(
              paypalSubscription.start_time || paypalSubscription.create_time,
            );

            if (
              paypalSubscription.billing_info &&
              paypalSubscription.billing_info.next_billing_time
            ) {
              updates.nextBillingDate = new Date(
                paypalSubscription.billing_info.next_billing_time,
              );
            }
          } else if (paypalSubscription.status === "APPROVED") {
            updates.status = "active";
            updates.startDate = new Date();
          } else if (paypalSubscription.status === "CANCELLED") {
            updates.status = "cancelled";
            updates.endDate = new Date();
          } else if (paypalSubscription.status === "SUSPENDED") {
            updates.status = "suspended";
          }

          await subscription.update(updates);

          results.push({
            subscriptionId: subscription.subscriptionId,
            oldStatus: "pending",
            newStatus: updates.status,
            paypalStatus: paypalSubscription.status,
          });
        } catch (paypalError) {
          console.error(
            `Error checking PayPal subscription ${subscription.subscriptionId}:`,
            paypalError,
          );
          results.push({
            subscriptionId: subscription.subscriptionId,
            error: "Error al verificar con PayPal",
            paypalError: paypalError.message,
          });
        }
      }

      res.json({
        success: true,
        message: "Verificación de suscripciones completada",
        data: results,
      });
    } catch (error) {
      console.error("Error verifying pending subscriptions:", error);
      res.status(500).json({
        success: false,
        error: "Error al verificar suscripciones pendientes",
      });
    }
  }

  /**
   * Sync specific subscription with PayPal
   */
  async syncSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user.id;

      // Find subscription
      const subscription = await Subscription.findOne({
        where: {
          subscriptionId: subscriptionId,
          userId: userId,
        },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: "Suscripción no encontrada",
        });
      }

      // Get current status from PayPal
      const paypalSubscription =
        await paypalService.getSubscription(subscriptionId);

      console.log(`PayPal sync for ${subscriptionId}:`, {
        currentStatus: subscription.status,
        paypalStatus: paypalSubscription.status,
        paypalData: paypalSubscription,
      });

      // Update subscription based on PayPal response
      const updates = {
        paypalData: paypalSubscription,
      };

      if (paypalSubscription.status === "ACTIVE") {
        updates.status = "active";
        updates.startDate = new Date(
          paypalSubscription.start_time || paypalSubscription.create_time,
        );

        if (
          paypalSubscription.billing_info &&
          paypalSubscription.billing_info.next_billing_time
        ) {
          updates.nextBillingDate = new Date(
            paypalSubscription.billing_info.next_billing_time,
          );
        }
      } else if (paypalSubscription.status === "APPROVED") {
        updates.status = "active";
        updates.startDate = new Date();
      } else if (paypalSubscription.status === "CANCELLED") {
        updates.status = "cancelled";
        updates.endDate = new Date();
      } else if (paypalSubscription.status === "SUSPENDED") {
        updates.status = "suspended";
      }

      await subscription.update(updates);

      res.json({
        success: true,
        message: "Suscripción sincronizada correctamente",
        data: {
          subscription: subscription,
          paypalStatus: paypalSubscription.status,
          updated: true,
        },
      });
    } catch (error) {
      console.error("Error syncing subscription:", error);
      res.status(500).json({
        success: false,
        error: "Error al sincronizar suscripción con PayPal",
      });
    }
  }
}

module.exports = new SubscriptionController();
