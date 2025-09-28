import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const ComoFunciona = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container className="py-5">
        {/* Hero Section */}
        <Row className="text-center mb-5">
          <Col lg={8} className="mx-auto">
            <Badge bg="primary" className="px-3 py-2 fs-6 mb-3">
              Guía de uso
            </Badge>
            <h1 className="display-4 fw-bold mb-4 text-dark">
              ¿Cómo funciona NexoSQL?
            </h1>
            <p className="lead text-muted fs-5">
              Descubre paso a paso cómo NexoSQL te ayuda a gestionar tus bases de
              datos con IA de forma intuitiva y eficiente
            </p>
          </Col>
        </Row>

        {/* Pasos principales */}
        <Row className="g-4 mb-5">
          {/* Paso 1: Registro */}
          <Col md={6} lg={3}>
            <Card className="h-100 text-center border-0 shadow-sm hover-shadow" 
                  style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
              <Card.Body className="d-flex flex-column p-4">
                <div className="mb-4">
                  <div
                    className="bg-primary bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: "70px", height: "70px" }}
                  >
                    <i
                      className="bi bi-person-plus-fill"
                      style={{ fontSize: "28px" }}
                    ></i>
                  </div>
                </div>
                <Card.Title className="h4 fw-bold text-dark">1. Regístrate</Card.Title>
                <Card.Text className="flex-grow-1 text-muted">
                  Crea tu cuenta en segundos. Solo necesitas tu email y una
                  contraseña segura.
                </Card.Text>
                <Button
                  as={Link}
                  to="/register"
                  variant="outline-primary"
                  size="sm"
                  className="mt-auto"
                >
                  <i className="bi bi-arrow-right me-2"></i>
                  Crear cuenta
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Paso 2: Suscripción */}
          <Col md={6} lg={3}>
            <Card className="h-100 text-center border-0 shadow-sm hover-shadow"
                  style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
              <Card.Body className="d-flex flex-column p-4">
                <div className="mb-4">
                  <div
                    className="bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: "70px", height: "70px" }}
                  >
                    <i
                      className="bi bi-star-fill"
                      style={{ fontSize: "28px" }}
                    ></i>
                  </div>
                </div>
                <Card.Title className="h4 fw-bold text-dark">2. Elige tu plan</Card.Title>
                <Card.Text className="flex-grow-1 text-muted">
                  Selecciona el plan que mejor se adapte a tus necesidades:
                  Bronce, Plata u Oro.
                </Card.Text>
                <Button
                  as={Link}
                  to="/planes"
                  variant="outline-success"
                  size="sm"
                  className="mt-auto"
                >
                  <i className="bi bi-eye me-2"></i>
                  Ver planes
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Paso 3: Conexión */}
          <Col md={6} lg={3}>
            <Card className="h-100 text-center border-0 shadow-sm hover-shadow"
                  style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
              <Card.Body className="d-flex flex-column p-4">
                <div className="mb-4">
                  <div
                    className="bg-warning bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: "70px", height: "70px" }}
                  >
                    <i className="bi bi-hdd-stack-fill" style={{ fontSize: "28px" }}></i>
                  </div>
                </div>
                <Card.Title className="h4 fw-bold text-dark">3. Conecta tu DB</Card.Title>
                <Card.Text className="flex-grow-1 text-muted">
                  Configura la conexión a tu base de datos MySQL, PostgreSQL o SQL
                  Server de forma segura.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Paso 4: Chat con IA */}
          <Col md={6} lg={3}>
            <Card className="h-100 text-center border-0 shadow-sm hover-shadow"
                  style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
              <Card.Body className="d-flex flex-column p-4">
                <div className="mb-4">
                  <div
                    className="bg-info bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: "70px", height: "70px" }}
                  >
                    <i
                      className="bi bi-chat-dots-fill"
                      style={{ fontSize: "28px" }}
                    ></i>
                  </div>
                </div>
                <Card.Title className="h4 fw-bold text-dark">4. Chatea con IA</Card.Title>
                <Card.Text className="flex-grow-1 text-muted">
                  Haz preguntas en lenguaje natural y obtén consultas SQL,
                  análisis y estadísticas.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Proceso detallado */}
        <Row className="mb-5">
          <Col lg={10} className="mx-auto">
            <div className="text-center mb-5">
              <h2 className="fw-bold text-dark mb-3">Proceso detallado</h2>
              <p className="text-muted fs-5">
                Una visión más profunda de cada paso para que entiendas completamente el flujo de trabajo
              </p>
            </div>
            <Card className="border-0 shadow-sm" 
                  style={{ backgroundColor: '#ffffff' }}>
              <Card.Body className="p-5">
                <div className="timeline">
                  <div className="d-flex mb-5 position-relative">
                    <div className="flex-shrink-0 me-4">
                      <div className="bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                           style={{ width: "50px", height: "50px" }}>
                        <i className="bi bi-check-circle-fill" style={{ fontSize: "24px" }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="text-primary fw-bold mb-3">
                        Registro y verificación
                      </h4>
                      <p className="text-muted mb-0 fs-6">
                        Después del registro, verifica tu email y completa tu perfil
                        con información básica.
                      </p>
                    </div>
                  </div>

                  <div className="d-flex mb-5 position-relative">
                    <div className="flex-shrink-0 me-4">
                      <div className="bg-success bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                           style={{ width: "50px", height: "50px" }}>
                        <i className="bi bi-credit-card-fill" style={{ fontSize: "24px" }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="text-success fw-bold mb-3">
                        Selección de suscripción
                      </h4>
                      <p className="text-muted mb-3 fs-6">
                        Elige entre nuestros planes según el número de conexiones y
                        consultas que necesites:
                      </p>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="p-3 border rounded bg-light">
                            <h6 className="fw-bold text-warning mb-2">
                              <i className="bi bi-star-fill me-2"></i>
                              Bronce
                            </h6>
                            <small className="text-muted">5 conexiones<br />500 consultas/mes</small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="p-3 border rounded bg-light">
                            <h6 className="fw-bold text-secondary mb-2">
                              <i className="bi bi-star-fill me-2"></i>
                              Plata
                            </h6>
                            <small className="text-muted">10 conexiones<br />1000 consultas/mes</small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="p-3 border rounded bg-light">
                            <h6 className="fw-bold text-warning mb-2">
                              <i className="bi bi-star-fill me-2"></i>
                              Oro
                            </h6>
                            <small className="text-muted">20 conexiones<br />2000 consultas/mes</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex mb-5 position-relative">
                    <div className="flex-shrink-0 me-4">
                      <div className="bg-warning bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                           style={{ width: "50px", height: "50px" }}>
                        <i className="bi bi-link-45deg" style={{ fontSize: "24px" }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="text-warning fw-bold mb-3">
                        Configuración de conexiones
                      </h4>
                      <p className="text-muted mb-3 fs-6">
                        Agrega tus bases de datos proporcionando:
                      </p>
                      <ul className="list-unstyled">
                        <li className="d-flex align-items-center mb-2">
                          <i className="bi bi-check-circle-fill text-success me-3"></i>
                          <span className="text-muted">Host y puerto del servidor</span>
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <i className="bi bi-check-circle-fill text-success me-3"></i>
                          <span className="text-muted">Nombre de la base de datos</span>
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <i className="bi bi-check-circle-fill text-success me-3"></i>
                          <span className="text-muted">Credenciales de acceso</span>
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <i className="bi bi-check-circle-fill text-success me-3"></i>
                          <span className="text-muted">Tipo de base de datos (MySQL, PostgreSQL, SQL Server)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="d-flex mb-0 position-relative">
                    <div className="flex-shrink-0 me-4">
                      <div className="bg-info bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                           style={{ width: "50px", height: "50px" }}>
                        <i className="bi bi-robot" style={{ fontSize: "24px" }}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="text-info fw-bold mb-3">
                        Interacción con IA
                      </h4>
                      <p className="text-muted mb-3 fs-6">Una vez conectado, puedes:</p>
                      <ul className="list-unstyled">
                        <li className="d-flex align-items-center mb-2">
                          <i className="bi bi-robot text-info me-3" style={{ fontSize: "18px" }}></i>
                          <span className="text-muted">Hacer preguntas sobre tu esquema de base de datos</span>
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <i className="bi bi-robot text-info me-3" style={{ fontSize: "18px" }}></i>
                          <span className="text-muted">Generar consultas SQL automáticamente</span>
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <i className="bi bi-robot text-info me-3" style={{ fontSize: "18px" }}></i>
                          <span className="text-muted">Hacer consultas en lenguaje natural</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Call to action */}
        <Row className="text-center">
          <Col lg={8} className="mx-auto">
            <Card className="border-0 bg-primary bg-gradient text-white shadow-lg">
              <Card.Body className="py-5 px-4">
                <div className="mb-4">
                  <i className="bi bi-rocket-takeoff display-4 mb-3"></i>
                  <h2 className="fw-bold mb-3">¿Listo para empezar?</h2>
                  <p className="fs-5 mb-0 opacity-90">
                    Únete a miles de desarrolladores que ya están optimizando sus
                    bases de datos con IA
                  </p>
                </div>
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center">
                  <Button
                    as={Link}
                    to="/register"
                    variant="light"
                    size="lg"
                    className="fw-semibold px-4 py-3 shadow-sm"
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Crear cuenta ahora
                  </Button>
                  <Button 
                    as={Link} 
                    to="/planes" 
                    variant="outline-light" 
                    size="lg"
                    className="fw-semibold px-4 py-3"
                  >
                    <i className="bi bi-eye me-2"></i>
                    Ver planes disponibles
                  </Button>
                </div>
                <div className="mt-4">
                  <small className="opacity-75">
                    <i className="bi bi-shield-check me-2"></i>
                    100% seguro • Sin compromisos • Cancela cuando quieras
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Estilos adicionales para efectos hover */}
      <style jsx>{`
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transition: all 0.3s ease;
        }
        
        .timeline .d-flex:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 24px;
          top: 60px;
          width: 2px;
          height: 60px;
          background: linear-gradient(to bottom, #dee2e6, transparent);
        }
      `}</style>
    </div>
  );
};

export default ComoFunciona;
