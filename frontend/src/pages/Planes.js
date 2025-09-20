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
    <Container className="my-5">
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-4 mb-4">Planes de Suscripción</h1>
          <p className="lead text-muted">
            Elige el plan que mejor se adapte a tus necesidades de desarrollo
          </p>
        </Col>
      </Row>

      {/* Planes detallados */}
      <Row className="justify-content-center">
        {Object.entries(plans).map(([planType, plan]) => (
          <Col key={planType} lg={4} md={6} className="mb-4">
            <Card
              className={`h-100 position-relative ${plan.popular ? "border-primary shadow-lg" : "border-0 shadow"}`}
            >
              {plan.popular && (
                <div className="position-absolute top-0 start-50 translate-middle">
                  <Badge bg="primary" className="px-3 py-2 fs-6">
                    <i className="bi bi-star-fill me-1"></i>
                    Más Popular
                  </Badge>
                </div>
              )}

              <Card.Header
                className={`text-center bg-${plan.color} ${plan.color === "warning" ? "text-dark" : "text-white"}`}
              >
                <h3 className="mb-1">{plan.name}</h3>
                <div className="display-4 fw-bold">
                  {formatPrice(plan.price)}
                  <small className="fs-6 opacity-75">/mes</small>
                </div>
              </Card.Header>

              <Card.Body className="d-flex flex-column">
                <p className="text-muted mb-4 text-center">
                  {plan.description}
                </p>

                <div className="text-center mb-4">
                  <div className="row text-center">
                    <div className="col-6">
                      <div className={`text-${plan.color} fw-bold fs-2`}>
                        {plan.connections}
                      </div>
                      <small className="text-muted">Conexiones</small>
                    </div>
                    <div className="col-6">
                      <div className={`text-${plan.color} fw-bold fs-2`}>
                        {plan.queries.toLocaleString()}
                      </div>
                      <small className="text-muted">Consultas/mes</small>
                    </div>
                  </div>
                </div>

                <h6 className="mb-3">Características incluidas:</h6>
                <ul className="list-unstyled flex-grow-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="mb-2 d-flex align-items-start">
                      <i
                        className={`bi bi-check-circle-fill text-${plan.color} me-2 mt-1`}
                      ></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  <Button
                    variant={
                      plan.popular ? plan.color : `outline-${plan.color}`
                    }
                    size="lg"
                    className="w-100"
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
          <Card className="border-0 bg-light">
            <Card.Body className="py-5">
              <h3 className="mb-3">¿Necesitas ayuda para elegir?</h3>
              <p className="text-muted mb-4">
                Nuestro equipo está aquí para ayudarte a encontrar el plan
                perfecto para tu proyecto
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button as={Link} to="/como-funciona" variant="outline-primary">
                  <i className="bi bi-question-circle me-2"></i>
                  Cómo funciona
                </Button>
                <Button as={Link} to="/register" variant="primary">
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
