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
  ProgressBar,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import { conexionDBApi, motorDBApi } from "../services/api";
import { useSubscription } from "../contexts/SubscriptionContext";
import { dbLogos } from "../assets/db-logos";

const CrearConexion = () => {
  const { id } = useParams(); // For edit mode, id will be present
  const navigate = useNavigate();
  const { hasActiveSubscription } = useSubscription();

  // State variables
  const [step, setStep] = useState(1);
  const [motores, setMotores] = useState([]);
  const [selectedMotor, setSelectedMotor] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    motores_db_id: "",
    host: "",
    port: "",
    username: "",
    password: "",
    database_name: "",
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  // Fetch database engines on component mount
  useEffect(() => {
    fetchDatabaseEngines();
  }, []);

  // If in edit mode, fetch the connection details
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchConnectionDetails(id);
    }
  }, [id]);

  const fetchDatabaseEngines = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await motorDBApi.getAllMotores();

      if (error) {
        throw new Error(error);
      }

      setMotores(data || []);
    } catch (err) {
      console.error("Error fetching database engines:", err);
      setError(
        "No se pudieron cargar los motores de base de datos. Por favor, intente nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionDetails = async (connectionId) => {
    try {
      setLoading(true);
      setError("");

      const { data, error } =
        await conexionDBApi.getConnectionById(connectionId);

      if (error) {
        throw new Error(error);
      }

      // Update form data with connection details
      setFormData({
        nombre: data.nombre || "",
        motores_db_id: data.motores_db_id || "",
        host: data.host || "",
        port: data.port || "",
        username: data.username || "",
        password: "", // Password is not returned from the API for security reasons
        database_name: data.database_name || "",
      });

      setSelectedMotor(data.motores_db_id);
    } catch (err) {
      console.error("Error fetching connection details:", err);
      setError(
        "No se pudieron cargar los detalles de la conexión. Por favor, intente nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = () => {
    if (step === 2) {
      // Validate form before proceeding
      const form = document.getElementById("conexion-form");
      if (!form.checkValidity()) {
        setValidated(true);
        return;
      }
    }

    setError("");
    setStep((prev) => prev + 1);

    // If moving to step 3 (verification), automatically test the connection
    if (step === 2) {
      setTimeout(() => {
        handleTestConnection();
      }, 500);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setTestResult(null);
    setStep((prev) => prev - 1);
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setError("");
      setSuccess("");
      setTestResult(null);

      const connectionData = {
        motores_db_id: formData.motores_db_id,
        host: formData.host,
        port: formData.port,
        username: formData.username,
        password: formData.password,
        database_name: formData.database_name,
      };

      const { error } = await conexionDBApi.testConnection(connectionData);

      if (error) {
        throw new Error(error);
      }

      setTestResult({
        success: true,
        message: "Conexión exitosa a la base de datos",
      });
      // Solo limpiamos el mensaje de error, pero no establecemos success
      // para evitar duplicación con el testResult
      setError("");
    } catch (err) {
      console.error("Error testing connection:", err);
      setTestResult({
        success: false,
        message: err.message || "Error al probar la conexión",
      });
      // Solo limpiamos el mensaje de éxito, pero no establecemos error
      // para evitar duplicación con el testResult
      setSuccess("");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConnection = async () => {
    // Verificar suscripción antes de intentar guardar
    if (!hasActiveSubscription) {
      setError("Se requiere una suscripción activa para crear conexiones");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const connectionData = {
        nombre: formData.nombre,
        motores_db_id: formData.motores_db_id,
        host: formData.host,
        port: formData.port,
        username: formData.username,
        password: formData.password,
        database_name: formData.database_name,
      };

      let result;
      if (isEditMode) {
        result = await conexionDBApi.updateConnection(id, connectionData);
      } else {
        result = await conexionDBApi.createConnection(connectionData);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      // Mostrar cardview flotante y navegar después de un breve retraso
      setShowSuccessCard(true);
      setTimeout(() => {
        // Usar window.location.href para forzar una recarga completa de la página
        window.location.href = "/conexiones";
      }, 2500);
    } catch (err) {
      console.error("Error saving connection:", err);
      setError(err.message || "Error al guardar la conexión");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="mb-4 step-indicator-wrapper">
        <ProgressBar
          now={(step / 3) * 100}
          className="mb-3 step-progress"
        />
        <div className="d-flex justify-content-between">
          <div
            className={`step-item ${step >= 1 ? "active" : ""} ${
              step === 1 ? "current" : ""
            }`}
          >
            <div className="step-number">1</div>
            <div className="step-text">Seleccionar Motor</div>
          </div>
          <div
            className={`step-item ${step >= 2 ? "active" : ""} ${
              step === 2 ? "current" : ""
            }`}
          >
            <div className="step-number">2</div>
            <div className="step-text">Ingresar Credenciales</div>
          </div>
          <div
            className={`step-item ${step >= 3 ? "active" : ""} ${
              step === 3 ? "current" : ""
            }`}
          >
            <div className="step-number">3</div>
            <div className="step-text">Verificación</div>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderMotorSelection();
      case 2:
        return renderCredentialsForm();
      case 3:
        return renderVerification();
      default:
        return null;
    }
  };

  const renderMotorSelection = () => {
    if (loading && motores.length === 0) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3">Cargando motores de base de datos...</p>
        </div>
      );
    }

    return (
      <>
        <h5 className="mb-4 section-title">Seleccione el motor de base de datos</h5>
        <Row className="g-3 g-lg-4 motor-card-grid">
          {motores.map((motor) => (
            <Col md={4} key={motor.id} className="motor-card-col">
              <Card
                className={`h-100 motor-card ${
                  selectedMotor === motor.id ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedMotor(motor.id);
                  setFormData((prev) => ({
                    ...prev,
                    motores_db_id: motor.id,
                  }));
                }}
              >
                <Card.Body className="text-center motor-card-body">
                  <div className="motor-card-media">
                    {dbLogos[motor.nombre.toLowerCase()] ? (
                      <img
                        src={dbLogos[motor.nombre.toLowerCase()]}
                        alt={`${motor.nombre} logo`}
                        className="motor-card-logo"
                      />
                    ) : (
                      <i className="bi bi-database motor-card-icon"></i>
                    )}
                  </div>
                  <Card.Title className="motor-card-title">
                    {motor.nombre}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  };

  const renderCredentialsForm = () => {
    const selectedMotorDetails = motores.find(
      (m) => m.id.toString() === selectedMotor.toString(),
    );

    return (
      <>
        <h5 className="mb-4 section-title">
          Ingrese las credenciales para{" "}
          {selectedMotorDetails
            ? selectedMotorDetails.nombre
            : "la base de datos"}
        </h5>

        <Form id="conexion-form" noValidate validated={validated}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formNombre">
                <Form.Label>Nombre de la conexión</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej. Mi Base de Datos de Producción"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El nombre de la conexión es requerido
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="formHost">
                <Form.Label>Host</Form.Label>
                <Form.Control
                  type="text"
                  name="host"
                  value={formData.host}
                  onChange={handleInputChange}
                  placeholder="Ej. localhost o 192.168.1.1"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El host es requerido
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formPort">
                <Form.Label>Puerto</Form.Label>
                <Form.Control
                  type="text"
                  name="port"
                  value={formData.port}
                  onChange={handleInputChange}
                  placeholder="Ej. 3306"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El puerto es requerido
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="formDatabaseName">
                <Form.Label>Nombre de la base de datos</Form.Label>
                <Form.Control
                  type="text"
                  name="database_name"
                  value={formData.database_name}
                  onChange={handleInputChange}
                  placeholder="Ej. my_database"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El nombre de la base de datos es requerido
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>Usuario</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Ej. root"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El usuario es requerido
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Contraseña"
                  required={!isEditMode}
                />
                <Form.Control.Feedback type="invalid">
                  La contraseña es requerida
                </Form.Control.Feedback>
                {isEditMode && (
                  <Form.Text className="text-muted">
                    Deje este campo en blanco si no desea cambiar la contraseña.
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </>
    );
  };

  const renderVerification = () => {
    return (
      <>
        <h5 className="mb-4 section-title">Verificación de la conexión</h5>

        <Card className="mb-4 verification-card">
          <Card.Body>
            <h6 className="verification-title">Resumen de la conexión</h6>
            <Row>
              <Col md={6}>
                <p>
                  <strong>Nombre:</strong> {formData.nombre}
                </p>
                <p>
                  <strong>Motor:</strong>{" "}
                  {
                    motores.find(
                      (m) =>
                        m.id.toString() === formData.motores_db_id.toString(),
                    )?.nombre
                  }
                </p>
                <p>
                  <strong>Host:</strong> {formData.host}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Puerto:</strong> {formData.port}
                </p>
                <p>
                  <strong>Usuario:</strong> {formData.username}
                </p>
                <p>
                  <strong>Base de datos:</strong> {formData.database_name}
                </p>
              </Col>
            </Row>

            {testingConnection && (
              <div className="mt-3 text-center verification-loading">
                <Spinner
                  as="span"
                  animation="border"
                  role="status"
                  variant="primary"
                  className="me-2"
                />
                <span>Verificando conexión a la base de datos...</span>
              </div>
            )}
          </Card.Body>
        </Card>

        {testResult && (
          <Alert variant={testResult.success ? "success" : "danger"}>
            {testResult.message}
          </Alert>
        )}

        {/* Nos aseguramos de que no haya botones duplicados aquí */}
      </>
    );
  };

  return (
    <>
      <div className="mb-4 mt-4 page-header">
        <h1 className="page-title">
          {isEditMode ? "Editar Conexión" : "Crear Nueva Conexión"}
        </h1>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Success Card flotante */}
      {showSuccessCard && (
        <div className="position-fixed top-50 start-50 translate-middle" style={{ zIndex: 1050 }}>
          <Card className="shadow-lg" style={{ minWidth: '300px', border: '2px solid #22c55e' }}>
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <div className="d-inline-flex align-items-center justify-content-center bg-success rounded-circle" style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-check-lg text-white" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
              <h5 className="text-success mb-2">¡Éxito!</h5>
              <p className="mb-0">
                {isEditMode ? "Conexión actualizada exitosamente" : "Conexión creada exitosamente"}
              </p>
              <small className="text-muted">Redirigiendo...</small>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Overlay para el cardview flotante */}
      {showSuccessCard && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25" style={{ zIndex: 1040 }}></div>
      )}

      <Card className="shadow-sm create-connection-card mx-auto" style={{ width: '90%' }}>
        <Card.Body className="p-4 create-connection-card-body">
          {renderStepIndicator()}

          <div className="step-content py-3">{renderStepContent()}</div>

          <div className="d-flex justify-content-between mt-4">
            {step > 1 && (
              <Button
                variant="secondary"
                onClick={handlePrevStep}
                size="md"
                className="cta-button"
                style={{ color: 'white', backgroundColor: '#6c757d', borderColor: '#6c757d' }}
              >
                Anterior
              </Button>
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                onClick={handleNextStep}
                size="md"
                className={`cta-button ${step > 1 ? "" : "ms-auto"}`}
                disabled={step === 1 && !selectedMotor}
                style={{ color: 'white', backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSaveConnection}
                disabled={loading || !hasActiveSubscription}
                size="md"
                className="cta-button cta-success"
                style={{ color: 'white', backgroundColor: '#198754', borderColor: '#198754' }}
              >
                {loading ? "Guardando..." : "Guardar Conexión"}
              </Button>
            )}

            {/* El botón de editar credenciales ya no es necesario */}
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default CrearConexion;
