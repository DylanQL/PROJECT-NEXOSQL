import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Modal, Pagination, Spinner, Table } from "react-bootstrap";
import { ArrowClockwise, Eye } from "react-bootstrap-icons";
import AdminLayout from "../components/AdminLayout";
import { adminApi } from "../../services/api";

const STATUS_MAP = {
  open: {
    label: "Sin atender",
    badgeClass: "admin-badge warn",
    buttonVariant: "warning",
    buttonClassName: "text-dark fw-semibold",
  },
  in_progress: {
    label: "Atendiendo",
    badgeClass: "admin-badge",
    buttonVariant: "info",
    buttonClassName: "text-dark fw-semibold",
  },
  resolved: {
    label: "Terminado",
    badgeClass: "admin-badge",
    buttonVariant: "success",
    buttonClassName: "fw-semibold",
  },
  closed: {
    label: "Cerrado",
    badgeClass: "admin-badge error",
    buttonVariant: "secondary",
    buttonClassName: "fw-semibold",
  },
};

const EDITABLE_STATUSES = ["open", "in_progress", "resolved"];

const INCIDENT_LABELS = {
  connection_error: "Error de conexión",
  billing: "Facturación y pagos",
  assistant_ai: "Asistente AI",
  other: "Otro",
};

const PLAN_LABELS = {
  oro: "Plan Oro",
  plata: "Plan Plata",
  bronce: "Plan Bronce",
};

const PLAN_ORDER = ["oro", "plata", "bronce", "none"];

