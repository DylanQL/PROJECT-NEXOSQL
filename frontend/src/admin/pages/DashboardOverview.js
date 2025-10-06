import React from "react";
import { Alert, Button, ProgressBar, Table } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import AdminLayout from "../components/AdminLayout";
import { useAdminData } from "../AdminDataProvider";

const DashboardOverview = () => {
  const { metrics, loading, error, refresh } = useAdminData();

  const renderLoading = () => (
    <div className="text-center py-5">
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Cargando métricas...</span>
      </div>
      <p className="mt-3 text-muted">Recopilando datos estratégicos...</p>
    </div>
  );

  const renderError = () => (
    <Alert variant="danger" className="admin-card">
      <Alert.Heading>Error al cargar el panel</Alert.Heading>
      <p className="mb-3">{error}</p>
      <Button variant="outline-light" onClick={refresh}>
        <ArrowClockwise className="me-2" /> Reintentar
      </Button>
    </Alert>
  );

  if (loading) {
    return <AdminLayout title="Resumen Ejecutivo">{renderLoading()}</AdminLayout>;
  }

  if (error || !metrics) {
    return <AdminLayout title="Resumen Ejecutivo">{renderError()}</AdminLayout>;
  }

  const { timeframe, kpis, charts } = metrics;
  const queryCancellationRate = Number.isFinite(kpis?.queryCancellationRate)
    ? Number(kpis.queryCancellationRate)
    : 0;
  const queryCancellationRateLabel = queryCancellationRate.toFixed(2);
  const subscriptionsChart = charts.subscriptions || [];
  const cancellationsChart = charts.cancellations || [];
  const connectionsChart = charts.connections || [];
  const queriesChart = charts.queries || [];
  const queryCancellationsChart = charts.queryCancellations || [];

  const lastThreeMonths = subscriptionsChart.slice(-3);

  const renderMonthlyProgress = (data) => {
    if (!data.length) {
      return <p className="text-muted mb-0">Sin datos disponibles.</p>;
    }

    const maxValue = Math.max(...data.map((item) => item.value), 1);

    return data.map((item) => (
      <div className="mb-3" key={item.label}>
        <div className="d-flex justify-content-between text-muted mb-1">
          <span>{item.label}</span>
          <span>{item.value}</span>
        </div>
        <ProgressBar
          now={(item.value / maxValue) * 100}
          variant="success"
          style={{ height: "10px" }}
        />
      </div>
    ));
  };

  const renderConnectionsSnapshot = () => {
    if (!connectionsChart.length) {
      return (
        <div className="admin-card" key="no-connections">
          <h4>Sin datos de conexiones</h4>
          <p className="text-muted mb-0">
            Aún no se registran conexiones en el periodo analizado.
          </p>
        </div>
      );
    }

    return connectionsChart.slice(-4).map((item) => {
      const engines = Object.entries(item.engines || {});
      return (
        <div className="admin-card" key={`conn-${item.month}`}>
          <h4>{item.label}</h4>
          <div className="admin-stat-value">{item.value}</div>
          <div className="admin-stat-caption">Conexiones registradas</div>
          {engines.length > 0 ? (
            <ul className="mt-3 mb-0 ps-3 text-muted">
              {engines.map(([engine, count]) => (
                <li key={engine}>
                  {engine}: <strong>{count}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mt-3 mb-0">Sin datos para este mes.</p>
          )}
        </div>
      );
    });
  };

  return (
    <AdminLayout title={`Resumen Ejecutivo ${timeframe.year}`}>
      <div className="admin-grid cols-3 mb-4">
        <div className="admin-card">
          <p className="text-muted mb-1">Ingresos totales del año</p>
          <div className="admin-stat-value">
            ${kpis.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </div>
          <div className="admin-stat-caption">
            Promedio por usuario activo: ${kpis.avgRevenuePerUser.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="admin-card">
          <p className="text-muted mb-1">Suscripciones activas</p>
          <div className="admin-stat-value">{kpis.activeSubscriptions}</div>
          <div className="admin-stat-caption">
            Tasa de adopción: {kpis.adoptionRate}%
          </div>
        </div>
        <div className="admin-card">
          <p className="text-muted mb-1">Conexiones creadas</p>
          <div className="admin-stat-value">{kpis.totalConnections}</div>
          <div className="admin-stat-caption">Usuarios activos: {kpis.activeUsers}</div>
        </div>
        <div className="admin-card">
          <p className="text-muted mb-1">Consultas ejecutadas</p>
          <div className="admin-stat-value">{kpis.totalQueries}</div>
          <div className="admin-stat-caption">
            <div>Consultas canceladas: {kpis.totalQueryCancellations}</div>
            <div>Índice: {queryCancellationRateLabel}%</div>
          </div>
        </div>
      </div>

      <div className="admin-grid cols-2 mb-4">
        <div className="admin-card">
          <h4>Suscripciones recientes</h4>
          <p className="text-muted">Comportamiento de los últimos meses</p>
          {renderMonthlyProgress(lastThreeMonths)}
        </div>

        <div className="admin-card">
          <h4>Consultas por mes</h4>
          <p className="text-muted">Actividad en la plataforma</p>
        {renderMonthlyProgress(queriesChart.slice(-3))}
        </div>
      </div>

      <div className="admin-grid cols-2 mb-4">
        {renderConnectionsSnapshot()}
      </div>

      <div className="admin-table-wrapper">
        <Table variant="dark" responsive className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Suscripciones</th>
              <th>Cancelaciones</th>
              <th>Consultas</th>
              <th>Consultas canceladas</th>
              <th>Conexiones</th>
            </tr>
          </thead>
          <tbody>
            {subscriptionsChart.map((item, index) => {
              const cancellations = cancellationsChart[index]?.value || 0;
              const queries = queriesChart[index]?.value || 0;
              const cancelledQueries = queryCancellationsChart[index]?.value || 0;
              const connections = connectionsChart[index]?.value || 0;
              return (
                <tr key={`row-${item.month}`}>
                  <td>{item.label}</td>
                  <td>
                    <span className="admin-badge">
                      +{item.value}
                    </span>
                  </td>
                  <td>
                    <span className={
                      cancellations ? "admin-badge error" : "admin-badge"
                    }>
                      {cancellations}
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge">{queries}</span>
                  </td>
                  <td>
                    <span
                      className={
                        cancelledQueries ? "admin-badge warn" : "admin-badge"
                      }
                    >
                      {cancelledQueries}
                    </span>
                  </td>
                  <td>{connections}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default DashboardOverview;
