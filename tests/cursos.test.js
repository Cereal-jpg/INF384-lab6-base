const request = require('supertest');
const app = require('../src/app');

describe('GET /cursos', () => {
  // Requisito 1.1: devuelve todos los cursos con los campos requeridos
  test('1.1 responde 200 con todos los cursos de la malla', async () => {
    const res = await request(app).get('/cursos');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(87);
  });

  test('1.1 cada curso tiene código, nombre, créditos, ciclo y tipo', async () => {
    const res = await request(app).get('/cursos');

    for (const curso of res.body) {
      expect(curso).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          credits: expect.any(Number),
          type: expect.any(String),
        }),
      );
      // cycle puede ser número o null
      expect('cycle' in curso).toBe(true);
    }
  });

  // Requisito 1.2: filtra por ciclo cuando el parámetro es válido
  test('1.2 ?ciclo=6 devuelve solo los cursos del ciclo 6', async () => {
    const res = await request(app).get('/cursos?ciclo=6');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((c) => c.cycle === 6)).toBe(true);
  });

  test('1.2 ?ciclo=10 devuelve exactamente 3 cursos', async () => {
    const res = await request(app).get('/cursos?ciclo=10');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  test('1.2 ?ciclo=5 devuelve solo cursos del ciclo 5', async () => {
    const res = await request(app).get('/cursos?ciclo=5');

    expect(res.status).toBe(200);
    expect(res.body.every((c) => c.cycle === 5)).toBe(true);
  });

  // Requisito 1.3: rechaza ciclos inválidos con 400
  test('1.3 ?ciclo=4 responde 400 con mensaje de error', async () => {
    const res = await request(app).get('/cursos?ciclo=4');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ciclo debe ser un entero entre 5 y 10' });
  });

  test('1.3 ?ciclo=11 responde 400', async () => {
    const res = await request(app).get('/cursos?ciclo=11');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ciclo debe ser un entero entre 5 y 10' });
  });

  test('1.3 ?ciclo=abc responde 400', async () => {
    const res = await request(app).get('/cursos?ciclo=abc');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ciclo debe ser un entero entre 5 y 10' });
  });

  test('1.3 ?ciclo=5.5 responde 400 (no es entero)', async () => {
    const res = await request(app).get('/cursos?ciclo=5.5');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ciclo debe ser un entero entre 5 y 10' });
  });
});

describe('GET /cursos/:codigo', () => {
  // Requisito 2.1: devuelve el curso con sus requisitos (id + nombre)
  test('2.1 código existente responde 200 con los campos requeridos', async () => {
    const res = await request(app).get('/cursos/1CON27');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: '1CON27',
      name: expect.any(String),
      credits: expect.any(Number),
      cycle: expect.any(Number),
      type: expect.any(String),
    });
    expect(Array.isArray(res.body.prerequisites)).toBe(true);
  });

  test('2.1 cada prerequisito incluye id y name', async () => {
    // 1CON27 tiene ["1IND90"] como prerrequisito
    const res = await request(app).get('/cursos/1CON27');

    expect(res.status).toBe(200);
    expect(res.body.prerequisites).toHaveLength(1);
    expect(res.body.prerequisites[0]).toEqual({
      id: '1IND90',
      name: 'Empresa y su Entorno',
    });
  });

  test('2.1 curso sin prerrequisitos devuelve prerequisites vacío', async () => {
    // 1GES92 no tiene prerrequisitos
    const res = await request(app).get('/cursos/1GES92');

    expect(res.status).toBe(200);
    expect(res.body.prerequisites).toEqual([]);
  });

  // Requisito 2.2: código inexistente responde 404
  test('2.2 código inexistente responde 404 con mensaje de error', async () => {
    const res = await request(app).get('/cursos/NOEXISTE');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'curso no encontrado' });
  });
});
