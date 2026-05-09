const router = require('express').Router();
const { auth, esAdmin } = require('../middleware/auth');
const Usuario = require('../models/Usuario');

// Listar colaboradores del negocio
router.get('/', auth, async (req, res) => {
  try {
    const colaboradores = await Usuario.find({
      negocioId: req.usuario.negocioId,
      rol: 'colaborador',
      activo: true,
    }).select('-password');
    res.json(colaboradores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear colaborador
router.post('/', auth, esAdmin, async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ error: 'Email ya registrado' });
    const colaborador = await Usuario.create({
      nombre,
      email,
      password,
      rol: 'colaborador',
      negocioId: req.usuario.negocioId,
    });
    res.status(201).json({ id: colaborador._id, nombre, email, rol: 'colaborador' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar colaborador
router.delete('/:id', auth, esAdmin, async (req, res) => {
  try {
    await Usuario.findOneAndUpdate(
      { _id: req.params.id, negocioId: req.usuario.negocioId, rol: 'colaborador' },
      { activo: false }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