const formatSubscriptionPlan = (planType) => {
  if (!planType) {
    return "Sin suscripción";
  }
  return PLAN_LABELS[planType] || planType;
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

const getStatusTransitionCopy = (currentStatus, nextStatus, ticket) => {
  const userName = ticket?.user
    ? `${ticket.user.nombres} ${ticket.user.apellidos}`.trim()
    : "el usuario";

  if (currentStatus === "open" && nextStatus === "in_progress") {
    return {
      title: "Confirmar atención",
      body: `Estás por comenzar a atender el ticket de ${userName}. ¿Deseas marcarlo como “Atendiendo”?`,
      confirmLabel: "Sí, comenzar atención",
    };
  }

  if (currentStatus === "in_progress" && nextStatus === "resolved") {
    return {
      title: "Ticket resuelto",
      body: `¿Confirmas que el ticket de ${userName} ya fue atendido y puedes marcarlo como “Terminado”?`,
      confirmLabel: "Sí, marcar como terminado",
    };
  }

  return {
    title: "Actualizar estado",
    body: "¿Confirmas que deseas actualizar el estado del ticket?",
    confirmLabel: "Actualizar",
  };
};

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionFeedback, setActionFeedback] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [processing, setProcessing] = useState({});
  const [statusChangeRequest, setStatusChangeRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

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

  const statusOptions = useMemo(() => Object.keys(STATUS_MAP), []);

  const planOptions = useMemo(() => {
    const values = new Set();
    values.add("none");
    tickets.forEach((ticket) => {
      const planType = ticket.user?.subscriptionPlan || ticket.subscriptionPlan || null;
      values.add(planType || "none");
    });
    return Array.from(values).sort((a, b) => {
      const indexA = PLAN_ORDER.indexOf(a);
      const indexB = PLAN_ORDER.indexOf(b);
      const safeA = indexA === -1 ? PLAN_ORDER.length : indexA;
      const safeB = indexB === -1 ? PLAN_ORDER.length : indexB;
      return safeA - safeB;
    });
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const ticketStatus = ticket.status || "";
      if (statusFilter !== "all" && ticketStatus !== statusFilter) {
        return false;
      }

      const planTypeRaw = ticket.user?.subscriptionPlan || ticket.subscriptionPlan || null;
      const planKey = planTypeRaw || "none";
      if (planFilter !== "all" && planKey !== planFilter) {
        return false;
      }

      return true;
    });
  }, [tickets, statusFilter, planFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, planFilter]);

  useEffect(() => {
    const totalPagesCalc = Math.max(1, Math.ceil(filteredTickets.length / rowsPerPage));
    if (currentPage > totalPagesCalc) {
      setCurrentPage(totalPagesCalc);
    }
  }, [filteredTickets.length, rowsPerPage, currentPage]);

  const totalTickets = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalTickets / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalTickets === 0 ? 0 : (safeCurrentPage - 1) * rowsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + rowsPerPage);
  const endIndex = totalTickets === 0 ? 0 : Math.min(startIndex + rowsPerPage, totalTickets);

  const visiblePages = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [safeCurrentPage, totalPages]);

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handlePlanFilterChange = (event) => {
    setPlanFilter(event.target.value);
  };

  const handleRowsPerPageChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (Number.isNaN(value) || value <= 0) {
      return;
    }
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }
    setCurrentPage(page);
  };

  const handleCancelStatusChange = () => {
    setStatusChangeRequest(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeRequest) {
      return;
    }

    const { ticket, nextStatus } = statusChangeRequest;
    const success = await handleStatusChange(ticket.id, nextStatus);
    if (success) {
      setStatusChangeRequest(null);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    const currentTicket = tickets.find((ticket) => ticket.id === ticketId);
    if (!currentTicket || currentTicket.status === status) {
      return false;
    }

    setProcessing((prev) => ({ ...prev, [ticketId]: true }));
    setActionFeedback(null);
    const result = await adminApi.updateSupportTicketStatus(ticketId, status);
    if (result.error) {
      setActionFeedback({ type: "danger", message: result.error });
      setProcessing((prev) => {
        const next = { ...prev };
        delete next[ticketId];
        return next;
      });
      return false;
    } else {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? result.data.ticket : ticket,
        ),
      );
    }
    setProcessing((prev) => {
      const next = { ...prev };
      delete next[ticketId];
      return next;
    });
    return true;
  };

  const pendingTicket = statusChangeRequest?.ticket || null;
  const isPendingTicketUpdating = pendingTicket
    ? !!processing[pendingTicket.id]
    : false;
  const pendingCopy = statusChangeRequest
    ? getStatusTransitionCopy(
        statusChangeRequest.currentStatus,
        statusChangeRequest.nextStatus,
        pendingTicket,
      )
    : null;

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

  const renderModalContent = () => {
    if (!selectedTicket) {
      return null;
    }

    return (
      <>
        <Modal.Header closeButton closeLabel="Cerrar">
          <Modal.Title>Detalle del ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body className="admin-modal-body">
          <div className="mb-3">
            <h5 className="mb-1 d-flex align-items-center gap-2">
              <span>
                {INCIDENT_LABELS[selectedTicket.incidentType] || selectedTicket.incidentType}
              </span>
              <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                ({STATUS_MAP[selectedTicket.status]?.label || selectedTicket.status})
              </span>
            </h5>
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
                <li>
                  <strong>Suscripción:</strong> {formatSubscriptionPlan(selectedTicket.user.subscriptionPlan || selectedTicket.subscriptionPlan)}
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
      {actionFeedback && (
        <Alert
          variant={actionFeedback.type}
          onClose={() => setActionFeedback(null)}
          dismissible
        >
          {actionFeedback.message}
        </Alert>
      )}

      <div className="admin-card mb-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <h4 className="mb-0">Listado de tickets</h4>
            <small className="text-muted">
              Revisa el detalle y aplica filtros para encontrar incidencias específicas.
            </small>
          </div>
          <Button variant="outline-light" size="sm" onClick={loadTickets}>
            <ArrowClockwise className="me-2" />
            Actualizar
          </Button>
        </div>
        <div className="d-flex flex-column flex-lg-row align-items-lg-end gap-3 mt-3">
          <Form.Group controlId="statusFilter" className="flex-grow-1 flex-lg-grow-0" style={{ minWidth: "200px" }}>
            <Form.Label className="text-muted small mb-1">Estado</Form.Label>
            <Form.Select value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="all">Todos los estados</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {STATUS_MAP[status]?.label || status}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="planFilter" className="flex-grow-1 flex-lg-grow-0" style={{ minWidth: "220px" }}>
            <Form.Label className="text-muted small mb-1">Tipo de suscripción</Form.Label>
            <Form.Select value={planFilter} onChange={handlePlanFilterChange}>
              <option value="all">Todas las suscripciones</option>
              {planOptions.map((plan) => (
                <option key={plan} value={plan}>
                  {plan === "none" ? "Sin suscripción" : formatSubscriptionPlan(plan)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="rowsPerPage" style={{ maxWidth: "160px" }}>
            <Form.Label className="text-muted small mb-1">Resultados por página</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            />
          </Form.Group>
        </div>
      </div>

      {!tickets.length ? (
        renderEmptyState()
      ) : !filteredTickets.length ? (
        <Alert variant="info" className="admin-card">
          <Alert.Heading>Sin resultados</Alert.Heading>
          <p>No se encontraron tickets con los filtros seleccionados. Ajusta los filtros para ver otros registros.</p>
        </Alert>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <Table variant="dark" responsive className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Creado</th>
                  <th>Usuario</th>
                  <th>Suscripción</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
              {paginatedTickets.map((ticket) => {
                const statusInfo = STATUS_MAP[ticket.status] || {
                  label: ticket.status,
                  badgeClass: "admin-badge",
                  buttonVariant: "secondary",
                  buttonClassName: "fw-semibold",
                };
                const isEditable = EDITABLE_STATUSES.includes(ticket.status);
                const nextStatus = getNextEditableStatus(ticket.status);
                const isUpdating = processing[ticket.id];
                const subscriptionPlanType =
                  ticket.user?.subscriptionPlan || ticket.subscriptionPlan || null;

                return (
                  <tr key={ticket.id}>
                    <td>{formatDateTime(ticket.createdAt)}</td>
                    <td>
                      {ticket.user
                        ? `${ticket.user.nombres} ${ticket.user.apellidos}`
                        : "Usuario no disponible"}
                    </td>
                    <td>{formatSubscriptionPlan(subscriptionPlanType)}</td>
                    <td>{INCIDENT_LABELS[ticket.incidentType] || ticket.incidentType}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant={statusInfo.buttonVariant || "outline-light"}
                        className={`d-inline-flex align-items-center gap-2 px-3 ${statusInfo.buttonClassName || ""}`}
                        disabled={!isEditable || !nextStatus || isUpdating}
                        onClick={() =>
                          nextStatus &&
                          setStatusChangeRequest({
                            ticket,
                            currentStatus: ticket.status,
                            nextStatus,
                          })
                        }
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
          <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-center gap-3 mt-3">
            <small className="text-light">
              Mostrando {totalTickets === 0 ? 0 : startIndex + 1} - {endIndex} de {totalTickets} tickets
            </small>
            {totalPages > 1 && (
              <Pagination className="mb-0">
                <Pagination.First disabled={safeCurrentPage === 1} onClick={() => handlePageChange(1)} />
                <Pagination.Prev
                  disabled={safeCurrentPage === 1}
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                />
                {visiblePages.map((page) => (
                  <Pagination.Item
                    key={`page-${page}`}
                    active={page === safeCurrentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                />
                <Pagination.Last
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => handlePageChange(totalPages)}
                />
              </Pagination>
            )}
          </div>
        </>
      )}

      <Modal
        show={!!statusChangeRequest}
        onHide={() => {
          if (!isPendingTicketUpdating) {
            handleCancelStatusChange();
          }
        }}
        centered
        backdrop="static"
        contentClassName="admin-modal"
      >
        {statusChangeRequest && pendingCopy && (
          <>
            <Modal.Header closeButton={!isPendingTicketUpdating} closeLabel="Cerrar confirmación">
              <Modal.Title>{pendingCopy.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="admin-modal-body">
              <p>{pendingCopy.body}</p>
              <div className="d-flex flex-column gap-1 text-muted small">
                <span>
                  Estado actual:{" "}
                  {STATUS_MAP[statusChangeRequest.currentStatus]?.label ||
                    statusChangeRequest.currentStatus}
                </span>
                <span>
                  Próximo estado:{" "}
                  {STATUS_MAP[statusChangeRequest.nextStatus]?.label ||
                    statusChangeRequest.nextStatus}
                </span>
                <span>
                  Creado el {formatDateTime(statusChangeRequest.ticket.createdAt)}
                </span>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-light"
                onClick={handleCancelStatusChange}
                disabled={isPendingTicketUpdating}
                className="px-4"
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                onClick={handleConfirmStatusChange}
                disabled={isPendingTicketUpdating}
                className="d-inline-flex align-items-center gap-2 px-4"
              >
                {isPendingTicketUpdating && (
                  <Spinner animation="border" size="sm" role="status">
                    <span className="visually-hidden">Guardando...</span>
                  </Spinner>
                )}
                {pendingCopy.confirmLabel}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <Modal
        show={!!selectedTicket}
        onHide={() => setSelectedTicket(null)}
        centered
        backdrop="static"
        contentClassName="admin-modal"
      >
        {renderModalContent()}
      </Modal>
    </AdminLayout>
  );
};

export default SupportTickets;
