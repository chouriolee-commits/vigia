# 006 — Alert System (Alertas Activas)

> Uno de los 3 botones del dashboard — MVP crítico. También es el destino del link "Ver análisis →" del dashboard (`002-dashboard`).

## Problema
El operador necesita ver, en una sola tabla, todas las alertas activas generadas por el sistema (comportamiento anómalo, animal faltante, animal desconocido, salud, sistema) para priorizar su atención.

## Objetivo
Construir la pantalla `/alertas`, accesible desde la card "Alertas Activas" del dashboard, con la tabla completa de alertas.

## Usuario
Operador/ganadero.

## User stories
- Como operador, quiero ver todas las alertas activas con su nivel de prioridad, animal involucrado, tipo y fecha/hora, para decidir cuál atender primero.
- Como operador, quiero filtrar/ordenar por prioridad o estado.
- Como operador, quiero volver al dashboard con un solo click.

## Requisitos funcionales

### MVP obligatorio
- RF1 **[MVP]** Header con título "Alertas" y `BackButton` ("← Volver" → `/`).
- RF2 **[MVP]** Tabla de alertas: `Prioridad` (badge: baja/media/alta/crítica), `Animal` (tag o "N/A"), `Tipo` (comportamiento anómalo / animal faltante / animal desconocido / salud), `Descripción`, `Fecha/hora`, `Estado`.
- RF3 **[MVP]** Orden por defecto: prioridad descendente, luego fecha descendente.
- RF4 **[MVP]** Datos mockeados con la forma de `GET /api/alertas` (fase futura para el backend real, `009-api-integration`). Este mismo mock es el `context` que consume `007-ai-assistant`.

### Fase futura
- RF5 **[Fase futura]** Filtro por estado (dropdown). El MVP muestra todas las alertas activas del seed/mock directamente.
- RF6 **[Fase futura]** Modal de detalle al hacer click en una fila. El MVP muestra toda la info necesaria directamente en la tabla (columnas de RF2 ya son suficientes para la demo).

## Requisitos no funcionales
- RNF1: Tabla legible en mobile (columnas prioritarias visibles, resto en el detalle).
- RNF2: Los badges de prioridad usan colores consistentes con `StatusBadge` ya definido en `003-livestock-monitoring`.

## Criterios de aceptación (Given/When/Then)

```
Dado el mock con alertas de distinta prioridad (baja, media, alta, crítica),
cuando se abre /alertas,
entonces la tabla se muestra ordenada por prioridad descendente y luego por fecha descendente.

Dado que el usuario llega a /alertas desde el link "Ver análisis →" del dashboard,
cuando la página carga,
entonces la alerta correspondiente al evento detectado es visible en la tabla (mismo animal, misma descripción).

Dado que el usuario está en /alertas,
cuando hace click en "← Volver",
entonces regresa a "/".
```

## Casos límite
- Sin alertas activas → estado vacío ("No hay alertas activas") en vez de tabla vacía sin contexto.
- Alerta sin animal asociado (`livestock_id = NULL`, tipo `sistema`) → columna "Animal" muestra "N/A", no rompe la tabla.

## Restricciones
- No se permite resolver/editar alertas desde el frontend en el MVP (solo lectura); el cambio de estado es responsabilidad de una iteración futura, documentada como pendiente.
