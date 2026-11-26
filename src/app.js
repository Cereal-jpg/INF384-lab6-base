const path = require('path');
const express = require('express');
const repositorio = require('./data/repositorio');

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', cursos: repositorio.listar().length });
});

app.use('/cursos', require('./routes/cursos'));
app.use('/habilitados', require('./routes/habilitados'));

// Generic error-handling middleware — must be declared after all routes.
// Catches any error passed via next(err) or thrown inside async handlers.
// Never leaks internal details to clients.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Errores del parser de express.json: son errores del cliente, no del servidor.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'cuerpo JSON inválido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'solicitud demasiado grande' });
  }
  console.error(err);
  res.status(500).json({ error: 'error interno del servidor' });
});

module.exports = app;
