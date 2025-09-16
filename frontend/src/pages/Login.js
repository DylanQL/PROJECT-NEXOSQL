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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

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

      // Login successful
      navigate("/welcome");
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

      // Login successful
      navigate("/welcome");
    } catch (error) {
      setError("Error al iniciar sesión con Google: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Iniciar Sesión</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleEmailLogin}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingrese su correo electrónico"
                    required
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
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Cargando..." : "Iniciar Sesión"}
                  </Button>

                  <div className="text-center my-3">O</div>

                  <Button
                    variant="outline-danger"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    type="button"
                  >
                    Iniciar Sesión con Google
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-3">
                ¿No tiene una cuenta? <Link to="/register">Regístrese</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
