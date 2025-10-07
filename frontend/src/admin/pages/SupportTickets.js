import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Modal, Spinner, Table } from "react-bootstrap";
import { ArrowClockwise, Eye } from "react-bootstrap-icons";
import AdminLayout from "../components/AdminLayout";
import { adminApi } from "../../services/api";

const STATUS_MAP = {
  open: { label: "Sin atender", badgeClass: "admin-badge warn", buttonVariant: "outline-warning" },
  in_progress: { label: "Atendiendo", badgeClass: "admin-badge", buttonVariant: "outline-primary" },
  resolved: { label: "Terminado", badgeClass: "admin-badge", buttonVariant: "outline-success" },
  closed: { label: "Cerrado", badgeClass: "admin-badge error", buttonVariant: "outline-secondary" },
};

const EDITABLE_STATUSES = ["open", "in_progress", "resolved"];

const INCIDENT_LABELS = {
  connection_error: "Error de conexión",
  billing: "Facturación y pagos",
  assistant_ai: "Asistente AI",
  other: "Otro",
};

const formatDateTime = (value) => {
  if (!value) {
    return "Sin registro";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionFeedback, setActionFeedback] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [processing, setProcessing] = useState({});

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await adminApi.getSupportTickets();
    if (result.error) {
      setError(result.error);
      setTickets([]);
    } else {
      setTickets(result.data?.tickets || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleStatusChange = async (ticketId, status) => {
    const currentTicket = tickets.find((ticket) => ticket.id === ticketId);
    if (!currentTicket || currentTicket.status === status) {
      return;
    }

    setProcessing((prev) => ({ ...prev, [ticketId]: true }));
    setActionFeedback(null);
    const result = await adminApi.updateSupportTicketStatus(ticketId, status);
    if (result.error) {
      setActionFeedback({ type: "danger", message: result.error });
    } else {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? result.data.ticket : ticket,
        ),
      );
      setActionFeedback({
        type: "success",
        message: "Estado actualizado correctamente.",
      });
    }
    setProcessing((prev) => {
      const next = { ...prev };
      delete next[ticketId];
      return next;
    });
  };

  const ticketSummary = useMemo(() => {
    if (!tickets.length) {
      return null;
    }

    const summary = {
      total: tickets.length,
      byStatus: {},
    };

    tickets.forEach((ticket) => {
      summary.byStatus[ticket.status] = (summary.byStatus[ticket.status] || 0) + 1;
    });

    return summary;
  }, [tickets]);

  const renderLoading = () => (
    <div className="text-center py-5">
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Cargando tickets...</span>
      </div>
    </div>
  );

  const renderError = () => (
    <Alert variant="danger" className="admin-card">
      <Alert.Heading>No se pudieron obtener los tickets de soporte</Alert.Heading>
      <p>{error}</p>
      <Button variant="outline-light" onClick={loadTickets}>
        <ArrowClockwise className="me-2" /> Reintentar
      </Button>
    </Alert>
  );

  const renderEmptyState = () => (
    <Alert variant="info" className="admin-card text-center">
      <Alert.Heading>No hay tickets registrados</Alert.Heading>
      <p>Aún no se han generado solicitudes de soporte por parte de los usuarios.</p>
    </Alert>
  );

const getNextEditableStatus = (status) => {
  const currentIndex = EDITABLE_STATUSES.indexOf(status);
  if (currentIndex === -1) {
    return null;
  }
  if (currentIndex === EDITABLE_STATUSES.length - 1) {
    return null;
  }
  return EDITABLE_STATUSES[currentIndex + 1];
};

const renderStatusBadge = (status) => {
  const statusInfo = STATUS_MAP[status] || {
    label: status,
    badgeClass: "admin-badge",
  };
  return (
    <span className={statusInfo.badgeClass}>{statusInfo.label}</span>
  );
};

  const renderModalContent = () => {
    if (!selectedTicket) {
      return null;
    }

    return (
      <>
        <Modal.Header closeButton closeLabel="Cerrar">
          <Modal.Title>Detalle del ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h5 className="mb-1">{INCIDENT_LABELS[selectedTicket.incidentType] || selectedTicket.incidentType}</h5>
            {renderStatusBadge(selectedTicket.status)}
          </div>
          <div className="mb-3">
            <h6 className="text-muted mb-1">Descripción</h6>
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {selectedTicket.description}
            </p>
          </div>
          <div className="mb-3">
            <h6 className="text-muted mb-1">Información del usuario</h6>
            {selectedTicket.user ? (
              <ul className="mb-0">
                <li>
                  <strong>Nombre:</strong>{" "}
                  {`${selectedTicket.user.nombres} ${selectedTicket.user.apellidos}`}
                </li>
                <li>
                  <strong>Email:</strong> {selectedTicket.user.email}
                </li>
                {selectedTicket.user.telefono && (
                  <li>
                    <strong>Teléfono:</strong> {selectedTicket.user.telefono}
                  </li>
                )}
                {selectedTicket.user.pais && (
                  <li>
                    <strong>País:</strong> {selectedTicket.user.pais}
                  </li>
                )}
              </ul>
            ) : (
              <p className="mb-0">Usuario no disponible.</p>
            )}
          </div>
          <div className="mb-3">
            <h6 className="text-muted mb-1">Tiempos</h6>
            <ul className="mb-0">
              <li>
                <strong>Creado:</strong> {formatDateTime(selectedTicket.createdAt)}
              </li>
              <li>
                <strong>Actualizado:</strong> {formatDateTime(selectedTicket.updatedAt)}
              </li>
            </ul>
          </div>
          {selectedTicket.metadata && (
            <div>
              <h6 className="text-muted mb-1">Metadata adicional</h6>
              <pre className="bg-dark text-white rounded p-3 mb-0" style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(selectedTicket.metadata, null, 2)}
              </pre>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedTicket(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </>
    );
  };

  if (loading) {
    return <AdminLayout title="Tickets de soporte">{renderLoading()}</AdminLayout>;
  }

  if (error) {
    return <AdminLayout title="Tickets de soporte">{renderError()}</AdminLayout>;
  }

  return (
    <AdminLayout title="Tickets de soporte">
      {ticketSummary && (
        <div className="admin-grid cols-3 mb-4">
          <div className="admin-card">
            <p className="text-muted mb-1">Tickets registrados</p>
            <div className="admin-stat-value">{ticketSummary.total}</div>
            <div className="admin-stat-caption">
              Seguimiento desde el panel administrativo.
            </div>
          </div>
          <div className="admin-card">
            <p className="text-muted mb-1">En espera</p>
            <div className="admin-stat-value">
              {ticketSummary.byStatus.open || 0}
            </div>
            <div className="admin-stat-caption">
              Prioriza los casos urgentes antes de cerrar.
            </div>
          </div>
          <div className="admin-card">
            <p className="text-muted mb-1">En progreso</p>
            <div className="admin-stat-value">
              {ticketSummary.byStatus.in_progress || 0}
            </div>
            <div className="admin-stat-caption">
              Coordina con el equipo de soporte para acelerar la resolución.
            </div>
          </div>
          <div className="admin-card">
            <p className="text-muted mb-1">Terminados</p>
            <div className="admin-stat-value">
              {(ticketSummary.byStatus.resolved || 0) +
                (ticketSummary.byStatus.closed || 0)}
            </div>
            <div className="admin-stat-caption">
              Casos que ya fueron atendidos y pueden archivarse.
            </div>
          </div>
        </div>
      )}

      {actionFeedback && (
        <Alert
          variant={actionFeedback.type}
          onClose={() => setActionFeedback(null)}
          dismissible
        >
          {actionFeedback.message}
        </Alert>
      )}

      <div className="admin-card mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-0">Listado de tickets</h4>
          <small className="text-muted">
            Revisa el detalle y actualiza el estado de cada solicitud.
          </small>
        </div>
        <Button variant="outline-light" size="sm" onClick={loadTickets}>
          <ArrowClockwise className="me-2" />
          Actualizar
        </Button>
      </div>

      {!tickets.length ? (
        renderEmptyState()
      ) : (
        <div className="admin-table-wrapper">
          <Table variant="dark" responsive className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Creado</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => {
                const statusInfo = STATUS_MAP[ticket.status] || {
                  label: ticket.status,
                  badgeClass: "admin-badge",
                  buttonVariant: "outline-light",
                };
                const isEditable = EDITABLE_STATUSES.includes(ticket.status);
                const nextStatus = getNextEditableStatus(ticket.status);
                const isUpdating = processing[ticket.id];

                return (
                  <tr key={ticket.id}>
                    <td>{formatDateTime(ticket.createdAt)}</td>
                    <td>
                      {ticket.user
                        ? `${ticket.user.nombres} ${ticket.user.apellidos}`
                        : "Usuario no disponible"}
                    </td>
                    <td>{ticket.user?.email || "Sin email"}</td>
                    <td>{INCIDENT_LABELS[ticket.incidentType] || ticket.incidentType}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant={statusInfo.buttonVariant || "outline-light"}
                        className="d-inline-flex align-items-center gap-2 px-3"
                        disabled={!isEditable || !nextStatus || isUpdating}
                        onClick={() => nextStatus && handleStatusChange(ticket.id, nextStatus)}
                      >
                        {isUpdating && (
                          <Spinner animation="border" size="sm" role="status">
                            <span className="visually-hidden">Actualizando...</span>
                          </Spinner>
                        )}
                        {statusInfo.label}
                      </Button>
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-light"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <Eye className="me-2" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      <Modal
        show={!!selectedTicket}
        onHide={() => setSelectedTicket(null)}
        centered
        backdrop="static"
      >
        {renderModalContent()}
      </Modal>
    </AdminLayout>
  );
};

export default SupportTickets;
