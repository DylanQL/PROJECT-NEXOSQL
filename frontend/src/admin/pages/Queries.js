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
  const planLabels = {
    oro: "Plan Oro",
    plata: "Plan Plata",
    bronce: "Plan Bronce",
    sin_plan: "Sin plan",
  };
  const planColors = {
    oro: "#f5c518",
    plata: "#b0bec5",
    bronce: "#cd7f32",
    sin_plan: "#495057",
  };
  const planKeys = Object.keys(planLabels);
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

      <div className="admin-card">
        <div className="d-flex flex-wrap gap-3 mb-3 text-muted small">
          {planKeys.map((key) => (
            <div key={`legend-${key}`} className="d-flex align-items-center gap-2">
              <span
                className="admin-plan-dot"
                style={{ backgroundColor: planColors[key] }}
              ></span>
              <span>{planLabels[key]}</span>
            </div>
          ))}
        </div>
        <h4>Evolución mensual</h4>
        {queries.map((item) => {
          const plans = item.plans || {};
          const hasPlanData = planKeys.some((key) => plans[key]);
          const planTotals = planKeys.reduce(
            (total, key) => total + (plans[key] || 0),
            0,
          );

          return (
            <div key={`query-${item.month}`} className="mb-3">
              <div className="d-flex justify-content-between text-muted mb-1">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="admin-plan-progress" aria-hidden={!hasPlanData}>
                {hasPlanData ? (
                  planKeys.map((key) => {
                    const count = plans[key] || 0;
                    if (!count || !planTotals) {
                      return null;
                    }
                    const width = (count / planTotals) * 100;
                    return (
                      <div
                        key={`${item.month}-${key}`}
                        className="admin-plan-progress-segment"
                        style={{
                          width: `${width}%`,
                          backgroundColor: planColors[key],
                        }}
                        title={`${planLabels[key]} · ${count} consultas`}
                      ></div>
                    );
                  })
                ) : (
                  <div className="admin-plan-progress-placeholder"></div>
                )}
              </div>
              {hasPlanData && (
                <div className="d-flex flex-wrap gap-3 mt-2 text-muted small">
                  {planKeys.map((key) => (
                    <span key={`${item.month}-legend-${key}`}>
                      {planLabels[key]}: <strong>{plans[key] || 0}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default Queries;
