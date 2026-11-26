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
  console.error(err);
  res.status(500).json({ error: 'error interno del servidor' });
});

module.exports = app;
