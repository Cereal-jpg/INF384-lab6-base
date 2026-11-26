const path = require('path');
const fs = require('fs');

const RUTA_DATOS = path.join(__dirname, '..', '..', 'data', 'cursos.json');

// Se carga una sola vez al importar el módulo.
const { courses } = JSON.parse(fs.readFileSync(RUTA_DATOS, 'utf8'));
const porCodigo = new Map(courses.map((curso) => [curso.id, curso]));

function listar() {
  return [...porCodigo.values()];
}

function listarPorCiclo(ciclo) {
  return listar().filter((curso) => curso.cycle === ciclo);
}

function obtener(codigo) {
  return porCodigo.get(codigo);
}

function existe(codigo) {
  return porCodigo.has(codigo);
}

// Orden: ciclo ascendente, electivos (cycle null) al final, luego por id.
function compararPorCicloEId(a, b) {
  const cicloA = a.cycle === null ? Infinity : a.cycle;
  const cicloB = b.cycle === null ? Infinity : b.cycle;
  if (cicloA !== cicloB) {
    return cicloA - cicloB;
  }
  return a.id.localeCompare(b.id);
}

/**
 * Cursos no aprobados cuyos requisitos están todos en `aprobados`.
 * Requisitos 1.1–1.7 del spec habilitados.
 * @param {Set<string>} aprobados
 */
function habilitados(aprobados) {
  return listar()
    .filter((curso) => !aprobados.has(curso.id))
    .filter((curso) => curso.prerequisites.every((req) => aprobados.has(req)))
    .sort(compararPorCicloEId)
    .map(({ id, name, credits, cycle, type }) => ({ id, name, credits, cycle, type }));
}

module.exports = { listar, listarPorCiclo, obtener, existe, habilitados };
