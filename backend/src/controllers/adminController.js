const { Op } = require("sequelize");
const {
  Subscription,
  ConexionDB,
  ChatMessage,
  MotorDB,
  User,
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
      ChatMessage.findAll({ where: queryWhere, attributes: ["id", "createdAt"] }),
      ChatMessage.findAll({
        where: queryCancelledWhere,
        attributes: ["id", "createdAt"],
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
    const queryMonthly = buildMonthlyTemplate();
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
      addToMonthly(queryMonthly, message.createdAt);
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

module.exports = {
  getDashboardMetrics,
};
