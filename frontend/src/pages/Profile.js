import React, { useState, useEffect, useMemo } from "react";
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
  Modal,
  FloatingLabel,
} from "react-bootstrap";
import { PencilSquare, CheckCircleFill, ShieldLock } from "react-bootstrap-icons";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { userProfile, updateProfile, currentUser, profileLoading } = useAuth();
  const { autoSyncActive } = useSubscription();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    pais: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [subscriptionNotice, setSubscriptionNotice] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState("");
  const [plans, setPlans] = useState({});
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isInGracePeriod, setIsInGracePeriod] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  useEffect(() => {
    if (currentUser) {
      loadSubscription();
      loadPlans();
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
        setHasActiveSubscription(data.hasActiveSubscription);
        setIsInGracePeriod(data.isInGracePeriod || false);
      }
    } catch (err) {
      console.error("Error loading subscription:", err);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await fetch("/api/subscriptions/plans");
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (err) {
      console.error("Error loading plans:", err);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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

      setProfileNotice("¡Perfil actualizado correctamente!");
      setIsEditing(false);
      setTimeout(() => setProfileNotice(""), 3000);
    } catch (err) {
      setError("Error al actualizar perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    setError("");
    setProfileNotice("");

    if (isEditing && userProfile) {
      setFormData({
        nombres: userProfile.nombres || "",
        apellidos: userProfile.apellidos || "",
        telefono: userProfile.telefono || "",
        pais: userProfile.pais || "",
      });
    }

    setIsEditing((prev) => !prev);
  };

  const handleSyncSubscription = async () => {
    if (!subscription?.subscriptionId) return;

    try {
      setSyncLoading(true);
      setError("");
      setSyncSuccess("");
      setSubscriptionNotice("");

      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;

      const result = await subscriptionService.syncSubscription(
        subscription.subscriptionId,
      );

      if (result.success) {
        setSyncSuccess("Suscripción sincronizada correctamente");
        await loadSubscription();
        setTimeout(() => setSyncSuccess(""), 3000);
      }
    } catch (err) {
      setError("Error al sincronizar suscripción: " + err.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSubscriptionNotice("");

      const subscriptionService = (
        await import("../services/subscriptionService")
      ).default;
      const data = await subscriptionService.cancelSubscription(
        "Usuario solicitó cancelación",
      );

      if (data.success) {
        setSubscriptionNotice("Suscripción cancelada correctamente.");
        setShowCancelModal(false);
        await loadSubscription();
        setTimeout(() => setSubscriptionNotice(""), 4000);
      } else {
        setError(data.error || "Error al cancelar la suscripción");
      }
    } catch (err) {
      setError("Error al cancelar la suscripción");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: "success", text: "Activa" },
      pending: { variant: "warning", text: "Pendiente" },
      cancelled: { variant: "danger", text: "Cancelada" },
      suspended: { variant: "secondary", text: "Suspendida" },
      expired: { variant: "dark", text: "Expirada" },
    };

    const config = statusConfig[status] || {
      variant: "secondary",
      text: status,
    };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-US", { style: "currency", currency: "USD" }).format(price);

  const formatDate = (date, includeTime = false) => {
    if (!date) return "N/A";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    return new Date(date).toLocaleDateString("es-ES", options);
  };

  const fullName = useMemo(() => {
    if (!userProfile) return "";
    const parts = [userProfile.nombres, userProfile.apellidos].filter(Boolean);
    return parts.join(" ").trim();
  }, [userProfile]);

  const memberSince = userProfile?.createdAt
    ? formatDate(userProfile.createdAt)
    : "—";

  const subscriptionPriceLabel = subscription
    ? `${formatPrice(subscription.price)}/mes`
    : "—";

  const showSyncButton =
    subscription?.status === "pending" && !autoSyncActive && !isInGracePeriod;

  if (profileLoading) {
    return (
      <div className="profile-layout">
        <Container className="py-5 text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3">Cargando información de perfil...</p>
        </Container>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="profile-layout">
        <Container className="py-5">
          <Alert variant="warning">
            No has iniciado sesión. Por favor inicia sesión para ver tu perfil.
          </Alert>
          <div className="text-center mt-3">
            <Button onClick={() => navigate("/login")}>Iniciar Sesión</Button>
          </div>
        </Container>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="profile-layout">
        <Container className="py-5">
          <Alert variant="warning">
            No se encontró información de perfil. Por favor completa tu perfil primero.
          </Alert>
          <div className="text-center mt-3">
            <Button onClick={() => navigate("/complete-profile")}>
              Completar Perfil
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="profile-layout">
      <Container className="py-4">
        <Row className="g-4">
          <Col xs={12}>
            <Card className="profile-summary-card">
              <Card.Body className="profile-summary-card__body">
                <div className="profile-summary-card__section">
                  <h1 className="profile-summary-card__title">
                    {fullName || "Usuario sin nombre"}
                  </h1>
                  <p className="profile-summary-card__subtitle mb-0">
                    ID de usuario: {currentUser.uid || currentUser.email}
                  </p>
                </div>
                <div className="profile-summary-card__stats">
                  <div className="profile-summary-card__item">
                    <span className="profile-summary-card__label">Correo</span>
                    <strong className="profile-summary-card__value text-truncate">
                      {currentUser.email}
                    </strong>
                  </div>
                  <div className="profile-summary-card__item">
                    <span className="profile-summary-card__label">Miembro desde</span>
                    <strong className="profile-summary-card__value">{memberSince}</strong>
                  </div>
                  <div className="profile-summary-card__item">
                    <span className="profile-summary-card__label">Plan</span>
                    <strong className="profile-summary-card__value">
                      {hasActiveSubscription
                        ? plans[subscription?.planType]?.name || subscription?.planType
                        : "Sin suscripción"}
                    </strong>
                  </div>
                  <div className="profile-summary-card__item">
                    <span className="profile-summary-card__label">Estado</span>
                    <strong className="profile-summary-card__value">
                      {hasActiveSubscription
                        ? subscription?.status?.toUpperCase()
                        : "SIN PLAN"}
                    </strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} className="d-flex">
            <Card className="profile-panel flex-fill">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                  <div>
                    <h2 className="h4 mb-1">Información personal</h2>
                    <p className="text-muted mb-0">
                      Actualiza tus datos básicos para mantener tu cuenta al día.
                    </p>
                    <small className="text-muted d-block mt-1">
                      Nombre registrado: {fullName || currentUser.email}
                    </small>
                  </div>
                  <Button
                    variant={isEditing ? "outline-secondary" : "primary"}
                    onClick={toggleEdit}
                    disabled={loading}
                    className="d-inline-flex align-items-center gap-2"
                  >
                    <PencilSquare size={16} />
                    {isEditing ? "Cancelar" : "Editar"}
                  </Button>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}
                {profileNotice && (
                  <Alert variant="success" className="d-flex align-items-center gap-2">
                    <CheckCircleFill size={16} /> {profileNotice}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} className="profile-form-grid">
                  <FloatingLabel controlId="nombres" label="Nombres">
                    <Form.Control
                      type="text"
                      name="nombres"
                      placeholder="Nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </FloatingLabel>
                  <FloatingLabel controlId="apellidos" label="Apellidos">
                    <Form.Control
                      type="text"
                      name="apellidos"
                      placeholder="Apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </FloatingLabel>
                  <FloatingLabel controlId="telefono" label="Teléfono">
                    <Form.Control
                      type="tel"
                      name="telefono"
                      placeholder="Teléfono"
                      value={formData.telefono}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </FloatingLabel>
                  <FloatingLabel controlId="pais" label="País">
                    <Form.Control
                      type="text"
                      name="pais"
                      placeholder="País"
                      value={formData.pais}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </FloatingLabel>
                  <div className="profile-form-grid__full">
                    <Form.Group controlId="email">
                      <Form.Label className="text-muted">Correo electrónico</Form.Label>
                      <Form.Control type="email" value={userProfile.email} disabled readOnly />
                      <Form.Text className="text-muted">
                        Este campo no se puede modificar.
                      </Form.Text>
                    </Form.Group>
                  </div>

                  {userProfile.updatedAt && userProfile.updatedAt !== userProfile.createdAt && (
                    <div className="profile-form-grid__full">
                      <small className="text-muted">
                        Última actualización: {formatDate(userProfile.updatedAt, true)}
                      </small>
                    </div>
                  )}

                  {isEditing && (
                    <div className="profile-form__actions profile-form-grid__full">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                        className="profile-form__submit"
                      >
                        {loading ? "Guardando cambios..." : "Guardar cambios"}
                      </Button>
                    </div>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} className="d-flex">
            <Card className="profile-panel flex-fill">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                  <div>
                    <h2 className="h4 mb-1">Suscripción</h2>
                    <p className="text-muted mb-0">
                      Consulta y gestiona tu plan actual.
                    </p>
                    <small className="text-muted d-block mt-1">
                      Estado: {hasActiveSubscription ? subscription?.status : "Sin suscripción"}
                    </small>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate("/subscriptions")}
                  >
                    Ver planes
                  </Button>
                </div>

                {subscriptionLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                    <p className="text-muted mt-2 mb-0">
                      Cargando información de suscripción...
                    </p>
                  </div>
                ) : hasActiveSubscription && subscription ? (
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <Badge bg="primary" pill>
                        {plans[subscription.planType]?.name || subscription.planType}
                      </Badge>
                      {getStatusBadge(subscription.status)}
                      <span className="text-muted">{subscriptionPriceLabel}</span>
                    </div>

                    <div className="subscription-meta">
                      <div className="subscription-meta__row">
                        <span>Inicio</span>
                        <strong>{formatDate(subscription.startDate)}</strong>
                      </div>
                      <div className="subscription-meta__row">
                        <span>Próximo cobro</span>
                        <strong>{formatDate(subscription.nextBillingDate)}</strong>
                      </div>
                      {subscription.endDate && (
                        <div className="subscription-meta__row">
                          <span>Fecha de fin</span>
                          <strong>{formatDate(subscription.endDate)}</strong>
                        </div>
                      )}
                    </div>

                    {isInGracePeriod && (
                      <Alert variant="warning" className="mb-0">
                        Mantienes acceso hasta {formatDate(subscription.endDate)}.
                      </Alert>
                    )}

                    <div className="d-flex flex-wrap gap-2">
                      {subscription.status === "pending" && autoSyncActive && (
                        <Alert variant="info" className="mb-0 flex-grow-1">
                          <div className="d-flex align-items-center gap-2">
                            <Spinner animation="border" size="sm" />
                            <div>
                              <strong>Sincronizando automáticamente...</strong>
                              <div className="small text-muted">
                                Verificando el estado con PayPal.
                              </div>
                            </div>
                          </div>
                        </Alert>
                      )}

                      {showSyncButton && (
                        <Button
                          variant="outline-secondary"
                          onClick={handleSyncSubscription}
                          disabled={syncLoading || actionLoading}
                        >
                          {syncLoading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Sincronizando...
                            </>
                          ) : (
                            "Sincronizar con PayPal"
                          )}
                        </Button>
                      )}

                      {!isInGracePeriod && (
                        <Button
                          variant="outline-danger"
                          onClick={() => setShowCancelModal(true)}
                          disabled={actionLoading || syncLoading || autoSyncActive}
                        >
                          Cancelar suscripción
                        </Button>
                      )}
                    </div>

                    {syncSuccess && (
                      <Alert variant="success" className="mb-0">
                        <CheckCircleFill size={16} className="me-1" />
                        {syncSuccess}
                      </Alert>
                    )}
                    {subscriptionNotice && (
                      <Alert variant="success" className="mb-0">
                        <CheckCircleFill size={16} className="me-1" />
                        {subscriptionNotice}
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <ShieldLock size={36} className="text-primary mb-3" />
                    <h5>Sin suscripción activa</h5>
                    <p className="text-muted">
                      Elige un plan para aprovechar al máximo NexoSQL.
                    </p>
                    <Button variant="primary" onClick={() => navigate("/subscriptions")}>
                      Ver planes de suscripción
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar suscripción</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que quieres cancelar tu suscripción?</p>
          <Alert variant="warning" className="mb-0">
            <strong>Importante:</strong> Perderás acceso al finalizar el período actual.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Mantener suscripción
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelSubscription}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Confirmar cancelación"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;
