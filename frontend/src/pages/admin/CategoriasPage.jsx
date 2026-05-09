import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../../api/client';
import { Plus, Trash2, Pencil } from 'lucide-react';

const GENEROS = [{ value: 'ambos', label: 'Ambos' }, { value: 'hombre', label: 'Hombre' }, { value: 'mujer', label: 'Mujer' }];

export default function CategoriasPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ nombre: '', genero: 'ambos' });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => API.get('/categorias').then(r => r.data),
  });

  const save = useMutation({
    mutationFn: (data) => editId
      ? API.put(`/categorias/${editId}`, data)
      : API.post('/categorias', data),
    onSuccess: () => { qc.invalidateQueries(['categorias']); setShowForm(false); setEditId(null); setForm({ nombre: '', genero: 'ambos' }); },
  });

  const del = useMutation({
    mutationFn: (id) => API.delete(`/categorias/${id}`),
    onSuccess: () => qc.invalidateQueries(['categorias']),
  });

  const startEdit = (cat) => {
    setForm({ nombre: cat.nombre, genero: cat.genero });
    setEditId(cat._id);
    setShowForm(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Categorías</h2>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ nombre: '', genero: 'ambos' }); }}
          className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors"
        >
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">{editId ? 'Editar' : 'Nueva'} categoría</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Barbería, Estilismo..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
              <select
                value={form.genero}
                onChange={e => setForm(f => ({ ...f, genero: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {GENEROS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => save.mutate(form)}
              disabled={!form.nombre || save.isPending}
              className="bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {save.isPending ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : categorias.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
          <p>Aún no tienes categorías. Crea una para organizar tus servicios.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Género</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categorias.map(cat => (
                <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{cat.nombre}</td>
                  <td className="px-5 py-3 text-gray-500 capitalize">{cat.genero}</td>
                  <td className="px-5 py-3 flex items-center justify-end gap-2">
                    <button onClick={() => startEdit(cat)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => del.mutate(cat._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
