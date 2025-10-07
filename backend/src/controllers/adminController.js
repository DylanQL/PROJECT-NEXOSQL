const { Op } = require("sequelize");
const {
  Subscription,
  ConexionDB,
  ChatMessage,
  MotorDB,
  User,
  Chat,
  AdminUser,
  SupportTicket,
} = require("../models");

const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const buildMonthlyTemplate = () =>
  MONTH_LABELS.map((label, index) => ({
    month: index + 1,
    label,
    value: 0,
  }));

const PLAN_KEYS = ["oro", "plata", "bronce", "sin_plan"];

const createPlanBucket = () => {
  const bucket = {};
  PLAN_KEYS.forEach((key) => {
    bucket[key] = 0;
  });
  return bucket;
};

const ticketStatusOrder = {
  open: 1,
  in_progress: 2,
  resolved: 3,
  closed: 4,
};

const ADMIN_TICKET_STATUSES = ["open", "in_progress", "resolved"];

const serializeSupportTicket = (ticket) => ({
  id: ticket.id,
  incidentType: ticket.incidentType,
  status: ticket.status,
  description: ticket.description,
  metadata: ticket.metadata,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
  user: ticket.user
    ? {
        id: ticket.user.id,
        nombres: ticket.user.nombres,
        apellidos: ticket.user.apellidos,
        email: ticket.user.email,
        telefono: ticket.user.telefono,
        pais: ticket.user.pais,
        createdAt: ticket.user.createdAt,
      }
    : null,
});

const toMonthIndex = (date) => new Date(date).getMonth();

const addToMonthly = (buckets, date, amount = 1) => {
  if (!date) return;
  const monthIndex = toMonthIndex(date);
  if (monthIndex < 0 || monthIndex > 11) return;
  buckets[monthIndex].value += amount;
};

const getPaypalStatus = (subscription) => {
  const rawData = subscription.paypalData;

  if (!rawData) {
    return null;
  }

  if (typeof rawData === "string") {
    try {
      const parsed = JSON.parse(rawData);
      return parsed?.status ? String(parsed.status).toLowerCase() : null;
    } catch (error) {
      return null;
    }
  }

  return rawData?.status ? String(rawData.status).toLowerCase() : null;
};

const isCancelledSubscription = (subscription) => {
  const directStatus = String(subscription.status || "").toLowerCase();
  if (directStatus === "cancelled" || directStatus === "canceled") {
    return true;
  }

  const paypalStatus = getPaypalStatus(subscription);
  if (paypalStatus === "cancelled" || paypalStatus === "canceled") {
    return true;
  }

  // As a fallback, consider subscriptions with an endDate in the past and not active
  if (
    subscription.endDate &&
    new Date(subscription.endDate) <= new Date() &&
    directStatus !== "active"
  ) {
    return true;
  }

  return false;
};

const isActiveSubscription = (subscription) => {
  if (isCancelledSubscription(subscription)) {
    return false;
  }

  const directStatus = String(subscription.status || "").toLowerCase();
  if (directStatus === "active") {
    return true;
  }

  const paypalStatus = getPaypalStatus(subscription);
  return paypalStatus === "active";
};

const getPaypalData = (subscription) => {
  const rawData = subscription.paypalData;
  if (!rawData) {
    return null;
  }

  if (typeof rawData === "string") {
    try {
      return JSON.parse(rawData);
    } catch (error) {
      return null;
    }
  }

  return rawData;
};

