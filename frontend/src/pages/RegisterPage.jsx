import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, CheckCircle } from 'lucide-react';

const perks = [
  'Página de reservas lista en minutos',
  'Tus clientes agendan solos, 24/7',
  'Calendario y estadísticas en tiempo real',
  'Notificaciones automáticas por email',
  'Código QR para compartir tu agenda',
  'Gratis para siempre en plan básico',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', negocioNombre: '', whatsapp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
        placeholder={placeholder}
        required={key !== 'whatsapp'}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Izquierda — perks */}
          <div className="bg-teal-600 p-10 flex flex-col justify-center">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Flame className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Sistema de Turnos</h2>
            <p className="text-teal-100 text-sm mb-8">Tu negocio empieza a recibir citas hoy.</p>
            <ul className="space-y-3">
              {perks.map(p => (
                <li key={p} className="flex items-start gap-2 text-sm text-teal-50">
                  <CheckCircle size={16} className="text-teal-300 mt-0.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Derecha — form */}
          <div className="p-10">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Crea tu cuenta gratis</h3>
            <p className="text-gray-500 text-sm mb-6">Sin tarjeta de crédito requerida</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {field('negocioNombre', 'Nombre de tu negocio', 'text', 'Barbería El Estilo')}
              {field('nombre', 'Tu nombre', 'text', 'Juan Pérez')}
              {field('email', 'Email', 'email', 'tu@email.com')}
              {field('password', 'Contraseña', 'password', 'Mínimo 6 caracteres')}
              {field('whatsapp', 'WhatsApp (opcional)', 'tel', '8112345678')}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 mt-2"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-teal-600 font-medium hover:underline">Ingresar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
