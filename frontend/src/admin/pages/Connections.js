import React from "react";
import { Alert, Button, Table } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import AdminLayout from "../components/AdminLayout";
import { useAdminData } from "../AdminDataProvider";

const Connections = () => {
  const { metrics, loading, error, refresh } = useAdminData();

  const renderLoading = () => (
    <div className="text-center py-5">
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Cargando conexiones...</span>
      </div>
    </div>
  );

  const renderError = () => (
    <Alert variant="danger" className="admin-card">
      <Alert.Heading>No se pudieron obtener las conexiones</Alert.Heading>
      <p>{error}</p>
      <Button variant="outline-light" onClick={refresh}>
        <ArrowClockwise className="me-2" /> Reintentar
      </Button>
    </Alert>
  );

  if (loading) {
    return <AdminLayout title="Conexiones">{renderLoading()}</AdminLayout>;
  }

  if (error || !metrics) {
    return <AdminLayout title="Conexiones">{renderError()}</AdminLayout>;
  }

  const { kpis, charts } = metrics;
  const connectionsByMonth = charts.connections;

  const enginesTotals = connectionsByMonth.reduce((acc, month) => {
    Object.entries(month.engines || {}).forEach(([engine, count]) => {
      acc[engine] = (acc[engine] || 0) + count;
    });
    return acc;
  }, {});

  const sortedEngines = Object.entries(enginesTotals).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <AdminLayout title="Conexiones">
      <div className="admin-grid cols-3 mb-4">
        <div className="admin-card">
          <p className="text-muted mb-1">Conexiones totales en el año</p>
          <div className="admin-stat-value">{kpis.totalConnections}</div>
          <div className="admin-stat-caption">Usuarios activos: {kpis.activeUsers}</div>
        </div>
        <div className="admin-card">
          <p className="text-muted mb-1">Motores más populares</p>
          {sortedEngines.slice(0, 3).map(([engine, count]) => (
            <div className="d-flex justify-content-between" key={engine}>
              <span>{engine}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
        <div className="admin-card">
          <p className="text-muted mb-1">Promedio mensual</p>
          <div className="admin-stat-value">
            {(kpis.totalConnections / (connectionsByMonth.length || 1)).toFixed(1)}
          </div>
          <div className="admin-stat-caption">
            Mantener campañas de integración para sostener el ritmo.
          </div>
        </div>
      </div>

      <div className="admin-card mb-4">
        <h4>Distribución mensual por motor</h4>
        <div className="table-responsive mt-3">
          <Table variant="dark" className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Total</th>
                {sortedEngines.map(([engine]) => (
                  <th key={`th-${engine}`}>{engine}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {connectionsByMonth.map((item) => (
                <tr key={`conn-${item.month}`}>
                  <td>{item.label}</td>
                  <td>
                    <span className="admin-badge">{item.value}</span>
                  </td>
                  {sortedEngines.map(([engine]) => (
                    <td key={`cell-${item.month}-${engine}`}>
                      {item.engines?.[engine] || 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="admin-grid cols-2">
        <div className="admin-card">
          <h4>Tendencias clave</h4>
          <ul className="text-muted ps-3 mb-0">
            <li>
              Identificar motores con crecimiento acelerado para preparar guías y
              webinars específicos.
            </li>
            <li>
              Verificar la tasa de éxito en la creación de conexiones y revisar logs
              de errores recurrentes.
            </li>
            <li>
              Promover plantillas de conexión para motores con menor adopción.
            </li>
          </ul>
        </div>
        <div className="admin-card">
          <h4>Acciones recomendadas</h4>
          <ul className="text-muted ps-3 mb-0">
            <li>Implementar monitoreo de uptime de motores integrados.</li>
            <li>Crear checklist de verificación para nuevas conexiones.</li>
            <li>Ofrecer talleres para optimizar la seguridad de credenciales.</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Connections;
