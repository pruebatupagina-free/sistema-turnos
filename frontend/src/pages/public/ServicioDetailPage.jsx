import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import API from '../../api/client';
import { ArrowLeft, Heart, Share2, MapPin, Mail, MessageCircle, Search, CheckCircle } from 'lucide-react';

const formatFecha = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const getDias = () => {
  const dias = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dias.push(d.toISOString().split('T')[0]);
  }
  return dias;
};

export default function ServicioDetailPage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();

  const [diaSeleccionado, setDiaSeleccionado] = useState(getDias()[0]);
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);
  const [form, setForm] = useState({ clienteNombre: '', clienteTelefono: '', clienteEmail: '' });
  const [paso, setPaso] = useState('seleccion'); // 'seleccion' | 'datos' | 'confirmado'
  const [error, setError] = useState('');

  const { data } = useQuery({
    queryKey: ['public-servicio', slug, id],
    queryFn: () => API.get(`/public/${slug}/servicio/${id}`).then(r => r.data),
  });

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', slug, id, diaSeleccionado],
    queryFn: () => API.get(`/public/${slug}/servicio/${id}/slots?fecha=${diaSeleccionado}`).then(r => r.data),
    enabled: !!diaSeleccionado,
  });

  const agendar = useMutation({
    mutationFn: () => API.post(`/public/${slug}/agendar`, {
      servicioId: id,
      ...form,
      fecha: diaSeleccionado,
      horaInicio: slotSeleccionado.horaInicio,
      horaFin: slotSeleccionado.horaFin,
    }),
    onSuccess: () => setPaso('confirmado'),
    onError: (err) => setError(err.response?.data?.error || 'Error al agendar'),
  });

  const negocio = data?.negocio;
  const servicio = data?.servicio;
  const slots = slotsData?.slots || [];
  const dias = getDias();
  const wa = negocio?.whatsapp ? `https://wa.me/52${negocio.whatsapp.replace(/\D/g, '')}` : null;

  if (!servicio) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (paso === 'confirmado') return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={40} className="text-teal-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Turno agendado!</h2>
      <p className="text-gray-600 mb-1">{servicio.nombre}</p>
      <p className="text-teal-600 font-semibold mb-1">{formatFecha(diaSeleccionado)}</p>
      <p className="text-gray-700 font-medium mb-6">{slotSeleccionado?.horaInicio} — {slotSeleccionado?.horaFin}</p>
      {form.clienteEmail && <p className="text-sm text-gray-500 mb-6">Te enviamos una confirmación a {form.clienteEmail}</p>}
      <button onClick={() => navigate(`/${slug}`)} className="bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors">
        Volver al inicio
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto">
      {/* Imagen hero */}
      <div className="relative h-64 bg-gray-100">
        {servicio.imagen ? (
          <img src={servicio.imagen} alt={servicio.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-teal-100 flex items-center justify-center text-6xl">✂️</div>
        )}
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
          <ArrowLeft size={18} />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md"><Heart size={16} /></button>
          <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md"><Share2 size={16} /></button>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 py-5 space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-teal-600 flex-wrap">
          <span className="text-yellow-500">★</span>
          <span>{servicio.categoriaId?.genero === 'mujer' ? 'Mujer' : 'Hombre'}</span>
          <span className="text-gray-400">›</span>
          <span>{servicio.categoriaId?.nombre}</span>
          <span className="text-gray-400">›</span>
          <span>{servicio.nombre}</span>
          <span className="text-gray-400">›</span>
          <span className="font-bold">${servicio.precio.toLocaleString()}</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{servicio.nombre}</h1>

        {/* Profesional */}
        {servicio.colaboradorId && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold">
                {servicio.colaboradorId.nombre[0]}
              </div>
              <div>
                <p className="text-xs text-gray-500">Profesional</p>
                <p className="font-semibold text-gray-900 text-sm">{servicio.colaboradorId.nombre}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[MapPin, Mail, MessageCircle, Search].map((Icon, i) => (
                <button key={i} className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <Icon size={14} className="text-white" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Descripción */}
        {servicio.descripcion && (
          <p className="text-sm text-gray-600 leading-relaxed">{servicio.descripcion}</p>
        )}

        {paso === 'seleccion' && (
          <>
            {/* Selector de día */}
            <div>
              <p className="text-teal-600 font-semibold text-sm mb-3">{formatFecha(diaSeleccionado)}:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dias.map(d => {
                  const fecha = new Date(d + 'T12:00:00');
                  const diaNom = fecha.toLocaleDateString('es-MX', { weekday: 'short' });
                  const diaNum = fecha.getDate();
                  const mes = fecha.toLocaleDateString('es-MX', { month: 'short' });
                  const activo = d === diaSeleccionado;
                  return (
                    <button
                      key={d}
                      onClick={() => { setDiaSeleccionado(d); setSlotSeleccionado(null); }}
                      className={`flex flex-col items-center px-4 py-3 rounded-2xl min-w-fit border-2 transition-colors ${activo ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'}`}
                    >
                      <span className="text-xs capitalize">{diaNom}</span>
                      <span className="text-lg font-bold">{diaNum}</span>
                      <span className="text-xs capitalize">{mes}</span>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activo ? 'bg-white' : 'bg-green-500'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de horario */}
            {slotsLoading ? (
              <div className="text-center py-4 text-gray-400 text-sm">Cargando horarios...</div>
            ) : slotsData?.cerrado ? (
              <div className="text-center py-4 text-gray-400 text-sm">El negocio no atiende este día</div>
            ) : slots.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">No hay horarios disponibles</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => {
                  const seleccionado = slotSeleccionado?.horaInicio === slot.horaInicio;
                  return (
                    <button
                      key={slot.horaInicio}
                      disabled={!slot.disponible}
                      onClick={() => setSlotSeleccionado(slot)}
                      className={`py-3 rounded-2xl border-2 text-sm font-medium transition-colors ${
                        !slot.disponible
                          ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                          : seleccionado
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400'
                      }`}
                    >
                      {slot.horaInicio} - {slot.horaFin}
                    </button>
                  );
                })}
              </div>
            )}

            {/* CTA */}
            {slotSeleccionado && (
              <button
                onClick={() => setPaso('datos')}
                className="w-full bg-teal-500 text-white py-4 rounded-2xl font-bold text-base hover:bg-teal-600 transition-colors"
              >
                Agendar turno de {slotSeleccionado.horaInicio} - {slotSeleccionado.horaFin}
              </button>
            )}
          </>
        )}

        {paso === 'datos' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Tus datos para la cita</h3>
            <p className="text-sm text-teal-600 font-medium">
              {formatFecha(diaSeleccionado)} · {slotSeleccionado?.horaInicio} — {slotSeleccionado?.horaFin}
            </p>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {[
              ['clienteNombre', 'Nombre completo', 'text', 'Juan García', true],
              ['clienteTelefono', 'Teléfono / WhatsApp', 'tel', '8112345678', true],
              ['clienteEmail', 'Email (opcional, para confirmación)', 'email', 'tu@email.com', false],
            ].map(([key, label, type, ph, req]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  required={req}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={ph}
                />
              </div>
            ))}

            <button
              onClick={() => { setError(''); agendar.mutate(); }}
              disabled={!form.clienteNombre || !form.clienteTelefono || agendar.isPending}
              className="w-full bg-teal-500 text-white py-4 rounded-2xl font-bold hover:bg-teal-600 transition-colors disabled:opacity-60"
            >
              {agendar.isPending ? 'Agendando...' : 'Confirmar cita'}
            </button>
            <button onClick={() => setPaso('seleccion')} className="w-full text-sm text-gray-500 py-2 hover:underline">
              ← Cambiar horario
            </button>
          </div>
        )}
      </div>

      {/* WhatsApp flotante */}
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer"
          className="fixed bottom-6 right-4 z-20 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
          <MessageCircle className="text-white" size={26} fill="white" />
        </a>
      )}
    </div>
  );
}
