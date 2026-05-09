import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/client';
import { Calendar, Scissors, Tag, Users } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#00BDB0', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe', '#0891b2'];

export default function DashboardPage() {
  const { negocio } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => API.get('/turnos/stats').then(r => r.data),
    enabled: !!negocio,
  });

  const { data: servicios = [] } = useQuery({
    queryKey: ['servicios'],
    queryFn: () => API.get('/servicios').then(r => r.data),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => API.get('/categorias').then(r => r.data),
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => API.get('/colaboradores').then(r => r.data),
  });

  const cards = [
    { label: 'Servicios', value: servicios.length, icon: Scissors, color: 'bg-teal-50 text-teal-600' },
    { label: 'Categorías', value: categorias.length, icon: Tag, color: 'bg-cyan-50 text-cyan-600' },
    { label: 'Colaboradores', value: colaboradores.length, icon: Users, color: 'bg-sky-50 text-sky-600' },
    { label: 'Turnos totales', value: stats?.totalTurnos ?? 0, icon: Calendar, color: 'bg-indigo-50 text-indigo-600' },
  ];

  const lineData = (stats?.porDia || []).map(d => ({ fecha: d._id.slice(5), turnos: d.total }));
  const pieData = (stats?.porServicio || []).map(d => ({ name: d.nombre || 'Sin nombre', value: d.total }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-200 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Turnos agendados (últimos 30 días)</h3>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="turnos" stroke="#00BDB0" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Aún no hay turnos registrados
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Turnos por servicio</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Sin datos de turnos aún
            </div>
          )}
        </div>
      </div>

      {/* Plan */}
      {negocio?.plan === 'basico' && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-teal-800">Plan Gratuito</p>
            <p className="text-sm text-teal-600">1 colaborador · 10 servicios</p>
          </div>
          <a
            href={`https://wa.me/528139863634?text=Hola%2C%20quiero%20mejorar%20mi%20plan%20de%20Sistema%20de%20Turnos`}
            target="_blank"
            rel="noreferrer"
            className="bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors"
          >
            Mejorar plan
          </a>
        </div>
      )}
    </div>
  );
}
