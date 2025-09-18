import React, { useState, useEffect } from "react";
import {
  Card,
  ProgressBar,
  Badge,
  Alert,
  Button,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";

const ConnectionLimitInfo = ({
  currentConnectionCount = 0,
  showUpgradeButton = true,
}) => {
  const { currentUser } = useAuth();
  const {
    currentSubscription,
    hasActiveSubscription,
    subscriptionLoading,
    getPlanDetails,
  } = useSubscription();
  const navigate = useNavigate();
  const [connections, setConnections] = useState(currentConnectionCount);
  const [loading, setLoading] = useState(false);

  const loadConnectionCount = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/conexiones", {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-firebase-uid": currentUser?.uid || "",
        },
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setConnections(data.data.length);
      }
    } catch (err) {
      console.error("Error loading connection count:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  // Load connection count if not provided
  useEffect(() => {
    if (currentConnectionCount === 0) {
      // Always try to load connection count, even without subscription
      // This allows the backend to return empty array for users without subscription
      loadConnectionCount();
    } else {
      setConnections(currentConnectionCount);
    }
  }, [currentConnectionCount, loadConnectionCount]);

  if (subscriptionLoading || loading) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Cargando información de conexiones...</span>
        </Card.Body>
      </Card>
    );
  }

  if (!hasActiveSubscription || !currentSubscription) {
    return (
      <Alert variant="warning" className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Sin suscripción activa</strong>
            <p className="mb-0 mt-1 small">
              Necesitas una suscripción para crear conexiones de base de datos.
            </p>
          </div>
          {showUpgradeButton && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => navigate("/subscriptions")}
            >
              Ver Planes
            </Button>
          )}
        </div>
      </Alert>
    );
  }

  const planDetails = getPlanDetails(currentSubscription.planType);
  const limit = planDetails?.connectionLimit || 0;
  const remaining = Math.max(0, limit - connections);
  const percentageUsed = limit > 0 ? (connections / limit) * 100 : 0;

  // Determine the variant based on usage
  let progressVariant = "success";
  let alertVariant = "info";

  if (percentageUsed >= 90) {
    progressVariant = "danger";
    alertVariant = "danger";
  } else if (percentageUsed >= 75) {
    progressVariant = "warning";
    alertVariant = "warning";
  } else if (percentageUsed >= 50) {
    progressVariant = "info";
  }

  const getPlanBadgeColor = (planType) => {
    switch (planType) {
      case "oro":
        return "warning";
      case "plata":
        return "info";
      case "bronce":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <i className="bi bi-hdd-network me-2 text-primary"></i>
          <span className="fw-bold">Límite de Conexiones</span>
        </div>
        <Badge bg={getPlanBadgeColor(currentSubscription.planType)}>
          Plan{" "}
          {currentSubscription.planType.charAt(0).toUpperCase() +
            currentSubscription.planType.slice(1)}
        </Badge>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">Conexiones utilizadas</span>
            <span className="fw-bold">
              {connections} de {limit}
            </span>
          </div>
          <ProgressBar
            now={percentageUsed}
            variant={progressVariant}
            className="mb-2"
            style={{ height: "8px" }}
          />
          <div className="d-flex justify-content-between">
            <small className="text-muted">
              {remaining > 0 ? (
                <span className="text-success">
                  <i className="bi bi-check-circle me-1"></i>
                  {remaining} conexiones disponibles
                </span>
              ) : (
                <span className="text-danger">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  Límite alcanzado
                </span>
              )}
            </small>
            <small className="text-muted">
              {Math.round(percentageUsed)}% usado
            </small>
          </div>
        </div>

        {/* Warning when approaching limit */}
        {percentageUsed >= 75 && remaining > 0 && (
          <Alert variant={alertVariant} className="mb-3 py-2">
            <small>
              <i className="bi bi-info-circle me-1"></i>
              Estás cerca del límite de tu plan. Te quedan {remaining}{" "}
              conexiones disponibles.
            </small>
          </Alert>
        )}

        {/* Limit reached alert */}
        {remaining === 0 && (
          <Alert variant="danger" className="mb-3 py-2">
            <small>
              <i className="bi bi-exclamation-triangle me-1"></i>
              Has alcanzado el límite de conexiones de tu plan.
            </small>
          </Alert>
        )}

        {/* Plan features */}
        <div className="mt-3">
          <h6 className="text-muted mb-2">
            <i className="bi bi-star me-1"></i>
            Características de tu plan:
          </h6>
          <ul className="list-unstyled mb-0 small">
            {planDetails?.features?.slice(0, 3).map((feature, index) => (
              <li key={index} className="mb-1">
                <i className="bi bi-check text-success me-2"></i>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade button */}
        {showUpgradeButton && (remaining <= 2 || percentageUsed >= 75) && (
          <div className="mt-3 pt-2 border-top">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">¿Necesitas más conexiones?</small>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate("/subscriptions")}
              >
                <i className="bi bi-arrow-up-circle me-1"></i>
                Actualizar Plan
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ConnectionLimitInfo;
