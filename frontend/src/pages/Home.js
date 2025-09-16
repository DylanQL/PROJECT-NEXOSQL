import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <Card.Title className="mb-4 text-center">Bienvenido a NexoSQL</Card.Title>

              {!currentUser ? (
                <>
                  <Card.Text className="text-center">
                    Una aplicación de demostración para gestión de usuarios con Firebase Auth y MySQL.
                  </Card.Text>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                    <Button variant="primary" onClick={() => navigate('/login')}>
                      Iniciar Sesión
                    </Button>
                    <Button variant="outline-primary" onClick={() => navigate('/register')}>
                      Registrarse
                    </Button>
                  </div>
                </>
              ) : !userProfile ? (
                <>
                  <Card.Text className="text-center">
                    ¡Gracias por registrarse! Para completar su perfil, por favor ingrese su información.
                  </Card.Text>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                    <Button variant="primary" onClick={() => navigate('/complete-profile')}>
                      Completar Perfil
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Card.Text className="text-center">
                    ¡Hola, {userProfile.nombres}! Has iniciado sesión correctamente.
                  </Card.Text>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                    <Button variant="primary" onClick={() => navigate('/profile')}>
                      Ver Perfil
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
