import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Container } from "react-bootstrap";
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

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { ConnectionProvider } from "./contexts/ConnectionContext";

function App() {
  return (
    <AuthProvider>
      <ConnectionProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
          <Navigation />
          <Container className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Routes that require authentication */}
              <Route element={<PrivateRoute />}>
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
              </Route>

              {/* Routes that require authentication and completed profile */}
              <Route element={<PrivateRoute requireProfile={true} />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/conexiones" element={<Conexiones />} />
                <Route path="/crear-conexion" element={<CrearConexion />} />
                <Route path="/editar-conexion/:id" element={<EditarConexion />} />
              </Route>

              {/* Redirect for any unknown routes */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
          <footer className="bg-dark text-center text-white py-3 mt-auto">
            <Container>
              <p className="mb-0">
                &copy; {new Date().getFullYear()} NexoSQL. Todos los derechos
                reservados.
              </p>
            </Container>
          </footer>
          </div>
        </Router>
      </ConnectionProvider>
    </AuthProvider>
  );
}

export default App;
