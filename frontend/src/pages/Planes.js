import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
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
      price: 9.99,
      connections: 2,
      queries: 100,
      description: "Perfecto para proyectos pequeños",
      features: [
        "2 conexiones de base de datos",
        "100 consultas por mes",
        "Soporte básico por email",
        "Acceso a chat con IA",
        "Consultas SQL automáticas",
        "Documentación básica"
      ],
      color: "secondary",
      popular: false
    },
    plata: {
      name: "Plan Plata",
      price: 19.99,
      connections: 5,
      queries: 500,
      description: "Ideal para equipos medianos",
      features: [
        "5 conexiones de base de datos",
        "500 consultas por mes",
        "Soporte prioritario",
        "Análisis de rendimiento",
        "Optimización de consultas",
        "Historial de consultas",
        "Exportación de datos",
        "Notificaciones en tiempo real"
      ],
      color: "primary",
      popular: true
    },
    oro: {
      name: "Plan Oro",
      price: 39.99,
      connections: 15,
      queries: 2000,
      description: "Para empresas y proyectos grandes",
      features: [
        "15 conexiones de base de datos",
        "2000 consultas por mes",
        "Soporte 24/7",
        "Análisis avanzado con IA",
        "Reportes personalizados",
        "Backup automático",
        "Integración con APIs",
        "Dashboard ejecutivo",
        "Acceso a beta features",
        "Consultoría personalizada"
      ],
      color: "warning",
      popular: false
    }
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

      {/* Comparación rápida */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light text-center">
              <h4 className="mb-0">Comparación de Planes</h4>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-borderless text-center">
                  <thead>
                    <tr>
                      <th></th>
                      <th className="text-muted">Bronce</th>
                      <th className="text-primary">Plata</th>
                      <th className="text-warning">Oro</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-start"><strong>Precio/mes</strong></td>
                      <td>{formatPrice(plans.bronce.price)}</td>
                      <td>{formatPrice(plans.plata.price)}</td>
                      <td>{formatPrice(plans.oro.price)}</td>
                    </tr>
                    <tr>
                      <td className="text-start"><strong>Conexiones DB</strong></td>
                      <td>{plans.bronce.connections}</td>
                      <td>{plans.plata.connections}</td>
                      <td>{plans.oro.connections}</td>
                    </tr>
                    <tr>
                      <td className="text-start"><strong>Consultas/mes</strong></td>
                      <td>{plans.bronce.queries.toLocaleString()}</td>
                      <td>{plans.plata.queries.toLocaleString()}</td>
                      <td>{plans.oro.queries.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="text-start"><strong>Soporte</strong></td>
                      <td>Email</td>
                      <td>Prioritario</td>
                      <td>24/7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Planes detallados */}
      <Row className="justify-content-center">
        {Object.entries(plans).map(([planType, plan]) => (
          <Col key={planType} lg={4} md={6} className="mb-4">
            <Card className={`h-100 position-relative ${plan.popular ? 'border-primary shadow-lg' : 'border-0 shadow'}`}>
              {plan.popular && (
                <div className="position-absolute top-0 start-50 translate-middle">
                  <Badge bg="primary" className="px-3 py-2 fs-6">
                    <i className="bi bi-star-fill me-1"></i>
                    Más Popular
                  </Badge>
                </div>
              )}

              <Card.Header className={`text-center bg-${plan.color} ${plan.color === 'warning' ? 'text-dark' : 'text-white'}`}>
                <h3 className="mb-1">{plan.name}</h3>
                <div className="display-4 fw-bold">
                  {formatPrice(plan.price)}
                  <small className="fs-6 opacity-75">/mes</small>
                </div>
                <p className="mb-0 opacity-85">{plan.description}</p>
              </Card.Header>

              <Card.Body className="d-flex flex-column">
                <div className="text-center mb-4">
                  <div className="row text-center">
                    <div className="col-6">
                      <div className={`text-${plan.color} fw-bold fs-2`}>{plan.connections}</div>
                      <small className="text-muted">Conexiones</small>
                    </div>
                    <div className="col-6">
                      <div className={`text-${plan.color} fw-bold fs-2`}>{plan.queries.toLocaleString()}</div>
                      <small className="text-muted">Consultas/mes</small>
                    </div>
                  </div>
                </div>

                <h6 className="mb-3">Características incluidas:</h6>
                <ul className="list-unstyled flex-grow-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="mb-2 d-flex align-items-start">
                      <i className={`bi bi-check-circle-fill text-${plan.color} me-2 mt-1`}></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  <Button
                    variant={plan.popular ? plan.color : `outline-${plan.color}`}
                    size="lg"
                    className="w-100"
                    onClick={() => handleSelectPlan(planType)}
                  >
                    {!currentUser
                      ? "Crear cuenta y suscribirse"
                      : hasActiveSubscription
                        ? "Gestionar suscripción"
                        : "Suscribirse ahora"
                    }
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
          <div className="accordion" id="planesAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                  ¿Puedo cambiar de plan en cualquier momento?
                </button>
              </h2>
              <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#planesAccordion">
                <div className="accordion-body">
                  Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente y se prorratea el costo según corresponda.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                  ¿Qué sucede si excedo mi límite de consultas?
                </button>
              </h2>
              <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#planesAccordion">
                <div className="accordion-body">
                  Si excedes tu límite mensual, el servicio se pausará temporalmente hasta el próximo ciclo de facturación, o puedes actualizar tu plan para obtener más consultas inmediatamente.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                  ¿Hay período de prueba gratuito?
                </button>
              </h2>
              <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#planesAccordion">
                <div className="accordion-body">
                  Ofrecemos una garantía de devolución de dinero de 7 días en todos nuestros planes. Si no estás satisfecho, te devolvemos el 100% de tu dinero.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                  ¿Qué tipos de bases de datos soportan?
                </button>
              </h2>
              <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#planesAccordion">
                <div className="accordion-body">
                  Actualmente soportamos MySQL, PostgreSQL y SQL Server. Estamos trabajando para agregar más tipos de bases de datos en futuras actualizaciones.
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Call to action final */}
      <Row className="mt-5 text-center">
        <Col>
          <Card className="border-0 bg-light">
            <Card.Body className="py-5">
              <h3 className="mb-3">¿Necesitas ayuda para elegir?</h3>
              <p className="text-muted mb-4">
                Nuestro equipo está aquí para ayudarte a encontrar el plan perfecto para tu proyecto
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