const getCyclesCompleted = (subscription) => {
  const paypalData = getPaypalData(subscription);
  if (!paypalData) {
    return isActiveSubscription(subscription) ? 1 : 0;
  }

  const executions = paypalData?.billing_info?.cycle_executions;
  let cyclesCompleted = 0;

  if (Array.isArray(executions)) {
    cyclesCompleted = executions.reduce((total, execution) => {
      const cycles = parseInt(execution?.cycles_completed, 10);
      return total + (Number.isNaN(cycles) ? 0 : cycles);
    }, 0);
  }

  const price = parseFloat(subscription.price || 0);
  if (cyclesCompleted === 0 && price > 0) {
    const lastPaymentAmount = parseFloat(
      paypalData?.billing_info?.last_payment?.amount?.value || 0,
    );
    if (lastPaymentAmount > 0) {
      const inferredCycles = Math.round(lastPaymentAmount / price);
      if (inferredCycles >= 1) {
        cyclesCompleted = inferredCycles;
      } else {
        cyclesCompleted = 1;
      }
    }
  }

  if (cyclesCompleted === 0 && isActiveSubscription(subscription)) {
    cyclesCompleted = 1;
  }

  return cyclesCompleted;
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizePlanType = (planType) => {
  const normalized = String(planType || "").toLowerCase();
  return PLAN_KEYS.includes(normalized) ? normalized : "sin_plan";
};

const extractSubscriptionPeriod = (subscription) => {
  const planType = normalizePlanType(subscription.planType);
  const startDate =
    parseDate(subscription.startDate) ||
    parseDate(subscription.createdAt) ||
    parseDate(subscription.updatedAt);

  let endDate = null;
  if (isCancelledSubscription(subscription)) {
    const paypalData = getPaypalData(subscription);
    endDate =
      parseDate(subscription.endDate) ||
      parseDate(paypalData?.cancelled_at) ||
      parseDate(paypalData?.cancelTime) ||
      parseDate(subscription.updatedAt);
  }

  return {
    planType,
    startDate,
    endDate,
  };
};

const getPlanForMoment = (timeline, userId, moment) => {
  if (!userId) {
    return "sin_plan";
  }

  const periods = timeline.get(userId);
  if (!periods || periods.length === 0) {
    return "sin_plan";
  }

  const reference = parseDate(moment);
  if (!reference) {
    return periods[periods.length - 1].planType;
  }

  const target = reference.getTime();

  for (let index = periods.length - 1; index >= 0; index -= 1) {
    const period = periods[index];
    if (!period.startDate) {
      continue;
    }

    const startTime = period.startDate.getTime();
    if (startTime > target) {
      continue;
    }

    if (!period.endDate || target < period.endDate.getTime()) {
      return period.planType;
    }
  }

  return periods[0].planType || "sin_plan";
};

const getDashboardMetrics = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    const subscriptionWhere = {
      createdAt: {
        [Op.gte]: startOfYear,
        [Op.lt]: startOfNextYear,
      },
    };

    const connectionWhere = {
      createdAt: {
        [Op.gte]: startOfYear,
        [Op.lt]: startOfNextYear,
      },
    };

    const queryWhere = {
      type: "user",
      cancelado: {
        [Op.not]: true,
      },
      createdAt: {
        [Op.gte]: startOfYear,
        [Op.lt]: startOfNextYear,
      },
    };

    const queryCancelledWhere = {
      cancelado: true,
      type: "user",
      createdAt: {
        [Op.gte]: startOfYear,
        [Op.lt]: startOfNextYear,
      },
    };

    const [
      subscriptions,
      connections,
      queryMessages,
      cancelledQueryMessages,
      cancellationCandidates,
      allActiveSubs,
      allUsers,
    ] = await Promise.all([
      Subscription.findAll({ where: subscriptionWhere }),
      ConexionDB.findAll({
        where: connectionWhere,
        include: [{ model: MotorDB, as: "motor", attributes: ["nombre"] }],
      }),
      ChatMessage.findAll({
        where: queryWhere,
        attributes: ["id", "createdAt"],
        include: [{ model: Chat, as: "chat", attributes: ["userId"] }],
      }),
      ChatMessage.findAll({
        where: queryCancelledWhere,
        attributes: ["id", "createdAt"],
        include: [{ model: Chat, as: "chat", attributes: ["userId"] }],
      }),
      Subscription.findAll({
        where: {
          updatedAt: {
            [Op.gte]: startOfYear,
            [Op.lt]: startOfNextYear,
          },
        },
      }),
      Subscription.findAll({ where: { status: "active" } }),
      User.findAll({ attributes: ["id", "email"] }),
    ]);

    const cancellations = cancellationCandidates.filter((subscription) =>
      isCancelledSubscription(subscription),
    );

    const relevantSubscriptions = subscriptions.filter((sub) =>
      isActiveSubscription(sub) || isCancelledSubscription(sub),
    );

    const subscriptionTimeline = new Map();

    const registerSubscriptionPeriod = (subscription) => {
      const period = extractSubscriptionPeriod(subscription);
      if (!period.startDate) {
        return;
      }

      const timeline = subscriptionTimeline.get(subscription.userId) || [];
      timeline.push(period);
      subscriptionTimeline.set(subscription.userId, timeline);
    };

    relevantSubscriptions.forEach(registerSubscriptionPeriod);
    allActiveSubs.forEach(registerSubscriptionPeriod);
    cancellationCandidates.forEach(registerSubscriptionPeriod);

    subscriptionTimeline.forEach((periods, userId) => {
      periods.sort((a, b) => a.startDate - b.startDate);
      for (let index = 0; index < periods.length - 1; index += 1) {
        const current = periods[index];
        const next = periods[index + 1];

        if (!current.startDate || !next.startDate) {
          continue;
        }

        if (!current.endDate || current.endDate > next.startDate) {
          current.endDate = new Date(next.startDate.getTime());
        }
      }
      subscriptionTimeline.set(userId, periods);
    });

    const revenue = relevantSubscriptions.reduce((acc, sub) => {
      const price = parseFloat(sub.price || 0);
      if (!price || Number.isNaN(price)) {
        return acc;
      }

      const cyclesCompleted = getCyclesCompleted(sub);
      return acc + price * cyclesCompleted;
    }, 0);

    const activeSubscriptions = relevantSubscriptions.filter((sub) =>
      isActiveSubscription(sub),
    ).length;

    const totalConnections = connections.length;
    const totalQueries = queryMessages.length;
    const totalQueryCancellations = cancelledQueryMessages.length;

    const subscriptionMonthly = buildMonthlyTemplate();
    const cancellationMonthly = buildMonthlyTemplate();
    const connectionMonthly = buildMonthlyTemplate().map((bucket) => ({
      ...bucket,
      engines: {},
    }));
    const queryMonthly = buildMonthlyTemplate().map((bucket) => ({
      ...bucket,
      plans: createPlanBucket(),
    }));
    const queryCancelledMonthly = buildMonthlyTemplate();

    relevantSubscriptions.forEach((sub) => {
      addToMonthly(subscriptionMonthly, sub.createdAt);
    });

    cancellations.forEach((sub) => {
      addToMonthly(cancellationMonthly, sub.updatedAt);
    });

    connections.forEach((connection) => {
      const monthIndex = toMonthIndex(connection.createdAt);
      if (monthIndex < 0 || monthIndex > 11) {
        return;
      }
      connectionMonthly[monthIndex].value += 1;
      const engineName = connection.motor?.nombre || "Desconocido";
      connectionMonthly[monthIndex].engines[engineName] =
        (connectionMonthly[monthIndex].engines[engineName] || 0) + 1;
    });

    queryMessages.forEach((message) => {
      const monthIndex = toMonthIndex(message.createdAt);
      if (monthIndex < 0 || monthIndex > 11) {
        return;
      }

      addToMonthly(queryMonthly, message.createdAt);

      const userId = message.chat?.userId;
      const planKey = getPlanForMoment(
        subscriptionTimeline,
        userId,
        message.createdAt,
      );
      const planBucket = queryMonthly[monthIndex].plans;
      if (planBucket && planKey) {
        planBucket[planKey] = (planBucket[planKey] || 0) + 1;
      }
    });

    cancelledQueryMessages.forEach((message) => {
      addToMonthly(queryCancelledMonthly, message.createdAt);
    });

    const activeUsers = new Set(
      allActiveSubs.map((subscription) => subscription.userId),
    ).size;

    const avgRevenuePerUser = activeUsers
      ? parseFloat((revenue / activeUsers).toFixed(2))
      : 0;

    const totalUsers = allUsers.length;
    const adoptionRate = totalUsers
      ? parseFloat(((activeSubscriptions / totalUsers) * 100).toFixed(2))
      : 0;

    const churnBase = cancellations.length + activeSubscriptions;

    const churnRate = churnBase
      ? parseFloat(
          ((cancellations.length / churnBase) * 100).toFixed(2),
        )
      : 0;

    const queryCancellationRate = totalQueries
      ? parseFloat(
          ((totalQueryCancellations / totalQueries) * 100).toFixed(2),
        )
      : 0;

    return res.json({
      timeframe: {
        year: currentYear,
        generatedAt: now.toISOString(),
      },
      kpis: {
        totalRevenue: parseFloat(revenue.toFixed(2)),
        activeSubscriptions,
        totalConnections,
        totalQueries,
        totalQueryCancellations,
        activeUsers,
        avgRevenuePerUser,
        adoptionRate,
        churnRate,
        queryCancellationRate,
      },
      charts: {
        subscriptions: subscriptionMonthly,
        cancellations: cancellationMonthly,
        connections: connectionMonthly,
        queries: queryMonthly,
        queryCancellations: queryCancelledMonthly,
      },
    });
  } catch (error) {
    console.error("Error building admin dashboard metrics", error);
    return res.status(500).json({ error: "Failed to build dashboard metrics" });
  }
};

