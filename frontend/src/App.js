import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Container, Toast, ToastContainer } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "./assets/logo_nexosql.svg";

// Components
import Navigation from "./components/Navigation";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CompleteProfile from "./pages/CompleteProfile";

import Conexiones from "./pages/Conexiones";
import CrearConexion from "./pages/CrearConexion";
import EditarConexion from "./pages/EditarConexion";
import Subscriptions from "./pages/Subscriptions";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import ComoFunciona from "./pages/ComoFunciona";
import Planes from "./pages/Planes";
import SobreNosotros from "./pages/SobreNosotros";

// Contexts
import { useAuth } from "./contexts/AuthContext";
import { ConnectionProvider } from "./contexts/ConnectionContext";
import {
  SubscriptionProvider,
  useSubscription,
} from "./contexts/SubscriptionContext";

// Admin
import AdminLogin from "./admin/AdminLogin";
import AdminRoute from "./admin/AdminRoute";
import { AdminDataProvider } from "./admin/AdminDataProvider";
import DashboardOverview from "./admin/pages/DashboardOverview";
import AdminSubscriptionsPage from "./admin/pages/Subscriptions";
import AdminConnectionsPage from "./admin/pages/Connections";
import AdminQueriesPage from "./admin/pages/Queries";
import AdminSupportTicketsPage from "./admin/pages/SupportTickets";
import AdminSupportReportsPage from "./admin/pages/SupportReports";

// Component to handle global notifications
function AppNotifications() {
  const { autoSyncSuccess, clearAutoSyncSuccess } = useSubscription();

  return (
    <ToastContainer
      position="top-end"
      className="p-3"
      style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}
    >
      <Toast
        show={!!autoSyncSuccess}
        onClose={clearAutoSyncSuccess}
        delay={5000}
        autohide
        bg="success"
      >
        <Toast.Header>
          <i className="bi bi-check-circle-fill text-success me-2"></i>
          <strong className="me-auto">Suscripción Activada</strong>
        </Toast.Header>
        <Toast.Body className="text-white">{autoSyncSuccess}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

// Layout component for auth pages (login/register) without navbar and footer
function AuthLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <AppNotifications />
      {children}
    </div>
  );
}

// Layout component for regular pages with navbar and footer
function MainLayout({ children }) {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <Navigation />
      <AppNotifications />
      <Container
        fluid
        className="flex-grow-1 p-0"
        style={{ maxWidth: "100%" }}
      >
        {children}
      </Container>
      {!isAuthenticated && (
        <footer className="bg-dark text-white mt-auto">
          <Container className="py-5">
            <div className="row g-4">
              {/* Logo y descripción */}
              <div className="col-lg-4 col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <img src={logo} alt="NexoSQL Logo" height="32" className="me-2" />
                  <h5 className="fw-bold mb-0 text-primary">NexoSQL</h5>
                </div>
                <p className="text-light opacity-75 mb-3">
                  La plataforma de gestión de bases de datos más intuitiva y potente.
                  Conecta, administra y consulta tus bases de datos desde cualquier lugar.
                </p>
                <div className="d-flex gap-3 social-icons">
                  <a href="#" className="text-light opacity-75 hover-opacity-100 transition-opacity">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#" className="text-light opacity-75 hover-opacity-100 transition-opacity">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="#" className="text-light opacity-75 hover-opacity-100 transition-opacity">
                    <i className="bi bi-linkedin"></i>
                  </a>
                  <a href="#" className="text-light opacity-75 hover-opacity-100 transition-opacity">
                    <i className="bi bi-github"></i>
                  </a>
                </div>
              </div>

              {/* Enlaces de producto */}
              <div className="col-lg-2 col-md-6">
                <h6 className="fw-bold mb-3">Producto</h6>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <a href="/como-funciona" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      Cómo Funciona
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="/planes" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      Planes
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      Características
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      Seguridad
                    </a>
                  </li>
                </ul>
              </div>

              {/* Enlaces de empresa */}
              <div className="col-lg-2 col-md-6">
                <h6 className="fw-bold mb-3">Empresa</h6>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <a href="/sobre-nosotros" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      Sobre Nosotros
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      Blog
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      Carreras
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      Contacto
                    </a>
                  </li>
                </ul>
              </div>

              {/* Enlaces de soporte */}
              <div className="col-lg-2 col-md-6">
                <h6 className="fw-bold mb-3">Soporte</h6>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      Centro de Ayuda
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      Documentación
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      Estado del Sistema
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-light opacity-75 text-decoration-none hover-opacity-100 transition-opacity">
                      API
                    </a>
                  </li>
                </ul>
              </div>

              {/* Newsletter */}
              <div className="col-lg-2 col-md-12">
                <h6 className="fw-bold mb-3">Newsletter</h6>
                <p className="text-light opacity-75 small mb-3">
                  Mantente al día con las últimas noticias y actualizaciones.
                </p>
                <div className="input-group mb-3">
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    placeholder="tu@email.com"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white'
                    }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                  >
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Línea divisoria y copyright */}
            <hr className="my-4 opacity-25" />
            <div className="row align-items-center">
              <div className="col-md-6">
                <p className="mb-0 text-light opacity-75 small">
                  &copy; {new Date().getFullYear()} NexoSQL. Todos los derechos reservados.
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <div className="d-flex justify-content-md-end gap-4 mt-2 mt-md-0">
                  <a href="#" className="text-light opacity-75 text-decoration-none small hover-opacity-100 transition-opacity">
                    Política de Privacidad
                  </a>
                  <a href="#" className="text-light opacity-75 text-decoration-none small hover-opacity-100 transition-opacity">
                    Términos de Servicio
                  </a>
                  <a href="#" className="text-light opacity-75 text-decoration-none small hover-opacity-100 transition-opacity">
                    Cookies
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </footer>
      )}
    </div>
  );
}

