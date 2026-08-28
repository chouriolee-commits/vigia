# 008 — PostgreSQL Data Model

> Ver `README.md` raíz §4 para la tabla completa MVP vs. Fase futura del proyecto.

## Problema
Todas las features de VIGÍA necesitan un modelo de datos común. Sin definirlo de antemano, cada spec inventaría su propia forma de datos.

## Objetivo
Definir el **mínimo** modelo de datos que soporta el MVP de 3h30 — sin tablas que no se usan en la demo — y dejar documentado (sin implementar) lo que corresponde a fase futura.

## Usuario
Backend (`models/`/`repositories/`) y, a través de la API, frontend. No es una pantalla.

## Requisitos funcionales

### MVP obligatorio — 6 tablas núcleo
- RF1 **[MVP]** `potreros`: nombre, descripción, ubicación.
- RF2 **[MVP]** `livestock`: animal con asignación **esperada** a un potrero (`potrero_id`).
- RF3 **[MVP]** `drone_missions` y `media`: origen de cada imagen/video.
- RF4 **[MVP]** `detections`: referencia a `media`, opcionalmente a `livestock`, siempre a `potrero_id` (real), `bbox`, `confidence`, `behavior`, `detected_at`.
- RF5 **[MVP]** `alerts`: tipo, prioridad, estado, referencias opcionales a `detection`/`livestock`/`potrero`.
- RF6 **[MVP]** Query de reconciliación (esperados vs. detectados) — ver `design.md`. No requiere tabla adicional.
- RF7 **[MVP]** "Eventos Hoy" (`012-events-log`) se resuelve con una **query derivada** que une `alerts` (hoy) + `detections` con `behavior='anomalo'` (hoy) + `drone_missions` completadas hoy. **No se crea tabla `events` para el MVP** (ver Decisión en `design.md`).

### Fase futura — no se implementa en el hackathon salvo que sobre tiempo
- RF8 **[Fase futura]** `users`: no hay autenticación en el MVP; si se necesita autoría se puede usar un valor fijo/constante.
- RF9 **[Fase futura]** Tabla `events` persistida con triggers automáticos, si se necesita auditoría histórica más allá del día actual.
- RF10 **[Fase futura]** `ai_conversations` / `ai_messages`: el historial del chat vive en memoria del frontend (o del proceso backend) durante el MVP, no se persiste.

## Requisitos no funcionales
- RNF1 **[MVP]** Índices sobre `potrero_id`, `livestock_id`, `detected_at` — solo donde la query de reconciliación y la de "eventos hoy" los necesitan.
- RNF2 **[MVP]** El modelo debe poder poblarse con un seed pequeño (1 potrero, ~10 animales, 1 misión, ~8 detecciones, 2-3 alertas) en minutos, no horas.

## Criterios de aceptación (Given/When/Then)

```
Dado el seed de datos de demo (1 potrero, 10 animales, 8 detecciones, 3 alertas),
cuando se ejecuta la query de reconciliación para ese potrero,
entonces se listan correctamente los animales esperados (10) y los reales (según detecciones),
y al menos 1 animal esperado sin detección reciente aparece marcado como faltante.

Dado que existen alertas y detecciones anómalas con fecha de hoy,
cuando se ejecuta la query derivada de "eventos hoy",
entonces se devuelve una lista ordenada cronológicamente que incluye esas alertas y detecciones,
sin necesidad de una tabla `events` separada.
```

## Casos límite
- Detección sin match a `livestock` conocido (`livestock_id = NULL`) → aparece como "animal desconocido" en la reconciliación.
- Animal esperado sin ninguna detección reciente → candidato a alerta `animal_faltante`.
- Animal detectado en un potrero distinto al asignado → "no esperado en este potrero" al ver ese potrero.

## Restricciones
- Solo PostgreSQL.
- No crear `users`, `events` (tabla), `ai_conversations`/`ai_messages` en el MVP — quedan documentadas como Fase futura en `design.md` para no perder el trabajo de diseño, pero **no se implementan** salvo que sobre tiempo tras completar todo lo `[MVP]`.
- No modelar el "estado actual" de un animal como columna mutable: siempre se deriva de `detections`.
