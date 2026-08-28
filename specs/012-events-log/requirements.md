# 012 — Events Log (Eventos Hoy)

> **Corrección de auditoría:** ya no depende de una tabla `events` persistida con triggers (eso ahora es Fase futura, ver `008-postgresql-data-model`). Para el MVP, "Eventos Hoy" se resuelve con mocks en frontend y, si se conecta backend, con una query derivada de `alerts` + `detections`.

## Problema
El operador necesita una bitácora del día (alertas + detecciones relevantes) sin cruzar varias pantallas — es uno de los 3 botones del dashboard.

## Objetivo
Construir `/eventos`, accesible desde la card "Eventos Hoy", con la tabla de eventos del día.

## Usuario
Operador/ganadero.

## Requisitos funcionales

### MVP obligatorio
- RF1 **[MVP]** Header "Eventos de hoy" + `BackButton` ("← Volver" → `/`).
- RF2 **[MVP]** Tabla: `Hora`, `Tipo` (alerta/detección, con ícono), `Descripción`, `Animal/Potrero relacionado`.
- RF3 **[MVP]** Orden cronológico descendente.
- RF4 **[MVP]** Datos: mock (`services/mocks/events.mock.js`) que combina alertas + detecciones anómalas de "hoy" — misma forma que tendría la query derivada de `008-postgresql-data-model/design.md`.
- RF5 **[Fase futura]** Click en un evento tipo `alerta` abre el detalle en `/alertas` (reutiliza esa pantalla, no crea una nueva) — si el tiempo alcanza; el MVP mínimo solo requiere que la tabla se muestre correctamente.

## Requisitos no funcionales
- RNF1 **[MVP]** Tabla legible en mobile.

## Criterios de aceptación (Given/When/Then)

```
Dado el mock de eventos con alertas y detecciones anómalas de hoy,
cuando se abre /eventos,
entonces se muestra la tabla ordenada del más reciente al más antiguo,
y cada fila indica su tipo (alerta/detección) con un ícono distinto.

Dado que el usuario está en /eventos,
cuando hace click en "← Volver",
entonces regresa a "/" (dashboard).
```

## Casos límite
- Día sin eventos → estado vacío ("Sin eventos hoy").
- Evento sin animal/potrero relacionado → columna muestra "N/A".

## Restricciones
- No se crea ninguna tabla `events` nueva en el MVP (ver `008-postgresql-data-model`).
- No se editan/eliminan eventos desde esta pantalla.
