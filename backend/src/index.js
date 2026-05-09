require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas autenticadas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/negocios', require('./routes/negocios'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/servicios', require('./routes/servicios'));
app.use('/api/colaboradores', require('./routes/colaboradores'));
app.use('/api/turnos', require('./routes/turnos'));

// Rutas públicas (sin auth) — ANTES del 404
app.use('/api/public', require('./routes/public'));

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.use((_, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(process.env.PORT || 4000, () =>
      console.log(`Servidor en puerto ${process.env.PORT || 4000}`)
    );
  })
  .catch((err) => {
    console.error('Error MongoDB:', err.message);
    process.exit(1);
  });
