const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  negocioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Negocio', required: true },
  nombre: { type: String, required: true, trim: true },
  genero: { type: String, enum: ['hombre', 'mujer', 'ambos'], default: 'ambos' },
  orden: { type: Number, default: 0 },
  activa: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Categoria', categoriaSchema);
