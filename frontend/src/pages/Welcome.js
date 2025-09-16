import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Welcome = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5 text-center">
              <h1 className="display-4 mb-4">¡Bienvenido a NexoSQL!</h1>

              {userProfile ? (
                <>
                  <h2 className="text-primary mb-4">{userProfile.nombres} {userProfile.apellidos}</h2>
                  <p className="lead mb-4">
                    Nos alegra que hayas iniciado sesión en nuestra plataforma. Tu cuenta ha sido verificada correctamente.
                  </p>
                  <p className="mb-5">
                    Ahora puedes explorar todas las funcionalidades de nuestra aplicación.
                  </p>
                </>
              ) : (
                <>
                  <p className="lead mb-4">
                    Nos alegra que hayas iniciado sesión en nuestra plataforma. Tu cuenta ha sido verificada correctamente.
                  </p>
                  <p className="mb-5">
                    Por favor, completa tu perfil para aprovechar todas las funcionalidades.
                  </p>
                </>
              )}

              <div className="d-grid gap-3 d-md-flex justify-content-md-center">
                {userProfile ? (
                  <>
                    <Button variant="primary" size="lg" onClick={() => navigate('/profile')}>
                      Ver mi perfil
                    </Button>
                    <Button variant="outline-primary" size="lg" onClick={() => navigate('/')}>
                      Ir al inicio
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" size="lg" onClick={() => navigate('/complete-profile')}>
                    Completar mi perfil
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Welcome;
