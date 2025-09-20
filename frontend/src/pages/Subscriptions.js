import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  Spinner,
  Modal,
} from "react-bootstrap";

import { useSubscription } from "../contexts/SubscriptionContext";

const Subscriptions = () => {
  const { autoSyncActive } = useSubscription();
  const [plans, setPlans] = useState({});
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isInGracePeriod, setIsInGracePeriod] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingPlanType, setLoadingPlanType] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscriptionStats, setSubscriptionStats] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPlans(),
        loadCurrentSubscription(),
        loadSubscriptionStats(),
      ]);
    } catch (err) {
      setError("Error al cargar la información");
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await fetch("/api/subscriptions/plans");
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (err) {
      console.error("Error loading plans:", err);
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;
      const data = await subscriptionService.getCurrentSubscription();
      if (data.success) {
        setCurrentSubscription(data.data);
        setHasActiveSubscription(data.hasActiveSubscription);
        setIsInGracePeriod(data.isInGracePeriod || false);
      }
    } catch (err) {
      console.error("Error loading current subscription:", err);
    }
  };

  const loadSubscriptionStats = async () => {
    try {
      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;
      const data = await subscriptionService.getSubscriptionStats();
      if (data.success) {
        setSubscriptionStats(data.data);
      }
    } catch (err) {
      console.error("Error loading subscription stats:", err);
    }
  };

  const handleSubscribe = async (planType) => {
    try {
      setLoadingPlanType(planType);
      setError("");
      setSuccess("");

      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;
      const data = await subscriptionService.createSubscription(planType);

      if (data.success && data.data.data.approvalUrl) {
        // Redirect to PayPal for approval
        window.location.href = data.data.data.approvalUrl;
      } else {
        setError(data.error || "Error al crear la suscripción");
      }
    } catch (err) {
      setError("Error al crear la suscripción");
    } finally {
      setLoadingPlanType(null);
    }
  };

  const handleUpdateSubscription = async (newPlanType) => {
    try {
      setLoadingPlanType(newPlanType);
      setError("");
      setSuccess("");

      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;
      const data = await subscriptionService.updateSubscription(newPlanType);

      if (data.success && data.data.data.approvalUrl) {
        // Redirect to PayPal for approval
        window.location.href = data.data.data.approvalUrl;
      } else {
        setError(data.error || "Error al actualizar la suscripción");
      }
    } catch (err) {
      setError("Error al actualizar la suscripción");
    } finally {
      setLoadingPlanType(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoadingPlanType("cancel");
      setError("");
      setSuccess("");

      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;
      const data = await subscriptionService.cancelSubscription(
        "Usuario solicitó cancelación",
      );

      if (data.success) {
        setSuccess("Suscripción cancelada correctamente");
        setShowCancelModal(false);
        loadData();
      } else {
        setError(data.error || "Error al cancelar la suscripción");
      }
    } catch (err) {
      setError("Error al cancelar la suscripción");
    } finally {
      setLoadingPlanType(null);
    }
  };

  const handleSyncSubscription = async () => {
    if (!currentSubscription?.subscriptionId) return;

    try {
      setSyncLoading(true);
      setError("");
      setSyncSuccess("");

      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;

      const result = await subscriptionService.syncSubscription(
        currentSubscription.subscriptionId,
      );

      if (result.success) {
        setSyncSuccess("Suscripción sincronizada correctamente");
        // Reload all data
        await loadData();

        // Clear success message after 3 seconds
        setTimeout(() => setSyncSuccess(""), 3000);
      }
    } catch (err) {
      setError("Error al sincronizar suscripción: " + err.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: "success", text: "Activa" },
      pending: { variant: "warning", text: "Pendiente" },
      cancelled: { variant: "danger", text: "Cancelada" },
      suspended: { variant: "secondary", text: "Suspendida" },
      expired: { variant: "dark", text: "Expirada" },
    };

    const config = statusConfig[status] || {
      variant: "secondary",
      text: status,
    };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-ES");
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {syncSuccess && (
        <Alert variant="info" dismissible onClose={() => setSyncSuccess("")}>
          <i className="bi bi-check-circle me-2"></i>
          {syncSuccess}
        </Alert>
      )}

      {/* Plans */}
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">Planes Disponibles</h2>
        </Col>
      </Row>

      <Row className="justify-content-center">
        {Object.entries(plans).map(([planType, plan]) => {
          const isCurrentPlan =
            currentSubscription?.planType === planType && hasActiveSubscription;
          const planHierarchy = { bronce: 1, plata: 2, oro: 3 };
          const canUpgrade =
            hasActiveSubscription &&
            planHierarchy[planType] >
              planHierarchy[currentSubscription?.planType];
          const canDowngrade =
            hasActiveSubscription &&
            planHierarchy[planType] <
              planHierarchy[currentSubscription?.planType];

          return (
            <Col key={planType} md={4} className="mb-4">
              <Card
                className={`h-100 ${isCurrentPlan ? "border-success shadow" : ""} ${planType === "plata" ? "border-primary" : ""}`}
              >
                {planType === "plata" && (
                  <div className="position-absolute top-0 start-50 translate-middle">
                    <Badge bg="primary" className="px-3 py-2">
                      Más Popular
                    </Badge>
                  </div>
                )}
                <Card.Header
                  className={`text-center ${planType === "oro" ? "bg-warning" : planType === "plata" ? "bg-primary text-white" : "bg-light"}`}
                >
                  <h4>{plan.name}</h4>
                  <h2 className="mb-0">
                    {formatPrice(plan.price)}
                    <small>/mes</small>
                  </h2>
                </Card.Header>
                <Card.Body className="d-flex flex-column">
                  <p className="text-muted">{plan.description}</p>
                  <ul className="list-unstyled mb-4">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    {isCurrentPlan ? (
                      <Button variant="success" disabled className="w-100">
                        Plan Actual
                      </Button>
                    ) : hasActiveSubscription ? (
                      canUpgrade ? (
                        <Button
                          variant="primary"
                          className="w-100"
                          onClick={() => handleUpdateSubscription(planType)}
                          disabled={loadingPlanType === planType}
                        >
                          {loadingPlanType === planType ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            "Actualizar Plan"
                          )}
                        </Button>
                      ) : canDowngrade ? (
                        <Button
                          variant="outline-secondary"
                          className="w-100"
                          onClick={() => handleUpdateSubscription(planType)}
                          disabled={loadingPlanType === planType}
                        >
                          {loadingPlanType === planType ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            "Cambiar Plan"
                          )}
                        </Button>
                      ) : null
                    ) : (
                      <Button
                        variant={
                          planType === "plata" ? "primary" : "outline-primary"
                        }
                        className="w-100"
                        onClick={() => handleSubscribe(planType)}
                        disabled={loadingPlanType === planType}
                      >
                        {loadingPlanType === planType ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Suscribirse"
                        )}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Subscription History */}
      {subscriptionStats?.subscriptionHistory?.length > 0 && (
        <Row className="mt-5">
          <Col>
            <h3>Historial de Suscripciones</h3>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Estado</th>
                    <th>Precio</th>
                    <th>Fecha de Inicio</th>
                    <th>Fecha de Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionStats.subscriptionHistory.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <Badge bg="secondary">
                          {sub.planType.charAt(0).toUpperCase() +
                            sub.planType.slice(1)}
                        </Badge>
                      </td>
                      <td>{getStatusBadge(sub.status)}</td>
                      <td>{formatPrice(sub.price)}</td>
                      <td>{formatDate(sub.startDate)}</td>
                      <td>{formatDate(sub.endDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      )}

      {/* Cancel Subscription Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar Suscripción</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que quieres cancelar tu suscripción?</p>
          <Alert variant="warning">
            <strong>Importante:</strong> Una vez cancelada, perderás el acceso a
            las funciones premium al final del período de facturación actual.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            No, Mantener Suscripción
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelSubscription}
            disabled={loadingPlanType === "cancel"}
          >
            {loadingPlanType === "cancel" ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Sí, Cancelar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Subscriptions;
