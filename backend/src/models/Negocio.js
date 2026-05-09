const mongoose = require('mongoose');

const negocioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  logo: { type: String, default: null },
  descripcion: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  telefono: { type: String, default: '' },
  direccion: { type: String, default: '' },
  ciudad: { type: String, default: '' },
  email: { type: String, default: '' },
  colorPrimario: { type: String, default: '#00BDB0' },
  plan: { type: String, enum: ['basico', 'pro', 'elite'], default: 'basico' },
  activo: { type: Boolean, default: true },
  // Configuración de horario general
  horario: {
    diasActivos: {
      type: [String],
      enum: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
      default: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'],
    },
    horaInicio: { type: String, default: '09:00' },
    horaFin: { type: String, default: '19:00' },
    duracionSlot: { type: Number, default: 30 }, // minutos
  },
}, { timestamps: true });

module.exports = mongoose.model('Negocio', negocioSchema);
