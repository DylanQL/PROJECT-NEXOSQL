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
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { userProfile, updateProfile, currentUser, profileLoading } = useAuth();
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
  const [isEditing, setIsEditing] = useState(false);

  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        nombres: userProfile.nombres || "",
        apellidos: userProfile.apellidos || "",
        telefono: userProfile.telefono || "",
        pais: userProfile.pais || "",
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.nombres || !formData.apellidos) {
      return setError("Nombres y apellidos son campos requeridos");
    }

    try {
      setError("");
      setLoading(true);

      const result = await updateProfile(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccess(true);
      setIsEditing(false);

      // Clear success message after delay
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError("Error al actualizar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setError("");
    setSuccess(false);
  };

  if (profileLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando información de perfil...</p>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          No has iniciado sesión. Por favor inicia sesión para ver tu perfil.
        </Alert>
        <div className="text-center mt-3">
          <Button onClick={() => navigate("/login")}>Iniciar Sesión</Button>
        </div>
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          No se encontró información de perfil. Por favor complete su perfil
          primero.
        </Alert>
        <div className="text-center mt-3">
          <Button onClick={() => navigate("/complete-profile")}>
            Completar Perfil
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Mi Perfil</h2>
                <div>
                  <small className="text-muted me-3">
                    Usuario: {currentUser.email}
                  </small>
                  <Button
                    variant={isEditing ? "secondary" : "primary"}
                    onClick={toggleEdit}
                    disabled={loading}
                  >
                    {isEditing ? "Cancelar" : "Editar Perfil"}
                  </Button>
                </div>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">
                  ¡Perfil actualizado exitosamente!
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="nombres">
                      <Form.Label>Nombres</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="apellidos">
                      <Form.Label>Apellidos</Form.Label>
                      <Form.Control
                        type="text"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    value={userProfile.email}
                    disabled
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    Este campo no se puede modificar.
                  </Form.Text>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="telefono">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="pais">
                      <Form.Label>País</Form.Label>
                      <Form.Control
                        type="text"
                        name="pais"
                        value={formData.pais}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {isEditing && (
                  <div className="d-grid gap-2 mt-4">
                    <Button variant="success" type="submit" disabled={loading}>
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                )}
              </Form>

              <div className="mt-4">
                <Card.Text>
                  <strong>Fecha de registro:</strong>{" "}
                  {new Date(userProfile.createdAt).toLocaleDateString()}
                </Card.Text>
                {userProfile.updatedAt &&
                  userProfile.updatedAt !== userProfile.createdAt && (
                    <Card.Text>
                      <strong>Última actualización:</strong>{" "}
                      {new Date(userProfile.updatedAt).toLocaleDateString()}
                    </Card.Text>
                  )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
