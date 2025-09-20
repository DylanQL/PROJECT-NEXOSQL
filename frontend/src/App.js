import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Container, Toast, ToastContainer } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Components
import Navigation from "./components/Navigation";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CompleteProfile from "./pages/CompleteProfile";
import Welcome from "./pages/Welcome";
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
import { AuthProvider } from "./contexts/AuthContext";
import { ConnectionProvider } from "./contexts/ConnectionContext";
import {
  SubscriptionProvider,
  useSubscription,
} from "./contexts/SubscriptionContext";

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

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ConnectionProvider>
          <Router>
            <div className="d-flex flex-column min-vh-100">
              <Navigation />
              <AppNotifications />
              <Container className="flex-grow-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/como-funciona" element={<ComoFunciona />} />
                  <Route path="/planes" element={<Planes />} />
                  <Route path="/sobre-nosotros" element={<SobreNosotros />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Routes that require authentication */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/welcome" element={<Welcome />} />
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
              </Container>
              <footer className="bg-dark text-center text-white py-3 mt-auto">
                <Container>
                  <p className="mb-0">
                    &copy; {new Date().getFullYear()} NexoSQL. Todos los
                    derechos reservados.
                  </p>
                </Container>
              </footer>
            </div>
          </Router>
        </ConnectionProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
