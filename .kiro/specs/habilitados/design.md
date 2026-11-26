# Diseño: Cursos habilitados

## Visión general

Endpoint `POST /habilitados` que calcula en memoria los cursos que el alumno puede llevar, usando `src/data/repositorio.js`. No se agregan dependencias: la validación es manual, porque son cuatro reglas simples y `tech.md` pide no sumar dependencias sin necesidad.

## Componentes

| Componente | Responsabilidad |
| --- | --- |
| `src/data/repositorio.js` | Nueva función `habilitados(aprobados)`: recibe un `Set` de códigos y devuelve los cursos no aprobados cuyos `prerequisites` están todos en el `Set`, ordenados por ciclo e id. También `existe(codigo)`. |
| `src/routes/habilitados.js` | Valida el cuerpo en el orden definido abajo y traduce el resultado a la respuesta HTTP. |
| `src/app.js` | Usa `express.json({ limit: '10kb' })`, monta el router en `/habilitados` y registra el middleware de errores al final. |
| Middleware de errores | `entity.parse.failed` → 400 `cuerpo JSON inválido`; `entity.too.large` → 413 `solicitud demasiado grande`; cualquier otro error → 500 `error interno del servidor`. Nunca envía `err.message` ni `err.stack` al cliente. |

## Contrato

`POST /habilitados` con:

```json
{ "aprobados": ["1INF25", "1INF27", "1INF49"] }
```

Respuesta `200`:

```json
[
  { "id": "1GES92", "name": "Taller de Habilidades Interpersonales", "credits": 1.0, "cycle": 5, "type": "obligatorio" },
  { "id": "1INF30", "name": "Programación 3", "credits": 5.0, "cycle": 6, "type": "obligatorio" }
]
```

Errores con la forma `{ "error": "<mensaje>" }`:

| Caso | Código | Mensaje | Requisito |
| --- | --- | --- | --- |
| `aprobados` no es arreglo | 400 | `aprobados debe ser una lista de códigos` | 4.1 |
| Más de 100 elementos | 400 | `aprobados admite como máximo 100 códigos` | 2.1 |
| Elemento no es texto o no cumple `^[A-Z0-9]{6}$` | 400 | `código inválido` | 3.1, 4.2 |
| Código válido que no existe en la malla | 400 | `curso desconocido: <codigo>` | 3.4 |
| JSON mal formado | 400 | `cuerpo JSON inválido` | 3.2 |
| Cuerpo mayor a 10 kb | 413 | `solicitud demasiado grande` | 2.2, 2.3 |
| Error no controlado | 500 | `error interno del servidor` | 3.3 |

## Orden de validación

1. ¿`aprobados` es un arreglo? Si no, 400 (4.1).
2. ¿Tiene como máximo 100 elementos? Si no, 400 (2.1).
3. ¿Cada elemento es un texto que cumple `^[A-Z0-9]{6}$`? Si no, 400 (3.1, 4.2).
4. ¿Cada código existe en la malla? Si no, 400 (3.4).
5. Se calcula el resultado con un `Set` (O(cursos × requisitos), con un máximo de 87 × 2).

El tamaño se revisa antes de recorrer los elementos para no gastar CPU en listas grandes. Antes de eso, `express.json({ limit: '10kb' })` corta cualquier cuerpo mayor sin parsearlo, y así una lista de 5000 códigos (~45 kb) nunca llega a la ruta. El mensaje `código inválido` no repite el valor recibido, para no reflejar contenido como `<script>`.

## Decisiones sobre casos no definidos en el pedido

