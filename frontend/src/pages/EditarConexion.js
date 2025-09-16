import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motorDBApi, conexionDBApi } from '../services/api';

const EditarConexion = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [step, setStep] = useState(1);
  const [motores, setMotores] = useState([]);
  const [selectedMotor, setSelectedMotor] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    motores_db_id: '',
    host: '',
    port: '',
    username: '',
    password: '',
    database_name: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testResult, setTestResult] = useState(null);

  // Fetch database engines and connection details on component mount
  useEffect(() => {
    fetchDatabaseEngines();
    if (id) {
      fetchConnectionDetails(id);
    } else {
      // If no ID is provided, redirect to connections page
      navigate('/conexiones');
    }
  }, [id, navigate]);

  const fetchDatabaseEngines = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await motorDBApi.getAllMotores();

      if (error) {
        throw new Error(error);
      }

      setMotores(data || []);
    } catch (err) {
      console.error('Error fetching database engines:', err);
      setError('No se pudieron cargar los motores de base de datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionDetails = async (connectionId) => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await conexionDBApi.getConnectionById(connectionId);

      if (error) {
        throw new Error(error);
      }

      // Update form data with connection details
      const connectionData = {
        nombre: data.nombre || '',
        motores_db_id: data.motores_db_id || '',
        host: data.host || '',
        port: data.port || '',
        username: data.username || '',
        password: '', // Password is not returned from the API for security reasons
        database_name: data.database_name || ''
      };

      setFormData(connectionData);
      setOriginalData(data);
      setSelectedMotor(data.motores_db_id);
    } catch (err) {
      console.error('Error fetching connection details:', err);
      setError('No se pudieron cargar los detalles de la conexión. Por favor, intente nuevamente.');
      setTimeout(() => {
        navigate('/conexiones');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleMotorSelect = (e) => {
    const motorId = e.target.value;
    setSelectedMotor(motorId);
    setFormData(prev => ({
      ...prev,
      motores_db_id: motorId
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedMotor) {
      setError('Por favor, seleccione un motor de base de datos');
      return;
    }

    if (step === 2) {
      // Validate form before proceeding
      const form = document.getElementById('conexion-form');
      if (!form.checkValidity()) {
        setValidated(true);
        return;
      }
    }

    setError('');
    setStep(prev => prev + 1);

    // No automatic test connection anymore
  };

  const handlePrevStep = () => {
    setError('');
    setTestResult(null);
    setStep(prev => prev - 1);
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setError('');
      setSuccess('');
      setTestResult(null);

      const connectionData = {
        motores_db_id: formData.motores_db_id,
        host: formData.host,
        port: formData.port,
        username: formData.username,
        password: formData.password || originalData?.password,
        database_name: formData.database_name
      };

      const { data, error } = await conexionDBApi.testConnection(connectionData);

      if (error) {
        throw new Error(error);
      }

      setTestResult({
        success: true,
        message: 'Conexión exitosa a la base de datos'
      });
      // Solo limpiamos el mensaje de error, pero no establecemos success
      // para evitar duplicación con el testResult
      setError('');
    } catch (err) {
      console.error('Error testing connection:', err);
      setTestResult({
        success: false,
        message: err.message || 'Error al probar la conexión'
      });
      // Solo limpiamos el mensaje de éxito, pero no establecemos error
      // para evitar duplicación con el testResult
      setSuccess('');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleUpdateConnection = async () => {
    try {
      setLoading(true);
      setError('');

      // Prepare connection data, only include password if provided
      const connectionData = {
        nombre: formData.nombre,
        motores_db_id: formData.motores_db_id,
        host: formData.host,
        port: formData.port,
        username: formData.username,
        database_name: formData.database_name
      };

      // Only include password if it was changed
      if (formData.password) {
        connectionData.password = formData.password;
      }

      const { data, error } = await conexionDBApi.updateConnection(id, connectionData);

      if (error) {
        throw new Error(error);
      }

      // Mostrar mensaje y navegar después de un breve retraso
      setSuccess('Conexión actualizada exitosamente');
      setTimeout(() => {
        navigate('/conexiones');
      }, 1500);
    } catch (err) {
      console.error('Error updating connection:', err);
      setError(err.message || 'Error al actualizar la conexión');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="mb-4">
        <ProgressBar now={(step / 3) * 100} className="mb-3" />
        <div className="d-flex justify-content-between">
          <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-text">Seleccionar Motor</div>
          </div>
          <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-text">Editar Credenciales</div>
          </div>
          <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
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
        <h5 className="mb-4">Seleccione el motor de base de datos</h5>

        {originalData && (
          <Alert variant="info">
            Motor actual: {motores.find(m => m.id.toString() === originalData.motores_db_id.toString())?.nombre || 'Desconocido'}
          </Alert>
        )}

        <Row>
          {motores.map(motor => (
            <Col md={4} key={motor.id} className="mb-3">
              <Card
                className={`h-100 ${selectedMotor.toString() === motor.id.toString() ? 'border-primary' : ''}`}
                onClick={() => {
                  setSelectedMotor(motor.id);
                  setFormData(prev => ({
                    ...prev,
                    motores_db_id: motor.id
                  }));
                }}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <i className={`bi bi-database fs-1`}></i>
                  </div>
                  <Card.Title>{motor.nombre}</Card.Title>
                  <Form.Check
                    type="radio"
                    name="motorRadio"
                    id={`motor-${motor.id}`}
                    checked={selectedMotor.toString() === motor.id.toString()}
                    onChange={() => {}}
                    className="mt-3"
                  />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  };

  const renderCredentialsForm = () => {
    const selectedMotorDetails = motores.find(m => m.id.toString() === selectedMotor.toString());

    return (
      <>
        <h5 className="mb-4">
          Edite las credenciales para {selectedMotorDetails ? selectedMotorDetails.nombre : 'la base de datos'}
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
                  placeholder="Dejar en blanco para mantener la contraseña actual"
                />
                <Form.Text className="text-muted">
                  Deje este campo en blanco si no desea cambiar la contraseña actual.
                </Form.Text>
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
        <h5 className="mb-4">Verificación de la conexión</h5>

        <Card className="mb-4">
          <Card.Body>
            <h6>Resumen de la conexión</h6>
            <Row>
              <Col md={6}>
                <p><strong>Nombre:</strong> {formData.nombre}</p>
                <p><strong>Motor:</strong> {motores.find(m => m.id.toString() === formData.motores_db_id.toString())?.nombre}</p>
                <p><strong>Host:</strong> {formData.host}</p>
              </Col>
              <Col md={6}>
                <p><strong>Puerto:</strong> {formData.port}</p>
                <p><strong>Usuario:</strong> {formData.username}</p>
                <p><strong>Base de datos:</strong> {formData.database_name}</p>
              </Col>
            </Row>

            <div className="mt-3">
              <Button
                variant="primary"
                onClick={handleTestConnection}
                disabled={testingConnection}
              >
                {testingConnection ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Probando conexión...
                  </>
                ) : (
                  'Probar Conexión'
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>

        {testResult && (
          <Alert variant={testResult.success ? 'success' : 'danger'}>
            {testResult.message}
          </Alert>
        )}

        {testResult && testResult.success && (
          <div className="d-grid gap-2">
            <Button
              variant="success"
              onClick={handleUpdateConnection}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Actualizando...
                </>
              ) : (
                'Actualizar Conexión'
              )}
            </Button>
          </div>
        )}
      </>
    );
  };

  if (loading && !originalData) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando detalles de la conexión...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h1>Editar Conexión</h1>
        {originalData && (
          <p className="text-muted">
            Editando: {originalData.nombre}
          </p>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          {renderStepIndicator()}

          <div className="step-content py-3">
            {renderStepContent()}
          </div>

          <div className="d-flex justify-content-between mt-4">
            {step > 1 && (
              <Button variant="outline-secondary" onClick={handlePrevStep}>
                Anterior
              </Button>
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                onClick={handleNextStep}
                className={step > 1 ? '' : 'ms-auto'}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleUpdateConnection}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Conexión"}
              </Button>
            )}
            {/* El botón de guardar ahora está integrado en la sección de navegación */}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditarConexion;
