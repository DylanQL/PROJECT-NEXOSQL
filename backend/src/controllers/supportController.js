const SupportTicket = require("../models/SupportTicket");

const VALID_INCIDENT_TYPES = new Set([
  "connection_error",
  "billing",
  "assistant_ai",
  "other",
]);

const createSupportTicket = async (req, res) => {
  try {
    const user = req.user;
    const { description, incidentType } = req.body;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Usuario no autenticado",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        error: "La descripción de la incidencia es obligatoria",
      });
    }

    if (!incidentType || !VALID_INCIDENT_TYPES.has(incidentType)) {
      return res.status(400).json({
        success: false,
        error: "Tipo de incidencia inválido",
      });
    }

    const activeSubscription = await user.getActiveSubscription();

    if (!activeSubscription || !activeSubscription.isActive()) {
      return res.status(403).json({
        success: false,
        error:
          "Se requiere una suscripción activa para crear solicitudes de soporte",
      });
    }

    const ticket = await SupportTicket.create({
      userId: user.id,
      incidentType,
      description: description.trim(),
      status: "open",
    });

    return res.status(201).json({
      success: true,
      ticket: {
        id: ticket.id,
        incidentType: ticket.incidentType,
        description: ticket.description,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating support ticket", error);
    return res.status(500).json({
      success: false,
      error: "Error al crear la solicitud de soporte",
    });
  }
};

module.exports = {
  createSupportTicket,
};
