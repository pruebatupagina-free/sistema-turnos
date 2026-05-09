const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Negocio = require('../models/Negocio');
const slugify = require('../utils/slugify');
const { sendWelcome } = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Registro público — crea admin_negocio + negocio
router.post('/register-public', async (req, res) => {
  const { nombre, email, password, negocioNombre, whatsapp } = req.body;
  if (!nombre || !email || !password || !negocioNombre) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  try {
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ error: 'Este email ya está registrado' });

    // Generar slug único
    let slug = slugify(negocioNombre);
    let contador = 0;
    while (await Negocio.findOne({ slug: contador ? `${slug}-${contador}` : slug })) contador++;
    if (contador) slug = `${slug}-${contador}`;

    const usuario = await Usuario.create({ nombre, email, password, rol: 'admin_negocio' });

    const negocio = await Negocio.create({
      nombre: negocioNombre,
      slug,
      adminId: usuario._id,
      whatsapp: whatsapp || '',
    });

    usuario.negocioId = negocio._id;
    await usuario.save();

    sendWelcome(email, nombre, negocioNombre, slug).catch(() => {});

    const token = signToken(usuario._id);
    res.status(201).json({
      token,
      usuario: { id: usuario._id, nombre, email, rol: usuario.rol, negocioId: negocio._id },
      negocio: { id: negocio._id, nombre: negocio.nombre, slug },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  try {
    const usuario = await Usuario.findOne({ email }).populate('negocioId', 'nombre slug plan');
    if (!usuario || !usuario.activo) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const ok = await usuario.compararPassword(password);
    if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const token = signToken(usuario._id);
    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        negocio: usuario.negocioId,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Me
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  const usuario = await Usuario.findById(req.usuario._id)
    .select('-password')
    .populate('negocioId', 'nombre slug plan colorPrimario logo horario');
  res.json(usuario);
});

module.exports = router;
