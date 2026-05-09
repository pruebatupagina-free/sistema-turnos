const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  negocioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Negocio', required: true },
  categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  colaboradorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, default: '' },
  precio: { type: Number, required: true, min: 0 },
  duracion: { type: Number, default: 30 }, // minutos
  imagen: { type: String, default: null },
  destacado: { type: Boolean, default: false },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Servicio', servicioSchema);
