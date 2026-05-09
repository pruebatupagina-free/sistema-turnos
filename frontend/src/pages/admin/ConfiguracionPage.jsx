import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/client';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';

const DIAS = [
  { key: 'lun', label: 'Lunes' }, { key: 'mar', label: 'Martes' }, { key: 'mie', label: 'Miércoles' },
  { key: 'jue', label: 'Jueves' }, { key: 'vie', label: 'Viernes' }, { key: 'sab', label: 'Sábado' }, { key: 'dom', label: 'Domingo' },
];

export default function ConfiguracionPage() {
  const { negocio } = useAuth();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState(null);

  const { data: negocioData } = useQuery({
    queryKey: ['negocio-me'],
    queryFn: () => API.get('/negocios/me').then(r => r.data),
  });

  useEffect(() => {
    if (negocioData && !form) {
      setForm({
        nombre: negocioData.nombre || '',
        descripcion: negocioData.descripcion || '',
        whatsapp: negocioData.whatsapp || '',
        telefono: negocioData.telefono || '',
        direccion: negocioData.direccion || '',
        ciudad: negocioData.ciudad || '',
        email: negocioData.email || '',
        horario: {
          diasActivos: negocioData.horario?.diasActivos || ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'],
          horaInicio: negocioData.horario?.horaInicio || '09:00',
          horaFin: negocioData.horario?.horaFin || '19:00',
          duracionSlot: negocioData.horario?.duracionSlot || 30,
        },
      });
    }
  }, [negocioData]);

  const guardar = useMutation({
    mutationFn: (data) => API.put('/negocios/me', data),
    onSuccess: () => qc.invalidateQueries(['negocio-me']),
  });

  const publicUrl = `${window.location.origin}/sistema-turnos/${negocio?.slug || ''}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDia = (key) => {
    setForm(f => {
      const dias = f.horario.diasActivos.includes(key)
        ? f.horario.diasActivos.filter(d => d !== key)
        : [...f.horario.diasActivos, key];
      return { ...f, horario: { ...f.horario, diasActivos: dias } };
    });
  };

  if (!form) return <div className="text-center py-12 text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900">Configuración</h2>

      {/* URL pública + QR */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Tu página de reservas</h3>
        <div className="flex gap-6 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-2">Comparte este link con tus clientes:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-teal-600 font-medium truncate">{publicUrl}</div>
              <button onClick={copyUrl} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500" />}
              </button>
            </div>
          </div>
          <div className="bg-white p-2 border border-gray-200 rounded-xl">
            <QRCodeSVG value={publicUrl} size={100} fgColor="#00BDB0" />
          </div>
        </div>
      </div>

      {/* Info del negocio */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Información del negocio</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['nombre', 'Nombre del negocio'], ['descripcion', 'Descripción'], ['whatsapp', 'WhatsApp'],
            ['telefono', 'Teléfono'], ['direccion', 'Dirección'], ['ciudad', 'Ciudad'], ['email', 'Email de contacto'],
          ].map(([key, label]) => (
            <div key={key} className={key === 'descripcion' ? 'sm:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              {key === 'descripcion' ? (
                <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={2} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              ) : (
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Horario */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Horario de atención</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {DIAS.map(d => (
            <button
              key={d.key}
              onClick={() => toggleDia(d.key)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${form.horario.diasActivos.includes(d.key) ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
            <input type="time" value={form.horario.horaInicio} onChange={e => setForm(f => ({ ...f, horario: { ...f.horario, horaInicio: e.target.value } }))} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
            <input type="time" value={form.horario.horaFin} onChange={e => setForm(f => ({ ...f, horario: { ...f.horario, horaFin: e.target.value } }))} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración de turno (min)</label>
            <select value={form.horario.duracionSlot} onChange={e => setForm(f => ({ ...f, horario: { ...f.horario, duracionSlot: Number(e.target.value) } }))} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              {[15, 20, 30, 45, 60, 90].map(v => <option key={v} value={v}>{v} min</option>)}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={() => guardar.mutate(form)}
        disabled={guardar.isPending}
        className="bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors disabled:opacity-60"
      >
        {guardar.isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
      {guardar.isSuccess && <span className="text-green-600 text-sm ml-3">✓ Cambios guardados</span>}
    </div>
  );
}
