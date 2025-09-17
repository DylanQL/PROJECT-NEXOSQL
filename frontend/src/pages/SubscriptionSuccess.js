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

const SubscriptionSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [subscriptionData, setSubscriptionData] = useState(null);

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

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" role="status" size="lg" className="mb-3">
            <span className="visually-hidden">Confirmando suscripción...</span>
          </Spinner>
          <h4>Confirmando tu suscripción...</h4>
          <p className="text-muted">
            Por favor, espera mientras procesamos tu pago.
          </p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-danger">
              <Card.Header className="bg-danger text-white text-center">
                <h4 className="mb-0">
                  <i className="bi bi-x-circle me-2"></i>
                  Error en la Suscripción
                </h4>
              </Card.Header>
              <Card.Body className="text-center">
                <Alert variant="danger">{error}</Alert>
                <p className="text-muted mb-4">
                  Ha ocurrido un problema al procesar tu suscripción. No te
                  preocupes, no se ha realizado ningún cargo.
                </p>
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <Button
                    variant="primary"
                    onClick={() => navigate("/subscriptions")}
                  >
                    Intentar de Nuevo
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/profile")}
                  >
                    Ir al Perfil
                  </Button>
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
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="border-success shadow">
              <Card.Header className="bg-success text-white text-center">
                <h2 className="mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  ¡Suscripción Exitosa!
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-4">
                  <h4 className="text-success">
                    ¡Bienvenido a NexoSQL Premium!
                  </h4>
                  <p className="lead text-muted">
                    Tu suscripción ha sido activada correctamente. Ahora puedes
                    disfrutar de todas las funciones premium.
                  </p>
                </div>

                <Row className="mb-4">
                  <Col md={6}>
                    <Card className="h-100 border-0 bg-light">
                      <Card.Body>
                        <h6 className="text-primary">
                          <i className="bi bi-credit-card me-2"></i>
                          Detalles de la Suscripción
                        </h6>
                        <hr />
                        <p>
                          <strong>Plan:</strong>{" "}
                          {getPlanName(subscriptionData.planType)}
                        </p>
                        <p>
                          <strong>Precio:</strong>{" "}
                          {formatPrice(subscriptionData.price)}/mes
                        </p>
                        <p>
                          <strong>Estado:</strong>
                          <span className="badge bg-success ms-2">
                            {subscriptionData.status === "active"
                              ? "Activa"
                              : subscriptionData.status}
                          </span>
                        </p>
                        <p>
                          <strong>ID de Suscripción:</strong>
                          <small className="text-muted d-block">
                            {subscriptionData.subscriptionId}
                          </small>
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="h-100 border-0 bg-light">
                      <Card.Body>
                        <h6 className="text-primary">
                          <i className="bi bi-calendar me-2"></i>
                          Fechas Importantes
                        </h6>
                        <hr />
                        <p>
                          <strong>Fecha de Inicio:</strong>{" "}
                          {formatDate(subscriptionData.startDate)}
                        </p>
                        {subscriptionData.nextBillingDate && (
                          <p>
                            <strong>Próximo Cobro:</strong>{" "}
                            {formatDate(subscriptionData.nextBillingDate)}
                          </p>
                        )}
                        <p>
                          <strong>Creado el:</strong>{" "}
                          {formatDate(subscriptionData.createdAt)}
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Alert variant="info">
                  <h6>
                    <i className="bi bi-info-circle me-2"></i>¿Qué sigue?
                  </h6>
                  <ul className="mb-0">
                    <li>
                      Ya puedes crear y gestionar conexiones de base de datos
                    </li>
                    <li>Accede a todas las funciones de IA avanzada</li>
                    <li>Disfruta de soporte prioritario</li>
                    <li>
                      Recibirás un email de confirmación con todos los detalles
                    </li>
                  </ul>
                </Alert>

                <div className="text-center mt-4">
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleContinue}
                      className="px-4"
                    >
                      <i className="bi bi-arrow-right me-2"></i>
                      Comenzar a Usar NexoSQL
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="lg"
                      onClick={handleViewProfile}
                    >
                      Ver Mi Perfil
                    </Button>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="text-center">
                  <h6 className="text-muted">¿Necesitas ayuda?</h6>
                  <p className="small text-muted mb-0">
                    Si tienes alguna pregunta sobre tu suscripción, visita
                    nuestro{" "}
                    <Button variant="link" className="p-0">
                      centro de ayuda
                    </Button>{" "}
                    o contáctanos en{" "}
                    <a href="mailto:soporte@nexosql.com">soporte@nexosql.com</a>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Features Preview */}
        <Row className="mt-5">
          <Col>
            <h3 className="text-center mb-4">¿Qué puedes hacer ahora?</h3>
          </Col>
        </Row>
        <Row>
          <Col md={4} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <i
                  className="bi bi-database text-primary"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h5 className="mt-3">Conexiones Avanzadas</h5>
                <p className="text-muted">
                  Conecta múltiples bases de datos y gestiona todas tus
                  conexiones desde un solo lugar.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <i
                  className="bi bi-robot text-success"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h5 className="mt-3">IA Avanzada</h5>
                <p className="text-muted">
                  Utiliza nuestro asistente de IA para optimizar consultas y
                  resolver problemas complejos.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <i
                  className="bi bi-headset text-warning"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h5 className="mt-3">Soporte Prioritario</h5>
                <p className="text-muted">
                  Recibe ayuda especializada y soporte técnico cuando lo
                  necesites.
                </p>
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
