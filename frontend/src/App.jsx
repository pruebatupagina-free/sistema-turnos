import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import TurnosPage from './pages/admin/TurnosPage';
import ServiciosPage from './pages/admin/ServiciosPage';
import CategoriasPage from './pages/admin/CategoriasPage';
import ColaboradoresPage from './pages/admin/ColaboradoresPage';
import ConfiguracionPage from './pages/admin/ConfiguracionPage';

import NegocioHomePage from './pages/public/NegocioHomePage';
import ServicioDetailPage from './pages/public/ServicioDetailPage';

function ProtectedRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="turnos" element={<TurnosPage />} />
        <Route path="servicios" element={<ServiciosPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="colaboradores" element={<ColaboradoresPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
      </Route>

      <Route path="/:slug" element={<NegocioHomePage />} />
      <Route path="/:slug/servicio/:id" element={<ServicioDetailPage />} />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
