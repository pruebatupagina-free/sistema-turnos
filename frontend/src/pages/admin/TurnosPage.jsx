import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import API from '../../api/client';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Search, Download, Calendar as CalIcon, List } from 'lucide-react';

moment.locale('es');
const localizer = momentLocalizer(moment);

const ESTADOS = { pendiente: 'bg-yellow-100 text-yellow-700', confirmado: 'bg-green-100 text-green-700', cancelado: 'bg-red-100 text-red-700', completado: 'bg-gray-100 text-gray-600' };

export default function TurnosPage() {
  const qc = useQueryClient();
  const [vista, setVista] = useState('lista');
  const [q, setQ] = useState('');
  const [filtroServicio, setFiltroServicio] = useState('');

  const { data: turnos = [], isLoading } = useQuery({
    queryKey: ['turnos', q, filtroServicio],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (filtroServicio) params.set('servicioId', filtroServicio);
      return API.get(`/turnos?${params}`).then(r => r.data);
    },
  });

  const { data: servicios = [] } = useQuery({
    queryKey: ['servicios'],
    queryFn: () => API.get('/servicios').then(r => r.data),
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado }) => API.patch(`/turnos/${id}/estado`, { estado }),
    onSuccess: () => qc.invalidateQueries(['turnos']),
  });

  const eliminar = useMutation({
    mutationFn: (id) => API.delete(`/turnos/${id}`),
    onSuccess: () => qc.invalidateQueries(['turnos']),
  });

  const exportarExcel = () => {
    const rows = turnos.map(t => ({
      Cliente: t.clienteNombre,
      Teléfono: t.clienteTelefono,
      Email: t.clienteEmail,
      Servicio: t.servicioId?.nombre,
      Colaborador: t.colaboradorId?.nombre || '-',
      Fecha: t.fecha,
      Hora: `${t.horaInicio} - ${t.horaFin}`,
      Estado: t.estado,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Turnos');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'turnos.xlsx');
  };

  const calEvents = useMemo(() => turnos.map(t => ({
    id: t._id,
    title: `${t.clienteNombre} (${t.horaInicio} - ${t.horaFin})`,
    start: new Date(`${t.fecha}T${t.horaInicio}`),
    end: new Date(`${t.fecha}T${t.horaFin}`),
    resource: t,
  })), [turnos]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Turnos</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
              placeholder="Nombre o teléfono"
            />
          </div>
          <select value={filtroServicio} onChange={e => setFiltroServicio(e.target.value)} className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Todos los servicios</option>
            {servicios.map(s => <option key={s._id} value={s._id}>{s.nombre}</option>)}
          </select>
          <div className="flex border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setVista('lista')} className={`px-3 py-2 text-sm flex items-center gap-1 transition-colors ${vista === 'lista' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}><List size={14} /> Lista</button>
            <button onClick={() => setVista('calendario')} className={`px-3 py-2 text-sm flex items-center gap-1 transition-colors ${vista === 'calendario' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}><CalIcon size={14} /> Calendario</button>
          </div>
          <button onClick={exportarExcel} className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            <Download size={14} /> Excel
          </button>
        </div>
      </div>

      {/* Chips de servicios */}
      {servicios.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {servicios.map(s => {
            const count = turnos.filter(t => t.servicioId?._id === s._id || t.servicioId === s._id).length;
            return (
              <button
                key={s._id}
                onClick={() => setFiltroServicio(filtroServicio === s._id ? '' : s._id)}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 border transition-colors ${filtroServicio === s._id ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}
              >
                <span className="font-semibold">({count})</span> {s.nombre}
              </button>
            );
          })}
        </div>
      )}

      {vista === 'calendario' ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-4" style={{ height: 600 }}>
          <Calendar
            localizer={localizer}
            events={calEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={{ next: 'Siguiente', previous: 'Anterior', today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
            eventPropGetter={() => ({ style: { backgroundColor: '#00BDB0', borderRadius: 6, border: 'none' } })}
          />
        </div>
      ) : isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : turnos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
          <CalIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay turnos registrados aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Cliente', 'Servicio', 'Fecha', 'Hora', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {turnos.map(t => (
                <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{t.clienteNombre}</p>
                    <p className="text-xs text-gray-500">{t.clienteTelefono}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{t.servicioId?.nombre || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{t.fecha}</td>
                  <td className="px-4 py-3 text-gray-700">{t.horaInicio} — {t.horaFin}</td>
                  <td className="px-4 py-3">
                    <select
                      value={t.estado}
                      onChange={e => cambiarEstado.mutate({ id: t._id, estado: e.target.value })}
                      className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer ${ESTADOS[t.estado]}`}
                    >
                      {['pendiente', 'confirmado', 'cancelado', 'completado'].map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => eliminar.mutate(t._id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Eliminar</button>
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
