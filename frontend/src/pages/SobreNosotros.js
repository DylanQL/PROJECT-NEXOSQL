import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const SobreNosotros = () => {
  return (
    <Container className="my-5">
      {/* Hero Section */}
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-4 mb-4">Sobre NexoSQL</h1>
          <p className="lead text-muted">
            Conectando desarrolladores con sus bases de datos a través de
            inteligencia artificial
          </p>
        </Col>
      </Row>

      {/* Misión y Visión */}
      <Row className="mb-5">
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-5 text-center d-flex flex-column">
              <div className="mb-4">
                <i
                  className="bi bi-bullseye text-primary"
                  style={{ fontSize: "3rem" }}
                ></i>
              </div>
              <h2 className="mb-4">Nuestra Misión</h2>
              <p className="fs-5 text-muted mb-0 flex-grow-1">
                Democratizar el acceso a la gestión inteligente de bases de
                datos, permitiendo que desarrolladores de todos los niveles
                puedan optimizar, consultar y administrar sus datos de manera
                eficiente mediante inteligencia artificial avanzada.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-5 text-center d-flex flex-column">
              <div className="mb-4">
                <i
                  className="bi bi-eye text-success"
                  style={{ fontSize: "3rem" }}
                ></i>
              </div>
              <h2 className="mb-4">Nuestra Visión</h2>
              <p className="fs-5 text-muted mb-0 flex-grow-1">
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
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-5">Nuestros Valores</h2>
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-4">
              <div className="mb-3">
                <i
                  className="bi bi-shield-check text-primary"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h5 className="mb-3">Seguridad</h5>
              <p className="text-muted mb-0">
                Protegemos tus datos con los más altos estándares de seguridad y
                encriptación.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-4">
              <div className="mb-3">
                <i
                  className="bi bi-lightbulb text-warning"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h5 className="mb-3">Innovación</h5>
              <p className="text-muted mb-0">
                Desarrollamos tecnología de vanguardia para soluciones
                eficientes y modernas.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-4">
              <div className="mb-3">
                <i
                  className="bi bi-people text-info"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h5 className="mb-3">Colaboración</h5>
              <p className="text-muted mb-0">
                Creemos en el poder del trabajo en equipo y la comunidad de
                desarrolladores.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-4">
              <div className="mb-3">
                <i
                  className="bi bi-graph-up text-success"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h5 className="mb-3">Excelencia</h5>
              <p className="text-muted mb-0">
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
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4">Nuestra Historia</h2>
              <Row>
                <Col lg={6}>
                  <div className="mb-4">
                    <h4 className="text-primary">El Comienzo</h4>
                    <p className="text-muted">
                      NexoSQL nació de la necesidad de simplificar la gestión de
                      bases de datos. Nuestro equipo de desarrolladores
                      experimentó firsthand las dificultades de trabajar con
                      sistemas complejos de bases de datos.
                    </p>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-success">La Solución</h4>
                    <p className="text-muted">
                      Combinamos inteligencia artificial con interfaces
                      intuitivas para crear una plataforma que permite a
                      cualquier desarrollador gestionar bases de datos usando
                      lenguaje natural.
                    </p>
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-4">
                    <h4 className="text-warning">El Presente</h4>
                    <p className="text-muted">
                      Hoy, miles de desarrolladores confían en NexoSQL para
                      optimizar sus consultas, analizar datos y mantener sus
                      bases de datos funcionando de manera eficiente.
                    </p>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-info">El Futuro</h4>
                    <p className="text-muted">
                      Continuamos innovando, añadiendo nuevas funcionalidades y
                      expandiendo nuestro soporte a más tipos de bases de datos
                      y tecnologías emergentes.
                    </p>
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
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5 text-center">
              <h2 className="mb-4">Nuestro Compromiso</h2>
              <p className="fs-5 text-muted mb-4">
                Nos comprometemos a mantener la transparencia, la seguridad y la
                innovación como pilares fundamentales de nuestra plataforma. Tu
                éxito es nuestro éxito.
              </p>
              <ul className="list-unstyled text-start">
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Privacidad:</strong> Tus datos siempre permanecen
                  seguros y privados
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Transparencia:</strong> Comunicación clara sobre
                  actualizaciones y cambios
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Soporte:</strong> Asistencia técnica cuando la
                  necesites
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Evolución:</strong> Mejora continua basada en tu
                  feedback
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Call to action */}
      <Row className="text-center">
        <Col>
          <Card className="border-0 bg-light">
            <Card.Body className="py-5">
              <h3 className="mb-3">
                ¿Listo para formar parte de la comunidad NexoSQL?
              </h3>
              <p className="text-muted mb-4">
                Únete a miles de desarrolladores que ya están transformando la
                manera de trabajar con bases de datos
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button as={Link} to="/register" variant="primary" size="lg">
                  <i className="bi bi-person-plus me-2"></i>
                  Crear cuenta
                </Button>
                <Button
                  as={Link}
                  to="/como-funciona"
                  variant="outline-primary"
                  size="lg"
                >
                  <i className="bi bi-play-circle me-2"></i>
                  Ver cómo funciona
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SobreNosotros;
