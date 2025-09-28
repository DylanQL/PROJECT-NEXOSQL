import React, { useState, useEffect, useMemo } from "react";
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
import {
  Gem,
  LightningCharge,
  ShieldLock,
  Trophy,
  GraphUp,
  ArrowRepeat,
  CheckCircleFill,
} from "react-bootstrap-icons";

import { useSubscription } from "../contexts/SubscriptionContext";

const PLAN_ORDER = { bronce: 1, plata: 2, oro: 3 };

const planThemes = {
  bronce: {
    gradient: "linear-gradient(135deg, #475569 0%, #1f2937 100%)",
    textColor: "#f8fafc",
  },
  plata: {
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    textColor: "#f8fafc",
  },
  oro: {
    gradient: "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)",
    textColor: "#1f2937",
  },
};

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
    } catch {
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
        setPlans(data.data || {});
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
        window.location.href = data.data.data.approvalUrl;
      } else {
        setError(data.error || "Error al crear la suscripción");
      }
    } catch {
      setError("Error al crear la suscripción");
    } finally {
      setLoadingPlanType(null);
    }
  };

  const handleUpdateSubscription = async (planType) => {
    try {
      setLoadingPlanType(planType);
      setError("");
      setSuccess("");

      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;
      const data = await subscriptionService.updateSubscription(planType);

      if (data.success && data.data.data.approvalUrl) {
        window.location.href = data.data.data.approvalUrl;
      } else {
        setError(data.error || "Error al actualizar la suscripción");
      }
    } catch {
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
    } catch {
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
        await loadData();
        setTimeout(() => setSyncSuccess("") , 3000);
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

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-US", { style: "currency", currency: "USD" }).format(price);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-ES");
  };

  const sortedPlans = useMemo(() => {
    return Object.entries(plans).sort(
      ([planTypeA], [planTypeB]) =>
        (PLAN_ORDER[planTypeA] || 0) - (PLAN_ORDER[planTypeB] || 0),
    );
  }, [plans]);

  const planIcons = {
    oro: <Trophy size={18} />,
    plata: <LightningCharge size={18} />,
    bronce: <ShieldLock size={18} />,
  };

  if (loading) {
    return (
      <div className="subscriptions-simple subscriptions-simple--loading">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-muted">Preparando tus planes...</p>
      </div>
    );
  }

  return (
    <div className="subscriptions-simple">
      <Container className="py-5">
        <div className="subscriptions-simple__header text-center mb-5">
          <h1 className="mb-3">Gestiona tu suscripción</h1>
          <p className="text-muted mb-4">
            Elige el plan que mejor se ajuste a tus necesidades y cambia en cualquier
            momento. No hay cargos ocultos ni permanencias obligatorias.
          </p>
        </div>

        {(error || success || syncSuccess) && (
          <div className="subscriptions-simple__alerts mb-4">
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
                <CheckCircleFill size={16} className="me-2" />
                {syncSuccess}
              </Alert>
            )}
          </div>
        )}

        {isInGracePeriod && (
          <Alert variant="warning" className="text-center mb-4">
            Tu suscripción se cancelará en {formatDate(currentSubscription?.endDate)}.
          </Alert>
        )}

        <Row className="g-4 justify-content-center">
          {sortedPlans.map(([planType, plan]) => {
            const currentHierarchy = PLAN_ORDER[currentSubscription?.planType] || 0;
            const thisHierarchy = PLAN_ORDER[planType] || 0;
            const isCurrentPlan =
              currentSubscription?.planType === planType && hasActiveSubscription;
            const canUpgrade = hasActiveSubscription && thisHierarchy > currentHierarchy;
            const canDowngrade = hasActiveSubscription && thisHierarchy < currentHierarchy;

            return (
              <Col key={planType} lg={4} md={6} className="d-flex">
                <Card
                  className={`subscription-card flex-fill ${
                    isCurrentPlan ? "subscription-card--active" : ""
                  }`}
                    style={{
                      borderTopLeftRadius: "25px",
                      borderTopRightRadius: "25px",
                    }}
                >
                  <Card.Header
                    className="text-center border-0 py-4 px-3"
                    style={{
                      background: planThemes[planType].gradient,
                      color: planThemes[planType].textColor,
                      borderTopLeftRadius: "24px",
                      borderTopRightRadius: "24px",
                    }}
                  >
                    <div className="subscription-card__heading">
                      <div>
                        <h3 className="subscription-card__title mb-1">{plan.name}</h3>
                        <p className="subscription-card__description mb-0" style={{color: planThemes[planType].textColor, opacity: 0.8}}>
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    <div className="subscription-card__price mb-0">
                      <span>{formatPrice(plan.price)}</span>
                      <small style={{opacity: 0.8}}>/mes</small>
                    </div>
                  </Card.Header>

                  <Card.Body className="d-flex flex-column h-100">

                    <ul className="subscription-card__features">
                      {plan.features?.map((feature, index) => (
                        <li key={index}>
                          <GraphUp size={16} className="text-primary me-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      {isCurrentPlan ? (
                        <Button variant="success" disabled className="w-100">
                          Plan actual
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
                              "Actualizar plan"
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
                              "Cambiar plan"
                            )}
                          </Button>
                        ) : null
                      ) : (
                        <Button
                          variant={planType === "oro" ? "primary" : "outline-primary"}
                          className="w-100"
                          onClick={() => handleSubscribe(planType)}
                          disabled={loadingPlanType === planType}
                        >
                          {loadingPlanType === planType ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            "Suscribirme"
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

        {subscriptionStats?.subscriptionHistory?.length > 0 && (
          <div className="subscription-history mt-5">
            <h3>Historial de suscripciones</h3>
            <div className="subscription-history__table">
              <table>
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Estado</th>
                    <th>Precio</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionStats.subscriptionHistory.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <Badge bg="secondary">
                          {sub.planType.charAt(0).toUpperCase() + sub.planType.slice(1)}
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
          </div>
        )}
      </Container>

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar suscripción</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que quieres cancelar tu suscripción?</p>
          <Alert variant="warning" className="mb-0">
            <strong>Importante:</strong> Una vez cancelada, perderás el acceso a las
            funciones premium al final del período actual.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Mantener suscripción
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelSubscription}
            disabled={loadingPlanType === "cancel"}
          >
            {loadingPlanType === "cancel" ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Confirmar cancelación"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Subscriptions;
