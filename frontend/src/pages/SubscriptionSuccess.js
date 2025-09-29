import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import "../styles/SubscriptionSuccess.css";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();
  const { refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [refreshingContexts, setRefreshingContexts] = useState(false);

  useEffect(() => {
    confirmSubscription();
  }, []);

  const confirmSubscription = async () => {
    try {
      setLoading(true);

      // Get parameters from URL
      const subscriptionId = searchParams.get("subscription_id");
      const token = searchParams.get("token");
      const payerId = searchParams.get("PayerID");

      if (!subscriptionId) {
        setError("ID de suscripción no encontrado en la URL");
        return;
      }

      // Confirm subscription with backend
      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;
      const data = await subscriptionService.confirmSubscription(
        subscriptionId,
        token,
        payerId,
      );

      if (data.success) {
        setSuccess(true);
        setSubscriptionData(data.data.data);

        // Force refresh of subscription context to get updated data
        setRefreshingContexts(true);
        console.log("Subscription confirmed successfully, refreshing contexts...");
        
        try {
          // Refresh subscription context
          await refreshSubscription();
          console.log("Subscription context refreshed successfully");
          setRefreshingContexts(false);
        } catch (refreshError) {
          console.error("Error refreshing contexts:", refreshError);
          setRefreshingContexts(false);
        }
      } else {
        setError(data.error || "Error al confirmar la suscripción");
      }
    } catch (err) {
      console.error("Error confirming subscription:", err);
      setError(
        "Error al confirmar la suscripción. Por favor, contacta con soporte.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = (planType) => {
    const planNames = {
      bronce: "Plan Bronce",
      plata: "Plan Plata",
      oro: "Plan Oro",
    };
    return planNames[planType] || planType;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleContinue = () => {
    navigate("/conexiones");
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

  // Add confetti effect on component mount
  useEffect(() => {
    if (success && subscriptionData) {
      // Create confetti particles
      const createConfetti = () => {
        for (let i = 0; i < 50; i++) {
          const confetti = document.createElement('div');
          confetti.className = `confetti-particle confetti-${(i % 5) + 1}`;
          confetti.style.left = Math.random() * 100 + 'vw';
          confetti.style.animationDelay = Math.random() * 3 + 's';
          confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
          document.body.appendChild(confetti);

          // Remove confetti after animation
          setTimeout(() => {
            if (confetti.parentNode) {
              confetti.parentNode.removeChild(confetti);
            }
          }, 5000);
        }
      };

      // Trigger confetti after a slight delay
      const confettiTimer = setTimeout(createConfetti, 500);
      
      return () => {
        clearTimeout(confettiTimer);
      };
    }
  }, [success, subscriptionData]);

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="text-center">
          <div className="mb-4">
            <Spinner 
              animation="border" 
              role="status" 
              size="lg" 
              className="text-primary" 
              style={{ width: "4rem", height: "4rem" }}
            >
              <span className="visually-hidden">Confirmando suscripción...</span>
            </Spinner>
          </div>
          <h4 className="mb-3">Confirmando tu suscripción...</h4>
          <p className="text-muted">
            Por favor, espera mientras procesamos tu pago y activamos tu cuenta premium.
          </p>
          <div className="progress mt-3" style={{ height: "4px", width: "300px", margin: "0 auto" }}>
            <div 
              className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
              style={{ width: "75%" }}
            ></div>
          </div>
        </div>
      </Container>
    );
  }

  if (refreshingContexts) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="text-center">
          <div className="mb-4">
            <Spinner 
              animation="border" 
              role="status" 
              size="lg" 
              className="text-success" 
              style={{ width: "4rem", height: "4rem" }}
            >
              <span className="visually-hidden">Actualizando información...</span>
            </Spinner>
          </div>
          <h4 className="mb-3 text-success">¡Suscripción confirmada!</h4>
          <p className="text-muted">
            Actualizando tu información de suscripción...
          </p>
          <div className="progress mt-3" style={{ height: "4px", width: "300px", margin: "0 auto" }}>
            <div 
              className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
              style={{ width: "95%" }}
            ></div>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow-lg">
              <Card.Header className="text-center py-4" style={{ background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)", color: "white" }}>
                <h3 className="mb-0">
                  <i className="bi bi-exclamation-triangle me-3" style={{ fontSize: "2.5rem" }}></i>
                  <div>Error en la Suscripción</div>
                </h3>
              </Card.Header>
              <Card.Body className="text-center p-5">
                <Alert variant="danger" className="border-0 mb-4">
                  <h5 className="alert-heading mb-2">
                    <i className="bi bi-x-circle me-2"></i>
                    Oops, algo salió mal
                  </h5>
                  <p className="mb-0">{error}</p>
                </Alert>
                <p className="text-muted mb-4 fs-6">
                  Ha ocurrido un problema al procesar tu suscripción. No te
                  preocupes, <strong>no se ha realizado ningún cargo</strong> a tu tarjeta.
                </p>
                <div className="d-grid gap-3 d-md-flex justify-content-md-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate("/subscriptions")}
                    className="px-4"
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Intentar de Nuevo
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={() => navigate("/profile")}
                    className="px-4"
                  >
                    <i className="bi bi-house me-2"></i>
                    Ir al Inicio
                  </Button>
                </div>
                <div className="mt-4 pt-3 border-top">
                  <small className="text-muted">
                    ¿Necesitas ayuda? Contáctanos en{" "}
                    <a href="mailto:soporte@nexosql.com" className="text-decoration-none">
                      soporte@nexosql.com
                    </a>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (success && subscriptionData) {
    return (
      <Container className="py-4 d-flex align-items-center" style={{ minHeight: "80vh" }}>
        <Row className="justify-content-center w-100">
          <Col md={10} lg={8}>
            <Card className="success-card">
              <Card.Header className="success-card-header text-center success-header py-3">
                <h3 className="mb-0 text-white">
                  <i className="bi bi-check-circle me-2 success-icon" style={{ fontSize: "2rem" }}></i>
                  ¡Suscripción Exitosa!
                </h3>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="text-center mb-3 success-content">
                  <h4 className="text-success mb-2">
                    {userProfile?.name 
                      ? `¡Bienvenido ${userProfile.name} a NexoSQL Premium!`
                      : "¡Bienvenido a NexoSQL Premium!"
                    }
                  </h4>
                  <p className="text-muted mb-0">
                    Tu suscripción ha sido activada correctamente.
                  </p>
                </div>

                <Row className="mb-3 success-details">
                  <Col md={6} className="mb-2">
                    <Card className="details-card h-100 bg-light border-0">
                      <Card.Body className="p-3">
                        <h6 className="text-primary mb-2">
                          <i className="bi bi-credit-card me-2"></i>
                          Detalles de Suscripción
                        </h6>
                        <div className="mb-2">
                          <strong className="text-dark">Plan:</strong>
                          <span className="ms-2 badge bg-primary-subtle text-primary">
                            {getPlanName(subscriptionData.planType)}
                          </span>
                        </div>
                        <div className="mb-2">
                          <strong className="text-dark">Precio:</strong>
                          <span className="ms-2 text-success fw-bold">
                            {formatPrice(subscriptionData.price)}/mes
                          </span>
                        </div>
                        <div className="mb-0">
                          <strong className="text-dark">Estado:</strong>
                          <span className="badge bg-success ms-2 px-2 py-1">
                            <i className="bi bi-check-circle me-1"></i>
                            {subscriptionData.status === "active"
                              ? "Activa"
                              : subscriptionData.status}
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6} className="mb-2">
                    <Card className="details-card h-100 bg-light border-0">
                      <Card.Body className="p-3">
                        <h6 className="text-primary mb-2">
                          <i className="bi bi-calendar-check me-2"></i>
                          Fechas
                        </h6>
                        <div className="mb-2">
                          <strong className="text-dark">Inicio:</strong>
                          <div className="text-muted small">
                            {formatDate(subscriptionData.startDate)}
                          </div>
                        </div>
                        {subscriptionData.nextBillingDate && (
                          <div className="mb-2">
                            <strong className="text-dark">Próximo Cobro:</strong>
                            <div className="text-muted small">
                              {formatDate(subscriptionData.nextBillingDate)}
                            </div>
                          </div>
                        )}
                        <div className="mb-0">
                          <strong className="text-dark">Creado:</strong>
                          <div className="text-muted small">
                            {formatDate(subscriptionData.createdAt)}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <div className="text-center success-actions">
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                    <Button
                      className="primary-button celebration-button px-3 py-2"
                      onClick={handleContinue}
                    >
                      <i className="bi bi-arrow-right me-2"></i>
                      Comenzar a Usar NexoSQL
                    </Button>
                    <Button
                      className="secondary-button px-3 py-2"
                      onClick={handleViewProfile}
                    >
                      <i className="bi bi-person me-2"></i>
                      Ver Mi Perfil
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return null;
};

export default SubscriptionSuccess;
