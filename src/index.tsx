import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { VehiculosPage } from './pages/VehiculosPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { ViagesPage } from './pages/ViagesPage';
import { MiPerfilAdminPage } from './pages/MiPerfilAdminPage';
import { DashboardUserPage } from './pages/user/DashboardUserPage';
import { MisViajesPage } from './pages/user/MisViajesPage';
import { MiPerfilPage } from './pages/user/MiPerfilPage';
import { IniciarViajeUserPage } from './pages/user/IniciarViajeUserPage';
import { VehiculosUserPage } from './pages/user/VehiculosUserPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastContainer } from './components/ToastContainer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas de Administrador */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viajes"
            element={
              <ProtectedRoute requiredRole="admin">
                <ViagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehiculos"
            element={
              <ProtectedRoute requiredRole="admin">
                <VehiculosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute requiredRole="admin">
                <UsuariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mi-perfil-admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <MiPerfilAdminPage />
              </ProtectedRoute>
            }
          />

          {/* Rutas de Usuario Regular */}
          <Route
            path="/dashboard-user"
            element={
              <ProtectedRoute requiredRole="user">
                <DashboardUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehiculos-user"
            element={
              <ProtectedRoute requiredRole="user">
                <VehiculosUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/iniciar-viaje"
            element={
              <ProtectedRoute requiredRole="user">
                <IniciarViajeUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-viajes"
            element={
              <ProtectedRoute requiredRole="user">
                <MisViajesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mi-perfil"
            element={
              <ProtectedRoute requiredRole="user">
                <MiPerfilPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
