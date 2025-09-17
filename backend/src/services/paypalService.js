const axios = require('axios');

class PayPalService {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || 'AR_aJX5pNGAGM_aodiVmtR_jypetl-RnOWykHg_1PjYLiF3ajuSlvhN0BxuS11UZ2hYWNmSrCBEPcKaT';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'EFtcAGXTj-5uXKqLYDw7Z8bnjkohJ2X657_SbL0XXAmb0tPjX7ICk0BROCfUxh6ZSkFmQnpcu4hGIBFm';
    this.baseURL = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';
    this.accessToken = null;
    this.tokenExpiry = null;

    // Plan IDs from PayPal
    this.plans = {
      bronce: 'P-6C599257RD4194644NDFFPGI',
      plata: 'P-74918607K53020936NDFFQFI',
      oro: 'P-54096226PF034844GNDFFQTI'
    };
  }

  /**
   * Get access token from PayPal
   */
  async getAccessToken() {
    try {
      // Check if current token is still valid
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post(`${this.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry time (subtract 5 minutes for safety)
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Error getting PayPal access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with PayPal');
    }
  }

  /**
   * Get headers for PayPal API requests
   */
  async getHeaders() {
    const token = await this.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'PayPal-Request-Id': Date.now().toString(),
      'Prefer': 'return=representation'
    };
  }

  /**
   * Create a subscription
   */
  async createSubscription(planType, returnUrl, cancelUrl, userDetails = {}) {
    try {
      const headers = await this.getHeaders();
      const planId = this.plans[planType];

      if (!planId) {
        throw new Error(`Invalid plan type: ${planType}`);
      }

      const subscriptionData = {
        plan_id: planId,
        start_time: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
        quantity: 1,
        subscriber: {
          name: {
            given_name: userDetails.nombres || 'Usuario',
            surname: userDetails.apellidos || 'NexoSQL'
          },
          email_address: userDetails.email || 'test@example.com'
        },
        application_context: {
          brand_name: 'NexoSQL',
          locale: 'es-ES',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
          return_url: returnUrl,
          cancel_url: cancelUrl
        }
      };

      const response = await axios.post(
        `${this.baseURL}/v1/billing/subscriptions`,
        subscriptionData,
        { headers }
      );

      return {
        subscriptionId: response.data.id,
        status: response.data.status,
        approvalUrl: response.data.links.find(link => link.rel === 'approve')?.href,
        selfUrl: response.data.links.find(link => link.rel === 'self')?.href,
        planId: planId,
        planType: planType,
        fullResponse: response.data
      };
    } catch (error) {
      console.error('Error creating PayPal subscription:', error.response?.data || error.message);
      throw new Error('Failed to create subscription with PayPal');
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId) {
    try {
      const headers = await this.getHeaders();

      const response = await axios.get(
        `${this.baseURL}/v1/billing/subscriptions/${subscriptionId}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting PayPal subscription:', error.response?.data || error.message);
      throw new Error('Failed to get subscription details from PayPal');
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId, reason = 'User requested cancellation') {
    try {
      const headers = await this.getHeaders();

      const response = await axios.post(
        `${this.baseURL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
        {
          reason: reason
        },
        { headers }
      );

      return response.status === 204;
    } catch (error) {
      console.error('Error canceling PayPal subscription:', error.response?.data || error.message);
      throw new Error('Failed to cancel subscription with PayPal');
    }
  }

  /**
   * Suspend a subscription
   */
  async suspendSubscription(subscriptionId, reason = 'User requested suspension') {
    try {
      const headers = await this.getHeaders();

      const response = await axios.post(
        `${this.baseURL}/v1/billing/subscriptions/${subscriptionId}/suspend`,
        {
          reason: reason
        },
        { headers }
      );

      return response.status === 204;
    } catch (error) {
      console.error('Error suspending PayPal subscription:', error.response?.data || error.message);
      throw new Error('Failed to suspend subscription with PayPal');
    }
  }

  /**
   * Activate a subscription
   */
  async activateSubscription(subscriptionId, reason = 'Reactivating subscription') {
    try {
      const headers = await this.getHeaders();

      const response = await axios.post(
        `${this.baseURL}/v1/billing/subscriptions/${subscriptionId}/activate`,
        {
          reason: reason
        },
        { headers }
      );

      return response.status === 204;
    } catch (error) {
      console.error('Error activating PayPal subscription:', error.response?.data || error.message);
      throw new Error('Failed to activate subscription with PayPal');
    }
  }

  /**
   * Get plan details
   */
  async getPlan(planId) {
    try {
      const headers = await this.getHeaders();

      const response = await axios.get(
        `${this.baseURL}/v1/billing/plans/${planId}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting PayPal plan:', error.response?.data || error.message);
      throw new Error('Failed to get plan details from PayPal');
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(headers, body, webhookId) {
    try {
      const requestHeaders = await this.getHeaders();

      const verificationData = {
        auth_algo: headers['paypal-auth-algo'],
        cert_id: headers['paypal-cert-id'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: body
      };

      const response = await axios.post(
        `${this.baseURL}/v1/notifications/verify-webhook-signature`,
        verificationData,
        { headers: requestHeaders }
      );

      return response.data.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('Error verifying webhook signature:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event) {
    try {
      const eventType = event.event_type;
      const resource = event.resource;

      console.log(`Processing PayPal webhook event: ${eventType}`);

      switch (eventType) {
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          return {
            type: 'subscription_activated',
            subscriptionId: resource.id,
            status: 'active',
            data: resource
          };

        case 'BILLING.SUBSCRIPTION.CANCELLED':
          return {
            type: 'subscription_cancelled',
            subscriptionId: resource.id,
            status: 'cancelled',
            data: resource
          };

        case 'BILLING.SUBSCRIPTION.SUSPENDED':
          return {
            type: 'subscription_suspended',
            subscriptionId: resource.id,
            status: 'suspended',
            data: resource
          };

        case 'PAYMENT.SALE.COMPLETED':
          return {
            type: 'payment_completed',
            subscriptionId: resource.billing_agreement_id,
            paymentId: resource.id,
            amount: resource.amount,
            data: resource
          };

        case 'PAYMENT.SALE.DENIED':
          return {
            type: 'payment_denied',
            subscriptionId: resource.billing_agreement_id,
            paymentId: resource.id,
            data: resource
          };

        default:
          console.log(`Unhandled webhook event type: ${eventType}`);
          return {
            type: 'unhandled',
            eventType: eventType,
            data: resource
          };
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
      throw error;
    }
  }

  /**
   * Get available plans
   */
  getAvailablePlans() {
    return {
      bronce: {
        id: this.plans.bronce,
        name: 'Plan Bronce',
        description: 'Acceso básico a NexoSQL',
        price: 5.00,
        currency: 'USD',
        features: [
          '5 conexiones de base de datos',
          'Consultas básicas',
          'Soporte por email'
        ]
      },
      plata: {
        id: this.plans.plata,
        name: 'Plan Plata',
        description: 'Acceso estándar a NexoSQL',
        price: 10.00,
        currency: 'USD',
        features: [
          '20 conexiones de base de datos',
          'Consultas avanzadas',
          'IA para optimización',
          'Soporte prioritario'
        ]
      },
      oro: {
        id: this.plans.oro,
        name: 'Plan Oro',
        description: 'Acceso completo a NexoSQL',
        price: 20.00,
        currency: 'USD',
        features: [
          'Conexiones ilimitadas',
          'Todas las características',
          'IA avanzada',
          'Soporte 24/7',
          'Análisis de rendimiento'
        ]
      }
    };
  }
}

module.exports = new PayPalService();
