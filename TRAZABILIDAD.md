# Trazabilidad

Repositorio: https://github.com/Cereal-jpg/INF384-lab6-base — spec en [`.kiro/specs/habilitados/`](.kiro/specs/habilitados/).

Runs citados:

| Run | Commit | Resultado |
| --- | --- | --- |
| [#1 — evidencia de cobertura](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902297583) | `4966bf7` (rama `evidencia/cobertura`: main en `827da0d` + umbral) | Rojo: `coverage threshold for lines (80%) not met: 66.66%` |
| [#2 — gates con gitleaks-action](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902318325) | `6c79a97` | Rojo en SCA (lodash); gitleaks en verde por el modo de escaneo (ver nota) |
| [#3 — gitleaks sobre todo el historial](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902879978) | `8d094dc` | Rojo en secretos (`generic-api-key` en `config/ejemplo.env:4`) y en SCA |
| [#4 — lodash 4.18.1](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902921413) | `5787377` | SCA en verde; secretos sigue en rojo |
| [#5 — clave rotada](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573) | `3e83a5f` | Todo en verde: secretos, SCA, pruebas con cobertura y SAST |

## Requisito → gate → evidencia

Los requisitos 2.x, 3.x y 4.x se verifican con tests de `tests/habilitados.test.js`, que corren en el job **Pruebas y cobertura** (bloquea). Los tests se escribieron y subieron primero en `4da7813` (tarea 1), donde fallaban los 25; la evidencia de falla es el nombre del test en ese commit, y la de corrección es el commit que lo hizo pasar y el run #5. Actions todavía no estaba habilitado en el fork en esos commits, por eso no hay un run en rojo para cada test.

| Requisito | Gate (herramienta y umbral) | Bloquea / avisa | Etapa | Run fallido | Run corregido |
| --- | --- | --- | --- | --- | --- |
| 2.1 Máx. 100 códigos → 400 | Test `2.1 más de 100 elementos responde 400` | Bloquea | Pruebas | Test en rojo en `4da7813` | Pasa desde `8716346` (tarea 3); [run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573) |
| 2.2 Cuerpo > 10 kb → 413 | Test `2.2 un cuerpo mayor a 10 kb responde 413 con error JSON` | Bloquea | Pruebas | Test en rojo en `4da7813` y en `8716346` (el middleware respondía 500) | Pasa desde `1f6c6fd` (tarea 4); [run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573) |
| 2.3 5000 códigos → 413 en < 1000 ms | Test `2.3 una lista de 5000 códigos responde 413 en menos de 1000 ms` | Bloquea | Pruebas | Test en rojo en `4da7813` y `8716346` | Pasa desde `1f6c6fd`; [run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573) |
| 3.1 `1INF30<script>` → 400 sin reflejar el valor | Tests `3.1 el código 1INF30<script> responde 400 sin reflejar el valor`, `3.1 un código en minúsculas responde 400` | Bloquea | Pruebas | Tests en rojo en `4da7813` | Pasan desde `8716346`; [run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573) |
| 3.2 JSON mal formado → 400, no 500 | Test `3.2 un cuerpo JSON mal formado responde 400, no 500` | Bloquea | Pruebas | Test en rojo en `4da7813` y `8716346` (respondía 500) | Pasa desde `1f6c6fd`; [run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573) |
| 3.3 Error no controlado → 500 genérico sin stack ni rutas | Test `3.3 error no controlado › responde 500 genérico sin stack trace ni rutas` | Bloquea | Pruebas | Test en rojo en `4da7813` (ruta inexistente) | Pasa desde `8716346`; [run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573) |
| 3.4 Código desconocido → 400 | Test `3.4 un código válido que no existe en la malla responde 400` | Bloquea | Pruebas | Test en rojo en `4da7813` | Pasa desde `8716346`; [run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573) |
| 4.1 `aprobados` no es arreglo → 400 | Tests `4.1 aprobados como un texto / un número / un objeto / null / ausente responde 400` | Bloquea | Pruebas | Tests en rojo en `4da7813` | Pasan desde `8716346`; [run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573) |
| 4.2 Elemento no texto → 400 | Tests `4.2 un elemento que es un número / null / un objeto / un arreglo responde 400` | Bloquea | Pruebas | Tests en rojo en `4da7813` | Pasan desde `8716346`; [run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573) |
| 5.1 Cobertura de líneas ≥ 80 % | Jest `coverageThreshold.global.lines = 80` (`npm test` = `jest --coverage`) | Bloquea | Pruebas | [Run #1](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902297583): 66,66 % (main previo, `formato.js` sin tests) | [Run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573): 100 % de líneas tras `0b3f33a` (tests de `formato.js` y de habilitados) |
| Política TI: sin dependencias high/critical | `npm audit --audit-level=high --omit=dev` | Bloquea | SCA, después de `npm ci` y antes de pruebas | [Run #3](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902879978): `lodash <=4.17.23 Severity: high` (GHSA-35jh-r3h4-6jhm) | [Run #4](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902921413): lodash 4.18.1, `found 0 vulnerabilities` |
| Política TI: sin secretos | gitleaks CLI 8.24.3 sobre todo el historial; cualquier hallazgo fuera de `.gitleaksignore` | Bloquea | Secretos, primer job | [Run #3](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902879978): `CATALOGO_API_KEY` en `config/ejemplo.env:4`, commit `7506fec` | [Run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573): clave rotada, placeholder vacío y fingerprint en `.gitleaksignore` con su razón |
| Extra: SAST | CodeQL `javascript` | Avisa (alertas en Security, no bloquea) | SAST, en paralelo | — (modo aviso: no pone el run en rojo por hallazgos) | [Run #5](https://github.com/Cereal-jpg/INF384-lab6-base/actions/runs/45902962573) |

### Diagnóstico: por qué el run #2 no mostró el secreto

En el run #2 el gate de secretos usaba `gitleaks/gitleaks-action@v2`. Con un evento `push`, la action escanea solo los commits del push (`git log -p -U0 -1` → "1 commits scanned", "no leaks found"), aunque el checkout tenía `fetch-depth: 0`. La clave estaba en el commit inicial `7506fec`, fuera de ese rango, así que el gate quedó en verde con un secreto en el repositorio. Se cambió a `gitleaks git .` con el CLI (`8d094dc`), que escanea los 18 commits del historial; el run #3 detectó la clave y quedó en rojo. La corrección (`3e83a5f`) reemplaza la clave por un placeholder vacío y registra el fingerprint `7506fec…:config/ejemplo.env:generic-api-key:4` en `.gitleaksignore` con la razón (clave rotada). No se reescribe el historial de `main`.

### Diagnóstico: por qué el gate de cobertura no falló en la rama de trabajo

Al momento de agregar el umbral (`0b3f33a`), los tests de habilitados ya cubrían la mayor parte del código y la cobertura era 80,64 % sin tests de `formato.js`. Para registrar el gate en rojo se aplicó el mismo umbral sobre el estado de `main` anterior a esta funcionalidad (`827da0d`) en la rama `evidencia/cobertura`: 66,66 % de líneas, run #1 en rojo.

## Cambios a la propuesta de Kiro

| Documento | Qué propuso Kiro | Qué cambiaste | Por qué |
| --- | --- | --- | --- |
| `src/app.js` (middleware de errores, tarea 3 de `consulta-cursos`) | Un único middleware que responde `500 {"error":"error interno del servidor"}` a cualquier error, incluidos los del parser de `express.json` | Distinguir `entity.parse.failed` → 400 `cuerpo JSON inválido` y `entity.too.large` → 413 `solicitud demasiado grande`; el resto sigue en 500 genérico (`1f6c6fd`) | Un JSON mal formado o un cuerpo enorme es un error del cliente, no del servidor; con la propuesta original los tests 2.2, 2.3 y 3.2 fallaban (respondía 500), y `tech.md` define 400 para entrada inválida |
| `tests/health.test.js` (test del middleware de errores) | Probar el middleware montando un `express()` aparte con una copia del handler, no el de `src/app.js` | El test 3.3 de habilitados provoca el error dentro de la app real (reemplaza `repositorio.habilitados` por una función que lanza un `Error` con la ruta `C:\apps\malla\src\...`) y verifica el cuerpo exacto | El test de Kiro seguía pasando aunque el middleware real se cambiara o se borrara, así que no verificaba el hallazgo 2; el nuevo falla si la app real filtra el mensaje o el stack |
