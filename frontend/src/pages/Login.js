import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logoNexoSQL from "../assets/logo_nexosql.svg";
import loginImage from "../assets/Imagen_Login-Register.png";
import "../styles/AuthPages.css";

// Add Font Awesome CDN for icons
if (!document.querySelector('link[href*="font-awesome"]')) {
  const fontAwesome = document.createElement('link');
  fontAwesome.rel = 'stylesheet';
  fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
  document.head.appendChild(fontAwesome);
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/welcome";

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      return setError("Por favor ingrese email y contraseña");
    }

    try {
      setError("");
      setLoading(true);

      const result = await login(email, password);

      if (result.error) {
        throw new Error(result.error);
      }

      // Login successful, redirect to the page user was trying to access
      navigate(from);
    } catch (error) {
      setError("Error al iniciar sesión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const result = await loginWithGoogle();

      if (result.error) {
        throw new Error(result.error);
      }

      // Login successful, redirect to the page user was trying to access
      navigate(from);
    } catch (error) {
      setError("Error al iniciar sesión con Google: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-container">
      <Row className="h-100 g-0">
        {/* Left Side - Form */}
        <Col lg={6} className="auth-form-section-dark">
          <div className="text-center auth-logo-section">
            <div className="d-flex align-items-center justify-content-center mb-4">
              <img
                src={logoNexoSQL}
                alt="NexoSQL Logo"
                className="auth-logo"
              />
              <h1 className="mb-0 auth-title-dark">NexoSQL</h1>
            </div>
          </div>
          <div className="auth-welcome-section">
            <h2 className="text-center auth-subtitle-dark">🔐 Iniciar Sesión</h2>
            <p className="text-center auth-description">Accede a tu cuenta para gestionar tus bases de datos</p>
          </div>

          {error && <Alert variant="danger" className="auth-alert-dark">{error}</Alert>}

          <Form onSubmit={handleEmailLogin} className="auth-form-dark">
            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="auth-label-dark">
                <i className="fas fa-envelope me-2"></i>
                Correo Electrónico
              </Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="📧 Ingrese su correo electrónico"
                required
                className="auth-form-control-dark"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label className="auth-label-dark">
                <i className="fas fa-lock me-2"></i>
                Contraseña
              </Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="🔑 Ingrese su contraseña"
                required
                className="auth-form-control-dark"
              />
            </Form.Group>

            <div className="d-grid gap-3">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                size="lg"
                className="auth-btn-primary-dark"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Cargando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Iniciar Sesión
                  </>
                )}
              </Button>

              <div className="text-center my-3 auth-divider-dark">
                <span>O continúa con</span>
              </div>

              <Button
                variant="outline-light"
                onClick={handleGoogleLogin}
                disabled={loading}
                type="button"
                size="lg"
                className="auth-btn-google-dark"
              >
                <i className="fab fa-google me-2"></i>
                Google
              </Button>
            </div>
          </Form>

          <div className="text-center auth-link-section-dark">
            <span>¿No tienes una cuenta? </span>
            <Link to="/register" className="auth-link-dark">
              <i className="fas fa-user-plus me-1"></i>
              Regístrate aquí
            </Link>
          </div>
        </Col>

        {/* Right Side - Image */}
        <Col lg={6} className="d-none d-lg-block">
          <div className="auth-image-section" style={{ backgroundImage: `url(${loginImage})` }}>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
