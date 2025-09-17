import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/subscriptions');
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleGoToDashboard = () => {
    navigate('/conexiones');
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-warning shadow">
            <Card.Header className="bg-warning text-dark text-center">
              <h3 className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Suscripción Cancelada
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <h4 className="text-warning">Proceso de Pago Cancelado</h4>
                <p className="lead text-muted">
                  Has cancelado el proceso de suscripción.
                  No se ha realizado ningún cargo a tu cuenta.
                </p>
              </div>

              <Alert variant="info">
                <h6><i className="bi bi-info-circle me-2"></i>¿Qué pasó?</h6>
                <p className="mb-0">
                  El proceso de pago fue cancelado antes de completarse.
                  Esto puede haber ocurrido porque:
                </p>
                <ul className="mt-2 mb-0">
                  <li>Decidiste no continuar con el pago</li>
                  <li>Cerraste la ventana de PayPal</li>
                  <li>Hubo un problema técnico durante el proceso</li>
                </ul>
              </Alert>

              <div className="text-center mb-4">
                <h5>¿Qué quieres hacer ahora?</h5>
                <p className="text-muted">
                  Puedes intentar suscribirte nuevamente o explorar nuestras opciones gratuitas.
                </p>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleTryAgain}
                  className="px-4"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Intentar de Nuevo
                </Button>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={handleGoToProfile}
                >
                  <i className="bi bi-person me-2"></i>
                  Ver Mi Perfil
                </Button>
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <h6 className="text-muted">Mientras tanto...</h6>
                <p className="small text-muted mb-3">
                  Puedes seguir usando las funciones básicas de NexoSQL.
                </p>
                <Button
                  variant="outline-primary"
                  onClick={handleGoToDashboard}
                >
                  <i className="bi bi-house me-2"></i>
                  Ir al Dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Why Subscribe Section */}
      <Row className="mt-5">
        <Col>
          <h3 className="text-center mb-4">¿Por qué suscribirse a NexoSQL Premium?</h3>
        </Col>
      </Row>
      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <i className="bi bi-database-add text-primary" style={{fontSize: '2.5rem'}}></i>
              <h5 className="mt-3">Más Conexiones</h5>
              <p className="text-muted">
                Conecta hasta 20 bases de datos diferentes con el Plan Plata,
                o conexiones ilimitadas con el Plan Oro.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <i className="bi bi-lightning text-warning" style={{fontSize: '2.5rem'}}></i>
              <h5 className="mt-3">IA Avanzada</h5>
              <p className="text-muted">
                Optimización automática de consultas, sugerencias inteligentes
                y análisis de rendimiento con nuestra IA.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <i className="bi bi-shield-check text-success" style={{fontSize: '2.5rem'}}></i>
              <h5 className="mt-3">Soporte Prioritario</h5>
              <p className="text-muted">
                Acceso a soporte técnico especializado y respuesta
                prioritaria a tus consultas.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Plans Overview */}
      <Row className="mt-4">
        <Col>
          <Card className="bg-light">
            <Card.Body>
              <h5 className="text-center mb-4">Planes Disponibles</h5>
              <Row>
                <Col md={4} className="text-center">
                  <h6 className="text-muted">Plan Bronce</h6>
                  <h4 className="text-primary">$5/mes</h4>
                  <p className="small text-muted">5 conexiones • Funciones básicas</p>
                </Col>
                <Col md={4} className="text-center">
                  <h6 className="text-primary">Plan Plata</h6>
                  <h4 className="text-primary">$10/mes</h4>
                  <p className="small text-muted">20 conexiones • IA básica</p>
                  <span className="badge bg-primary">Más Popular</span>
                </Col>
                <Col md={4} className="text-center">
                  <h6 className="text-warning">Plan Oro</h6>
                  <h4 className="text-warning">$20/mes</h4>
                  <p className="small text-muted">Ilimitado • IA avanzada • Soporte 24/7</p>
                </Col>
              </Row>
              <div className="text-center mt-3">
                <Button
                  variant="primary"
                  onClick={handleTryAgain}
                >
                  Ver Todos los Planes
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Contact Info */}
      <Row className="mt-4">
        <Col>
          <div className="text-center">
            <h6 className="text-muted">¿Tienes preguntas?</h6>
            <p className="small text-muted mb-0">
              Contáctanos en <a href="mailto:soporte@nexosql.com">soporte@nexosql.com</a> o
              visita nuestro centro de ayuda si necesitas asistencia con el proceso de suscripción.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionCancel;
