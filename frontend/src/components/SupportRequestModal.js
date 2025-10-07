import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { supportApi } from "../services/api";

const INCIDENT_TYPES = [
  { value: "connection_error", label: "Error de conexión" },
  { value: "billing", label: "Facturación" },
  { value: "assistant_ai", label: "Asistente IA" },
  { value: "other", label: "Otro" },
];

const SupportRequestModal = ({ show, onClose }) => {
  const [incidentType, setIncidentType] = useState("connection_error");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleHide = () => {
    if (submitting) return;
    setDescription("");
    setIncidentType("connection_error");
    setError("");
    setSuccess(false);
    if (onClose) onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!description.trim()) {
      setError("Por favor describe la incidencia");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      incidentType,
      description: description.trim(),
    };

    const result = await supportApi.createTicket(payload);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);

    setTimeout(() => {
      handleHide();
    }, 2400);
  };

  return (
    <Modal show={show} onHide={handleHide} centered backdrop="static">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Soporte técnico</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-4">
            Cuéntanos qué ocurrió y nuestro equipo se pondrá en contacto contigo.
          </p>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-4">
              Hemos recibido tu solicitud. Nos comunicaremos contigo pronto.
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="incidentType">
            <Form.Label>Tipo de incidencia</Form.Label>
            <Form.Select
              value={incidentType}
              onChange={(event) => setIncidentType(event.target.value)}
              disabled={submitting || success}
            >
              {INCIDENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="description">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Describe el problema con el mayor detalle posible"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={submitting || success}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleHide}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={submitting || success}>
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SupportRequestModal;
