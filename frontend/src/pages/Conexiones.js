import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
  ListGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { conexionDBApi } from "../services/api";
import ConnectionLimitInfo from "../components/ConnectionLimitInfo";
import { dbLogos } from "../assets/db-logos";

const Conexiones = () => {
  const navigate = useNavigate();

  const [conexiones, setConexiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);

  // Fetch connections on component mount
  useEffect(() => {
    fetchUserConnections();
  }, []);

  const fetchUserConnections = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await conexionDBApi.getUserConnections();

      if (error) {
        throw new Error(error);
      }

      setConexiones(data || []);
    } catch (err) {
      console.error("Error fetching connections:", err);
      setError(
        "No se pudieron cargar las conexiones. Por favor, intente nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionClick = (connection) => {
    setSelectedConnection(connection);
    setShowModal(true);
  };

  const handleEditConnection = () => {
    setShowModal(false);
    navigate(`/editar-conexion/${selectedConnection.id}`);
  };

  const handleDeleteConnection = async () => {
    try {
      setLoading(true);

      const { error } = await conexionDBApi.deleteConnection(
        selectedConnection.id,
      );

      if (error) {
        throw new Error(error);
      }

      setShowModal(false);
      // Usar window.location.href para forzar una recarga completa de la página
      setTimeout(() => {
        window.location.href = "/conexiones";
      }, 1000);
    } catch (err) {
      console.error("Error deleting connection:", err);
      setError(
        "No se pudo eliminar la conexión. Por favor, intente nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Función eliminada: no mostramos el estado de la conexión

  const getMotorIcon = (motor) => {
    return motor?.nombre || "Desconocido";
  };

  const getMotorLogo = (motor) => {
    if (!motor?.nombre) return null;
    return dbLogos[motor.nombre.toLowerCase()] || null;
  };

  if (loading && conexiones.length === 0) {
    return (
      <>
        <div className="py-5 text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3">Cargando conexiones...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Container className="py-3">
        <div className="mb-4 mt-4 page-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="page-title">Mis Conexiones a Bases de Datos</h1>
            </div>
            <Button 
              variant="primary" 
              onClick={() => navigate("/crear-conexion")}
              className="cta-button"
            >
              Nueva Conexión
            </Button>
          </div>
        </div>

        <ConnectionLimitInfo currentConnectionCount={conexiones.length} />

        {error && <Alert variant="danger">{error}</Alert>}

      {conexiones.length === 0 ? (
        <Card className="text-center p-5 create-connection-card mx-auto" style={{ width: '90%' }}>
          <Card.Body>
            <Card.Title>No tienes conexiones configuradas</Card.Title>
            <Card.Text>
              Para empezar a usar NexoSQL, necesitas configurar una conexión a
              una base de datos.
            </Card.Text>
            <Button
              variant="primary"
              onClick={() => navigate("/crear-conexion")}
              className="cta-button"
            >
              Crear Primera Conexión
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3 g-lg-4">
          {conexiones.map((conexion) => (
            <Col md={4} key={conexion.id} className="mb-4">
              <Card
                className="h-100 shadow-sm connection-card"
                onClick={() => handleConnectionClick(conexion)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body className="connection-card-body">
                  <div className="d-flex align-items-center mb-3 connection-card-header">
                    <div className="connection-card-media me-3">
                      {getMotorLogo(conexion.motor) ? (
                        <img
                          src={getMotorLogo(conexion.motor)}
                          alt={`${getMotorIcon(conexion.motor)} logo`}
                          className="connection-card-logo"
                        />
                      ) : (
                        <i className="bi bi-database connection-card-icon"></i>
                      )}
                    </div>
                    <div>
                      <Card.Title className="mb-0 connection-card-title">
                        {conexion.nombre}
                      </Card.Title>
                      <Card.Subtitle className="text-muted connection-card-subtitle">
                        {getMotorIcon(conexion.motor)}
                      </Card.Subtitle>
                    </div>
                  </div>
                  <ListGroup variant="flush" className="mb-3 connection-details">
                    <ListGroup.Item>
                      <strong>Host:</strong> {conexion.host}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Puerto:</strong> {conexion.port}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Base de datos:</strong> {conexion.database_name}
                    </ListGroup.Item>
                  </ListGroup>
                  <Card.Text className="text-muted connection-card-meta">
                    <small>
                      Creada:{" "}
                      {new Date(conexion.createdAt).toLocaleDateString()}
                    </small>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      </Container>

      {/* Modal for connection options */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Opciones de Conexión</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConnection && (
            <>
              <h5>{selectedConnection.nombre}</h5>
              <p>
                <strong>Motor:</strong> {getMotorIcon(selectedConnection.motor)}
              </p>
              <p>
                <strong>Host:</strong> {selectedConnection.host}
              </p>
              <p>
                <strong>Puerto:</strong> {selectedConnection.port}
              </p>
              <p>
                <strong>Base de datos:</strong>{" "}
                {selectedConnection.database_name}
              </p>
              <p>
                <strong>Usuario:</strong> {selectedConnection.username}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            className="btn-ghost"
          >
            Cerrar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEditConnection}
            className="cta-button"
          >
            Editar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConnection}
            className="cta-button"
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Conexiones;
