import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
} from "react-bootstrap";
import {
  Database,
  ChatDots,
  Shield,
  Speedometer2,
  Globe,
  ArrowRight,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useConnection } from "../contexts/ConnectionContext";
import ChatInterface from "../components/ChatInterface";

const Home = () => {
  const { currentUser, userProfile } = useAuth();
  const { connections, loading, error } = useConnection();
  const navigate = useNavigate();

  // If user is not logged in - Show landing page
  if (!currentUser) {
    return (
      <div className="bg-light">
        {/* Hero Section */}
        <Container className="py-5">
          <Row className="align-items-center min-vh-75">
            <Col lg={6}>
              <div className="mb-4">
                <Badge bg="primary" className="mb-3 px-3 py-2">
                  <Database className="me-2" />
                  Revoluciona tus consultas SQL
                </Badge>
              </div>
              <h1 className="display-4 fw-bold text-dark mb-4">
                Consulta tus bases de datos con
                <span className="text-primary"> lenguaje natural</span>
              </h1>
              <p className="lead text-muted mb-4">
                NexoSQL convierte tus preguntas cotidianas en consultas SQL
                precisas. Conecta múltiples bases de datos y obtén respuestas
                instantáneas sin escribir una sola línea de código.
              </p>
              <div className="d-grid gap-2 d-md-flex">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="me-md-2"
                >
                  Comenzar Ahora
                  <ArrowRight className="ms-2" />
                </Button>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={() => navigate("/login")}
                >
                  Iniciar Sesión
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="bg-white p-4 rounded-3 shadow-sm">
                <ChatDots size={80} className="text-primary mb-3" />
                <h5 className="mb-3">
                  ¿Cuántos usuarios se registraron este mes?
                </h5>
                <div className="bg-light p-3 rounded text-start">
                  <code className="text-success">
                    SELECT COUNT(*) FROM usuarios
                    <br />
                    WHERE MONTH(created_at) = MONTH(NOW())
                  </code>
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Features Section */}
        <Container className="py-5">
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="fw-bold">¿Por qué elegir NexoSQL?</h2>
              <p className="text-muted">
                Simplifica tu trabajo con bases de datos
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <ChatDots size={48} className="text-primary mb-3" />
                  <h5 className="fw-bold">Lenguaje Natural</h5>
                  <p className="text-muted">
                    Haz preguntas en español y obtén consultas SQL precisas
                    automáticamente.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <Database size={48} className="text-success mb-3" />
                  <h5 className="fw-bold">Múltiples Conexiones</h5>
                  <p className="text-muted">
                    Conecta y consulta múltiples bases de datos desde una sola
                    interfaz.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <Shield size={48} className="text-warning mb-3" />
                  <h5 className="fw-bold">Seguro y Confiable</h5>
                  <p className="text-muted">
                    Tus conexiones están protegidas con autenticación segura y
                    encriptación.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* CTA Section */}
        <Container className="py-5">
          <Row>
            <Col lg={12}>
              <Card className="bg-primary text-white border-0">
                <Card.Body className="p-5 text-center">
                  <h3 className="fw-bold mb-3">¿Listo para empezar?</h3>
                  <p className="mb-4 opacity-75">
                    Únete a cientos de desarrolladores que ya están consultando
                    sus bases de datos de forma inteligente.
                  </p>
                  <Button
                    variant="light"
                    size="lg"
                    onClick={() => navigate("/register")}
                  >
                    Crear Cuenta Ahora
                    <ArrowRight className="ms-2" />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // If user profile is not complete
  if (!userProfile) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <Card.Title className="mb-4 text-center">
                  Completa tu Perfil
                </Card.Title>
                <Card.Text className="text-center">
                  ¡Gracias por registrarte! Para comenzar a usar NexoSQL, por
                  favor completa tu perfil.
                </Card.Text>
                <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                  <Button
                    variant="primary"
                    onClick={() => navigate("/complete-profile")}
                  >
                    Completar Perfil
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // If loading
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando tus conexiones...</p>
      </Container>
    );
  }

  // If error loading connections
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // If no connections
  if (connections.length === 0) {
    return (
      <Container className="py-5">
        <Card className="text-center p-5">
          <Card.Body>
            <Database size={64} className="mb-4 text-primary" />
            <Card.Title>No tienes conexiones configuradas</Card.Title>
            <Card.Text>
              Para empezar a usar el asistente SQL, necesitas configurar al
              menos una conexión a una base de datos.
            </Card.Text>
            <Button
              variant="primary"
              onClick={() => navigate("/crear-conexion")}
            >
              Crear Primera Conexión
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Show the chat interface
  return (
    <div data-connection-context className="w-100 h-100 chat-interface-container" style={{ maxWidth: "100%", overflow: "hidden" }}>
      <ChatInterface />
    </div>
  );
};

export default Home;
