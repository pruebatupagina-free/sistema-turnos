const router = require('express').Router();
const { auth, esAdmin } = require('../middleware/auth');
const Turno = require('../models/Turno');

// Listar turnos del negocio (con filtros opcionales: fecha, estado, servicio)
router.get('/', auth, async (req, res) => {
  try {
    const filtro = { negocioId: req.usuario.negocioId };
    if (req.query.fecha) filtro.fecha = req.query.fecha;
    if (req.query.estado) filtro.estado = req.query.estado;
    if (req.query.servicioId) filtro.servicioId = req.query.servicioId;
    if (req.query.colaboradorId) filtro.colaboradorId = req.query.colaboradorId;
    // Búsqueda por nombre o teléfono
    if (req.query.q) {
      const re = new RegExp(req.query.q, 'i');
      filtro.$or = [{ clienteNombre: re }, { clienteTelefono: re }];
    }

    const turnos = await Turno.find(filtro)
      .populate('servicioId', 'nombre precio duracion')
      .populate('colaboradorId', 'nombre')
      .sort({ fecha: 1, horaInicio: 1 });
    res.json(turnos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Estadísticas para dashboard
router.get('/stats', auth, esAdmin, async (req, res) => {
  try {
    const negocioId = req.usuario.negocioId;
    const totalTurnos = await Turno.countDocuments({ negocioId });

    // Turnos por día (últimos 30 días)
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    const fechaStr = hace30.toISOString().split('T')[0];

    const porDia = await Turno.aggregate([
      { $match: { negocioId, fecha: { $gte: fechaStr } } },
      { $group: { _id: '$fecha', total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Por servicio
    const porServicio = await Turno.aggregate([
      { $match: { negocioId } },
      { $group: { _id: '$servicioId', total: { $sum: 1 } } },
      { $lookup: { from: 'servicios', localField: '_id', foreignField: '_id', as: 'servicio' } },
      { $unwind: { path: '$servicio', preserveNullAndEmptyArrays: true } },
      { $project: { nombre: '$servicio.nombre', total: 1 } },
      { $sort: { total: -1 } },
      { $limit: 6 },
    ]);

    res.json({ totalTurnos, porDia, porServicio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar estado
router.patch('/:id/estado', auth, esAdmin, async (req, res) => {
  try {
    const turno = await Turno.findOneAndUpdate(
      { _id: req.params.id, negocioId: req.usuario.negocioId },
      { estado: req.body.estado },
      { new: true }
    );
    res.json(turno);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar turno
router.delete('/:id', auth, esAdmin, async (req, res) => {
  try {
    await Turno.findOneAndDelete({ _id: req.params.id, negocioId: req.usuario.negocioId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
