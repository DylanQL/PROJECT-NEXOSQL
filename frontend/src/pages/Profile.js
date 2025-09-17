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
  Badge,
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
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState("");

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

  // Load subscription data
  useEffect(() => {
    if (currentUser) {
      loadSubscription();
    }
  }, [currentUser]);

  const loadSubscription = async () => {
    try {
      setSubscriptionLoading(true);
      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;
      const data = await subscriptionService.getCurrentSubscription();
      if (data.success) {
        setSubscription(data.data);
      }
    } catch (err) {
      console.error("Error loading subscription:", err);
    } finally {
      setSubscriptionLoading(false);
    }
  };

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

  const handleSyncSubscription = async () => {
    if (!subscription?.subscriptionId) return;

    try {
      setSyncLoading(true);
      setError("");
      setSyncSuccess("");

      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;

      const result = await subscriptionService.syncSubscription(
        subscription.subscriptionId,
      );

      if (result.success) {
        setSyncSuccess("Suscripción sincronizada correctamente");
        // Reload subscription data
        await loadSubscription();

        // Clear success message after 3 seconds
        setTimeout(() => setSyncSuccess(""), 3000);
      }
    } catch (err) {
      setError("Error al sincronizar suscripción: " + err.message);
    } finally {
      setSyncLoading(false);
    }
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

          {/* Subscription Section */}
          <Card className="shadow mt-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Mi Suscripción</h3>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate("/subscriptions")}
                >
                  Gestionar Suscripción
                </Button>
              </div>

              {subscriptionLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                  <p className="text-muted mt-2">
                    Cargando información de suscripción...
                  </p>
                </div>
              ) : subscription ? (
                <div>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Card.Text>
                        <strong>Plan Actual:</strong>{" "}
                        <Badge
                          bg={
                            subscription.planType === "oro"
                              ? "warning"
                              : subscription.planType === "plata"
                                ? "info"
                                : "secondary"
                          }
                        >
                          {subscription.planType.charAt(0).toUpperCase() +
                            subscription.planType.slice(1)}
                        </Badge>
                      </Card.Text>
                      <Card.Text>
                        <strong>Estado:</strong>{" "}
                        <Badge
                          bg={
                            subscription.status === "active"
                              ? "success"
                              : subscription.status === "pending"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {subscription.status === "active"
                            ? "Activa"
                            : subscription.status === "pending"
                              ? "Pendiente"
                              : subscription.status}
                        </Badge>
                      </Card.Text>
                    </Col>
                    <Col md={6}>
                      <Card.Text>
                        <strong>Precio:</strong> ${subscription.price}/mes
                      </Card.Text>
                      {subscription.nextBillingDate && (
                        <Card.Text>
                          <strong>Próximo cobro:</strong>{" "}
                          {new Date(
                            subscription.nextBillingDate,
                          ).toLocaleDateString("es-ES")}
                        </Card.Text>
                      )}
                    </Col>
                  </Row>

                  {subscription.status === "active" && (
                    <Alert variant="success" className="mb-0">
                      <i className="bi bi-check-circle me-2"></i>
                      Tu suscripción está activa. Disfruta de todas las
                      funciones premium de NexoSQL.
                    </Alert>
                  )}

                  {subscription.status === "pending" && (
                    <Alert variant="warning" className="mb-0">
                      <i className="bi bi-clock me-2"></i>
                      Tu suscripción está pendiente de activación. Por favor,
                      completa el proceso de pago.
                      <div className="mt-2">
                        <small className="d-block text-muted mb-2">
                          Si ya completaste el pago, puedes sincronizar tu
                          suscripción:
                        </small>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={handleSyncSubscription}
                          disabled={syncLoading}
                        >
                          {syncLoading ? (
                            <>
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-1"
                              />
                              Sincronizando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-arrow-clockwise me-1"></i>
                              Sincronizar con PayPal
                            </>
                          )}
                        </Button>
                      </div>
                    </Alert>
                  )}

                  {syncSuccess && (
                    <Alert variant="success" className="mb-0 mt-2">
                      <i className="bi bi-check-circle me-2"></i>
                      {syncSuccess}
                    </Alert>
                  )}
                </div>
              ) : (
                <div>
                  <Alert variant="info">
                    <h6>
                      <i className="bi bi-info-circle me-2"></i>Sin Suscripción
                      Activa
                    </h6>
                    <p className="mb-3">
                      Actualmente no tienes una suscripción activa. Para acceder
                      a todas las funciones premium de NexoSQL, elige uno de
                      nuestros planes.
                    </p>
                    <div className="d-grid gap-2 d-md-flex">
                      <Button
                        variant="primary"
                        onClick={() => navigate("/subscriptions")}
                      >
                        Ver Planes de Suscripción
                      </Button>
                    </div>
                  </Alert>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
