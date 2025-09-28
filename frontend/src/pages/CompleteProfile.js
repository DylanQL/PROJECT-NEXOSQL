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
      <div className="complete-profile-page">
        <Container className="py-5">
          <div className="loading-container">
            <div className="loading-spinner">
              <Spinner animation="border" variant="primary" />
            </div>
            <h3 className="loading-title">Verificando perfil</h3>
            <p className="loading-subtitle">Estamos verificando el estado de su perfil...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="complete-profile-page">
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <div className="auth-required-card">
                <div className="auth-required-icon">
                  <i className="bi bi-shield-exclamation"></i>
                </div>
                <h2 className="auth-required-title">Autenticación Requerida</h2>
                <p className="auth-required-text">
                  Debe iniciar sesión para completar su perfil.
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="btn-primary-modern"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Iniciar Sesión
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="complete-profile-page">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="complete-profile-card">
              <div className="complete-profile-header">
                <div className="complete-profile-icon">
                  <i className="bi bi-person-plus"></i>
                </div>
                <h1 className="complete-profile-title">Completar Perfil</h1>
                <p className="complete-profile-subtitle">
                  Complete su información para comenzar a usar NexoSQL
                </p>
              </div>

              <div className="complete-profile-info">
                <div className="info-badge">
                  <i className="bi bi-envelope me-2"></i>
                  {currentUser.email}
                </div>
                {currentUser.uid && (
                  <div className="info-badge uid-badge">
                    <i className="bi bi-key me-2"></i>
                    ID: {currentUser.uid.substring(0, 8)}...
                  </div>
                )}
              </div>

              {error && (
                <div className="alert-modern alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              {success && (
                <div className="alert-modern alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  ¡Perfil creado exitosamente!
                </div>
              )}

              <Form onSubmit={handleSubmit} className="complete-profile-form">
                <div className="form-grid">
                  <div className="form-group-modern">
                    <Form.Label className="form-label-modern">
                      <i className="bi bi-person me-2"></i>
                      Nombres
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      placeholder="Ingrese sus nombres"
                      className="form-control-modern"
                      required
                    />
                  </div>

                  <div className="form-group-modern">
                    <Form.Label className="form-label-modern">
                      <i className="bi bi-person-badge me-2"></i>
                      Apellidos
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      placeholder="Ingrese sus apellidos"
                      className="form-control-modern"
                      required
                    />
                  </div>

                  <div className="form-group-modern form-group-full">
                    <Form.Label className="form-label-modern">
                      <i className="bi bi-envelope me-2"></i>
                      Correo Electrónico
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={currentUser.email}
                      disabled
                      readOnly
                      className="form-control-modern form-control-disabled"
                    />
                    <Form.Text className="form-help-text">
                      Este campo no se puede modificar.
                    </Form.Text>
                  </div>

                  <div className="form-group-modern">
                    <Form.Label className="form-label-modern">
                      <i className="bi bi-telephone me-2"></i>
                      Teléfono
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ingrese su número de teléfono"
                      className="form-control-modern"
                    />
                  </div>

                  <div className="form-group-modern">
                    <Form.Label className="form-label-modern">
                      <i className="bi bi-globe me-2"></i>
                      País
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="pais"
                      value={formData.pais}
                      onChange={handleChange}
                      placeholder="Ingrese su país"
                      className="form-control-modern"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <Button
                    type="submit"
                    disabled={loading || success}
                    className="btn-primary-modern"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2 me-2"></i>
                        Guardar Perfil
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/")}
                    disabled={loading || success}
                    className="btn-secondary-modern"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancelar
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CompleteProfile;
