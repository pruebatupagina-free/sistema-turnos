import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../../api/client';
import { Plus, Trash2, Pencil, Scissors } from 'lucide-react';

export default function ServiciosPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', duracion: '30', categoriaId: '', colaboradorId: '', destacado: false });
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState('');

  const { data: servicios = [], isLoading } = useQuery({
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

  const save = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      if (imagen) fd.append('imagen', imagen);
      return editId
        ? API.put(`/servicios/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : API.post('/servicios', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { qc.invalidateQueries(['servicios']); resetForm(); },
    onError: (err) => setError(err.response?.data?.error || 'Error al guardar'),
  });

  const del = useMutation({
    mutationFn: (id) => API.delete(`/servicios/${id}`),
    onSuccess: () => qc.invalidateQueries(['servicios']),
  });

  const resetForm = () => { setShowForm(false); setEditId(null); setImagen(null); setError(''); setForm({ nombre: '', descripcion: '', precio: '', duracion: '30', categoriaId: '', colaboradorId: '', destacado: false }); };

  const startEdit = (s) => {
    setForm({ nombre: s.nombre, descripcion: s.descripcion, precio: String(s.precio), duracion: String(s.duracion), categoriaId: s.categoriaId?._id || '', colaboradorId: s.colaboradorId?._id || '', destacado: s.destacado });
    setEditId(s._id);
    setShowForm(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Servicios</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors">
          <Plus size={16} /> Nuevo servicio
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">{editId ? 'Editar' : 'Nuevo'} servicio</h3>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del servicio</label>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Corte de cabello" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select value={form.categoriaId} onChange={e => setForm(f => ({ ...f, categoriaId: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
              <input type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="350" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
              <input type="number" value={form.duracion} onChange={e => setForm(f => ({ ...f, duracion: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Colaborador asignado</label>
              <select value={form.colaboradorId} onChange={e => setForm(f => ({ ...f, colaboradorId: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Cualquiera</option>
                {colaboradores.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
              <input type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-600 file:text-sm file:font-medium hover:file:bg-teal-100" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={2} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" placeholder="Breve descripción del servicio..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="destacado" checked={form.destacado} onChange={e => setForm(f => ({ ...f, destacado: e.target.checked }))} className="w-4 h-4 accent-teal-500" />
              <label htmlFor="destacado" className="text-sm text-gray-700">Mostrar en hero slider</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => save.mutate(form)} disabled={!form.nombre || !form.precio || save.isPending} className="bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50">
              {save.isPending ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={resetForm} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : servicios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
          <Scissors size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aún no tienes servicios. Agrega el primero.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicios.map(s => (
            <div key={s._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {s.imagen ? (
                <img src={s.imagen} alt={s.nombre} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-teal-50 flex items-center justify-center"><Scissors size={32} className="text-teal-300" /></div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{s.nombre}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.categoriaId?.nombre} · {s.duracion} min</p>
                  </div>
                  <p className="text-teal-600 font-bold whitespace-nowrap">${s.precio.toLocaleString()}</p>
                </div>
                {s.colaboradorId && <p className="text-xs text-gray-400 mt-1">👤 {s.colaboradorId.nombre}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => startEdit(s)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 hover:bg-teal-50 px-2 py-1 rounded-lg transition-colors"><Pencil size={12} /> Editar</button>
                  <button onClick={() => del.mutate(s._id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"><Trash2 size={12} /> Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
