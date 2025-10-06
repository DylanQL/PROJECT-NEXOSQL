import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logoNexoSQL from "../assets/logo_nexosql.svg";
import loginImage from "../assets/Imagen_Login-Register.png";
import "../styles/AuthPages.css";

if (!document.querySelector('link[href*="font-awesome"]')) {
  const fontAwesome = document.createElement("link");
  fontAwesome.rel = "stylesheet";
  fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
  document.head.appendChild(fontAwesome);
}

const AdminLogin = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/admin/dashboard";

  const { loginWithGoogle, logout, isAdmin, isAuthenticated, adminEmail } =
    useAuth();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isAdmin, redirectTo, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      const result = await loginWithGoogle();

      if (result.error) {
        throw new Error(result.error);
      }

      const signedEmail = result?.user?.email?.toLowerCase();

      if (signedEmail !== adminEmail) {
        await logout();
        setError(
          "Solo el administrador autorizado puede acceder a este panel. Intenta con la cuenta oficial.",
        );
        return;
      }

      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(
        `No se pudo iniciar sesión con Google: ${loginError.message || loginError}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-container">
      <Row className="h-100 g-0">
        <Col lg={6} className="auth-form-section-dark">
          <div className="text-center auth-logo-section">
            <div className="d-flex align-items-center justify-content-center mb-4">
              <img
                src={logoNexoSQL}
                alt="NexoSQL Logo"
                className="auth-logo auth-logo-animated"
              />
              <h1 className="mb-0 auth-title-dark auth-title-animated">NexoSQL</h1>
            </div>
          </div>
          <div className="auth-welcome-section">
            <h2 className="text-center auth-subtitle-dark">
              👋 Bienvenido, Administrador
            </h2>
            <p className="text-center auth-description">
              Accede al panel estratégico de NexoSQL utilizando tu cuenta oficial de
              Google.
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="auth-alert-dark">
              {error}
            </Alert>
          )}

          <Card className="bg-dark border-0 shadow-sm mt-4">
            <Card.Body className="p-4">
              <h5 className="text-white mb-3 text-center">
                Acceso exclusivo para {adminEmail}
              </h5>
              <p className="text-muted text-center mb-4">
                Para mayor seguridad, el acceso al panel administrativo solo está
                disponible con autenticación federada mediante Google.
              </p>
              <div className="d-grid">
                <Button
                  variant="outline-light"
                  size="lg"
                  className="auth-btn-google-dark"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2" />
                      Validando credenciales...
                    </>
                  ) : (
                    <>
                      <i className="fab fa-google me-2" />
                      Ingresar con Google
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>

          <div className="text-center text-muted small mt-4">
            Si necesitas habilitar otra cuenta administradora contacta al equipo de
            plataforma.
          </div>
        </Col>

        <Col lg={6} className="d-none d-lg-block">
          <div
            className="auth-image-section"
            style={{ backgroundImage: `url(${loginImage})` }}
          ></div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLogin;
