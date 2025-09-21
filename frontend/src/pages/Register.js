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
import logoNexoSQL from "../assets/logo_nexosql.svg";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError("Por favor complete todos los campos");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    return true;
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setError("");
      setLoading(true);

      const result = await signup(email, password);

      if (result.error) {
        throw new Error(result.error);
      }

      // Registration successful, navigate to welcome page
      navigate("/welcome");
    } catch (error) {
      setError("Error al registrarse: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setError("");
      setLoading(true);

      const result = await loginWithGoogle();

      if (result.error) {
        throw new Error(result.error);
      }

      // Registration successful, navigate to welcome page
      navigate("/welcome");
    } catch (error) {
      setError("Error al registrarse con Google: " + error.message);
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
              <div className="text-center mb-4">
                <div className="d-flex align-items-center justify-content-center">
                  <img
                    src={logoNexoSQL}
                    alt="NexoSQL Logo"
                    style={{ height: "80px", marginRight: "15px" }}
                  />
                  <h1
                    className="mb-0"
                    style={{ color: "#007bff", fontWeight: "bold" }}
                  >
                    NexoSQL
                  </h1>
                </div>
              </div>
              <h2 className="text-center mb-4">Registrarse</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleEmailRegister}>
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
                  <Form.Text className="text-muted">
                    La contraseña debe tener al menos 6 caracteres.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme su contraseña"
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Cargando..." : "Registrarse"}
                  </Button>

                  <div className="text-center my-3">O</div>

                  <Button
                    variant="outline-danger"
                    onClick={handleGoogleRegister}
                    disabled={loading}
                    type="button"
                  >
                    Registrarse con Google
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-3">
                ¿Ya tiene una cuenta? <Link to="/login">Inicie Sesión</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
