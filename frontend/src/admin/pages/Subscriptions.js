import React from "react";
import { Alert, Button, Table } from "react-bootstrap";
import { ArrowClockwise, ArrowUpRight, ArrowDownRight } from "react-bootstrap-icons";
import AdminLayout from "../components/AdminLayout";
import { useAdminData } from "../AdminDataProvider";

const Subscriptions = () => {
  const { metrics, loading, error, refresh } = useAdminData();

  const renderLoading = () => (
    <div className="text-center py-5">
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Cargando suscripciones...</span>
      </div>
    </div>
  );

  const renderError = () => (
    <Alert variant="danger" className="admin-card">
      <Alert.Heading>No se pudieron obtener las suscripciones</Alert.Heading>
      <p>{error}</p>
      <Button variant="outline-light" onClick={refresh}>
        <ArrowClockwise className="me-2" /> Reintentar
      </Button>
    </Alert>
  );

  if (loading) {
    return <AdminLayout title="Suscripciones">{renderLoading()}</AdminLayout>;
  }

  if (error || !metrics) {
    return <AdminLayout title="Suscripciones">{renderError()}</AdminLayout>;
  }

  const { kpis, charts } = metrics;

  const monthlyData = charts.subscriptions.map((item, index) => {
    const cancellations = charts.cancellations[index]?.value || 0;
    const net = item.value - cancellations;
    return {
      ...item,
      cancellations,
      net,
      trend: net >= 0 ? "up" : "down",
    };
  });

  const bestMonth = [...monthlyData].sort((a, b) => b.net - a.net)[0];
  const worstMonth = [...monthlyData].sort((a, b) => a.net - b.net)[0];

  return (
    <AdminLayout title="Suscripciones">
      <div className="admin-grid cols-3 mb-4">
        <div className="admin-card">
          <p className="text-muted mb-1">Suscripciones activas</p>
          <div className="admin-stat-value">{kpis.activeSubscriptions}</div>
          <div className="admin-stat-caption">
            Participación de usuarios: {kpis.adoptionRate}%
          </div>
        </div>
        <div className="admin-card">
          <p className="text-muted mb-1">Ingresos anuales</p>
          <div className="admin-stat-value">
            ${kpis.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </div>
          <div className="admin-stat-caption">
            Promedio por usuario: ${kpis.avgRevenuePerUser.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="admin-card">
          <p className="text-muted mb-1">Churn rate</p>
          <div className={`admin-stat-value ${kpis.churnRate > 5 ? "admin-trend down" : "admin-trend up"}`}>
            {kpis.churnRate}%
          </div>
          <div className="admin-stat-caption">
            Meta sugerida: mantener por debajo de 3%
          </div>
        </div>
      </div>

      <div className="admin-grid cols-2 mb-4">
        {bestMonth && (
          <div className="admin-card">
            <h4>Mes más sólido</h4>
            <p className="text-muted">{bestMonth.label}</p>
            <div className="admin-stat-value">
              +{bestMonth.net} netas
            </div>
            <div className="admin-stat-caption">
              {bestMonth.value} altas · {bestMonth.cancellations} bajas
            </div>
          </div>
        )}
        {worstMonth && (
          <div className="admin-card">
            <h4>Mes a revisar</h4>
            <p className="text-muted">{worstMonth.label}</p>
            <div className="admin-stat-value admin-trend down">
              {worstMonth.net} netas
            </div>
            <div className="admin-stat-caption">
              {worstMonth.value} altas · {worstMonth.cancellations} bajas
            </div>
          </div>
        )}
      </div>

      <div className="admin-table-wrapper mb-4">
        <Table variant="dark" responsive className="mb-0 align-middle text-center">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Nuevas suscripciones</th>
              <th>Cancelaciones</th>
              <th>Balance neto</th>
              <th>Señal</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((item) => (
              <tr key={`subs-${item.month}`}>
                <td className="text-start">{item.label}</td>
                <td>
                  <span className="admin-badge">+{item.value}</span>
                </td>
                <td>
                  <span className={item.cancellations ? "admin-badge warn" : "admin-badge"}>
                    {item.cancellations}
                  </span>
                </td>
                <td className={item.net >= 0 ? "admin-trend up" : "admin-trend down"}>
                  {item.net}
                </td>
                <td>
                  {item.trend === "up" ? <ArrowUpRight className="text-success" /> : <ArrowDownRight className="text-danger" />}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="admin-grid cols-2">
        <div className="admin-card">
          <h4>Observaciones</h4>
          <ul className="mb-0 text-muted ps-3">
            <li>
              Reforzar campañas justo antes de los meses con histórico negativo para
              amortiguar cancelaciones.
            </li>
            <li>
              Analizar motivos de baja a partir de encuestas o tickets en los meses
              con mayor churn.
            </li>
            <li>
              Evaluar ofertas de upgrade en los meses de mejor desempeño para
              maximizar ingresos.
            </li>
          </ul>
        </div>
        <div className="admin-card">
          <h4>Próximas acciones sugeridas</h4>
          <ul className="mb-0 text-muted ps-3">
            <li>Implementar recordatorios proactivos antes del ciclo de facturación.</li>
            <li>Segmentar mensajes según antigüedad de la suscripción.</li>
            <li>Monitorear tickets de soporte asociados a cancelaciones.</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Subscriptions;
