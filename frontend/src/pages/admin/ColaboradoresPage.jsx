import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../../api/client';
import { Plus, Trash2, User } from 'lucide-react';

export default function ColaboradoresPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');

  const { data: colaboradores = [], isLoading } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => API.get('/colaboradores').then(r => r.data),
  });

  const crear = useMutation({
    mutationFn: (data) => API.post('/colaboradores', data),
    onSuccess: () => { qc.invalidateQueries(['colaboradores']); setShowForm(false); setForm({ nombre: '', email: '', password: '' }); setError(''); },
    onError: (err) => setError(err.response?.data?.error || 'Error al crear colaborador'),
  });

  const del = useMutation({
    mutationFn: (id) => API.delete(`/colaboradores/${id}`),
    onSuccess: () => qc.invalidateQueries(['colaboradores']),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Colaboradores</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors"
        >
          <Plus size={16} /> Nuevo colaborador
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Nuevo colaborador</h3>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="grid sm:grid-cols-3 gap-4">
            {[['nombre', 'Nombre', 'text', 'Juan Rivera'], ['email', 'Email', 'email', 'juan@negocio.com'], ['password', 'Contraseña', 'password', 'Mínimo 6 caracteres']].map(([key, label, type, ph]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={ph}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => crear.mutate(form)}
              disabled={!form.nombre || !form.email || !form.password || crear.isPending}
              className="bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {crear.isPending ? 'Creando...' : 'Crear colaborador'}
            </button>
            <button onClick={() => { setShowForm(false); setError(''); }} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : colaboradores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aún no tienes colaboradores registrados.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colaboradores.map(c => (
            <div key={c._id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-lg">
                {c.nombre[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{c.nombre}</p>
                <p className="text-sm text-gray-500 truncate">{c.email}</p>
              </div>
              <button onClick={() => del.mutate(c._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
