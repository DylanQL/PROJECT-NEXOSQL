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
        <Col lg={6} className="auth-form-section">
          <div className="text-center auth-logo-section">
            <div className="d-flex align-items-center justify-content-center">
              <img
                src={logoNexoSQL}
                alt="NexoSQL Logo"
                className="auth-logo"
              />
              <h1 className="mb-0 auth-title">NexoSQL</h1>
            </div>
          </div>
          <h2 className="text-center auth-subtitle">Iniciar Sesión</h2>

          {error && <Alert variant="danger" className="auth-alert">{error}</Alert>}

          <Form onSubmit={handleEmailLogin}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingrese su correo electrónico"
                required
                className="auth-form-control"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
                className="auth-form-control"
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                size="lg"
                className="auth-btn auth-btn-primary"
              >
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </Button>

              <div className="text-center my-3 auth-divider">O</div>

              <Button
                variant="outline-danger"
                onClick={handleGoogleLogin}
                disabled={loading}
                type="button"
                size="lg"
                className="auth-btn auth-btn-google"
              >
                Iniciar Sesión con Google
              </Button>
            </div>
          </Form>

          <div className="text-center auth-link-section">
            <span>¿No tiene una cuenta? </span>
            <Link to="/register" className="auth-link">
              Regístrese
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
