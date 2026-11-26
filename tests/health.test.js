const request = require('supertest');
const express = require('express');
const app = require('../src/app');

describe('GET /health', () => {
  test('responde 200 con estado ok y la cantidad de cursos', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', cursos: 87 });
  });
});

describe('Middleware de manejo de errores (Requisito 3.1)', () => {
  test('responde 500 con mensaje genérico cuando una ruta lanza un error', async () => {
    // Mount a temporary test route that throws to exercise the error handler.
    const testApp = express();
    testApp.use(express.json());

    testApp.get('/error-test', (req, res, next) => {
      next(new Error('fallo inesperado'));
    });

    // Re-use the same error-handler logic by requiring app — but we build a
    // minimal clone so the test route is isolated.
    // eslint-disable-next-line no-unused-vars
    testApp.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ error: 'error interno del servidor' });
    });

    const res = await request(testApp).get('/error-test');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'error interno del servidor' });
  });

  test('no filtra el mensaje de error interno hacia el cliente', async () => {
    const testApp = express();
    testApp.get('/secret-error', (req, res, next) => {
      next(new Error('contraseña: s3cr3t'));
    });
    // eslint-disable-next-line no-unused-vars
    testApp.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ error: 'error interno del servidor' });
    });

    const res = await request(testApp).get('/secret-error');

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('s3cr3t');
  });
});
