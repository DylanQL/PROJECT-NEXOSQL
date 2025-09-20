import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const ComoFunciona = () => {
  return (
    <Container className="my-5">
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-4 mb-4">¿Cómo funciona NexoSQL?</h1>
          <p className="lead">
            Descubre paso a paso cómo NexoSQL te ayuda a gestionar tus bases de
            datos con IA
          </p>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Paso 1: Registro */}
        <Col md={6} lg={3}>
          <Card className="h-100 text-center border-0 shadow">
            <Card.Body className="d-flex flex-column">
              <div className="mb-3">
                <div
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px" }}
                >
                  <i
                    className="bi bi-person-plus-fill"
                    style={{ fontSize: "24px" }}
                  ></i>
                </div>
              </div>
              <Card.Title className="h4">1. Regístrate</Card.Title>
              <Card.Text className="flex-grow-1">
                Crea tu cuenta en segundos. Solo necesitas tu email y una
                contraseña segura.
              </Card.Text>
              <Button
                as={Link}
                to="/register"
                variant="outline-primary"
                size="sm"
              >
                Crear cuenta
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Paso 2: Suscripción */}
        <Col md={6} lg={3}>
          <Card className="h-100 text-center border-0 shadow">
            <Card.Body className="d-flex flex-column">
              <div className="mb-3">
                <div
                  className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px" }}
                >
                  <i
                    className="bi bi-credit-card-fill"
                    style={{ fontSize: "24px" }}
                  ></i>
                </div>
              </div>
              <Card.Title className="h4">2. Elige tu plan</Card.Title>
              <Card.Text className="flex-grow-1">
                Selecciona el plan que mejor se adapte a tus necesidades:
                Bronce, Plata u Oro.
              </Card.Text>
              <Button
                as={Link}
                to="/planes"
                variant="outline-success"
                size="sm"
              >
                Ver planes
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Paso 3: Conexión */}
        <Col md={6} lg={3}>
          <Card className="h-100 text-center border-0 shadow">
            <Card.Body className="d-flex flex-column">
              <div className="mb-3">
                <div
                  className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px" }}
                >
                  <i className="bi bi-server" style={{ fontSize: "24px" }}></i>
                </div>
              </div>
              <Card.Title className="h4">3. Conecta tu DB</Card.Title>
              <Card.Text className="flex-grow-1">
                Configura la conexión a tu base de datos MySQL, PostgreSQL o SQL
                Server de forma segura.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Paso 4: Chat con IA */}
        <Col md={6} lg={3}>
          <Card className="h-100 text-center border-0 shadow">
            <Card.Body className="d-flex flex-column">
              <div className="mb-3">
                <div
                  className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px" }}
                >
                  <i
                    className="bi bi-chat-dots-fill"
                    style={{ fontSize: "24px" }}
                  ></i>
                </div>
              </div>
              <Card.Title className="h4">4. Chatea con IA</Card.Title>
              <Card.Text className="flex-grow-1">
                Haz preguntas en lenguaje natural y obtén consultas SQL,
                análisis y estadísticas.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detalles del proceso */}
      <Row className="mt-5">
        <Col lg={8} className="mx-auto">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h3 className="mb-0 text-center">Proceso detallado</h3>
            </Card.Header>
            <Card.Body>
              <div className="timeline">
                <div className="mb-4">
                  <h5 className="text-primary">
                    <i className="bi bi-1-circle-fill me-2"></i>
                    Registro y verificación
                  </h5>
                  <p className="mb-2">
                    Después del registro, verifica tu email y completa tu perfil
                    con información básica.
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="text-success">
                    <i className="bi bi-2-circle-fill me-2"></i>
                    Selección de suscripción
                  </h5>
                  <p className="mb-2">
                    Elige entre nuestros planes según el número de conexiones y
                    consultas que necesites:
                  </p>
                  <ul className="list-unstyled ps-3">
                    <li>
                      • <strong>Bronce:</strong> 5 conexiones, 500 consultas/mes
                    </li>
                    <li>
                      • <strong>Plata:</strong> 10 conexiones, 1000
                      consultas/mes
                    </li>
                    <li>
                      • <strong>Oro:</strong> 20 conexiones, 2000 consultas/mes
                    </li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="text-warning">
                    <i className="bi bi-3-circle-fill me-2"></i>
                    Configuración de conexiones
                  </h5>
                  <p className="mb-2">
                    Agrega tus bases de datos proporcionando:
                  </p>
                  <ul className="list-unstyled ps-3">
                    <li>• Host y puerto del servidor</li>
                    <li>• Nombre de la base de datos</li>
                    <li>• Credenciales de acceso</li>
                    <li>
                      • Tipo de base de datos (MySQL, PostgreSQL, SQL Server)
                    </li>
                  </ul>
                </div>

                <div className="mb-0">
                  <h5 className="text-info">
                    <i className="bi bi-4-circle-fill me-2"></i>
                    Interacción con IA
                  </h5>
                  <p className="mb-2">Una vez conectado, puedes:</p>
                  <ul className="list-unstyled ps-3">
                    <li>• Hacer preguntas sobre tu esquema de base de datos</li>
                    <li>• Generar consultas SQL automáticamente</li>
                    <li>• Hacer consultas en lenguaje natural</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Call to action */}
      <Row className="mt-5 text-center">
        <Col>
          <Card className="border-0 bg-primary text-white">
            <Card.Body className="py-4">
              <h3 className="mb-3">¿Listo para empezar?</h3>
              <p className="mb-4">
                Únete a miles de desarrolladores que ya están optimizando sus
                bases de datos con IA
              </p>
              <Button
                as={Link}
                to="/register"
                variant="light"
                size="lg"
                className="me-3"
              >
                Crear cuenta ahora
              </Button>
              <Button as={Link} to="/planes" variant="outline-light" size="lg">
                Ver planes
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ComoFunciona;
