const router = require('express').Router();
const { auth, esAdmin } = require('../middleware/auth');
const Servicio = require('../models/Servicio');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'sistema-turnos/servicios', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
});
const upload = multer({ storage });

// Listar
router.get('/', auth, async (req, res) => {
  try {
    const servicios = await Servicio.find({ negocioId: req.usuario.negocioId, activo: true })
      .populate('categoriaId', 'nombre genero')
      .populate('colaboradorId', 'nombre')
      .sort({ createdAt: -1 });
    res.json(servicios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear
router.post('/', auth, esAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, duracion, categoriaId, colaboradorId, destacado } = req.body;
    const servicio = await Servicio.create({
      negocioId: req.usuario.negocioId,
      categoriaId,
      colaboradorId: colaboradorId || null,
      nombre,
      descripcion,
      precio: Number(precio),
      duracion: Number(duracion) || 30,
      imagen: req.file ? req.file.path : null,
      destacado: destacado === 'true',
    });
    res.status(201).json(servicio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar
router.put('/:id', auth, esAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.imagen = req.file.path;
    if (update.precio) update.precio = Number(update.precio);
    if (update.duracion) update.duracion = Number(update.duracion);
    const servicio = await Servicio.findOneAndUpdate(
      { _id: req.params.id, negocioId: req.usuario.negocioId },
      update,
      { new: true }
    ).populate('categoriaId', 'nombre genero').populate('colaboradorId', 'nombre');
    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(servicio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar
router.delete('/:id', auth, esAdmin, async (req, res) => {
  try {
    await Servicio.findOneAndUpdate(
      { _id: req.params.id, negocioId: req.usuario.negocioId },
      { activo: false }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
