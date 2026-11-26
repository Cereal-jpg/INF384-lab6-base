# Plan de implementación: Cursos habilitados

- [x] 1. Escribir los tests de `POST /habilitados` (deben fallar)
  - Crear `tests/habilitados.test.js` con supertest, al menos un test por criterio
  - Hacer push para dejar el run en rojo como evidencia
  - _Requisitos: 1.1–1.7, 2.1–2.3, 3.1–3.4, 4.1, 4.2_

- [x] 2. Implementar `habilitados(aprobados)` y `existe(codigo)` en el repositorio
  - Filtrar los cursos no aprobados con todos sus requisitos en el `Set`
  - Ordenar por ciclo (electivos al final) y luego por id; devolver `{id, name, credits, cycle, type}`
  - Tests unitarios en `tests/repositorio.test.js`
  - _Requisitos: 1.1–1.7_

- [x] 3. Implementar la ruta `POST /habilitados` con validación de entrada
  - Crear `src/routes/habilitados.js` y validar en el orden del design (tipo → tamaño → formato → existencia)
  - Montar en `src/app.js` con `express.json({ limit: '10kb' })`
  - _Requisitos: 2.1, 3.1, 3.4, 4.1, 4.2_

- [ ] 4. Ajustar el middleware de errores
  - `entity.parse.failed` → 400, `entity.too.large` → 413, resto → 500 `{"error":"error interno del servidor"}`
  - No enviar nunca `err.message` ni `err.stack`
  - _Requisitos: 2.2, 2.3, 3.2, 3.3_

- [ ] 5. Asegurar cobertura de líneas ≥ 80 %
  - Agregar `coverageThreshold: { global: { lines: 80 } }` en `jest.config.js` y `--coverage` al script de test
  - Agregar `tests/formato.test.js` para `src/util/formato.js`
  - _Requisitos: 5.1_

- [ ] 6. Agregar los gates de SCA, secretos y SAST a `.github/workflows/ci.yml`
  - Job `secretos` con gitleaks (`fetch-depth: 0`), job `sca` con `npm audit --audit-level=high --omit=dev`, job `sast` con CodeQL en modo aviso
  - Hacer push sin corregir nada para registrar el run en rojo
  - Corregir: actualizar `lodash` a 4.18.1, rotar `CATALOGO_API_KEY`, reemplazarla por un placeholder y registrar el hallazgo histórico en `.gitleaksignore` con su razón
  - _Requisitos: política de TI (sin vulnerabilidades high/critical, sin secretos)_

- [ ] 7. Completar `TRAZABILIDAD.md`
  - Cada requisito no funcional (2.x, 3.x, 4.x, 5.1 y la política de TI) con su gate o test, el run fallido y el run corregido
  - Dos cambios hechos a la propuesta de Kiro, con su razón
