const express = require('express');
const repositorio = require('../data/repositorio');

const router = express.Router();

const MAX_APROBADOS = 100;
const PATRON_CODIGO = /^[A-Z0-9]{6}$/;

/**
 * POST /habilitados
 * Body: { "aprobados": ["1INF25", ...] }
 *
 * Valida en el orden del design: tipo → tamaño → formato → existencia.
 * Requisitos 1.x, 2.1, 3.1, 3.4, 4.1, 4.2
 */
router.post('/', (req, res) => {
  const aprobados = req.body ? req.body.aprobados : undefined;

  if (!Array.isArray(aprobados)) {
    return res.status(400).json({ error: 'aprobados debe ser una lista de códigos' });
  }

  if (aprobados.length > MAX_APROBADOS) {
    return res.status(400).json({ error: `aprobados admite como máximo ${MAX_APROBADOS} códigos` });
  }

  // No se refleja el valor recibido para no devolver contenido como <script>.
  if (!aprobados.every((codigo) => typeof codigo === 'string' && PATRON_CODIGO.test(codigo))) {
    return res.status(400).json({ error: 'código inválido' });
  }

  const desconocido = aprobados.find((codigo) => !repositorio.existe(codigo));
  if (desconocido) {
    return res.status(400).json({ error: `curso desconocido: ${desconocido}` });
  }

  res.json(repositorio.habilitados(new Set(aprobados)));
});

module.exports = router;
