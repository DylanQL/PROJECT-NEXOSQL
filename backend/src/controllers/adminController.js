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

    const cancellationWhere = {
      status: "cancelled",
      updatedAt: {
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
      createdAt: {
        [Op.gte]: startOfYear,
        [Op.lt]: startOfNextYear,
      },
    };

    const [
      subscriptions,
      cancellations,
      connections,
      queryMessages,
      cancelledQueryMessages,
      allActiveSubs,
      allUsers,
    ] = await Promise.all([
      Subscription.findAll({ where: subscriptionWhere }),
      Subscription.findAll({
        where: {
          ...cancellationWhere,
          status: {
            [Op.in]: ["cancelled", "canceled"],
          },
        },
      }),
      ConexionDB.findAll({
        where: connectionWhere,
        include: [{ model: MotorDB, as: "motor", attributes: ["nombre"] }],
      }),
      ChatMessage.findAll({ where: queryWhere, attributes: ["id", "createdAt"] }),
      ChatMessage.findAll({
        where: queryCancelledWhere,
        attributes: ["id", "createdAt"],
      }),
      Subscription.findAll({ where: { status: "active" } }),
      User.findAll({ attributes: ["id", "email"] }),
    ]);

    const revenue = subscriptions
      .filter((sub) => sub.status === "active")
      .reduce((acc, sub) => acc + parseFloat(sub.price || 0), 0);

    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.status === "active",
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

    subscriptions.forEach((sub) => {
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

    const churnRate = subscriptions.length
      ? parseFloat(
          (
            (cancellations.length /
              (subscriptions.length + cancellations.length)) *
            100
          ).toFixed(2),
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
