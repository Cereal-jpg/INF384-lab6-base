const request = require('supertest');
const app = require('../src/app');
const repositorio = require('../src/data/repositorio');

const EJEMPLO = ['1INF25', '1INF27', '1INF49'];

function post(body) {
  return request(app).post('/habilitados').send(body);
}

function ids(res) {
  return res.body.map((curso) => curso.id);
}

describe('POST /habilitados — Requisito 1: cursos habilitados', () => {
  test('1.1 el ejemplo del pedido devuelve 27 cursos con 1INF29, 1INF30, 1INF31 y 1INF32', async () => {
    const res = await post({ aprobados: EJEMPLO });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(27);
    expect(ids(res)).toEqual(expect.arrayContaining(['1INF29', '1INF30', '1INF31', '1INF32']));
  });

  test('1.2 incluye los cursos sin requisitos que no están aprobados', async () => {
    const res = await post({ aprobados: EJEMPLO });

    const sinRequisitos = repositorio
      .listar()
      .filter((c) => c.prerequisites.length === 0 && !EJEMPLO.includes(c.id))
      .map((c) => c.id);
    expect(ids(res)).toEqual(expect.arrayContaining(sinRequisitos));
  });

  test('1.3 no incluye los cursos aprobados', async () => {
    const res = await post({ aprobados: EJEMPLO });

    for (const codigo of EJEMPLO) {
      expect(ids(res)).not.toContain(codigo);
    }
  });

  test('1.4 no incluye cursos a los que les falta algún requisito', async () => {
    // 1INF30 requiere 1INF25; sin 1INF25 no debe aparecer.
    const res = await post({ aprobados: ['1INF27'] });

    expect(res.status).toBe(200);
    expect(ids(res)).not.toContain('1INF30');
    for (const curso of res.body) {
      const completo = repositorio.obtener(curso.id);
      expect(completo.prerequisites.every((p) => p === '1INF27')).toBe(true);
    }
  });

  test('1.5 con aprobados vacío devuelve solo los cursos sin requisitos', async () => {
    const res = await post({ aprobados: [] });

    const esperados = repositorio
      .listar()
      .filter((c) => c.prerequisites.length === 0)
      .map((c) => c.id);
    expect(res.status).toBe(200);
    expect(ids(res).sort()).toEqual(esperados.sort());
  });

  test('1.6 los códigos repetidos no cambian el resultado', async () => {
    const sinRepetidos = await post({ aprobados: EJEMPLO });
    const conRepetidos = await post({ aprobados: [...EJEMPLO, ...EJEMPLO, '1INF25'] });

    expect(conRepetidos.status).toBe(200);
    expect(conRepetidos.body).toEqual(sinRepetidos.body);
  });

  test('1.7 cada curso tiene id, name, credits, cycle y type, ordenados por ciclo (electivos al final) e id', async () => {
    const res = await post({ aprobados: EJEMPLO });

    for (const curso of res.body) {
      expect(Object.keys(curso).sort()).toEqual(['credits', 'cycle', 'id', 'name', 'type']);
    }
    const clave = (c) => [c.cycle === null ? Infinity : c.cycle, c.id];
    const ordenado = [...res.body].sort((a, b) => {
      const [ca, ia] = clave(a);
      const [cb, ib] = clave(b);
      return ca - cb || ia.localeCompare(ib);
    });
    expect(ids(res)).toEqual(ordenado.map((c) => c.id));
  });
});

describe('POST /habilitados — Requisito 2: límite de tamaño (hallazgo 1)', () => {
  test('2.1 más de 100 elementos responde 400', async () => {
    const aprobados = Array.from({ length: 101 }, () => '1INF25');
    const res = await post({ aprobados });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'aprobados admite como máximo 100 códigos' });
  });

  test('2.1 exactamente 100 elementos es aceptado', async () => {
    const aprobados = Array.from({ length: 100 }, () => '1INF25');
    const res = await post({ aprobados });

    expect(res.status).toBe(200);
  });

  test('2.2 un cuerpo mayor a 10 kb responde 413 con error JSON', async () => {
    const res = await post({ relleno: 'x'.repeat(11 * 1024), aprobados: [] });

    expect(res.status).toBe(413);
    expect(res.body).toEqual({ error: 'solicitud demasiado grande' });
  });

  test('2.3 una lista de 5000 códigos responde 413 en menos de 1000 ms', async () => {
    const aprobados = Array.from({ length: 5000 }, (_, i) => `X${String(i).padStart(5, '0')}`);
    const inicio = Date.now();
    const res = await post({ aprobados });
    const duracion = Date.now() - inicio;

    expect(res.status).toBe(413);
    expect(duracion).toBeLessThan(1000);
  });
});

describe('POST /habilitados — Requisito 3: errores sin información interna (hallazgo 2)', () => {
  test('3.1 el código 1INF30<script> responde 400 sin reflejar el valor', async () => {
    const res = await post({ aprobados: ['1INF25', '1INF30<script>'] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'código inválido' });
    expect(res.text).not.toContain('<script>');
  });

  test('3.1 un código en minúsculas responde 400', async () => {
    const res = await post({ aprobados: ['1inf25'] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'código inválido' });
  });

  test('3.2 un cuerpo JSON mal formado responde 400, no 500', async () => {
    const res = await request(app)
      .post('/habilitados')
      .set('Content-Type', 'application/json')
      .send('{"aprobados": ["1INF25"');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'cuerpo JSON inválido' });
  });

  describe('3.3 error no controlado', () => {
    const original = repositorio.habilitados;

    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      repositorio.habilitados = () => {
        throw new Error('ENOENT C:\\apps\\malla\\src\\data\\repositorio.js');
      };
    });

    afterEach(() => {
      repositorio.habilitados = original;
      jest.restoreAllMocks();
    });

    test('responde 500 genérico sin stack trace ni rutas', async () => {
      const res = await post({ aprobados: EJEMPLO });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'error interno del servidor' });
      expect(res.text).not.toMatch(/at |C:\\|\/src\/|ENOENT/);
    });
  });

  test('3.4 un código válido que no existe en la malla responde 400', async () => {
    const res = await post({ aprobados: ['1INF25', 'ABC123'] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'curso desconocido: ABC123' });
  });
});

describe('POST /habilitados — Requisito 4: tipo de entrada (hallazgo 3)', () => {
  test.each([
    ['un texto', { aprobados: '1INF25' }],
    ['un número', { aprobados: 5 }],
    ['un objeto', { aprobados: { codigo: '1INF25' } }],
    ['null', { aprobados: null }],
    ['ausente', {}],
  ])('4.1 aprobados como %s responde 400', async (_, body) => {
    const res = await post(body);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'aprobados debe ser una lista de códigos' });
  });

  test.each([
    ['un número', 25],
    ['null', null],
    ['un objeto', { id: '1INF25' }],
    ['un arreglo', ['1INF25']],
  ])('4.2 un elemento que es %s responde 400', async (_, elemento) => {
    const res = await post({ aprobados: ['1INF27', elemento] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'código inválido' });
  });
});
