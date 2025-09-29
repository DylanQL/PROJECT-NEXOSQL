import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import "../styles/SubscriptionCancel.css";

const SubscriptionCancel = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

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
    <Container className="py-4 d-flex align-items-center" style={{ minHeight: "80vh" }}>
      <Row className="justify-content-center w-100">
        <Col md={10} lg={8}>
          <Card className="cancel-card">
            <Card.Header className="cancel-card-header text-center cancel-header py-3">
              <h3 className="mb-0 text-white">
                <i className="bi bi-exclamation-triangle me-2 cancel-icon" style={{ fontSize: "2rem" }}></i>
                ¡Suscripción Cancelada!
              </h3>
            </Card.Header>
            <Card.Body className="p-3">
              <div className="text-center mb-3 cancel-content">
                <h4 className="text-warning mb-2">
                  {userProfile?.name 
                    ? `${userProfile.name}, no te preocupes`
                    : "No te preocupes"
                  }
                </h4>
                <p className="text-muted mb-0">
                  El proceso de suscripción fue cancelado. No se realizó ningún cargo.
                </p>
              </div>

              <Row className="mb-3 cancel-details">
                <Col md={6} className="mb-2">
                  <Card className="details-card h-100 bg-light border-0">
                    <Card.Body className="p-3">
                      <h6 className="text-warning mb-2">
                        <i className="bi bi-info-circle me-2"></i>
                        ¿Qué pasó?
                      </h6>
                      <div className="mb-2">
                        <strong className="text-dark">Estado:</strong>
                        <span className="badge bg-warning ms-2 px-2 py-1">
                          <i className="bi bi-x-circle me-1"></i>
                          Cancelado
                        </span>
                      </div>
                      <div className="mb-2">
                        <strong className="text-dark">Cargo:</strong>
                        <span className="ms-2 text-success fw-bold">
                          $0.00
                        </span>
                      </div>
                      <div className="mb-0">
                        <strong className="text-dark">Fecha:</strong>
                        <div className="text-muted small">
                          {new Date().toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-2">
                  <Card className="details-card h-100 bg-light border-0">
                    <Card.Body className="p-3">
                      <h6 className="text-info mb-2">
                        <i className="bi bi-question-circle me-2"></i>
                        Posibles Causas
                      </h6>
                      <ul className="small text-muted mb-0" style={{ listStyle: "none", padding: 0 }}>
                        <li className="mb-1">
                          <i className="bi bi-dot text-warning"></i>
                          Decidiste no continuar
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-dot text-warning"></i>
                          Cerraste la ventana de pago
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-dot text-warning"></i>
                          Problema técnico temporal
                        </li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="text-center cancel-actions">
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <Button
                    className="primary-button px-3 py-2"
                    onClick={handleTryAgain}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Intentar de Nuevo
                  </Button>
                  <Button
                    className="secondary-button px-3 py-2"
                    onClick={handleGoToDashboard}
                  >
                    <i className="bi bi-house me-2"></i>
                    Ir al Dashboard
                  </Button>
                </div>
                <div className="mt-3">
                  <small className="text-muted">
                    ¿Necesitas ayuda? Contáctanos en{" "}
                    <a href="mailto:soporte@nexosql.com" className="text-decoration-none">
                      soporte@nexosql.com
                    </a>
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionCancel;
