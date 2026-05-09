const router = require('express').Router();
const { auth, esAdmin, esSuperadmin } = require('../middleware/auth');
const Negocio = require('../models/Negocio');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'sistema-turnos/logos', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
});
const upload = multer({ storage });

// Obtener negocio propio
router.get('/me', auth, esAdmin, async (req, res) => {
  try {
    const negocio = await Negocio.findById(req.usuario.negocioId);
    if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' });
    res.json(negocio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar negocio
router.put('/me', auth, esAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, whatsapp, telefono, direccion, ciudad, email, colorPrimario, horario } = req.body;
    const negocio = await Negocio.findByIdAndUpdate(
      req.usuario.negocioId,
      { nombre, descripcion, whatsapp, telefono, direccion, ciudad, email, colorPrimario, horario },
      { new: true }
    );
    res.json(negocio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subir logo
router.post('/me/logo', auth, esAdmin, upload.single('logo'), async (req, res) => {
  try {
    const negocio = await Negocio.findByIdAndUpdate(
      req.usuario.negocioId,
      { logo: req.file.path },
      { new: true }
    );
    res.json({ logo: negocio.logo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Superadmin — todos los negocios
router.get('/', auth, esSuperadmin, async (req, res) => {
  const negocios = await Negocio.find().sort({ createdAt: -1 });
  res.json(negocios);
});

// Superadmin — cambiar plan
router.patch('/:id/plan', auth, esSuperadmin, async (req, res) => {
  const negocio = await Negocio.findByIdAndUpdate(req.params.id, { plan: req.body.plan }, { new: true });
  res.json(negocio);
});

module.exports = router;
