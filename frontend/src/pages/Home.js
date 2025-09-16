import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Database } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConnection } from '../contexts/ConnectionContext';
import ChatInterface from '../components/ChatInterface';

const Home = () => {
  const { currentUser, userProfile } = useAuth();
  const { connections, loading, error } = useConnection();
  const navigate = useNavigate();

  // If user is not logged in
  if (!currentUser) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <Card.Title className="mb-4 text-center">Bienvenido a NexoSQL</Card.Title>
                <Card.Text className="text-center">
                  Una aplicación para consultar tus bases de datos usando lenguaje natural.
                </Card.Text>
                <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                  <Button variant="primary" onClick={() => navigate('/login')}>
                    Iniciar Sesión
                  </Button>
                  <Button variant="outline-primary" onClick={() => navigate('/register')}>
                    Registrarse
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
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
                <Card.Title className="mb-4 text-center">Completa tu Perfil</Card.Title>
                <Card.Text className="text-center">
                  ¡Gracias por registrarse! Para comenzar a usar NexoSQL, por favor completa tu perfil.
                </Card.Text>
                <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                  <Button variant="primary" onClick={() => navigate('/complete-profile')}>
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
        <Alert variant="danger">
          {error}
        </Alert>
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
              Para empezar a usar el asistente SQL, necesitas configurar al menos una conexión a una base de datos.
            </Card.Text>
            <Button variant="primary" onClick={() => navigate('/crear-conexion')}>
              Crear Primera Conexión
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Show the chat interface
  return (
    <div data-connection-context>
      <ChatInterface />
    </div>
  );
};

export default Home;
