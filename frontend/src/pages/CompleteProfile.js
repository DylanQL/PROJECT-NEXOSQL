import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const CompleteProfile = () => {
  const { currentUser, userProfile, createProfile, profileLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    pais: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Redirect if the user already has a complete profile
  useEffect(() => {
    if (userProfile && !submitAttempted) {
      console.log("User already has a profile, redirecting to profile page");
      navigate("/profile");
    }
  }, [userProfile, navigate, submitAttempted]);

  // Pre-fill email from Firebase auth
  useEffect(() => {
    if (currentUser) {
      // If there's a display name, try to parse it for first/last name
      if (currentUser.displayName) {
        const nameParts = currentUser.displayName.split(" ");
        if (nameParts.length >= 2) {
          setFormData((prev) => ({
            ...prev,
            nombres: nameParts[0],
            apellidos: nameParts.slice(1).join(" "),
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            nombres: currentUser.displayName,
          }));
        }
      }
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Basic validation
    if (!formData.nombres || !formData.apellidos) {
      return setError("Nombres y apellidos son campos requeridos");
    }

    try {
      setError("");
      setLoading(true);

      // Create user profile in our database with Firebase UID
      const userData = {
        ...formData,
        email: currentUser.email,
      };

      console.log("Submitting profile data:", userData);
      const result = await createProfile(userData);

      if (result.error) {
        console.error("Error creating profile:", result.error);
        throw new Error(result.error);
      }

      console.log("Profile created successfully:", result.data);
      setSuccess(true);

      // Redirect to profile page after a short delay
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      console.error("Exception in handleSubmit:", error);
      setError("Error al crear perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Verificando estado del perfil...</p>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Debe iniciar sesión para completar su perfil.
        </Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={() => navigate("/login")}>
            Iniciar Sesión
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Completar Perfil</h2>

              <div className="mb-3 text-center text-muted">
                <small>Cuenta de Firebase: {currentUser.email}</small>
                {currentUser.uid && (
                  <small className="d-block">ID: {currentUser.uid}</small>
                )}
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">¡Perfil creado exitosamente!</Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="nombres">
                  <Form.Label>Nombres</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    placeholder="Ingrese sus nombres"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="apellidos">
                  <Form.Label>Apellidos</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    placeholder="Ingrese sus apellidos"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    value={currentUser.email}
                    disabled
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    Este campo no se puede modificar.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="telefono">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ingrese su número de teléfono"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="pais">
                  <Form.Label>País</Form.Label>
                  <Form.Control
                    type="text"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    placeholder="Ingrese su país"
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || success}
                  >
                    {loading ? "Guardando..." : "Guardar Perfil"}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="mt-2"
                    onClick={() => navigate("/")}
                    disabled={loading || success}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CompleteProfile;
