const router = require('express').Router();
const Negocio = require('../models/Negocio');
const Categoria = require('../models/Categoria');
const Servicio = require('../models/Servicio');
const Turno = require('../models/Turno');
const { sendConfirmacionTurno } = require('../utils/email');

// Generar slots de tiempo disponibles para un servicio y fecha
const generarSlots = (horaInicio, horaFin, duracion, ocupados) => {
  const slots = [];
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  let minutos = hIni * 60 + mIni;
  const finMin = hFin * 60 + mFin;

  while (minutos + duracion <= finMin) {
    const ini = `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
    const fin = `${String(Math.floor((minutos + duracion) / 60)).padStart(2, '0')}:${String((minutos + duracion) % 60).padStart(2, '0')}`;
    const disponible = !ocupados.some((t) => t.horaInicio === ini);
    slots.push({ horaInicio: ini, horaFin: fin, disponible });
    minutos += duracion;
  }
  return slots;
};

// Info pública del negocio + servicios por categoría
router.get('/:slug', async (req, res) => {
  try {
    const negocio = await Negocio.findOne({ slug: req.params.slug, activo: true }).select('-adminId');
    if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' });

    const categorias = await Categoria.find({ negocioId: negocio._id, activa: true }).sort({ orden: 1 });
    const servicios = await Servicio.find({ negocioId: negocio._id, activo: true })
      .populate('categoriaId', 'nombre genero')
      .populate('colaboradorId', 'nombre')
      .sort({ createdAt: 1 });

    res.json({ negocio, categorias, servicios });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detalle de servicio
router.get('/:slug/servicio/:id', async (req, res) => {
  try {
    const negocio = await Negocio.findOne({ slug: req.params.slug, activo: true });
    if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' });
    const servicio = await Servicio.findOne({ _id: req.params.id, negocioId: negocio._id, activo: true })
      .populate('categoriaId', 'nombre genero')
      .populate('colaboradorId', 'nombre');
    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json({ negocio, servicio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Slots disponibles para un servicio en una fecha
router.get('/:slug/servicio/:id/slots', async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Fecha requerida' });

    const negocio = await Negocio.findOne({ slug: req.params.slug, activo: true });
    if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' });

    const servicio = await Servicio.findOne({ _id: req.params.id, negocioId: negocio._id, activo: true });
    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });

    // Verificar día activo
    const diasSemana = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    const diaSemana = diasSemana[new Date(fecha + 'T12:00:00').getDay()];
    if (!negocio.horario.diasActivos.includes(diaSemana)) {
      return res.json({ slots: [], cerrado: true });
    }

    const turnos = await Turno.find({
      negocioId: negocio._id,
      servicioId: servicio._id,
      fecha,
      estado: { $ne: 'cancelado' },
    }).select('horaInicio horaFin');

    const duracion = servicio.duracion || negocio.horario.duracionSlot;
    const slots = generarSlots(negocio.horario.horaInicio, negocio.horario.horaFin, duracion, turnos);

    res.json({ slots, cerrado: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agendar turno (invitado)
router.post('/:slug/agendar', async (req, res) => {
  try {
    const negocio = await Negocio.findOne({ slug: req.params.slug, activo: true });
    if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' });

    const { servicioId, clienteNombre, clienteTelefono, clienteEmail, fecha, horaInicio, horaFin } = req.body;
    if (!servicioId || !clienteNombre || !clienteTelefono || !fecha || !horaInicio || !horaFin) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Verificar disponibilidad
    const existe = await Turno.findOne({
      negocioId: negocio._id,
      servicioId,
      fecha,
      horaInicio,
      estado: { $ne: 'cancelado' },
    });
    if (existe) return res.status(409).json({ error: 'Horario no disponible' });

    const servicio = await Servicio.findById(servicioId);

    const turno = await Turno.create({
      negocioId: negocio._id,
      servicioId,
      colaboradorId: servicio?.colaboradorId || null,
      clienteNombre,
      clienteTelefono,
      clienteEmail: clienteEmail || '',
      fecha,
      horaInicio,
      horaFin,
    });

    if (clienteEmail) {
      sendConfirmacionTurno(clienteEmail, clienteNombre, negocio.nombre, servicio?.nombre, fecha, horaInicio).catch(() => {});
    }

    res.status(201).json({ ok: true, turnoId: turno._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
