const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema({
  negocioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Negocio', required: true },
  servicioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', required: true },
  colaboradorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  // Cliente invitado — sin cuenta
  clienteNombre: { type: String, required: true, trim: true },
  clienteTelefono: { type: String, required: true, trim: true },
  clienteEmail: { type: String, default: '', trim: true },
  fecha: { type: String, required: true }, // 'YYYY-MM-DD'
  horaInicio: { type: String, required: true }, // 'HH:mm'
  horaFin: { type: String, required: true },   // 'HH:mm'
  estado: { type: String, enum: ['pendiente', 'confirmado', 'cancelado', 'completado'], default: 'pendiente' },
  notas: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Turno', turnoSchema);
