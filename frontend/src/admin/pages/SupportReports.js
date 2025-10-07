import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import AdminLayout from "../components/AdminLayout";
import { adminApi } from "../../services/api";

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const buildMonthlySeries = (tickets) => {
  const baseSeries = MONTH_LABELS.map((label, index) => ({
    month: index,
    label,
    value: 0,
  }));

  tickets.forEach((ticket) => {
    const createdAt = new Date(ticket.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return;
    }
    const monthIndex = createdAt.getMonth();
    if (monthIndex >= 0 && monthIndex < baseSeries.length) {
      baseSeries[monthIndex].value += 1;
    }
  });

  return baseSeries;
};

const SummaryCard = ({ title, value, caption }) => (
  <div className="admin-card">
    <p className="text-muted mb-1">{title}</p>
    <div className="admin-stat-value">{value}</div>
    <div className="admin-stat-caption">{caption}</div>
  </div>
);

const LineChartCard = ({ data }) => {
  const maxValue = Math.max(
    ...data.map((item) => item.value),
    0,
  );
  const safeMax = maxValue > 0 ? maxValue : 1;
  const pointCount = data.length;
  const horizontalSegments = pointCount > 1 ? pointCount - 1 : 1;
  const points = data
    .map((item, index) => {
      const x =
        pointCount === 1 ? 50 : (index / horizontalSegments) * 100;
      const y = 90 - (item.value / safeMax) * 70;
      const clampedY = Number.isFinite(y) ? y : 90;
      return `${x.toFixed(2)},${clampedY.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div className="admin-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">Tendencia anual de tickets</h4>
          <small className="text-muted">
            Casos registrados por mes durante el año actual.
          </small>
        </div>
      </div>
      <div className="position-relative" style={{ height: "240px" }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-100 h-100"
        >
          <defs>
            <linearGradient id="supportLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(99, 230, 190, 0.45)" />
              <stop offset="100%" stopColor="rgba(99, 230, 190, 0)" />
            </linearGradient>
          </defs>
          <polyline
            points={points || "0,90 100,90"}
            fill="none"
            stroke="rgba(99, 230, 190, 0.9)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polygon
            points={
              points
                ? `${points} 100,90 0,90`
                : "0,90 100,90 100,90 0,90"
            }
            fill="url(#supportLineGradient)"
          />
          {data.map((item, index) => {
            const x =
              pointCount === 1 ? 50 : (index / horizontalSegments) * 100;
            const y = 90 - (item.value / safeMax) * 70;
            const clampedY = Number.isFinite(y) ? y : 90;
            return (
              <g key={`${item.label}-${index}`}>
                <circle
                  cx={x}
                  cy={clampedY}
                  r={2.5}
                  fill="#63E6BE"
                  stroke="#051A2C"
                  strokeWidth="1"
                />
              </g>
            );
          })}
          {[25, 50, 75].map((percent) => (
            <line
              key={`grid-${percent}`}
              x1="0"
              x2="100"
              y1={percent}
              y2={percent}
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>
      <div className="d-flex justify-content-between text-uppercase text-muted small mt-3">
        {data.map((item) => (
          <span key={`label-${item.month}`}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};

const SupportReports = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await adminApi.getSupportTickets();
    if (result.error) {
      setError(result.error);
      setTickets([]);
    } else {
      setTickets(result.data?.tickets || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const summary = useMemo(() => {
    const base = {
      total: tickets.length,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
    };

    tickets.forEach((ticket) => {
      switch (ticket.status) {
        case "open":
          base.open += 1;
          break;
        case "in_progress":
          base.inProgress += 1;
          break;
        case "resolved":
          base.resolved += 1;
          break;
        case "closed":
          base.closed += 1;
          break;
        default:
          break;
      }
    });

    return {
      ...base,
      finished: base.resolved + base.closed,
    };
  }, [tickets]);

  const monthlySeries = useMemo(
    () => buildMonthlySeries(tickets),
    [tickets],
  );

  const renderLoading = () => (
    <div className="text-center py-5">
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Cargando reportes...</span>
      </div>
    </div>
  );

  const renderError = () => (
    <Alert variant="danger" className="admin-card">
      <Alert.Heading>No se pudieron obtener los reportes</Alert.Heading>
      <p>{error}</p>
      <Button variant="outline-light" onClick={loadTickets}>
        <ArrowClockwise className="me-2" /> Reintentar
      </Button>
    </Alert>
  );

  if (loading) {
    return <AdminLayout title="Reportes de soporte">{renderLoading()}</AdminLayout>;
  }

  if (error) {
    return <AdminLayout title="Reportes de soporte">{renderError()}</AdminLayout>;
  }

  return (
    <AdminLayout title="Reportes de soporte">
      <div className="admin-grid cols-3 mb-4">
        <SummaryCard
          title="Tickets registrados"
          value={summary.total}
          caption="Seguimiento desde el panel administrativo."
        />
        <SummaryCard
          title="En espera"
          value={summary.open}
          caption="Prioriza los casos urgentes antes de cerrar."
        />
        <SummaryCard
          title="En progreso"
          value={summary.inProgress}
          caption="Coordina con el equipo de soporte para acelerar la resolución."
        />
        <SummaryCard
          title="Terminados"
          value={summary.finished}
          caption="Casos que ya fueron atendidos y pueden archivarse."
        />
      </div>

      <LineChartCard data={monthlySeries} />
    </AdminLayout>
  );
};

export default SupportReports;
