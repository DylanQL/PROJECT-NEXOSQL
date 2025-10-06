import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { Speedometer2, Receipt, HddNetwork, Terminal, PersonCircle, BoxArrowRight } from "react-bootstrap-icons";
import { useAuth } from "../../contexts/AuthContext";
import logoNexoSQL from "../../assets/logo_nexosql.svg";
import "../../styles/AdminDashboard.css";

const AdminLayout = ({ children, title }) => {
  const { currentUser, adminEmail, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logoNexoSQL} alt="NexoSQL" className="admin-logo" />
          <span>NexoSQL</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className="admin-nav-link">
            <Speedometer2 />
            <span>Resumen</span>
          </NavLink>
          <NavLink to="/admin/subscriptions" className="admin-nav-link">
            <Receipt />
            <span>Suscripciones</span>
          </NavLink>
          <NavLink to="/admin/connections" className="admin-nav-link">
            <HddNetwork />
            <span>Conexiones</span>
          </NavLink>
          <NavLink to="/admin/queries" className="admin-nav-link">
            <Terminal />
            <span>Consultas</span>
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <small className="text-muted">Administrador</small>
          <div className="admin-user-email">{adminEmail}</div>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-header">
          <div>
            <h1 className="admin-heading">{title}</h1>
            <p className="admin-subheading">
              Panel estratégico para monitorear el pulso del negocio.
            </p>
          </div>
          <div className="admin-header-actions">
            <div className="admin-user-pill">
              <PersonCircle />
              <span>{currentUser?.email || adminEmail}</span>
            </div>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              <BoxArrowRight className="me-2" /> Cerrar sesión
            </Button>
          </div>
        </header>

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
