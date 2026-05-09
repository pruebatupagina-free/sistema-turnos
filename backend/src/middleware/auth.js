const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select('-password');
    if (!usuario || !usuario.activo) return res.status(401).json({ error: 'Usuario no autorizado' });
    req.usuario = usuario;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const esSuperadmin = (req, res, next) => {
  if (req.usuario.rol !== 'superadmin') return res.status(403).json({ error: 'Acceso denegado' });
  next();
};

const esAdmin = (req, res, next) => {
  if (!['superadmin', 'admin_negocio'].includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
};

module.exports = { auth, esSuperadmin, esAdmin };