function App() {
  const { loading, isAuthenticated } = useAuth();

  // Show loading screen while authentication state is being verified
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h3 className="mt-3">Cargando aplicación...</h3>
          <p>Por favor espere mientras verificamos su sesión</p>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionProvider>
      <ConnectionProvider>
        <Router>
          <Routes>
            {/* Auth Routes - Without navbar and footer */}
            <Route 
              path="/login" 
              element={
                <AuthLayout>
                  <Login />
                </AuthLayout>
              } 
            />
            <Route 
              path="/register" 
              element={
                <AuthLayout>
                  <Register />
                </AuthLayout>
              } 
            />
            <Route
              path="/admin/login"
              element={
                <AuthLayout>
                  <AdminLogin />
                </AuthLayout>
              }
            />

            <Route
              path="/admin/*"
              element={
                <AdminDataProvider>
                  <AdminRoute />
                </AdminDataProvider>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route
                path="subscriptions"
                element={<AdminSubscriptionsPage />}
              />
              <Route path="connections" element={<AdminConnectionsPage />} />
              <Route path="queries" element={<AdminQueriesPage />} />
              <Route
                path="support-tickets"
                element={<AdminSupportTicketsPage />}
              />
              <Route
                path="support-reports"
                element={<AdminSupportReportsPage />}
              />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>

            {/* All other routes - With navbar and footer */}
            <Route
              path="/*"
              element={
                <MainLayout>
                  <Routes>
                    {/* Public Routes */}
                    <Route
                      path="/"
                      element={
                        <div className="w-100 p-0 h-100">
                          <Home />
                        </div>
                      }
                    />
                    <Route path="/como-funciona" element={<ComoFunciona />} />
                    <Route path="/planes" element={<Planes />} />
                    <Route path="/sobre-nosotros" element={<SobreNosotros />} />

                    {/* Routes that require authentication */}
                    <Route element={<PrivateRoute />}>
                      <Route
                        path="/complete-profile"
                        element={<CompleteProfile />}
                      />
                    </Route>

                    {/* Routes that require authentication and completed profile */}
                    <Route element={<PrivateRoute requireProfile={true} />}>
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/subscriptions" element={<Subscriptions />} />
                      <Route
                        path="/subscription/success"
                        element={<SubscriptionSuccess />}
                      />
                      <Route
                        path="/subscription/cancel"
                        element={<SubscriptionCancel />}
                      />
                      <Route path="/conexiones" element={<Conexiones />} />
                      <Route path="/crear-conexion" element={<CrearConexion />} />
                      <Route
                        path="/editar-conexion/:id"
                        element={<EditarConexion />}
                      />
                    </Route>

                    {/* Redirect for any unknown routes */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </Router>
      </ConnectionProvider>
    </SubscriptionProvider>
  );
}

export default App;