const listAdminUsers = async (req, res) => {
  try {
    const admins = await AdminUser.findAll({
      where: { isActive: true },
      attributes: ["id", "email", "name", "createdAt", "updatedAt"],
      order: [["createdAt", "ASC"]],
    });

    return res.json({
      admins: admins.map((admin) => ({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error listing admin users", error);
    return res.status(500).json({ error: "Failed to fetch admin users" });
  }
};

const listSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "nombres",
            "apellidos",
            "email",
            "telefono",
            "pais",
            "createdAt",
          ],
        },
      ],
    });

    const serialized = tickets
      .map(serializeSupportTicket)
      .sort((a, b) => {
        const statusDiff =
          (ticketStatusOrder[a.status] || 99) -
          (ticketStatusOrder[b.status] || 99);
        if (statusDiff !== 0) {
          return statusDiff;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    return res.json({ tickets: serialized });
  } catch (error) {
    console.error("Error listing support tickets", error);
    return res.status(500).json({ error: "Failed to fetch support tickets" });
  }
};

const updateSupportTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body || {};

    if (!status || !ADMIN_TICKET_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid ticket status" });
    }

    const ticket = await SupportTicket.findByPk(ticketId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "nombres",
            "apellidos",
            "email",
            "telefono",
            "pais",
            "createdAt",
          ],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found" });
    }

    if (ticket.status !== status) {
      ticket.status = status;
      await ticket.save();
      await ticket.reload({
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "id",
              "nombres",
              "apellidos",
              "email",
              "telefono",
              "pais",
              "createdAt",
            ],
          },
        ],
      });
    }

    return res.json({
      success: true,
      ticket: serializeSupportTicket(ticket),
    });
  } catch (error) {
    console.error("Error updating support ticket status", error);
    return res.status(500).json({ error: "Failed to update ticket status" });
  }
};

module.exports = {
  getDashboardMetrics,
  listAdminUsers,
  listSupportTickets,
  updateSupportTicketStatus,
};
