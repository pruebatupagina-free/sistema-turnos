import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../../api/client';
import { Search, Heart, Menu, X, ChevronRight, MessageCircle, Flame } from 'lucide-react';

export default function NegocioHomePage() {
  const { slug } = useParams();
  const [genero, setGenero] = useState('hombre');
  const [categoriaActiva, setCategoriaActiva] = useState('todo');
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', slug],
    queryFn: () => API.get(`/public/${slug}`).then(r => r.data),
  });

  const negocio = data?.negocio;
  const categorias = data?.categorias || [];
  const servicios = data?.servicios || [];

  // Hero slider — servicios destacados
  const destacados = servicios.filter(s => s.destacado);
  useEffect(() => {
    if (destacados.length <= 1) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % destacados.length), 4000);
    return () => clearInterval(t);
  }, [destacados.length]);

  // Filtrado
  const categoriasFiltradas = categorias.filter(c =>
    c.genero === genero || c.genero === 'ambos'
  );

  const serviciosFiltrados = servicios.filter(s => {
    const cat = s.categoriaId;
    if (!cat) return false;
    if (cat.genero !== genero && cat.genero !== 'ambos') return false;
    if (categoriaActiva !== 'todo' && cat._id !== categoriaActiva) return false;
    return true;
  });

  // Agrupar por categoría
  const porCategoria = categoriasFiltradas.map(cat => ({
    cat,
    items: serviciosFiltrados.filter(s => s.categoriaId?._id === cat._id),
  })).filter(g => g.items.length > 0);

  const wa = negocio?.whatsapp ? `https://wa.me/52${negocio.whatsapp.replace(/\D/g, '')}` : null;

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-800 mb-2">Negocio no encontrado</p>
        <p className="text-gray-500">El link que buscas no existe o fue desactivado.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative">
      {/* Header */}
      <header className="bg-teal-500 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {negocio?.logo
            ? <img src={negocio.logo} alt="" className="w-8 h-8 rounded-full object-cover" />
            : <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><Flame size={16} /></div>
          }
          <div>
            <p className="font-bold text-sm leading-tight">{negocio?.nombre}</p>
            <p className="text-teal-100 text-xs">Agenda tu turno</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-white/80 hover:text-white"><Search size={20} /></button>
          <button className="text-white/80 hover:text-white"><Heart size={20} /></button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white/80 hover:text-white">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <button onClick={() => setMenuOpen(false)} className="mb-6 text-gray-500"><X size={20} /></button>
            <p className="font-bold text-lg text-gray-900 mb-1">{negocio?.nombre}</p>
            {negocio?.descripcion && <p className="text-sm text-gray-500 mb-4">{negocio.descripcion}</p>}
            {negocio?.direccion && <p className="text-sm text-gray-600 mb-1">📍 {negocio.direccion}</p>}
            {negocio?.telefono && <p className="text-sm text-gray-600 mb-1">📞 {negocio.telefono}</p>}
            {negocio?.email && <p className="text-sm text-gray-600">{negocio.email}</p>}
          </div>
        </div>
      )}

      {/* Hero Slider */}
      {destacados.length > 0 && (
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {destacados.map((s, i) => (
            <div
              key={s._id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              {s.imagen ? (
                <img src={s.imagen} alt={s.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-teal-100" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-bold text-lg">{s.nombre}</p>
                <p className="text-sm text-white/80 truncate max-w-48">{s.descripcion}</p>
                <p className="font-bold text-teal-300 mt-1">${s.precio.toLocaleString()}</p>
                <Link
                  to={`/${slug}/servicio/${s._id}`}
                  className="mt-2 inline-block bg-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  Ver más
                </Link>
              </div>
            </div>
          ))}
          {/* Dots */}
          {destacados.length > 1 && (
            <div className="absolute bottom-3 right-4 flex gap-1">
              {destacados.map((_, i) => (
                <button key={i} onClick={() => setHeroIndex(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === heroIndex ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toggle Hombre / Mujer */}
      <div className="px-4 py-3 flex gap-2">
        {['hombre', 'mujer'].map(g => (
          <button
            key={g}
            onClick={() => { setGenero(g); setCategoriaActiva('todo'); }}
            className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors capitalize ${genero === g ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {g === 'hombre' ? 'Hombre' : 'Mujer'}
          </button>
        ))}
      </div>

      {/* Filtros categoría */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setCategoriaActiva('todo')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoriaActiva === 'todo' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Todo
        </button>
        {categoriasFiltradas.map(c => (
          <button
            key={c._id}
            onClick={() => setCategoriaActiva(c._id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoriaActiva === c._id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {/* Servicios por categoría */}
      <div className="px-4 pb-24 space-y-6">
        {porCategoria.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No hay servicios disponibles en esta categoría.</p>
          </div>
        ) : (
          porCategoria.map(({ cat, items }) => (
            <div key={cat._id}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-teal-600">{cat.nombre}</h2>
                <button className="text-teal-500"><ChevronRight size={20} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {items.map(s => (
                  <Link key={s._id} to={`/${slug}/servicio/${s._id}`} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative">
                      {s.imagen ? (
                        <img src={s.imagen} alt={s.nombre} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-teal-50 flex items-center justify-center text-teal-200 text-4xl">✂</div>
                      )}
                      <span className="absolute top-2 left-2 bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">{cat.nombre}</span>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{s.nombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{s.descripcion || `Duración: ${s.duracion} min`}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-teal-600 font-bold text-sm">${s.precio.toLocaleString()}</p>
                        <ChevronRight size={14} className="text-teal-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* WhatsApp flotante */}
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-4 z-20 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="text-white" size={26} fill="white" />
        </a>
      )}
    </div>
  );
}
