import React from "react";
import { Alert, Button, ProgressBar } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import AdminLayout from "../components/AdminLayout";
import { useAdminData } from "../AdminDataProvider";

const Queries = () => {
  const { metrics, loading, error, refresh } = useAdminData();

  const renderLoading = () => (
    <div className="text-center py-5">
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Cargando consultas...</span>
      </div>
    </div>
  );

  const renderError = () => (
    <Alert variant="danger" className="admin-card">
      <Alert.Heading>No se pudieron obtener las consultas</Alert.Heading>
      <p>{error}</p>
      <Button variant="outline-light" onClick={refresh}>
        <ArrowClockwise className="me-2" /> Reintentar
      </Button>
    </Alert>
  );

  if (loading) {
    return <AdminLayout title="Consultas">{renderLoading()}</AdminLayout>;
  }

  if (error || !metrics) {
    return <AdminLayout title="Consultas">{renderError()}</AdminLayout>;
  }

  const { kpis, charts } = metrics;
  const queries = (charts?.queries || []).slice();
  const queryCancellations = (charts?.queryCancellations || []).slice();
  const queryCancellationRate = Number.isFinite(kpis?.queryCancellationRate)
    ? Number(kpis.queryCancellationRate)
    : 0;

  const maxQueries = Math.max(...queries.map((month) => month.value), 1);
  const maxCancelled = Math.max(
    ...queryCancellations.map((month) => month.value),
    1,
  );
  const highUsageMonths = queries
    .filter((month) => month.value > maxQueries * 0.65)
    .map((month) => month.label);

  const lowUsageMonths = queries
    .filter((month) => month.value < maxQueries * 0.25)
    .map((month) => month.label);

  return (
    <AdminLayout title="Consultas">
      <div className="admin-grid cols-3 mb-4">
        <div className="admin-card">
          <p className="text-muted mb-1">Consultas registradas</p>
          <div className="admin-stat-value">{kpis.totalQueries}</div>
          <div className="admin-stat-caption">
            <div>Canceladas: {kpis.totalQueryCancellations}</div>
            <div>Índice: {queryCancellationRate.toFixed(2)}%</div>
          </div>
        </div>
        <div className="admin-card">
          <p className="text-muted mb-1">Consultas promedio mensuales</p>
          <div className="admin-stat-value">
            {(kpis.totalQueries / (queries.length || 1)).toFixed(1)}
          </div>
          <div className="admin-stat-caption">
            Evaluar escalado cuando se supere el 120% del promedio.
          </div>
        </div>
        <div className="admin-card">
          <p className="text-muted mb-1">Meses con alto uso</p>
          <div className="admin-stat-caption">
            {highUsageMonths.length > 0
              ? highUsageMonths.join(", ")
              : "Aún sin picos relevantes"}
          </div>
        </div>
      </div>

      <div className="admin-grid cols-2 mb-4">
        <div className="admin-card">
          <h4>Evolución mensual</h4>
          {queries.map((item) => (
            <div key={`query-${item.month}`} className="mb-3">
              <div className="d-flex justify-content-between text-muted mb-1">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <ProgressBar
                now={(item.value / maxQueries) * 100}
                variant="info"
                style={{ height: "10px" }}
              />
            </div>
          ))}
        </div>

        <div className="admin-card">
          <h4>Observaciones</h4>
          <ul className="text-muted ps-3">
            <li>
              Identificar correlaciones entre picos de consultas y nuevas
              integraciones.
            </li>
            <li>
              Revisar el tiempo de respuesta promedio durante los meses de mayor
              tráfico.
            </li>
            <li>
              Preparar mecanismos de rate limiting para prevenir abuso en meses con
              alta demanda.
            </li>
          </ul>
          <h5 className="mt-4">Cancelaciones por mes</h5>
          {queryCancellations.map((item) => (
            <div key={`cancel-${item.month}`} className="mb-2">
              <div className="d-flex justify-content-between text-muted mb-1">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <ProgressBar
                now={(item.value / maxCancelled) * 100}
                variant={item.value ? "warning" : "success"}
                style={{ height: "8px" }}
              />
            </div>
          ))}
          <h5 className="mt-4">Meses con menor uso</h5>
          <p className="text-muted mb-0">
            {lowUsageMonths.length > 0
              ? lowUsageMonths.join(", ")
              : "Todos los meses mantienen actividad consistente."}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Queries;
