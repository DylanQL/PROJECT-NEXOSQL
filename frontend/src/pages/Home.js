import React, { useEffect } from "react";
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
  Robot,
  HddStack,
  ShieldFillCheck,
  Cpu,
  Magic,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useConnection } from "../contexts/ConnectionContext";
import ChatInterface from "../components/ChatInterface";
import "../styles/Home.css";

const Home = () => {
  const { currentUser, userProfile } = useAuth();
  const { connections, loading, error } = useConnection();
  const navigate = useNavigate();

  // Effect to manage body class for chat interface
  useEffect(() => {
    if (currentUser && userProfile && connections.length > 0) {
      // Add class when showing chat interface
      document.body.classList.add("chat-interface-page");
      return () => {
        // Remove class when component unmounts or conditions change
        document.body.classList.remove("chat-interface-page");
      };
    } else {
      // Remove class for other views
      document.body.classList.remove("chat-interface-page");
    }
  }, [currentUser, userProfile, connections.length]);

  // If user is not logged in - Show landing page
  if (!currentUser) {
    return (
      <div className="bg-light">
        {/* Hero Section */}
        <Container className="py-5 hero-section">
          <Row className="align-items-center min-vh-75">
            <Col lg={6} className="hero-content">
              <div className="mb-4">
                <Badge bg="primary" className="mb-3 px-3 py-2 hero-badge">
                  <Database className="me-2" />
                  Revoluciona tus consultas SQL
                </Badge>
              </div>
              <h1 className="display-4 fw-bold text-dark mb-4 hero-title">
                Consulta tus bases de datos con
                <span className="text-primary"> lenguaje natural</span>
              </h1>
              <p className="lead text-muted mb-4 hero-description">
                NexoSQL convierte tus preguntas cotidianas en consultas SQL
                precisas. Conecta múltiples bases de datos y obtén respuestas
                instantáneas sin escribir una sola línea de código.
              </p>
              <div className="d-grid gap-2 d-md-flex hero-buttons">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="me-md-2 hero-cta-primary"
                >
                  Comenzar Ahora
                  <ArrowRight className="ms-2" />
                </Button>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="hero-cta-secondary"
                >
                  Iniciar Sesión
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="hero-demo-card">
                <Robot size={80} className="text-primary mb-3 hero-demo-icon" />
                <h5 className="mb-3 hero-demo-question">
                  ¿Cuántos usuarios se registraron este mes?
                </h5>
                <div className="hero-demo-code">
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
        <Container className="py-5 features-section">
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="fw-bold features-title">¿Por qué elegir NexoSQL?</h2>
              <p className="text-muted features-subtitle">
                Simplifica tu trabajo con bases de datos
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm feature-card">
                <Card.Body className="text-center p-4">
                  <Magic size={48} className="text-primary mb-3 feature-icon" />
                  <h5 className="fw-bold feature-title">Lenguaje Natural</h5>
                  <p className="text-muted feature-description">
                    Haz preguntas en español y obtén consultas SQL precisas
                    automáticamente.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm feature-card">
                <Card.Body className="text-center p-4">
                  <HddStack size={48} className="text-success mb-3 feature-icon" />
                  <h5 className="fw-bold feature-title">Múltiples Conexiones</h5>
                  <p className="text-muted feature-description">
                    Conecta y consulta múltiples bases de datos desde una sola
                    interfaz.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm feature-card">
                <Card.Body className="text-center p-4">
                  <ShieldFillCheck size={48} className="text-warning mb-3 feature-icon" />
                  <h5 className="fw-bold feature-title">Seguro y Confiable</h5>
                  <p className="text-muted feature-description">
                    Tus conexiones están protegidas con autenticación segura y
                    encriptación.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* CTA Section */}
        <div className="py-5 cta-section">
          <Container>
            <Row>
              <Col lg={12}>
                <Card className="border-0 cta-card">
                  <Card.Body className="p-5 text-center">
                    <h3 className="fw-bold mb-3 cta-title">¿Listo para empezar?</h3>
                    <p className="mb-4 cta-description">
                      Únete a cientos de desarrolladores que ya están consultando
                      sus bases de datos de forma inteligente.
                    </p>
                    <Button
                      variant="light"
                      size="lg"
                      onClick={() => navigate("/register")}
                      className="cta-button"
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
        <Card className="text-center p-5 mx-auto" style={{ width: '90%' }}>
          <Card.Body>
            <HddStack size={64} className="mb-4 text-primary" />
            <Card.Title>No tienes conexiones configuradas</Card.Title>
            <Card.Text>
              Para empezar a usar el asistente SQL, necesitas configurar al
              menos una conexión a una base de datos.
            </Card.Text>
            <Button
              variant="primary"
              onClick={() => navigate("/conexiones")}
              className="cta-button"
              style={{ color: 'white', backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
            >
              Ir a Conexiones
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Show the chat interface
  return (
    <div
      data-connection-context
      className="w-100 h-100 chat-interface-container"
      style={{ maxWidth: "100%" }}
    >
      <ChatInterface />
    </div>
  );
};

export default Home;
