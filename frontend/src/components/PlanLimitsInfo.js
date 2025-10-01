import React, { useState, useEffect } from "react";
import {
  Card,
  ProgressBar,
  Badge,
  Alert,
  Button,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { userApi, conexionDBApi } from "../services/api";

const PlanLimitsInfo = ({ currentConnectionCount = null }) => {
  const { currentUser } = useAuth();
  const {
    currentSubscription,
    hasActiveSubscription,
    subscriptionLoading,
    getPlanDetails,
  } = useSubscription();
  const navigate = useNavigate();
  
  const [connections, setConnections] = useState(currentConnectionCount || 0);
  const [queryStats, setQueryStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load both connections count and query stats
  const loadPlanData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Load connections if not provided
      if (currentConnectionCount === null) {
        const { data, error: connError } = await conexionDBApi.getUserConnections();
        if (connError) {
          throw new Error(connError);
        }
        setConnections(data?.length || 0);
      } else {
        setConnections(currentConnectionCount);
      }

      // Load query stats
      const { data: queryData, error: queryError } = await userApi.getQueryStats();
      if (queryError) {
        throw new Error(queryError);
      }
      
      if (queryData?.success) {
        setQueryStats(queryData.data);
      }
    } catch (err) {
      console.error("Error loading plan data:", err);
      setError("No se pudo cargar la información del plan");
    } finally {
      setLoading(false);
    }
  }, [currentConnectionCount]);

  useEffect(() => {
    if (currentUser && hasActiveSubscription) {
      loadPlanData();
    }
  }, [currentUser, hasActiveSubscription, loadPlanData]);

  if (subscriptionLoading || loading) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Cargando información del plan...</span>
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
              Necesitas una suscripción para usar NexoSQL y realizar consultas.
            </p>
          </div>
          <Button
            variant="warning"
            size="sm"
            onClick={() => navigate("/subscriptions")}
          >
            Ver Planes
          </Button>
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

  const planDetails = getPlanDetails(currentSubscription.planType);
  const connectionLimit = planDetails?.connectionLimit || 0;
  const queryLimit = queryStats?.limit || planDetails?.maxQueries || 0;
  const queriesUsed = queryStats?.used || 0;
  const queriesRemaining = queryStats?.remaining || 0;

  const connectionPercentage = connectionLimit > 0 ? (connections / connectionLimit) * 100 : 0;
  const queryPercentage = queryLimit > 0 ? (queriesUsed / queryLimit) * 100 : 0;

  // Determine variants based on usage
  const getProgressVariant = (percentage) => {
    if (percentage >= 90) return "danger";
    if (percentage >= 75) return "warning";
    if (percentage >= 50) return "info";
    return "success";
  };

  const connectionVariant = getProgressVariant(connectionPercentage);
  const queryVariant = getProgressVariant(queryPercentage);

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

  const showUpgradeAlert = connectionPercentage >= 75 || queryPercentage >= 75;
  const isAtLimit = connectionPercentage >= 90 || queryPercentage >= 90;

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <i className="bi bi-speedometer2 me-2 text-primary"></i>
          <span className="fw-bold">Límites del Plan</span>
        </div>
        <Badge bg={getPlanBadgeColor(currentSubscription.planType)}>
          Plan{" "}
          {currentSubscription.planType.charAt(0).toUpperCase() +
            currentSubscription.planType.slice(1)}
        </Badge>
      </Card.Header>
      <Card.Body>
        <Row>
          {/* Conexiones */}
          <Col md={6} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-hdd-network me-2 text-muted"></i>
              <span className="text-muted small">Conexiones de BD</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold">
                {connections} de {connectionLimit}
              </span>
              <span className="text-muted small">
                {Math.round(connectionPercentage)}%
              </span>
            </div>
            <ProgressBar
              now={connectionPercentage}
              variant={connectionVariant}
              animated={connectionPercentage >= 90}
            />
            <div className="text-muted small mt-1">
              {connectionLimit - connections > 0 ? (
                <>
                  <i className="bi bi-check-circle me-1"></i>
                  {connectionLimit - connections} disponibles
                </>
              ) : (
                <>
                  <i className="bi bi-exclamation-circle me-1"></i>
                  Límite alcanzado
                </>
              )}
            </div>
          </Col>

          {/* Consultas */}
          <Col md={6}>
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-lightning-charge me-2 text-muted"></i>
              <span className="text-muted small">Consultas mensuales</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold">
                {queriesUsed} de {queryLimit}
              </span>
              <span className="text-muted small">
                {Math.round(queryPercentage)}%
              </span>
            </div>
            <ProgressBar
              now={queryPercentage}
              variant={queryVariant}
              animated={queryPercentage >= 90}
            />
            <div className="text-muted small mt-1">
              {queriesRemaining > 0 ? (
                <>
                  <i className="bi bi-check-circle me-1"></i>
                  {queriesRemaining} disponibles este mes
                </>
              ) : (
                <>
                  <i className="bi bi-exclamation-circle me-1"></i>
                  Límite alcanzado
                </>
              )}
            </div>
          </Col>
        </Row>

        {/* Alert when approaching limits */}
        {showUpgradeAlert && (
          <Alert
            variant={isAtLimit ? "danger" : "warning"}
            className="mb-0 mt-3 py-2"
          >
            <small>
              <i className="bi bi-info-circle me-2"></i>
              {isAtLimit ? (
                <>
                  <strong>¡Atención!</strong> Estás cerca o has alcanzado tus límites.
                  {currentSubscription.planType !== "oro" && (
                    <>
                      {" "}
                      <Button
                        variant={isAtLimit ? "danger" : "warning"}
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
                  Has utilizado más del 75% de tus recursos.
                  {currentSubscription.planType !== "oro" && (
                    <>
                      {" "}Considera mejorar tu plan para obtener más capacidad.
                    </>
                  )}
                </>
              )}
            </small>
          </Alert>
        )}

        {/* Info when all is good */}
        {!showUpgradeAlert && (
          <div className="text-center text-muted small mt-3 pt-2 border-top">
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            Estás dentro de los límites de tu plan
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PlanLimitsInfo;