| Caso | Decisión | Razón |
| --- | --- | --- |
| Código con formato válido que no está en la malla | 400 `curso desconocido: <codigo>` | Ignorarlo devolvería resultados incorrectos sin aviso (el mismo riesgo del hallazgo 3); un error de tipeo del alumno tiene que hacerse visible. Se puede repetir el código porque ya pasó el patrón y no tiene caracteres peligrosos. |
| Códigos repetidos | Se aceptan y se deduplican con `Set` | No cambian el resultado ni representan riesgo; rechazarlos solo complicaría al cliente. |
| Códigos en minúsculas (`1inf25`) | 400 `código inválido` | Los ids de la malla están en mayúsculas; normalizar ocultaría errores del cliente y agregaría casos que probar. |
| Patrón del código | `^[A-Z0-9]{6}$` | 31 cursos de la malla no siguen la forma `1XXX99` (por ejemplo `INF386`, `IND231`, `DER349`, `TEO240`); un patrón más estricto rechazaría cursos reales. |
| Máximo de elementos | 100 | La malla tiene 87 cursos, así que ninguna solicitud legítima supera 87 códigos distintos; 100 deja margen para repetidos. |
| Tamaño máximo del cuerpo | 10 kb | 100 códigos ocupan ~1 kb; 10 kb deja margen y corta payloads abusivos antes de parsearlos. |
| 413 vs 400 por tamaño | 413 si el cuerpo supera 10 kb; 400 si cabe pero tiene más de 100 elementos | 413 es el código que Express emite para un payload demasiado grande; el resto de los errores de entrada usa 400, como define `tech.md`. |
| `aprobados` vacío | 200 con los cursos sin requisitos | Es el caso real de un alumno que recién entra a ciclo 5. |
| Campos extra en el cuerpo | Se ignoran | No afectan el cálculo, y rechazarlos rompería a clientes que agreguen campos en el futuro. |
| Formato de la respuesta | Arreglo de `{id, name, credits, cycle, type}` sin `prerequisites` | Mismo formato que `GET /cursos`, así la página reutiliza el mismo render; el detalle de requisitos ya está en `GET /cursos/:codigo`. |
| Orden de la respuesta | Por `cycle` ascendente, electivos (`cycle: null`) al final, luego por `id` | Orden determinista para los tests y útil para el alumno, que primero ve los cursos de su ciclo. |

## Gates de CI

| Gate | Herramienta y umbral | Bloquea / avisa | Etapa | Razón |
| --- | --- | --- | --- | --- |
| Detección de secretos | gitleaks sobre todo el historial (`fetch-depth: 0`); cualquier hallazgo no registrado en `.gitleaksignore` | Bloquea | Primer job, en push y PR a `main`, en paralelo con SCA y antes de las pruebas | La política de TI exige cero secretos. Un secreto que llega al repositorio queda expuesto aunque se borre después, por eso se revisa todo el historial lo antes posible. La única salida válida para un hallazgo histórico es rotar la clave y registrarla en `.gitleaksignore` con su razón. |
| SCA | `npm audit --audit-level=high --omit=dev` | Bloquea con high o critical; low y moderate solo quedan en el log | Después de `npm ci`, antes de las pruebas, en push y PR a `main` | Aplica literalmente la política "ninguna dependencia con vulnerabilidades altas o críticas". Bloquear también moderate frenaría entregas sin que la política lo pida. Se omiten las devDependencies porque no se despliegan. |
| Cobertura | Jest `coverageThreshold.global.lines = 80` | Bloquea | Job de pruebas, después de SCA y secretos | Política de TI: la cobertura de líneas no baja de 80 %. Va después de los gates de seguridad para no gastar minutos de CI en código que igual se rechazaría. |
| SAST (extra) | CodeQL `javascript`, consultas por defecto | Avisa: las alertas quedan en la pestaña Security y no bloquean el merge | Job en paralelo, en push y PR a `main` | Tiene falsos positivos y tarda más que los otros gates; se revisa en triage y se volvería bloqueante (severidad error) cuando el ruido esté controlado. |

## Estrategia de pruebas

- `tests/habilitados.test.js` con supertest sobre `src/app.js`, al menos un test por criterio 1.1 a 4.2.
- 2.3 se mide con `Date.now()` antes y después de la solicitud de 5000 códigos.
- 3.3 se provoca con `jest.spyOn(repositorio, 'habilitados')` lanzando un `Error` cuyo mensaje contiene `C:\apps\malla\src\`; se verifica que el cuerpo sea exactamente `{"error":"error interno del servidor"}`.
- Tests de `repositorio.habilitados` con los datos reales.
- Tests de `src/util/formato.js` para que la cobertura total no baje de 80 %.
- 5.1 se verifica con el gate de cobertura en CI.
