import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const SobreNosotros = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container className="py-5">
        {/* Hero Section */}
        <Row className="text-center mb-5">
          <Col lg={8} className="mx-auto">
            <Badge bg="info" className="px-3 py-2 fs-6 mb-3">
              Conoce nuestra historia
            </Badge>
            <h1 className="display-4 fw-bold mb-4 text-dark">Sobre NexoSQL</h1>
            <p className="lead text-muted fs-5">
              Conectando desarrolladores con sus bases de datos a través de
              inteligencia artificial
            </p>
          </Col>
        </Row>

        {/* Misión y Visión */}
        <Row className="mb-5 g-4">
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100 hover-card" 
                  style={{ backgroundColor: '#ffffff' }}>
              <Card.Body className="p-5 text-center d-flex flex-column">
                <div className="mb-4">
                  <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                       style={{ width: "80px", height: "80px" }}>
                    <i
                      className="bi bi-bullseye text-white"
                      style={{ fontSize: "2.5rem" }}
                    ></i>
                  </div>
                </div>
                <h2 className="mb-4 fw-bold text-dark">Nuestra Misión</h2>
                <p className="fs-5 text-muted mb-0 flex-grow-1 lh-base">
                  Democratizar el acceso a la gestión inteligente de bases de
                  datos, permitiendo que desarrolladores de todos los niveles
                  puedan optimizar, consultar y administrar sus datos de manera
                  eficiente mediante inteligencia artificial avanzada.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100 hover-card"
                  style={{ backgroundColor: '#ffffff' }}>
              <Card.Body className="p-5 text-center d-flex flex-column">
                <div className="mb-4">
                  <div className="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                       style={{ width: "80px", height: "80px" }}>
                    <i
                      className="bi bi-binoculars text-white"
                      style={{ fontSize: "2.5rem" }}
                    ></i>
                  </div>
                </div>
                <h2 className="mb-4 fw-bold text-dark">Nuestra Visión</h2>
                <p className="fs-5 text-muted mb-0 flex-grow-1 lh-base">
                  Ser la plataforma líder mundial en gestión inteligente de bases
                  de datos, donde la inteligencia artificial y la experiencia
                  humana se combinen para crear soluciones innovadoras que
                  impulsen el desarrollo tecnológico y la transformación digital.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Valores */}
        <Row className="mb-5 text-center">
          <Col lg={8} className="mx-auto">
            <h2 className="fw-bold text-dark mb-3">Nuestros Valores</h2>
            <p className="text-muted fs-5 mb-5">
              Los principios que guían cada decisión y acción en NexoSQL
            </p>
          </Col>
        </Row>

        <Row className="g-4 mb-5">
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm text-center hover-card"
                  style={{ backgroundColor: '#ffffff' }}>
              <Card.Body className="p-4">
                <div className="mb-4">
                  <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                       style={{ width: "70px", height: "70px" }}>
                    <i
                      className="bi bi-shield-fill-check text-white"
                      style={{ fontSize: "2rem" }}
                    ></i>
                  </div>
                </div>
                <h5 className="mb-3 fw-bold text-dark">Seguridad</h5>
                <p className="text-muted mb-0 lh-base">
                  Protegemos tus datos con los más altos estándares de seguridad y
                  encriptación.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm text-center hover-card"
                  style={{ backgroundColor: '#ffffff' }}>
              <Card.Body className="p-4">
                <div className="mb-4">
                  <div className="bg-warning bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                       style={{ width: "70px", height: "70px" }}>
                    <i
                      className="bi bi-lightbulb-fill text-white"
                      style={{ fontSize: "2rem" }}
                    ></i>
                  </div>
                </div>
                <h5 className="mb-3 fw-bold text-dark">Innovación</h5>
                <p className="text-muted mb-0 lh-base">
                  Desarrollamos tecnología de vanguardia para soluciones
                  eficientes y modernas.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm text-center hover-card"
                  style={{ backgroundColor: '#ffffff' }}>
              <Card.Body className="p-4">
                <div className="mb-4">
                  <div className="bg-info bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                       style={{ width: "70px", height: "70px" }}>
                    <i
                      className="bi bi-people-fill text-white"
                      style={{ fontSize: "2rem" }}
                    ></i>
                  </div>
                </div>
                <h5 className="mb-3 fw-bold text-dark">Colaboración</h5>
                <p className="text-muted mb-0 lh-base">
                  Creemos en el poder del trabajo en equipo y la comunidad de
                  desarrolladores.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm text-center hover-card"
                  style={{ backgroundColor: '#ffffff' }}>
              <Card.Body className="p-4">
                <div className="mb-4">
                  <div className="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                       style={{ width: "70px", height: "70px" }}>
                    <i
                      className="bi bi-trophy-fill text-white"
                      style={{ fontSize: "2rem" }}
                    ></i>
                  </div>
                </div>
                <h5 className="mb-3 fw-bold text-dark">Excelencia</h5>
                <p className="text-muted mb-0 lh-base">
                  Nos comprometemos con la calidad y mejora continua en todo lo
                  que hacemos.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Historia */}
        <Row className="mb-5">
          <Col lg={10} className="mx-auto">
            <div className="text-center mb-5">
              <h2 className="fw-bold text-dark mb-3">Nuestra Historia</h2>
              <p className="text-muted fs-5">
                El camino que nos llevó a crear NexoSQL
              </p>
            </div>
            <Card className="border-0 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
              <Card.Body className="p-5">
                <Row className="g-4">
                  <Col lg={6}>
                    <div className="timeline-item mb-5">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-4">
                          <div className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                               style={{ width: "50px", height: "50px" }}>
                            <i className="bi bi-star-fill text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-primary fw-bold mb-3">El Comienzo</h4>
                          <p className="text-muted lh-base">
                            NexoSQL nació de la necesidad de simplificar la gestión de
                            bases de datos. Nuestro equipo de desarrolladores
                            experimentó firsthand las dificultades de trabajar con
                            sistemas complejos de bases de datos.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="timeline-item mb-4">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-4">
                          <div className="bg-success bg-gradient rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                               style={{ width: "50px", height: "50px" }}>
                            <i className="bi bi-gear-fill text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-success fw-bold mb-3">La Solución</h4>
                          <p className="text-muted lh-base">
                            Combinamos inteligencia artificial con interfaces
                            intuitivas para crear una plataforma que permite a
                            cualquier desarrollador gestionar bases de datos usando
                            lenguaje natural.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="timeline-item mb-5">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-4">
                          <div className="bg-warning bg-gradient rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                               style={{ width: "50px", height: "50px" }}>
                            <i className="bi bi-clock-fill text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-warning fw-bold mb-3">El Presente</h4>
                          <p className="text-muted lh-base">
                            Hoy, miles de desarrolladores confían en NexoSQL para
                            optimizar sus consultas, analizar datos y mantener sus
                            bases de datos funcionando de manera eficiente.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="timeline-item mb-4">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-4">
                          <div className="bg-info bg-gradient rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                               style={{ width: "50px", height: "50px" }}>
                            <i className="bi bi-arrow-up-circle-fill text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-info fw-bold mb-3">El Futuro</h4>
                          <p className="text-muted lh-base">
                            Continuamos innovando, añadiendo nuevas funcionalidades y
                            expandiendo nuestro soporte a más tipos de bases de datos
                            y tecnologías emergentes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Compromiso */}
        <Row className="mb-5">
          <Col lg={8} className="mx-auto">
            <Card className="border-0 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
              <Card.Body className="p-5 text-center">
                <div className="mb-4">
                  <div className="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                       style={{ width: "80px", height: "80px" }}>
                    <i className="bi bi-heart-fill text-white" style={{ fontSize: "2.5rem" }}></i>
                  </div>
                </div>
                <h2 className="mb-4 fw-bold text-dark">Nuestro Compromiso</h2>
                <p className="fs-5 text-muted mb-5 lh-base">
                  Nos comprometemos a mantener la transparencia, la seguridad y la
                  innovación como pilares fundamentales de nuestra plataforma. Tu
                  éxito es nuestro éxito.
                </p>
                <Row className="g-3">
                  <Col md={6}>
                    <div className="d-flex align-items-start text-start p-3 rounded bg-light">
                      <i className="bi bi-check-circle-fill text-success me-3 mt-1" style={{ fontSize: "1.2rem" }}></i>
                      <div>
                        <h6 className="fw-bold mb-2 text-dark">Privacidad</h6>
                        <p className="mb-0 text-muted small">Tus datos siempre permanecen seguros y privados</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-start text-start p-3 rounded bg-light">
                      <i className="bi bi-check-circle-fill text-success me-3 mt-1" style={{ fontSize: "1.2rem" }}></i>
                      <div>
                        <h6 className="fw-bold mb-2 text-dark">Transparencia</h6>
                        <p className="mb-0 text-muted small">Comunicación clara sobre actualizaciones y cambios</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-start text-start p-3 rounded bg-light">
                      <i className="bi bi-check-circle-fill text-success me-3 mt-1" style={{ fontSize: "1.2rem" }}></i>
                      <div>
                        <h6 className="fw-bold mb-2 text-dark">Soporte</h6>
                        <p className="mb-0 text-muted small">Asistencia técnica cuando la necesites</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-start text-start p-3 rounded bg-light">
                      <i className="bi bi-check-circle-fill text-success me-3 mt-1" style={{ fontSize: "1.2rem" }}></i>
                      <div>
                        <h6 className="fw-bold mb-2 text-dark">Evolución</h6>
                        <p className="mb-0 text-muted small">Mejora continua basada en tu feedback</p>
                      </div>
                    </div>
                  </Col>
                </Row>
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
                  <i className="bi bi-people-fill display-4 mb-3"></i>
                  <h3 className="fw-bold mb-3">
                    ¿Listo para formar parte de la comunidad NexoSQL?
                  </h3>
                  <p className="fs-5 mb-0 opacity-90">
                    Únete a miles de desarrolladores que ya están transformando la
                    manera de trabajar con bases de datos
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
                    Crear cuenta
                  </Button>
                  <Button
                    as={Link}
                    to="/como-funciona"
                    variant="outline-light"
                    size="lg"
                    className="fw-semibold px-4 py-3"
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    Ver cómo funciona
                  </Button>
                </div>
                <div className="mt-4">
                  <small className="opacity-75">
                    <i className="bi bi-shield-check me-2"></i>
                    Únete sin riesgos • Soporte completo • Comunidad activa
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Estilos adicionales para efectos hover */}
      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transition: all 0.3s ease;
        }
        
        .timeline-item {
          position: relative;
        }
        
        .timeline-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 24px;
          top: 60px;
          width: 2px;
          height: 50px;
          background: linear-gradient(to bottom, #dee2e6, transparent);
        }
      `}</style>
    </div>
  );
};

export default SobreNosotros;
