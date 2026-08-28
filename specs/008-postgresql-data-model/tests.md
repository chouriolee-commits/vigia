# 008 — PostgreSQL Data Model — Tests

## Críticos (MVP)
- Las 6 migraciones núcleo aplican limpio sobre una base vacía.
- Insertar un `livestock` con `potrero_id` inexistente falla por FK.
- Insertar una `detection` con `confidence = 1.5` falla por CHECK.
- Seed completo se inserta sin errores.
- La query de reconciliación devuelve, con el seed, al menos 1 faltante y 1 desconocido.
- La query derivada de "eventos hoy" devuelve alertas + detecciones anómalas de hoy, ordenadas por fecha.

## Opcionales / fase futura
- Tests de constraints exhaustivos sobre `users`, `events`, `ai_conversations` (solo si se implementan).
- Auditoría de inconsistencia `detections.potrero_id` vs. `drone_missions.potrero_id`.
