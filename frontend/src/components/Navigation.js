import React, { useState, useRef, useEffect } from "react";
import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import logo from "../assets/logo_nexosql.svg";

const Navigation = () => {
  const { currentUser, userProfile, logout, isAuthenticated } = useAuth();
  const { hasActiveSubscription, currentSubscription, autoSyncActive } =
    useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src={logo} alt="NexoSQL Logo" height="30" className="me-2" />
          NexoSQL
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={location.pathname === "/" ? "active" : ""}
            >
              Inicio
            </Nav.Link>
            {!currentUser && (
              <>
                <Nav.Link
                  as={Link}
                  to="/como-funciona"
                  className={
                    location.pathname === "/como-funciona" ? "active" : ""
                  }
                >
                  Cómo funciona
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/planes"
                  className={location.pathname === "/planes" ? "active" : ""}
                >
                  Planes
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/sobre-nosotros"
                  className={
                    location.pathname === "/sobre-nosotros" ? "active" : ""
                  }
                >
                  Sobre nosotros
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <div className="profile-dropdown" ref={dropdownRef}>
                <div
                  className="profile-avatar"
                  onClick={toggleProfileDropdown}
                  title="Menú de perfil"
                >
                  {getUserInitials()}
                </div>

                {showProfileDropdown && (
                  <div className="profile-dropdown-menu">
                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-name">
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
                      className="profile-dropdown-item"
                      onClick={handleProfileMenuClick}
                    >
                      <i className="bi bi-person"></i>
                      Mi Perfil
                    </Link>

                    <Link
                      to="/subscriptions"
                      className="profile-dropdown-item"
                      onClick={handleProfileMenuClick}
                    >
                      <i className="bi bi-credit-card"></i>
                      Suscripciones
                    </Link>

                    <Link
                      to="/conexiones"
                      className="profile-dropdown-item"
                      onClick={handleProfileMenuClick}
                    >
                      <i className="bi bi-server"></i>
                      Conexiones
                    </Link>

                    <div className="profile-dropdown-logout">
                      <button
                        className="profile-dropdown-item"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right"></i>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className={location.pathname === "/login" ? "active" : ""}
                >
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  className={location.pathname === "/register" ? "active" : ""}
                >
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
