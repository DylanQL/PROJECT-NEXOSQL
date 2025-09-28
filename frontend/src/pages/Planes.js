import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Accordion,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";

const Planes = () => {
  const { currentUser } = useAuth();
  const { hasActiveSubscription } = useSubscription();
  const navigate = useNavigate();

  const plans = {
    bronce: {
      name: "Plan Bronce",
      price: 5.0,
      connections: 5,
      queries: 500,
      description:
        "Para profesionales o micro-equipos que quieren comenzar a consultar sus bases de datos sin complicaciones.",
      features: [
        "Hasta 5 conexiones de bases de datos",
        "Consultas en lenguaje natural con IA",
        "Reportes y estadísticas en tiempo real",
        "Compatibilidad SQL/NoSQL",
      ],
      color: "secondary",
      popular: false,
    },
    plata: {
      name: "Plan Plata",
      price: 10.0,
      connections: 10,
      queries: 1000,
      description:
        "Para profesionales o micro-equipos que quieren comenzar a consultar sus bases de datos sin complicaciones.",
      features: [
        "Hasta 10 conexiones de bases de datos",
        "Consultas en lenguaje natural con IA",
        "Reportes y estadísticas en tiempo real",
        "Compatibilidad SQL/NoSQL",
      ],
      color: "primary",
      popular: true,
    },
    oro: {
      name: "Plan Oro",
      price: 20.0,
      connections: 20,
      queries: 2000,
      description:
        "Para profesionales o micro-equipos que quieren comenzar a consultar sus bases de datos sin complicaciones.",
      features: [
        "Hasta 20 conexiones de bases de datos",
        "Consultas en lenguaje natural con IA",
        "Reportes y estadísticas en tiempo real",
        "Compatibilidad SQL/NoSQL",
        "Soporte técnico prioritario para resolver dudas y consultas",
      ],
      color: "warning",
      popular: false,
    },
  };

  const planThemes = {
    bronce: {
      gradient: "linear-gradient(135deg, #475569 0%, #1f2937 100%)",
      textColor: "#f8fafc",
      badgeBg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    },
    plata: {
      gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      textColor: "#f8fafc",
      badgeBg: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
    },
    oro: {
      gradient: "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)",
      textColor: "#1f2937",
      badgeBg: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    },
  };

  const sectionStyle = {
    background: "linear-gradient(145deg, #f8fbff 0%, #eef4ff 45%, #f4f6ff 100%)",
    borderRadius: "32px",
    boxShadow: "0 26px 55px rgba(15, 23, 42, 0.12)",
  };

  const cardBaseStyle = {
    borderRadius: "22px",
    background: "rgba(255, 255, 255, 0.93)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    boxShadow: "0 18px 36px rgba(15, 23, 42, 0.12)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  };

  const badgeBaseStyle = {
    borderRadius: "999px",
    boxShadow: "0 16px 40px rgba(37, 99, 235, 0.35)",
  };

  const statsValueStyle = {
    letterSpacing: "-0.02em",
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleSelectPlan = (planType) => {
    if (!currentUser) {
      navigate("/register");
      return;
    }

    if (hasActiveSubscription) {
      navigate("/subscriptions");
      return;
    }

    navigate("/subscriptions");
  };

  return (
    <Container
      className="my-5 py-5 px-3 px-md-5"
      style={sectionStyle}
    >
      <Row className="text-center mb-5">
        <Col>
          <h1 className="fw-bold fs-1 mb-3">Planes de Suscripción</h1>
          <p className="text-muted fs-5 mb-0">
            Elige el plan que mejor se adapte a tus necesidades de desarrollo
          </p>
        </Col>
      </Row>

      {/* Planes detallados */}
      <Row className="justify-content-center g-4">
        {Object.entries(plans).map(([planType, plan]) => (
          <Col key={planType} lg={4} md={6} className="mb-4">
            <Card
              className="h-100 position-relative border-0 shadow-sm"
              style={{
                ...cardBaseStyle,
                boxShadow: plan.popular
                  ? "0 26px 52px rgba(37, 99, 235, 0.22)"
                  : cardBaseStyle.boxShadow,
                transform: plan.popular ? "translateY(-6px)" : "none",
              }}
            >
              {plan.popular && (
                <div className="position-absolute top-0 start-50 translate-middle">
                  <Badge
                    bg="primary"
                    className="px-3 py-2 text-uppercase fw-semibold small"
                    style={{
                      ...badgeBaseStyle,
                      background: planThemes[planType].badgeBg,
                    }}
                  >
                    <i className="bi bi-star-fill me-1"></i>
                    Más Popular
                  </Badge>
                </div>
              )}

              <Card.Header
                className="text-center border-0 py-4 px-3"
                style={{
                  background: planThemes[planType].gradient,
                  color: planThemes[planType].textColor,
                  borderTopLeftRadius: cardBaseStyle.borderRadius,
                  borderTopRightRadius: cardBaseStyle.borderRadius,
                }}
              >
                <h3 className="mb-1 fw-semibold fs-3">{plan.name}</h3>
                <div className="fw-bold fs-1">
                  {formatPrice(plan.price)}
                  <small className="fs-6 opacity-75 ms-1">/mes</small>
                </div>
              </Card.Header>

              <Card.Body className="d-flex flex-column gap-3 px-3 px-lg-4 py-4">
                <p className="text-muted mb-3 text-center small">
                  {plan.description}
                </p>

                <div className="text-center">
                  <div className="row gx-2">
                    <div className="col-6">
                      <div
                        className={`text-${plan.color} fw-semibold fs-3`}
                        style={statsValueStyle}
                      >
                        {plan.connections}
                      </div>
                      <small className="text-muted text-uppercase">
                        Conexiones
                      </small>
                    </div>
                    <div className="col-6">
                      <div
                        className={`text-${plan.color} fw-semibold fs-3`}
                        style={statsValueStyle}
                      >
                        {plan.queries.toLocaleString()}
                      </div>
                      <small className="text-muted text-uppercase">
                        Consultas/mes
                      </small>
                    </div>
                  </div>
                </div>

                <h6 className="mb-2 text-uppercase text-muted small">
                  Características incluidas
                </h6>
                <ul className="list-unstyled flex-grow-1 small mb-0">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="mb-2 d-flex align-items-start">
                      <i
                        className={`bi bi-check-circle-fill text-${plan.color} me-2 mt-1`}
                      ></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3">
                  <Button
                    variant={
                      plan.popular ? plan.color : `outline-${plan.color}`
                    }
                    size="md"
                    className="w-100 fw-semibold py-2"
                    onClick={() => handleSelectPlan(planType)}
                  >
                    {!currentUser
                      ? "Crear cuenta y suscribirse"
                      : hasActiveSubscription
                        ? "Gestionar suscripción"
                        : "Suscribirse ahora"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* FAQ sobre planes */}
      <Row className="mt-5">
        <Col lg={8} className="mx-auto">
          <h3 className="text-center mb-4">Preguntas Frecuentes</h3>
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                ¿Puedo cambiar de plan en cualquier momento?
              </Accordion.Header>
              <Accordion.Body>
                Sí, puedes cambiar tu plan en cualquier momento desde tu panel
                de suscripciones. Los cambios se aplicarán de inmediato.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>
                ¿Qué sucede si excedo mi límite de consultas?
              </Accordion.Header>
              <Accordion.Body>
                Si excedes tu límite mensual de consultas, tendrás que esperar
                hasta que se restablezca el contador el próximo mes. Para acceso
                inmediato, puedes actualizar tu plan.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>
                ¿Hay período de prueba gratuito?
              </Accordion.Header>
              <Accordion.Body>
                No ofrecemos período de prueba gratuito. Sin embargo, puedes
                comenzar con nuestro Plan Bronce que es muy accesible y cambiar
                de plan cuando lo necesites.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>
                ¿Qué tipos de bases de datos soportan?
              </Accordion.Header>
              <Accordion.Body>
                Soportamos las siguientes bases de datos: MySQL, SQL Server,
                PostgreSQL, MariaDB, Oracle y MongoDB. Trabajamos constantemente
                para ampliar esta lista.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>

      {/* Call to action final */}
      <Row className="mt-5 text-center">
        <Col>
          <Card className="border-0 bg-white shadow-sm rounded-4">
            <Card.Body className="py-5 px-4 px-md-5">
              <h3 className="mb-2 fw-semibold">¿Necesitas ayuda para elegir?</h3>
              <p className="text-muted mb-4 small">
                Nuestro equipo está aquí para ayudarte a encontrar el plan
                perfecto para tu proyecto
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button
                  as={Link}
                  to="/como-funciona"
                  variant="outline-primary"
                  className="px-4"
                  size="md"
                >
                  <i className="bi bi-question-circle me-2"></i>
                  Cómo funciona
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  className="px-4"
                  size="md"
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Empezar ahora
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Planes;
