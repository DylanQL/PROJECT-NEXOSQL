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
import { userApi } from "../services/api";

const QueryLimitInfo = ({ showUpgradeButton = true }) => {
  const { currentUser } = useAuth();
  const {
    currentSubscription,
    hasActiveSubscription,
    subscriptionLoading,
  } = useSubscription();
  const navigate = useNavigate();
  const [queryStats, setQueryStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadQueryStats = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data, error: apiError } = await userApi.getQueryStats();
      
      if (apiError) {
        throw new Error(apiError);
      }
      
      if (data?.success) {
        setQueryStats(data.data);
      }
    } catch (err) {
      console.error("Error loading query stats:", err);
      setError("No se pudo cargar la información de consultas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser && hasActiveSubscription) {
      loadQueryStats();
    }
  }, [currentUser, hasActiveSubscription, loadQueryStats]);

  if (subscriptionLoading || loading) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Cargando información de consultas...</span>
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
              Necesitas una suscripción para realizar consultas.
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

  if (error) {
    return (
      <Alert variant="danger" className="mb-3">
        <i className="bi bi-exclamation-circle me-2"></i>
        {error}
      </Alert>
    );
  }

  if (!queryStats) {
    return null;
  }

  const { used, limit, remaining, planType } = queryStats;
  const percentageUsed = limit > 0 ? (used / limit) * 100 : 0;

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
          <i className="bi bi-lightning-charge me-2 text-primary"></i>
          <span className="fw-bold">Consultas Mensuales</span>
        </div>
        <Badge bg={getPlanBadgeColor(planType)}>
          Plan{" "}
          {planType?.charAt(0).toUpperCase() + planType?.slice(1)}
        </Badge>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">Consultas utilizadas este mes</span>
            <span className="fw-bold">
              {used} de {limit}
            </span>
          </div>
          <ProgressBar
            now={percentageUsed}
            variant={progressVariant}
            animated={percentageUsed >= 90}
            label={percentageUsed >= 10 ? `${Math.round(percentageUsed)}%` : ""}
          />
        </div>

        {percentageUsed >= 75 && (
          <Alert variant={alertVariant} className="mb-0 py-2">
            <small>
              <i className="bi bi-info-circle me-2"></i>
              {percentageUsed >= 90 ? (
                <>
                  <strong>¡Límite casi alcanzado!</strong> Solo te quedan {remaining}{" "}
                  consultas este mes.
                  {showUpgradeButton && planType !== "oro" && (
                    <>
                      {" "}
                      <Button
                        variant={alertVariant}
                        size="sm"
                        className="ms-2"
                        onClick={() => navigate("/subscriptions")}
                      >
                        Mejorar Plan
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  Has utilizado el {Math.round(percentageUsed)}% de tus consultas
                  mensuales.
                </>
              )}
            </small>
          </Alert>
        )}

        {percentageUsed < 75 && (
          <div className="text-muted small">
            <i className="bi bi-check-circle me-2"></i>
            Te quedan {remaining} consultas disponibles este mes.
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default QueryLimitInfo;
