import React, { useState, useRef, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import SupportRequestModal from "./SupportRequestModal";
import logo from "../assets/logo_nexosql.svg";

const Navigation = () => {
  const { currentUser, userProfile, logout, isAuthenticated } = useAuth();
  const { hasActiveSubscription, currentSubscription, autoSyncActive } =
    useSubscription();

  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      // Forzar actualización del estado de autenticación
      window.location.href = "/login";
      setShowProfileDropdown(false);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleProfileMenuClick = () => {
    setShowProfileDropdown(false);
  };

  const handleSupportClick = () => {
    setShowProfileDropdown(false);
    setShowSupportModal(true);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userProfile && userProfile.nombres && userProfile.apellidos) {
      return `${userProfile.nombres.charAt(0)}${userProfile.apellidos.charAt(0)}`.toUpperCase();
    } else if (currentUser && currentUser.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (userProfile && userProfile.nombres && userProfile.apellidos) {
      return `${userProfile.nombres} ${userProfile.apellidos}`;
    } else if (currentUser && currentUser.email) {
      return currentUser.email;
    }
    return "Usuario";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    const handleCloseProfileDropdown = () => {
      setShowProfileDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener(
      "closeProfileDropdown",
      handleCloseProfileDropdown,
    );

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener(
        "closeProfileDropdown",
        handleCloseProfileDropdown,
      );
    };
  }, []);

  return (
    <>
      <Navbar bg="light" variant="light" expand="lg" className="px-0 navbar-modern">
      <Container fluid className="px-3">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center brand-modern">
          <img src={logo} alt="NexoSQL Logo" height="32" className="me-2 brand-logo" />
          <span className="brand-text">NexoSQL</span>
        </Navbar.Brand>
        {!isAuthenticated && <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggler-modern" />}
        {isAuthenticated ? (
          <div className="d-flex align-items-center">
            <div className="profile-dropdown" ref={dropdownRef}>
              <div
                className="profile-avatar profile-avatar-modern"
                onClick={toggleProfileDropdown}
                title="Menú de perfil"
              >
                {getUserInitials()}
              </div>

              {showProfileDropdown && (
                <div className="profile-dropdown-menu profile-dropdown-menu-modern">
                  <div className="profile-dropdown-header profile-dropdown-header-modern">
                    <div className="profile-dropdown-name profile-dropdown-name-modern">
                      {getUserDisplayName()}
                    </div>
                    <div className="profile-dropdown-badges">
                      {autoSyncActive && (
                        <span className="profile-badge sync-badge">
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Sincronizando
                        </span>
                      )}
                      {hasActiveSubscription && currentSubscription && (
                        <span
                          className={`profile-badge plan-badge-${currentSubscription.planType}`}
                        >
                          Plan{" "}
                          {currentSubscription.planType
                            .charAt(0)
                            .toUpperCase() +
                            currentSubscription.planType.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="profile-dropdown-item profile-dropdown-item-modern"
                    onClick={handleProfileMenuClick}
                  >
                    <i className="bi bi-person"></i>
                    Mi Perfil
                  </Link>

                  <Link
                    to="/subscriptions"
                    className="profile-dropdown-item profile-dropdown-item-modern"
                    onClick={handleProfileMenuClick}
                  >
                    <i className="bi bi-credit-card"></i>
                    Suscripciones
                  </Link>

                  <Link
                    to="/conexiones"
                    className="profile-dropdown-item profile-dropdown-item-modern"
                    onClick={handleProfileMenuClick}
                  >
                    <i className="bi bi-server"></i>
                    Conexiones
                  </Link>

                  {hasActiveSubscription && (
                    <button
                      type="button"
                      className="profile-dropdown-item profile-dropdown-item-modern"
                      onClick={handleSupportClick}
                    >
                      <i className="bi bi-life-preserver"></i>
                      Soporte técnico
                    </button>
                  )}

                  <div className="profile-dropdown-logout">
                    <button
                      className="profile-dropdown-item profile-dropdown-item-modern"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto nav-links-modern">
              <Nav.Link
                as={Link}
                to="/"
                className={`nav-link-modern ${location.pathname === "/" ? "active" : ""}`}
              >
                Inicio
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/como-funciona"
                className={`nav-link-modern ${
                  location.pathname === "/como-funciona" ? "active" : ""
                }`}
              >
                Cómo funciona
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/planes"
                className={`nav-link-modern ${location.pathname === "/planes" ? "active" : ""}`}
              >
                Planes
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/sobre-nosotros"
                className={`nav-link-modern ${
                  location.pathname === "/sobre-nosotros" ? "active" : ""
                }`}
              >
                Sobre nosotros
              </Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link
                as={Link}
                to="/login"
                className={`nav-link-login ${location.pathname === "/login" ? "active" : ""}`}
              >
                Iniciar Sesión
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        )}
      </Container>
    </Navbar>
      <SupportRequestModal
        show={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </>
  );
};

export default Navigation;
