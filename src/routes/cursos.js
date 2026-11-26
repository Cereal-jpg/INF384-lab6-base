const express = require('express');
const repositorio = require('../data/repositorio');

const router = express.Router();

/**
 * GET /cursos
 * GET /cursos?ciclo=N  (N entero entre 5 y 10)
 *
 * Requisitos 1.1, 1.2, 1.3
 */
router.get('/', (req, res) => {
  const { ciclo } = req.query;

  if (ciclo !== undefined) {
    const cicloNum = Number(ciclo);

    if (!Number.isInteger(cicloNum) || cicloNum < 5 || cicloNum > 10) {
      return res.status(400).json({ error: 'ciclo debe ser un entero entre 5 y 10' });
    }

    return res.json(repositorio.listarPorCiclo(cicloNum));
  }

  res.json(repositorio.listar());
});

/**
 * GET /cursos/:codigo
 *
 * Requisitos 2.1, 2.2
 */
router.get('/:codigo', (req, res) => {
  const curso = repositorio.obtener(req.params.codigo);

  if (!curso) {
    return res.status(404).json({ error: 'curso no encontrado' });
  }

  const prerequisites = (curso.prerequisites || []).map((id) => {
    const req_curso = repositorio.obtener(id);
    return { id, name: req_curso ? req_curso.name : id };
  });

  res.json({ ...curso, prerequisites });
});

module.exports = router;
