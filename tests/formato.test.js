const formato = require('../src/util/formato');

const P3 = { id: '1INF30', name: 'Programación 3', credits: 5, cycle: 6, type: 'obligatorio' };
const BD = { id: '1INF33', name: 'Base de Datos', credits: 3.5, cycle: 5, type: 'obligatorio' };
const ELE = { id: 'INF386', name: 'Electivo X', credits: 3.5, cycle: null, type: 'electivo' };

describe('util/formato', () => {
  test('formatearNombre capitaliza cada palabra', () => {
    expect(formato.formatearNombre('BASE DE DATOS')).toBe('Base De Datos');
  });

  test('formatearCreditos usa un decimal', () => {
    expect(formato.formatearCreditos(5)).toBe('5.0 créditos');
    expect(formato.formatearCreditos('3.5')).toBe('3.5 créditos');
  });

  test('formatearCiclo devuelve "Ciclo N" o "Electivo" si es null/undefined', () => {
    expect(formato.formatearCiclo(6)).toBe('Ciclo 6');
    expect(formato.formatearCiclo(null)).toBe('Electivo');
    expect(formato.formatearCiclo(undefined)).toBe('Electivo');
  });

  test('formatearTipo distingue obligatorio de electivo', () => {
    expect(formato.formatearTipo('obligatorio')).toBe('Obligatorio');
    expect(formato.formatearTipo('electivo')).toBe('Electivo');
  });

  test('resumenCurso une código, nombre y créditos', () => {
    expect(formato.resumenCurso(P3)).toBe('1INF30 · Programación 3 · 5.0 créditos');
  });

  test('totalCreditos suma los créditos', () => {
    expect(formato.totalCreditos([P3, BD])).toBe(8.5);
    expect(formato.totalCreditos([])).toBe(0);
  });

  test('agruparPorCiclo agrupa por etiqueta de ciclo y ordena por id', () => {
    const grupos = formato.agruparPorCiclo([P3, ELE, BD]);

    expect(Object.keys(grupos).sort()).toEqual(['Ciclo 5', 'Ciclo 6', 'Electivo']);
    expect(grupos['Ciclo 6']).toEqual([P3]);
    expect(grupos.Electivo).toEqual([ELE]);
  });

  test('ordenarPorCreditos ordena por créditos desc y luego por id', () => {
    const ordenados = formato.ordenarPorCreditos([ELE, BD, P3]);

    expect(ordenados.map((c) => c.id)).toEqual(['1INF30', '1INF33', 'INF386']);
  });

  test('listaRequisitos ordena y une, o indica "Sin requisitos"', () => {
    expect(formato.listaRequisitos(['1INF27', '1INF25'])).toBe('1INF25, 1INF27');
    expect(formato.listaRequisitos([])).toBe('Sin requisitos');
    expect(formato.listaRequisitos(undefined)).toBe('Sin requisitos');
  });
});
