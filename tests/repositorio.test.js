const repositorio = require('../src/data/repositorio');

describe('repositorio de cursos', () => {
  describe('listar()', () => {
    test('devuelve los 87 cursos de la malla', () => {
      expect(repositorio.listar()).toHaveLength(87);
    });

    test('cada curso tiene los campos del modelo de datos', () => {
      for (const curso of repositorio.listar()) {
        expect(curso).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            credits: expect.any(Number),
            type: expect.stringMatching(/^(obligatorio|electivo)$/),
            prerequisites: expect.any(Array),
          }),
        );
      }
    });
  });

  describe('listarPorCiclo(ciclo)', () => {
    test('el ciclo 10 tiene 3 cursos', () => {
      const cursos = repositorio.listarPorCiclo(10);

      expect(cursos).toHaveLength(3);
      expect(cursos.every((curso) => curso.cycle === 10)).toBe(true);
    });

    test('devuelve un arreglo vacío para un ciclo sin cursos', () => {
      expect(repositorio.listarPorCiclo(4)).toEqual([]);
    });
  });

  describe('obtener(codigo)', () => {
    test('devuelve 1INF30 con su requisito 1INF25', () => {
      const curso = repositorio.obtener('1INF30');

      expect(curso.name).toBe('Programación 3');
      expect(curso.cycle).toBe(6);
      expect(curso.prerequisites).toEqual(['1INF25']);
    });

    test('devuelve undefined si el código no existe', () => {
      expect(repositorio.obtener('XXX999')).toBeUndefined();
    });
  });

  describe('existe(codigo)', () => {
    test('devuelve true para un curso de la malla y false si no existe', () => {
      expect(repositorio.existe('INF386')).toBe(true);
      expect(repositorio.existe('ABC123')).toBe(false);
    });
  });

  describe('habilitados(aprobados)', () => {
    test('con el ejemplo del pedido devuelve 27 cursos', () => {
      const resultado = repositorio.habilitados(new Set(['1INF25', '1INF27', '1INF49']));

      expect(resultado).toHaveLength(27);
      expect(resultado.map((c) => c.id)).toEqual(
        expect.arrayContaining(['1INF29', '1INF30', '1INF31', '1INF32']),
      );
    });

    test('no incluye prerequisites en cada curso devuelto', () => {
      const [curso] = repositorio.habilitados(new Set());

      expect(curso).not.toHaveProperty('prerequisites');
    });

    test('ubica los electivos (cycle null) al final', () => {
      const resultado = repositorio.habilitados(new Set());
      const primerElectivo = resultado.findIndex((c) => c.cycle === null);

      expect(primerElectivo).toBeGreaterThan(-1);
      expect(resultado.slice(primerElectivo).every((c) => c.cycle === null)).toBe(true);
    });
  });
});
