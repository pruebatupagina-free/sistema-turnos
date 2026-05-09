const router = require('express').Router();
const { auth, esAdmin } = require('../middleware/auth');
const Categoria = require('../models/Categoria');

// Listar categorías del negocio
router.get('/', auth, async (req, res) => {
  try {
    const categorias = await Categoria.find({ negocioId: req.usuario.negocioId, activa: true }).sort({ orden: 1, createdAt: 1 });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear
router.post('/', auth, esAdmin, async (req, res) => {
  try {
    const { nombre, genero, orden } = req.body;
    const cat = await Categoria.create({ negocioId: req.usuario.negocioId, nombre, genero, orden });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar
router.put('/:id', auth, esAdmin, async (req, res) => {
  try {
    const cat = await Categoria.findOneAndUpdate(
      { _id: req.params.id, negocioId: req.usuario.negocioId },
      req.body,
      { new: true }
    );
    if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar
router.delete('/:id', auth, esAdmin, async (req, res) => {
  try {
    await Categoria.findOneAndUpdate(
      { _id: req.params.id, negocioId: req.usuario.negocioId },
      { activa: false }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
