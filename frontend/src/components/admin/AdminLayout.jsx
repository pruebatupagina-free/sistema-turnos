import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Calendar, Scissors, Tag, Users, Settings, LogOut, Flame
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/turnos', icon: Calendar, label: 'Turnos' },
  { to: '/dashboard/servicios', icon: Scissors, label: 'Servicios' },
  { to: '/dashboard/categorias', icon: Tag, label: 'Categorías' },
  { to: '/dashboard/colaboradores', icon: Users, label: 'Colaboradores' },
  { to: '/dashboard/configuracion', icon: Settings, label: 'Configuración' },
];

export default function AdminLayout() {
  const { usuario, negocio, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-16 bg-teal-600 flex flex-col items-center py-4 gap-2 shrink-0">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <Flame className="text-white" size={20} />
        </div>

        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              `w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isActive ? 'bg-white/25 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
          </NavLink>
        ))}

        <div className="flex-1" />

        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={20} />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-800">{negocio?.nombre || 'Panel Admin'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open(`/sistema-turnos/${negocio?.slug}`, '_blank')}
              className="text-sm bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors font-medium"
            >
              Ver mi página
            </button>
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {usuario?.nombre?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
