# Requisitos: Cursos habilitados

## Introducción

Funcionalidad para que un alumno envíe los cursos que ya aprobó y reciba los cursos que puede llevar en la matrícula 2027-1. Se construye sobre `GET /cursos` y `GET /cursos/:codigo` e incluye requisitos de seguridad derivados de la revisión del prototipo anterior y un requisito de calidad derivado de la política de TI.

## Glosario

- **Aprobados**: lista de códigos de curso enviada por el alumno en el campo `aprobados`.
- **Curso habilitado**: curso que no está en Aprobados y cuyos `prerequisites` están todos en Aprobados. Un curso sin requisitos está habilitado.
- **Código válido**: texto que cumple el patrón `^[A-Z0-9]{6}$`.

## Requisitos

### Requisito 1: Calcular cursos habilitados

**Historia de usuario:** Como alumno, quiero enviar los cursos que aprobé, para saber qué cursos puedo llevar.

#### Criterios de aceptación

1.1 CUANDO se envíe `POST /habilitados` con `{"aprobados":["1INF25","1INF27","1INF49"]}`, EL sistema DEBE responder 200 con un arreglo de 27 cursos que incluya 1INF29, 1INF30, 1INF31 y 1INF32.

1.2 CUANDO un curso no tenga requisitos y no esté en `aprobados`, EL sistema DEBE incluirlo en la respuesta.

1.3 CUANDO un curso esté en `aprobados`, EL sistema NO DEBE incluirlo en la respuesta.

1.4 CUANDO a un curso le falte al menos uno de sus requisitos en `aprobados`, EL sistema NO DEBE incluirlo en la respuesta.

1.5 CUANDO `aprobados` sea `[]`, EL sistema DEBE responder 200 solo con los cursos que no tienen requisitos.

1.6 CUANDO `aprobados` contenga códigos repetidos, EL sistema DEBE responder 200 con el mismo resultado que sin los repetidos.

1.7 CUANDO el sistema responda 200, cada curso de la respuesta DEBE tener `id`, `name`, `credits`, `cycle` y `type`, ordenados por `cycle` ascendente (electivos con `cycle: null` al final) y luego por `id`.

### Requisito 2: Límite de tamaño de la solicitud (hallazgo 1)

**Historia de usuario:** Como responsable del servicio, quiero rechazar solicitudes desproporcionadas, para que una sola petición no deje el servicio sin responder.

#### Criterios de aceptación

2.1 SI `aprobados` tiene más de 100 elementos, ENTONCES EL sistema DEBE responder 400 con `{"error":"aprobados admite como máximo 100 códigos"}`.

2.2 SI el cuerpo de la solicitud supera 10 kb, ENTONCES EL sistema DEBE responder 413 con `{"error":"solicitud demasiado grande"}`.

2.3 CUANDO se envíe `aprobados` con 5000 códigos, EL sistema DEBE responder 413 en menos de 1000 ms.

### Requisito 3: Errores sin información interna (hallazgo 2)

**Historia de usuario:** Como responsable del servicio, quiero que los errores no expongan detalles internos, para no dar información útil a un atacante.

#### Criterios de aceptación

3.1 SI algún elemento de `aprobados` no es un código válido (por ejemplo `1INF30<script>`), ENTONCES EL sistema DEBE responder 400 con `{"error":"código inválido"}`.

3.2 SI el cuerpo no es JSON válido, ENTONCES EL sistema DEBE responder 400 con `{"error":"cuerpo JSON inválido"}`.

3.3 SI ocurre un error no controlado al procesar `POST /habilitados`, ENTONCES EL sistema DEBE responder 500 con exactamente `{"error":"error interno del servidor"}`, sin el texto `at `, `C:\`, `/src/` ni el mensaje original del error.

3.4 SI algún código es válido pero no existe en la malla, ENTONCES EL sistema DEBE responder 400 con `{"error":"curso desconocido: <codigo>"}`.

### Requisito 4: Validación del tipo de entrada (hallazgo 3)

**Historia de usuario:** Como alumno, quiero que una solicitud mal formada sea rechazada, para no recibir resultados incorrectos.

#### Criterios de aceptación

4.1 SI `aprobados` no es un arreglo (texto, número, objeto, `null` o campo ausente), ENTONCES EL sistema DEBE responder 400 con `{"error":"aprobados debe ser una lista de códigos"}`.

4.2 SI algún elemento de `aprobados` no es un texto (número, `null`, objeto o arreglo), ENTONCES EL sistema DEBE responder 400 con `{"error":"código inválido"}`.

### Requisito 5: Calidad

**Historia de usuario:** Como Centro Federado, quiero que todo cambio que llega a main esté probado, para cumplir la política de TI.

#### Criterios de aceptación

5.1 SI la cobertura de líneas de `src/` es menor a 80 % cuando el pipeline ejecuta `npm test`, ENTONCES el job de pruebas DEBE terminar con error y el run DEBE quedar en rojo.
