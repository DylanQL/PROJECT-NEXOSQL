import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Speedometer2,
  Receipt,
  HddNetwork,
  Terminal,
  PersonCircle,
  BoxArrowRight,
  List,
  Headset,
  GraphUp,
} from "react-bootstrap-icons";
import { useAuth } from "../../contexts/AuthContext";
import logoNexoSQL from "../../assets/logo_nexosql.svg";
import "../../styles/AdminDashboard.css";

const AdminLayout = ({ children, title }) => {
  const { currentUser, adminUsers, logout } = useAuth();
  const navigate = useNavigate();
  const adminEmailDisplay = adminUsers.map((admin) => admin.email).join(", ");
  const fallbackAdminLabel =
    adminEmailDisplay || "Administradores del sistema";
  const currentEmailDisplay =
    currentUser?.email || adminUsers[0]?.email || "admin@nexosql";
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleLogout = async () => {
    setSidebarVisible(false);
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const closeSidebar = () => setSidebarVisible(false);

  useEffect(() => {
    if (sidebarVisible) {
      document.body.classList.add("admin-mobile-sidebar-open");
    } else {
      document.body.classList.remove("admin-mobile-sidebar-open");
    }

    return () => {
      document.body.classList.remove("admin-mobile-sidebar-open");
    };
  }, [sidebarVisible]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setSidebarVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`admin-dashboard ${
        sidebarVisible ? "admin-dashboard--sidebar-open" : ""
      }`}
    >
      <aside className={`admin-sidebar ${sidebarVisible ? "is-visible" : ""}`}>
        <div className="admin-brand">
          <img src={logoNexoSQL} alt="NexoSQL" className="admin-logo" />
          <span>NexoSQL</span>
        </div>
        <nav className="admin-nav">
          <NavLink
            to="/admin/dashboard"
            className="admin-nav-link"
            onClick={closeSidebar}
          >
            <Speedometer2 />
            <span>Resumen</span>
          </NavLink>
          <NavLink
            to="/admin/subscriptions"
            className="admin-nav-link"
            onClick={closeSidebar}
          >
            <Receipt />
            <span>Suscripciones</span>
          </NavLink>
          <NavLink
            to="/admin/connections"
            className="admin-nav-link"
            onClick={closeSidebar}
          >
            <HddNetwork />
            <span>Conexiones</span>
          </NavLink>
          <NavLink
            to="/admin/queries"
            className="admin-nav-link"
            onClick={closeSidebar}
          >
            <Terminal />
            <span>Consultas</span>
          </NavLink>
          <NavLink
            to="/admin/support-tickets"
            className="admin-nav-link"
            onClick={closeSidebar}
          >
            <Headset />
            <span>Tickets soporte</span>
          </NavLink>
          <NavLink
            to="/admin/support-reports"
            className="admin-nav-link"
            onClick={closeSidebar}
          >
            <GraphUp />
            <span>Reportes de tickets</span>
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <small className="text-muted">Administradores</small>
          <div className="admin-user-email">{fallbackAdminLabel}</div>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-header-title">
            <Button
              variant="outline-light"
              size="sm"
              className="admin-sidebar-toggle d-lg-none"
              onClick={toggleSidebar}
              aria-label="Abrir menú de navegación"
            >
              <List size={18} />
            </Button>
            <h1 className="admin-heading">{title}</h1>
            <p className="admin-subheading">
              Panel estratégico para monitorear el pulso del negocio.
            </p>
          </div>
          <div className="admin-header-actions">
            <div className="admin-user-pill">
              <PersonCircle />
              <span>{currentEmailDisplay}</span>
            </div>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              <BoxArrowRight className="me-2" /> Cerrar sesión
            </Button>
          </div>
        </header>

        <main className="admin-main">{children}</main>
      </div>

      <div
        className={`admin-sidebar-overlay ${sidebarVisible ? "is-active" : ""}`}
        role="presentation"
        onClick={closeSidebar}
      />
    </div>
  );
};

export default AdminLayout;
