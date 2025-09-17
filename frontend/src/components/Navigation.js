import React from "react";
import { Navbar, Nav, Container, Button, Badge } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";

const Navigation = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const { hasActiveSubscription, currentSubscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          NexoSQL
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={location.pathname === "/" ? "active" : ""}
            >
              Inicio
            </Nav.Link>
            {currentUser && (
              <>
                <Nav.Link
                  as={Link}
                  to="/welcome"
                  className={location.pathname === "/welcome" ? "active" : ""}
                >
                  Bienvenida
                </Nav.Link>
                {userProfile && (
                  <>
                    <Nav.Link
                      as={Link}
                      to="/profile"
                      className={
                        location.pathname === "/profile" ? "active" : ""
                      }
                    >
                      Mi Perfil
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/subscriptions"
                      className={
                        location.pathname === "/subscriptions" ? "active" : ""
                      }
                    >
                      Suscripciones
                      {hasActiveSubscription && (
                        <Badge bg="success" className="ms-1">
                          ✓
                        </Badge>
                      )}
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/conexiones"
                      className={
                        location.pathname.startsWith("/conexiones") ||
                        location.pathname.startsWith("/crear-conexion") ||
                        location.pathname.startsWith("/editar-conexion")
                          ? "active"
                          : ""
                      }
                    >
                      Conexiones
                    </Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {currentUser ? (
              <>
                <Navbar.Text className="me-3">
                  <Badge bg="success" className="me-2">
                    Conectado
                  </Badge>
                  {hasActiveSubscription && currentSubscription && (
                    <Badge
                      bg={
                        currentSubscription.planType === "oro"
                          ? "warning"
                          : currentSubscription.planType === "plata"
                            ? "info"
                            : "secondary"
                      }
                      className="me-2"
                    >
                      {currentSubscription.planType.charAt(0).toUpperCase() +
                        currentSubscription.planType.slice(1)}
                    </Badge>
                  )}
                  {userProfile
                    ? `${userProfile.nombres} ${userProfile.apellidos}`
                    : currentUser.email}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className={location.pathname === "/login" ? "active" : ""}
                >
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  className={location.pathname === "/register" ? "active" : ""}
                >
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
